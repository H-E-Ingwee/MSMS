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

// Verify/unverify user
router.put('/users/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { verified: verified },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        location: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user verification:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user verification',
    });
  }
});

// Change user role
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['FARMER', 'BUYER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid Role',
        message: 'Role must be FARMER, BUYER, or ADMIN',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        location: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User role updated to ${role} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user role',
    });
  }
});

// Suspend/activate user account
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active: active },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        location: true,
        verified: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User account ${active ? 'activated' : 'suspended'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user status',
    });
  }
});

// Delete user (soft delete by marking as inactive)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has active orders or listings
    const userWithRelations = await prisma.user.findUnique({
      where: { id },
      include: {
        listings: { where: { status: 'ACTIVE' } },
        orders: { where: { status: { in: ['PENDING_APPROVAL', 'APPROVED', 'PENDING_PAYMENT', 'PAID', 'SHIPPED'] } } },
      },
    });

    if (!userWithRelations) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    if (userWithRelations.listings.length > 0 || userWithRelations.orders.length > 0) {
      return res.status(400).json({
        error: 'Cannot Delete User',
        message: 'User has active listings or orders. Please resolve these first.',
      });
    }

    // Soft delete by marking as inactive
    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete user',
    });
  }
});

// Bulk operations
router.post('/users/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { operation, userIds, data } = req.body;

    if (!['verify', 'unverify', 'activate', 'suspend', 'delete'].includes(operation)) {
      return res.status(400).json({
        error: 'Invalid Operation',
        message: 'Operation must be verify, unverify, activate, suspend, or delete',
      });
    }

    let updateData = {};
    let message = '';

    switch (operation) {
      case 'verify':
        updateData = { verified: true };
        message = 'Users verified successfully';
        break;
      case 'unverify':
        updateData = { verified: false };
        message = 'Users unverified successfully';
        break;
      case 'activate':
        updateData = { active: true };
        message = 'Users activated successfully';
        break;
      case 'suspend':
        updateData = { active: false };
        message = 'Users suspended successfully';
        break;
      case 'delete':
        updateData = { active: false };
        message = 'Users deleted successfully';
        break;
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: updateData,
    });

    res.json({
      message,
      affected: result.count,
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to perform bulk operation',
    });
  }
});

// Get user details with full information
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        listings: {
          include: {
            _count: {
              select: { orders: true },
            },
          },
        },
        orders: {
          include: {
            listing: {
              select: {
                grade: true,
                farmer: { select: { name: true } },
              },
            },
          },
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            listings: true,
            orders: true,
            walletTransactions: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user details',
    });
  }
});

// Download audit report as CSV
router.get('/reports/audit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV content
    const csvHeader = 'ID,User,Role,Action,Details,Timestamp\n';
    const csvRows = activities.map(activity =>
      `${activity.id},${activity.user?.name || 'System'},${activity.user?.role || 'SYSTEM'},"${activity.action}","${activity.details || ''}",${activity.createdAt.toISOString()}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_report.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating audit report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate audit report',
    });
  }
});

// Get all listings for admin management
router.get('/listings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'ALL';

    const where = {
      ...(status !== 'ALL' && { status }),
    };

    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
              location: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch listings',
    });
  }
});

// Update listing status (approve/reject)
router.put('/listings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['ACTIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid Status',
        message: 'Status must be ACTIVE, REJECTED, or SUSPENDED',
      });
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes }),
      },
      include: {
        farmer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `LISTING_${status}`,
        details: `Listing ${id} status changed to ${status}${notes ? ` - Notes: ${notes}` : ''}`,
      },
    });

    res.json({
      message: `Listing ${status.toLowerCase()} successfully`,
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update listing status',
    });
  }
});

// Update listing details
router.put('/listings/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, quantity, price, location, description } = req.body;

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...(grade && { grade }),
        ...(quantity && { quantity: parseFloat(quantity) }),
        ...(price && { price: parseFloat(price) }),
        ...(location && { location }),
        ...(description !== undefined && { description }),
      },
      include: {
        farmer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'LISTING_UPDATED',
        details: `Listing ${id} details updated`,
      },
    });

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update listing',
    });
  }
});

// Get all training modules for admin management
router.get('/training', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const modules = await prisma.trainingModule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ modules });
  } catch (error) {
    console.error('Error fetching training modules:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch training modules',
    });
  }
});

// Create new training module
router.post('/training', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, category, content, description, duration } = req.body;

    const module = await prisma.trainingModule.create({
      data: {
        title,
        category,
        content,
        description,
        duration: parseInt(duration),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'TRAINING_MODULE_CREATED',
        details: `Training module "${title}" created`,
      },
    });

    res.status(201).json({
      message: 'Training module created successfully',
      module,
    });
  } catch (error) {
    console.error('Error creating training module:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create training module',
    });
  }
});

// Update training module
router.put('/training/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content, description, duration } = req.body;

    const updatedModule = await prisma.trainingModule.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(category && { category }),
        ...(content && { content }),
        ...(description !== undefined && { description }),
        ...(duration && { duration: parseInt(duration) }),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'TRAINING_MODULE_UPDATED',
        details: `Training module "${title}" updated`,
      },
    });

    res.json({
      message: 'Training module updated successfully',
      module: updatedModule,
    });
  } catch (error) {
    console.error('Error updating training module:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update training module',
    });
  }
});

// Delete training module
router.delete('/training/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const module = await prisma.trainingModule.findUnique({
      where: { id },
      select: { title: true },
    });

    await prisma.trainingModule.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'TRAINING_MODULE_DELETED',
        details: `Training module "${module.title}" deleted`,
      },
    });

    res.json({
      message: 'Training module deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting training module:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete training module',
    });
  }
});

export default router;