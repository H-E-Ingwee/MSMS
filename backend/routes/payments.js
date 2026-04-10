import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import {
  initiateSTKPush,
  querySTKPushStatus,
  validatePhoneNumber,
  processMpesaCallback,
} from '../services/daraja.js';

const router = express.Router();
const prisma = new PrismaClient();

// Daraja M-Pesa Webhook - Payment Callback Handler
// This endpoint receives callbacks from Safaricom's Daraja when payment is completed or fails
router.post('/mpesa/callback', express.json(), async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('📬 Daraja Callback received:', JSON.stringify(callbackData, null, 2));

    // Parse Daraja callback
    const callback = processMpesaCallback(callbackData);
    console.log('✅ Parsed callback:', callback);

    // Extract orderId from account reference or metadata
    // Format could be: MSMS_ORDER_123 or MSMS_WALLET
    const accountRef = callback.accountReference || callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(i => i.Name === 'AccountReference')?.Value;

    if (!accountRef) {
      console.warn('No account reference in callback');
      return res.status(200).json({ success: true }); // Return 200 to acknowledge receipt
    }

    // Determine if this is a wallet or order payment
    const isWalletPayment = accountRef.includes('WALLET');
    const orderId = accountRef.split('_')[2]; // Extract from MSMS_ORDER_123

    if (callback.success) {
      // Payment succeeded
      console.log('💰 Payment successful:', callback);

      if (isWalletPayment) {
        // Update wallet transaction
        const transaction = await prisma.walletTransaction.findFirst({
          where: {
            reference: callback.checkoutRequestId,
          },
        });

        if (transaction) {
          await prisma.walletTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              metadata: {
                ...transaction.metadata,
                mpesaReceiptNumber: callback.mpesaReceiptNumber,
                transactionDate: callback.transactionDate,
                resultCode: callback.resultCode,
              },
            },
          });
          console.log('✅ Wallet transaction updated:', transaction.id);
        }
      } else if (orderId) {
        // Update order payment
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            buyer: { select: { id: true, name: true, phone: true } },
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              metadata: {
                ...order.metadata,
                mpesaReceiptNumber: callback.mpesaReceiptNumber,
                transactionDate: callback.transactionDate,
              },
            },
          });

          // Create wallet transaction for buyer
          await prisma.walletTransaction.create({
            data: {
              userId: order.buyerId,
              amount: order.totalPrice,
              type: 'DEBIT',
              reference: callback.mpesaReceiptNumber,
              description: `Payment for order ${orderId}`,
              status: 'COMPLETED',
              metadata: {
                orderId,
                mpesaReceiptNumber: callback.mpesaReceiptNumber,
              },
            },
          });

          console.log('✅ Order updated to PAID:', orderId);
        }
      }
    } else {
      // Payment failed
      console.warn('❌ Payment failed:', callback);

      if (!isWalletPayment && orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAYMENT_FAILED',
            metadata: {
              ...callbackData.metadata,
              failureReason: callback.resultDescription,
            },
          },
        });
      }
    }

    // Always return 200 OK to acknowledge receipt from Daraja
    res.status(200).json({ success: true, message: 'Callback received' });
  } catch (error) {
    console.error('❌ Callback error:', error);
    // Return 200 to prevent Daraja from retrying
    res.status(200).json({ success: false, message: 'Callback received but processing failed' });
  }
});

// M-Pesa Query Transaction Status
router.get('/mpesa/query/:checkoutRequestId', authenticateToken, async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    const status = await querySTKPushStatus(checkoutRequestId);
    return res.json(status);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to query transaction status' });
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
        listing: { select: { farmerId: true, grade: true, quantity: true, description: true } },
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
        description: `M-Pesa payment for ${order.quantity}kg ${order.listing.grade} from ${order.listing.description || 'Miraa'}`,
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
          merchantRequestId: stkPushResult.merchantRequestId,
        },
      },
    });

    res.json({
      success: true,
      message: stkPushResult.customerMessage || 'M-Pesa prompt sent to your phone',
      checkoutRequestId: stkPushResult.checkoutRequestId,
      merchantRequestId: stkPushResult.merchantRequestId,
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

// Get M-Pesa Daraja Configuration Status (for debugging)
router.get('/config', (req, res) => {
  const isConfigured = !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_BUSINESS_SHORTCODE
  );

  res.json({
    configured: isConfigured,
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
    provider: 'M-Pesa Daraja',
    businessShortcode: process.env.MPESA_BUSINESS_SHORTCODE,
    message: isConfigured
      ? 'M-Pesa Daraja is properly configured'
      : 'M-Pesa Daraja credentials not configured. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, and MPESA_BUSINESS_SHORTCODE environment variables.',
    setupLink: 'https://developer.safaricom.co.ke/',
    keyDetails: {
      hasConsumerKey: !!process.env.MPESA_CONSUMER_KEY,
      hasConsumerSecret: !!process.env.MPESA_CONSUMER_SECRET,
      hasBusinessShortcode: !!process.env.MPESA_BUSINESS_SHORTCODE,
      hasPasskey: !!process.env.MPESA_PASSKEY,
    },
  });
});

// Test endpoint to verify M-Pesa Daraja connection
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number required',
        message: 'Please provide a valid Kenyan phone number to test'
      });
    }

    console.log('🧪 Testing Daraja connection with phone:', phoneNumber);

    const stkPushResult = await initiateSTKPush({
      phoneNumber,
      amount: 1, // Test with 1 KES
      orderId: 'TEST_' + Date.now(),
      accountReference: 'MSMS_Test',
      transactionDescription: 'MSMS Test Payment',
    });

    res.json({
      success: true,
      message: '✅ M-Pesa Daraja connection successful!',
      result: stkPushResult,
      nextStep: `Check your phone ${phoneNumber} for an M-Pesa prompt. You have 40 seconds to respond.`,
    });
  } catch (error) {
    console.error('❌ M-Pesa Daraja test failed:', error);
    res.status(500).json({
      error: 'M-Pesa Daraja Connection Failed',
      message: error.message,
      troubleshoot: {
        checkCredentials: 'Verify your MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env',
        checkPhone: 'Ensure phone number is in format 0790123456 or 254790123456',
        checkAPI: 'Visit https://developer.safaricom.co.ke/ to verify your credentials',
      }
    });
  }
});

export default router;