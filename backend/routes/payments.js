import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// M-Pesa STK Push simulation
router.post('/mpesa/stkpush', [
  authenticateToken,
  body('amount').isFloat({ min: 1, max: 150000 }).withMessage('Amount must be between 1 and 150000 KES'),
  body('phoneNumber').matches(/^254[0-9]{9}$/).withMessage('Phone number must be in format 254XXXXXXXXX'),
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

    const { amount, phoneNumber } = req.body;

    // Generate transaction reference
    const transactionRef = `MSMS${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // In a real implementation, this would call M-Pesa API
    // For simulation, we'll create a pending transaction and simulate success
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: req.user.id,
        amount,
        type: 'CREDIT',
        description: `M-Pesa STK Push - ${phoneNumber}`,
        status: 'PENDING',
        reference: transactionRef,
      },
    });

    // Simulate M-Pesa response
    setTimeout(async () => {
      // Simulate successful payment
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
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

// Process order payment
router.post('/order/:orderId', [
  authenticateToken,
  body('paymentMethod').isIn(['WALLET', 'MPESA']).withMessage('Invalid payment method'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid payment method',
        details: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    if (order.buyerId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to pay for this order',
      });
    }

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        error: 'Invalid Order Status',
        message: 'Order must be confirmed before payment',
      });
    }

    if (paymentMethod === 'WALLET') {
      // Check wallet balance
      const transactions = await prisma.walletTransaction.findMany({
        where: { userId: req.user.id },
      });

      const balance = transactions.reduce((acc, transaction) => {
        return transaction.type === 'CREDIT' ? acc + transaction.amount : acc - transaction.amount;
      }, 0);

      if (balance < order.totalPrice) {
        return res.status(400).json({
          error: 'Insufficient Balance',
          message: 'You do not have enough funds in your wallet',
        });
      }

      // Deduct from wallet
      await prisma.walletTransaction.create({
        data: {
          userId: req.user.id,
          amount: order.totalPrice,
          type: 'DEBIT',
          description: `Payment for order ${orderId}`,
          status: 'COMPLETED',
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });

      res.json({
        message: 'Payment processed successfully',
        orderId,
        paymentMethod: 'WALLET',
      });
    } else if (paymentMethod === 'MPESA') {
      // Initiate M-Pesa payment
      const transactionRef = `ORDER${orderId}_${Date.now()}`;

      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: req.user.id,
          amount: order.totalPrice,
          type: 'DEBIT',
          description: `Payment for order ${orderId}`,
          status: 'PENDING',
          reference: transactionRef,
        },
      });

      // In a real implementation, initiate M-Pesa STK Push here
      // For simulation, mark as completed after delay
      setTimeout(async () => {
        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: { status: 'COMPLETED' },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
      }, 5000);

      res.json({
        message: 'M-Pesa payment initiated',
        orderId,
        paymentMethod: 'MPESA',
        transactionId: transaction.id,
        instructions: 'Please complete the payment on your phone',
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