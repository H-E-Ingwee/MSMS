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

export default router;