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

// IntaSend Webhook - Payment Callback Handler
// This endpoint receives callbacks from IntaSend when payment is completed or fails
router.post('/intasend/callback', express.json(), async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('IntaSend Callback received:', callbackData);

    // IntaSend callback structure
    const { id, state, mpesa_receipt_number, amount, phone_number, api_ref } = callbackData;

    // Extract orderId from api_ref (format: MSMS_{orderId}_{timestamp})
    const apiRefParts = api_ref?.split('_');
    const orderId = apiRefParts?.[1];

    if (!orderId) {
      console.warn('Could not extract orderId from api_ref:', api_ref);
      return res.status(400).json({ message: 'Invalid callback data - missing order ID' });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: { select: { farmerId: true, grade: true, quantity: true, title: true } },
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
        reference: id, // IntaSend transaction ID
        status: 'PENDING',
      },
    });

    // Handle payment success
    if (state === 'COMPLETE' && mpesa_receipt_number) {
      try {
        // Update transaction as completed
        if (transaction) {
          await prisma.walletTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              reference: mpesa_receipt_number,
              metadata: {
                ...transaction.metadata,
                mpesaReceiptNumber: mpesa_receipt_number,
                transactionDate: new Date().toISOString(),
                phoneNumber: phone_number,
              },
            },
          });
        }

        // Update order status to PAID
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paymentMethod: 'MPESA',
            mpesaReceiptNumber: mpesa_receipt_number,
            paidAt: new Date(),
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
            reference: `ORDER_${orderId}_MPESA_${mpesa_receipt_number}`,
            metadata: {
              mpesaReceiptNumber: mpesa_receipt_number,
              transactionDate: new Date().toISOString(),
              phoneNumber: phone_number,
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
              message: `Your M-Pesa payment of KES ${order.totalPrice.toLocaleString()} has been confirmed. Receipt: ${mpesa_receipt_number}`,
              orderId: orderId,
            },
          }),
        ]);

        console.log(`✅ Payment successful for order ${orderId}: ${mpesa_receipt_number}`);
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
            description: `${transaction.description} - Failed: ${state}`,
            metadata: {
              ...transaction.metadata,
              failureReason: state,
              phoneNumber: phone_number,
            },
          },
        });
      }

      // Create failure notification
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'PAYMENT_FAILED',
          title: 'Payment Failed',
          message: `Your M-Pesa payment for order ${orderId} failed: ${state}. Please try again.`,
          orderId: orderId,
        },
      });

      console.log(`❌ Payment failed for order ${orderId}: ${state}`);
    }

    // Return success to IntaSend
    res.status(200).json({
      status: 'received',
      message: 'Callback processed successfully',
    });
  } catch (error) {
    console.error('IntaSend callback processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process callback',
    });
  }
});

// Query IntaSend Payment Status
router.get('/status/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the transaction in our database
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user owns this transaction
    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If transaction is already completed or failed, return current status
    if (transaction.status !== 'PENDING') {
      return res.json({
        success: transaction.status === 'COMPLETED',
        status: transaction.status,
        statusDescription: transaction.status === 'COMPLETED' ? 'Payment completed successfully' : 'Payment failed',
        transaction,
      });
    }

    // Query IntaSend for status update
    const checkoutRequestId = transaction.metadata?.checkoutRequestId;
    if (!checkoutRequestId) {
      return res.status(400).json({ message: 'No checkout request ID found' });
    }

    const status = await queryStkPushStatus(checkoutRequestId);

    // Update transaction status based on IntaSend response
    let updatedTransaction = transaction;
    if (status.resultCode === '0') {
      // Payment successful
      updatedTransaction = await prisma.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          reference: status.mpesaReceiptNumber || transaction.reference,
          metadata: {
            ...transaction.metadata,
            mpesaReceiptNumber: status.mpesaReceiptNumber,
            transactionDate: status.transactionDate,
          },
        },
      });
    } else if (status.resultCode !== '1') { // Not still pending
      // Payment failed
      updatedTransaction = await prisma.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'FAILED',
          description: `${transaction.description} - Failed: ${status.resultDesc}`,
          metadata: {
            ...transaction.metadata,
            failureReason: status.resultDesc,
          },
        },
      });
    }

    res.json({
      success: status.resultCode === '0',
      statusCode: status.resultCode,
      statusDescription: status.resultDesc,
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error('Query payment status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to query payment status',
    });
  }
});

// Initiate M-Pesa Payment for Order
router.post('/order/:orderId', authenticateToken, [
  body('paymentMethod').isIn(['MPESA']).withMessage('Only M-Pesa payments are supported'),
  body('phoneNumber').isMobilePhone('any').withMessage('Valid phone number required'),
  body('amount').isNumeric().withMessage('Valid amount required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { paymentMethod, phoneNumber, amount } = req.body;

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: { select: { farmerId: true, grade: true, quantity: true, title: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.status !== 'APPROVED') {
      return res.status(400).json({
        message: 'Order must be approved before payment',
        orderStatus: order.status,
      });
    }

    // Check if payment already exists
    const existingTransaction = await prisma.walletTransaction.findFirst({
      where: {
        userId: req.user.id,
        reference: { contains: orderId },
        status: { in: ['PENDING', 'COMPLETED'] },
      },
    });

    if (existingTransaction) {
      return res.status(400).json({
        message: 'Payment already initiated for this order',
        transaction: existingTransaction,
      });
    }

    // Create pending transaction record
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: req.user.id,
        amount: order.totalPrice,
        type: 'DEBIT',
        description: `M-Pesa payment for ${order.quantity}kg ${order.listing.grade} from ${order.listing.title}`,
        status: 'PENDING',
        reference: `ORDER_${orderId}_MPESA_${Date.now()}`,
        metadata: {
          orderId,
          phoneNumber,
          paymentMethod,
        },
      },
    });

    // Initiate M-Pesa STK Push
    const stkPushResult = await initiateSTKPush({
      phoneNumber,
      amount: order.totalPrice,
      orderId,
      accountReference: `MSMS_Order_${orderId}`,
      transactionDescription: `Payment for ${order.quantity}kg ${order.listing.grade}`,
    });

    // Update transaction with checkout request ID
    await prisma.walletTransaction.update({
      where: { id: transaction.id },
      data: {
        reference: stkPushResult.checkoutRequestId,
        metadata: {
          ...transaction.metadata,
          checkoutRequestId: stkPushResult.checkoutRequestId,
          trackingId: stkPushResult.trackingId,
        },
      },
    });

    res.json({
      success: true,
      message: stkPushResult.customerMessage,
      checkoutRequestId: stkPushResult.checkoutRequestId,
      trackingId: stkPushResult.trackingId,
      transactionId: transaction.id,
      orderId,
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to initiate payment',
    });
  }
});

// Get IntaSend Configuration Status (for debugging)
router.get('/config', (req, res) => {
  const isConfigured = !!(process.env.INTASEND_PUBLISHABLE_KEY && process.env.INTASEND_SECRET_KEY);

  res.json({
    configured: isConfigured,
    environment: process.env.NODE_ENV || 'development',
    testMode: process.env.NODE_ENV !== 'production',
    provider: 'IntaSend',
    message: isConfigured
      ? 'IntaSend is properly configured'
      : 'IntaSend credentials not configured. Set INTASEND_PUBLISHABLE_KEY and INTASEND_SECRET_KEY environment variables.',
    setupLink: 'https://intasend.com/',
  });
});

export default router;