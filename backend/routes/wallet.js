import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { initiateSTKPush, validatePhoneNumber } from '../services/mpesaService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's wallet balance and transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get wallet balance
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId: req.user.id,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    const totalTransactions = await prisma.walletTransaction.count({
      where: {
        userId: req.user.id,
        ...(type && { type }),
      },
    });

    // Calculate balance from ALL transactions (not just current page)
    const allTransactions = await prisma.walletTransaction.findMany({
      where: {
        userId: req.user.id,
      },
    });

    const balance = allTransactions.reduce((acc, transaction) => {
      return transaction.type === 'CREDIT' ? acc + transaction.amount : acc - transaction.amount;
    }, 0);

    res.json({
      balance,
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalTransactions,
        pages: Math.ceil(totalTransactions / limitNum),
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch wallet data',
    });
  }
});

// Add money to wallet (credit)
router.post('/deposit', [
  authenticateToken,
  body('amount').isFloat({ min: 10, max: 50000 }).withMessage('Amount must be between 10 and 50000 KES'),
  body('paymentMethod').isIn(['MPESA', 'CARD']).withMessage('Invalid payment method'),
  body('phoneNumber').isMobilePhone('any').withMessage('Valid phone number required'),
], async (req, res) => {
  let transaction = null;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array(),
      });
    }

    const { amount, paymentMethod, phoneNumber } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Create transaction record
    transaction = await prisma.walletTransaction.create({
      data: {
        userId: req.user.id,
        amount,
        type: 'CREDIT',
        description: `Wallet deposit via ${paymentMethod}`,
        status: 'PENDING', // Will be updated when payment is confirmed
      },
    });

    try {
      // Initiate M-Pesa STK Push for wallet deposit
      console.log('Initiating M-Pesa STK Push with:', { phoneNumber, amount, orderId: `WALLET_${user.id}_${transaction.id}` });
      const stkPushResult = await initiateSTKPush({
        phoneNumber,
        amount,
        orderId: `WALLET_${user.id}_${transaction.id}`,
        accountReference: `MSMS_Wallet_Deposit`,
        transactionDescription: `Wallet deposit for MSMS account`,
      });

      console.log('M-Pesa STK Push initiated successfully:', stkPushResult);

      // Update transaction with checkout request ID
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          reference: stkPushResult.checkoutRequestId,
          metadata: {
            checkoutRequestId: stkPushResult.checkoutRequestId,
            trackingId: stkPushResult.trackingId,
            phoneNumber,
          },
        },
      });

      res.status(201).json({
        success: true,
        message: stkPushResult.customerMessage,
        checkoutRequestId: stkPushResult.checkoutRequestId,
        transactionId: transaction.id,
        trackingId: stkPushResult.trackingId,
      });
    } catch (mpesaError) {
      // If M-Pesa initiation fails, mark transaction as failed
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          description: `${transaction.description} - M-Pesa initiation failed: ${mpesaError.message}`,
        },
      });
      throw mpesaError;
    }
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to process deposit',
      transactionId: transaction?.id,
    });
  }
});

// Withdraw money from wallet (debit)
router.post('/withdraw', [
  authenticateToken,
  body('amount').isFloat({ min: 50, max: 50000 }).withMessage('Amount must be between 50 and 50000 KES'),
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

    const { amount } = req.body;

    // Calculate current balance
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: req.user.id },
    });

    const balance = transactions.reduce((acc, transaction) => {
      return transaction.type === 'CREDIT' ? acc + transaction.amount : acc - transaction.amount;
    }, 0);

    if (balance < amount) {
      return res.status(400).json({
        error: 'Insufficient Balance',
        message: 'You do not have enough funds in your wallet',
      });
    }

    // Create withdrawal transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: req.user.id,
        amount,
        type: 'DEBIT',
        description: 'Wallet withdrawal',
        status: 'PENDING', // Will be updated when withdrawal is processed
      },
    });

    // In a real implementation, this would initiate withdrawal processing
    // For now, we'll simulate successful withdrawal
    await prisma.walletTransaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' },
    });

    res.status(201).json({
      message: 'Withdrawal initiated successfully',
      transaction: {
        ...transaction,
        status: 'COMPLETED',
      },
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process withdrawal',
    });
  }
});

// Get transaction details
router.get('/transaction/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.walletTransaction.findUnique({
      where: { id },
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

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction',
    });
  }
});

// Get wallet statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: req.user.id },
    });

    const stats = {
      totalCredits: 0,
      totalDebits: 0,
      transactionCount: transactions.length,
      balance: 0,
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'CREDIT') {
        stats.totalCredits += transaction.amount;
      } else {
        stats.totalDebits += transaction.amount;
      }
    });

    stats.balance = stats.totalCredits - stats.totalDebits;

    // Get monthly breakdown for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTransactions = await prisma.walletTransaction.findMany({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyStats = {};
    monthlyTransactions.forEach(transaction => {
      const month = transaction.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyStats[month]) {
        monthlyStats[month] = { credits: 0, debits: 0 };
      }
      if (transaction.type === 'CREDIT') {
        monthlyStats[month].credits += transaction.amount;
      } else {
        monthlyStats[month].debits += transaction.amount;
      }
    });

    res.json({
      stats,
      monthlyBreakdown: monthlyStats,
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch wallet statistics',
    });
  }
});

export default router;