import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
  next();
};

// Get all users with pagination
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          location: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              listings: true,
              orders: true,
              walletTransactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch users',
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      farmersCount,
      buyersCount,
      adminsCount,
      verifiedUsers,
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { verified: true } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.walletTransaction.aggregate({
        where: { type: 'CREDIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        farmers: farmersCount,
        buyers: buyersCount,
        admins: adminsCount,
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        inactive: totalListings - activeListings,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: totalOrders - completedOrders,
      },
      revenue: totalRevenue._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch statistics',
    });
  }
});

// Download users report as CSV
router.get('/reports/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        location: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            listings: true,
            orders: true,
            walletTransactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV content
    const csvHeader = 'ID,Name,Phone,Role,Location,Verified,Created At,Updated At,Listings Count,Orders Count,Transactions Count\n';
    const csvRows = users.map(user =>
      `${user.id},${user.name},${user.phone},${user.role},${user.location || ''},${user.verified},${user.createdAt.toISOString()},${user.updatedAt.toISOString()},${user._count.listings},${user._count.orders},${user._count.walletTransactions}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users_report.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating users report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate users report',
    });
  }
});

// Download transactions report as CSV
router.get('/reports/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV content
    const csvHeader = 'ID,User Name,User Phone,User Role,Type,Amount,Description,Reference,Status,Created At\n';
    const csvRows = transactions.map(tx =>
      `${tx.id},${tx.user.name},${tx.user.phone},${tx.user.role},${tx.type},${tx.amount},${tx.description},${tx.reference || ''},${tx.status},${tx.createdAt.toISOString()}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions_report.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating transactions report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate transactions report',
    });
  }
});

// Download listings report as CSV
router.get('/reports/listings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      include: {
        farmer: {
          select: {
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV content
    const csvHeader = 'ID,Farmer Name,Farmer Phone,Grade,Quantity,Price,Location,Description,Status,Orders Count,Created At\n';
    const csvRows = listings.map(listing =>
      `${listing.id},${listing.farmer.name},${listing.farmer.phone},${listing.grade},${listing.quantity},${listing.price},${listing.location},${listing.description || ''},${listing.status},${listing._count.orders},${listing.createdAt.toISOString()}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="listings_report.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating listings report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate listings report',
    });
  }
});

export default router;