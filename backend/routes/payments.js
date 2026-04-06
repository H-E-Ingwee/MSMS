import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import {
  initiateSTKPush,
  queryStkPushStatus,
  validatePhoneNumber,
  generateTransactionRef,
} from '../services/mpesaService.js';

const router = express.Router();
const prisma = new PrismaClient();

// M-Pesa Webhook - Payment Callback Handler
// This endpoint receives callbacks from M-Pesa when payment is completed or fails
router.post('/mpesa/callback', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // M-Pesa sends the callback as JSON
    const callbackData = JSON.parse(req.body.toString());
    console.log('M-Pesa Callback received:', callbackData);

    // Check for required fields
    if (!callbackData.Body || !callbackData.Body.stkCallback) {
      return res.status(400).json({ message: 'Invalid callback format' });
    }

    const stkCallback = callbackData.Body.stkCallback;
    const { ResultCode, MerchantRequestID, CheckoutRequestID, ResultDesc, CallbackMetadata } = stkCallback;
    
    // Extract orderId from the callback context
    const orderId = req.query.orderId || MerchantRequestID;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: { select: { farmerId: true, grade: true, quantity: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      console.warn('Order not found for callback:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the pending transaction
    const transaction = await prisma.walletTransaction.findFirst({
      where: {
        userId: order.buyerId,
        status: 'PENDING',
        reference: { contains: orderId },
      },
    });

    // Handle payment success
    if (ResultCode === 0 && CallbackMetadata) {
      try {
        // Extract payment details from callback
        const itemArray = CallbackMetadata.Item || [];
        const mpesaReceiptNumber = itemArray.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const actualAmount = itemArray.find(item => item.Name === 'Amount')?.Value;
        const mpesaPhone = itemArray.find(item => item.Name === 'PhoneNumber')?.Value;
        const transactionDate = itemArray.find(item => item.Name === 'TransactionDate')?.Value;

        // Update transaction as completed
        if (transaction) {
          await prisma.walletTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              reference: mpesaReceiptNumber || transaction.reference,
            },
          });
        }

        // Update order status to PAID
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paymentMethod: 'MPESA',
            mpesaReceiptNumber: mpesaReceiptNumber,
          },
        });

        // Credit farmer's wallet
        const farmerCredit = await prisma.walletTransaction.create({
          data: {
            userId: order.listing.farmerId,
            amount: order.totalPrice,
            type: 'CREDIT',
            description: `M-Pesa payment from ${order.buyer.name} for ${order.quantity}kg ${order.listing.grade}`,
            status: 'COMPLETED',
            reference: `ORDER_${orderId}_MPESA`,
            metadata: {
              mpesaReceiptNumber,
              transactionDate,
            },
          },
        });

        // Create notifications
        await Promise.all([
          // Notify farmer of payment
          prisma.notification.create({
            data: {
              userId: order.listing.farmerId,
              type: 'PAYMENT_RECEIVED',
              title: 'Payment Received',
              message: `M-Pesa payment of KES ${order.totalPrice.toLocaleString()} received for order from ${order.buyer.name}`,
              orderId: orderId,
            },
          }),
          // Notify buyer of successful payment
          prisma.notification.create({
            data: {
              userId: order.buyerId,
              type: 'PAYMENT_CONFIRMED',
              title: 'Payment Successful',
              message: `Your M-Pesa payment of KES ${order.totalPrice.toLocaleString()} has been confirmed. Receipt: ${mpesaReceiptNumber}`,
              orderId: orderId,
            },
          }),
        ]);

        console.log(`✅ Payment successful for order ${orderId}: ${mpesaReceiptNumber}`);
      } catch (processError) {
        console.error('Error processing successful payment:', processError);
      }
    }
    // Handle payment failure
    else {
      if (transaction) {
        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            description: `${transaction.description} - Failed: ${ResultDesc}`,
          },
        });
      }

      // Create failure notification
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'PAYMENT_FAILED',
          title: 'Payment Failed',
          message: `Your M-Pesa payment for order ${orderId} failed: ${ResultDesc}. Please try again.`,
          orderId: orderId,
        },
      });

      console.log(`❌ Payment failed for order ${orderId}: ${ResultDesc}`);
    }

    // Return success to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Received successfully',
    });
  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process callback',
    });
  }
});

// Query M-Pesa Payment Status
router.get('/mpesa/status/:checkoutRequestId', authenticateToken, async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    // Query M-Pesa API
    const status = await queryStkPushStatus(checkoutRequestId);

    res.json({
      success: status.success,
      statusCode: status.resultCode,
      statusDescription: status.resultDescription,
      // Find the transaction
      transaction: await prisma.walletTransaction.findFirst({
        where: {
          userId: req.user.id,
          status: { in: ['PENDING', 'COMPLETED', 'FAILED'] },
        },
      }),
    });
  } catch (error) {
    console.error('Query payment status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to query payment status',
    });
  }
});

// Get M-Pesa Configuration Status (for debugging)
router.get('/config', (req, res) => {
  const isConfigured = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);
  
  res.json({
    configured: isConfigured,
    environment: process.env.NODE_ENV || 'development',
    sandboxMode: process.env.NODE_ENV !== 'production',
    message: isConfigured
      ? 'M-Pesa is properly configured'
      : 'M-Pesa credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET environment variables.',
    setupLink: 'https://developer.safaricom.co.ke/',
  });
});
    }, 3000); // 3 second delay to simulate processing

    res.status(200).json({
      message: 'STK Push initiated successfully',
      transaction: {
        id: transaction.id,
        reference: transactionRef,
        amount,
        status: 'PENDING',
      },
      instructions: 'Please check your phone and enter your M-Pesa PIN to complete the payment',
    });
  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to initiate M-Pesa payment',
    });
  }
});

// M-Pesa C2B (Customer to Business) callback
router.post('/mpesa/callback', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // In production, verify the callback signature
    const callbackData = JSON.parse(req.body);

    const {
      Body: {
        stkCallback: {
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata,
        },
      },
    } = callbackData;

    // Find transaction by reference
    const transaction = await prisma.walletTransaction.findFirst({
      where: { reference: CheckoutRequestID },
    });

    if (!transaction) {
      console.error('Transaction not found for callback:', CheckoutRequestID);
      return res.status(200).json({ message: 'Transaction not found' });
    }

    if (ResultCode === 0) {
      // Payment successful
      const amount = CallbackMetadata.Item.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber')?.Value;

      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          reference: mpesaReceiptNumber,
        },
      });
    } else {
      // Payment failed
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          description: `${transaction.description} - Failed: ${ResultDesc}`,
        },
      });
    }

    res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process callback',
    });
  }
});

// Process payment for approved order
router.post('/order/:orderId', [
  authenticateToken,
  body('paymentMethod').isIn(['MPESA', 'CASH', 'WALLET']).withMessage('Payment method must be MPESA, CASH, or WALLET'),
  body('phoneNumber').optional().matches(/^254[0-9]{9}$|^0[0-9]{9}$/).withMessage('Phone number must be valid'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { paymentMethod, phoneNumber } = req.body;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            farmer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        buyer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    // Verify buyer is the one making payment
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only pay for your own orders',
      });
    }

    // Check order status - must be APPROVED
    if (order.status !== 'APPROVED') {
      return res.status(400).json({
        error: 'Invalid Order Status',
        message: 'Order must be approved by farmer before payment. Current status: ' + order.status,
      });
    }

    const amount = order.totalPrice;

    // Handle M-Pesa payment
    if (paymentMethod === 'MPESA') {
      if (!phoneNumber) {
        return res.status(400).json({
          error: 'Phone Number Required',
          message: 'Phone number is required for M-Pesa payments',
        });
      }

      try {
        // Validate and format phone number
        const formattedPhone = validatePhoneNumber(phoneNumber);
        
        // Generate transaction reference
        const transactionRef = generateTransactionRef(orderId);

        // Create wallet transaction record
        const transaction = await prisma.walletTransaction.create({
          data: {
            userId: req.user.id,
            amount: amount,
            type: 'DEBIT',
            description: `M-Pesa payment for Order ${orderId} - ${order.listing.grade} Miraa`,
            status: 'PENDING',
            reference: transactionRef,
          },
        });

        // Initiate STK Push with real M-Pesa API
        const stkResponse = await initiateSTKPush({
          phoneNumber: formattedPhone,
          amount: Math.round(amount),
          orderId: orderId,
          accountReference: `ORDER_${orderId}`,
          transactionDescription: `Payment for ${order.quantity}kg ${order.listing.grade}`,
        });

        // Update order with payment details
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentMethod: 'MPESA',
            mpesaCheckoutRequestId: stkResponse.checkoutRequestId,
          },
        });

        return res.status(200).json({
          message: 'M-Pesa STK Push initiated successfully',
          transaction: {
            id: transaction.id,
            reference: transactionRef,
            amount: amount,
            status: 'PENDING',
            checkoutRequestId: stkResponse.checkoutRequestId,
          },
          orderId,
          customerMessage: stkResponse.customerMessage,
          instructions: 'Enter your M-Pesa PIN on your phone to complete the payment',
        });
      } catch (mpesaError) {
        console.error('M-Pesa API error:', mpesaError);
        
        // Delete the transaction record if M-Pesa fails
        const failedTrans = await prisma.walletTransaction.findFirst({
          where: {
            userId: req.user.id,
            status: 'PENDING',
            description: {
              contains: orderId,
            },
          },
        });
        
        if (failedTrans) {
          await prisma.walletTransaction.delete({ where: { id: failedTrans.id } });
        }

        return res.status(400).json({
          error: 'M-Pesa Error',
          message: mpesaError.message,
          hint: 'Make sure you have valid M-Pesa credentials configured. Check /api/payments/config for status.',
        });
      }
    } 
    // Handle Cash payment
    else if (paymentMethod === 'CASH') {
      // For cash payments, mark as paid immediately
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAID',
          paymentMethod: 'CASH',
        },
      });

      // Credit farmer's wallet immediately
      await prisma.walletTransaction.create({
        data: {
          userId: order.listing.farmerId,
          amount: amount,
          type: 'CREDIT',
          description: `Cash sale of ${order.quantity}kg ${order.listing.grade} to ${order.buyer.name}`,
          status: 'COMPLETED',
          reference: `ORDER_${orderId}_CASH`,
        },
      });

      // Create notification for farmer
      await prisma.notification.create({
        data: {
          userId: order.listing.farmerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received',
          message: `Cash payment of KES ${amount.toLocaleString()} received for order ${orderId}`,
          orderId: orderId,
        },
      });

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'PAYMENT_CONFIRMED',
          title: 'Payment Confirmed',
          message: `Your cash payment of KES ${amount.toLocaleString()} for order ${orderId} is confirmed`,
          orderId: orderId,
        },
      });

      return res.status(200).json({
        message: 'Cash payment recorded successfully',
        orderId,
        amount: amount,
        status: 'PAID',
      });
    }
    // Handle Wallet payment
    else if (paymentMethod === 'WALLET') {
      // Check wallet balance
      const transactions = await prisma.walletTransaction.findMany({
        where: { userId: req.user.id },
      });

      const balance = transactions.reduce((acc, tx) => {
        return tx.type === 'CREDIT' ? acc + tx.amount : acc - tx.amount;
      }, 0);

      if (balance < amount) {
        return res.status(400).json({
          error: 'Insufficient Balance',
          message: `You need KES ${(amount - balance).toLocaleString()} more to complete this payment`,
          currentBalance: balance,
          requiredAmount: amount,
        });
      }

      // Deduct from wallet
      await prisma.walletTransaction.create({
        data: {
          userId: req.user.id,
          amount: amount,
          type: 'DEBIT',
          description: `Wallet payment for Order ${orderId}`,
          status: 'COMPLETED',
          reference: `ORDER_${orderId}_WALLET`,
        },
      });

      // Mark order as paid
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAID',
          paymentMethod: 'WALLET',
        },
      });

      // Credit farmer's wallet
      await prisma.walletTransaction.create({
        data: {
          userId: order.listing.farmerId,
          amount: amount,
          type: 'CREDIT',
          description: `Wallet payment from ${order.buyer.name} for ${order.quantity}kg ${order.listing.grade}`,
          status: 'COMPLETED',
          reference: `ORDER_${orderId}_WALLET`,
        },
      });

      // Create notifications
      await prisma.notification.create({
        data: {
          userId: order.listing.farmerId,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Received',
          message: `Wallet payment of KES ${amount.toLocaleString()} received for order ${orderId}`,
          orderId: orderId,
        },
      });

      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'PAYMENT_CONFIRMED',
          title: 'Payment Confirmed',
          message: `Your wallet payment of KES ${amount.toLocaleString()} for order ${orderId} is confirmed`,
          orderId: orderId,
        },
      });

      return res.status(200).json({
        message: 'Wallet payment processed successfully',
        orderId,
        amount: amount,
        status: 'PAID',
      });
    }
  } catch (error) {
    console.error('Process order payment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process payment',
    });
  }
});

  } catch (error) {
    console.error('Order payment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process payment',
    });
  }
});

// Check payment status
router.get('/status/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transaction not found',
      });
    }

    if (transaction.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this transaction',
      });
    }

    res.json({
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check payment status',
    });
  }
});

// Get payment methods available
router.get('/methods', authenticateToken, (req, res) => {
  res.json({
    methods: [
      {
        id: 'WALLET',
        name: 'MSMS Wallet',
        description: 'Pay using your MSMS wallet balance',
        requiresConfirmation: false,
      },
      {
        id: 'MPESA',
        name: 'M-Pesa',
        description: 'Pay using M-Pesa STK Push',
        requiresConfirmation: true,
      },
    ],
  });
});

export default router;