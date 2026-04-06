import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(req.user.role === 'FARMER' ? { listing: { farmerId: req.user.id } } : { buyerId: req.user.id }),
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          listing: {
            include: {
              farmer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  verified: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              phone: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch orders',
    });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: {
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
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            phone: true,
            verified: true,
            location: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    // Check if user has access to this order
    const isBuyer = order.buyerId === req.user.id;
    const isFarmer = order.listing.farmerId === req.user.id;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this order',
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch order',
    });
  }
});

// Create new order (buyers only)
router.post('/', [
  authenticateToken,
  requireRole('BUYER'),
  body('listingId').isString().notEmpty(),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress').optional().trim().isLength({ min: 5, max: 200 }),
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

    const { listingId, quantity, deliveryAddress } = req.body;

    // Check if listing exists and is active
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { farmer: true },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Listing not found or no longer available',
      });
    }

    // Check if quantity is available
    if (quantity > listing.quantity) {
      return res.status(400).json({
        error: 'Invalid Quantity',
        message: `Only ${listing.quantity}kg available`,
      });
    }

    // Calculate total price
    const totalPrice = quantity * listing.price;

    // Create order
    const order = await prisma.order.create({
      data: {
        listingId,
        buyerId: req.user.id,
        quantity,
        totalPrice,
        deliveryAddress,
      },
      include: {
        listing: {
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Update listing quantity (reserve the ordered amount)
    await prisma.listing.update({
      where: { id: listingId },
      data: { quantity: listing.quantity - quantity },
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create order',
    });
  }
});

// Update order status
router.put('/:id/status', [
  authenticateToken,
  body('status').isIn(['CONFIRMED', 'PAID', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid status',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    // Check permissions
    const isBuyer = order.buyerId === req.user.id;
    const isFarmer = order.listing.farmerId === req.user.id;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this order',
      });
    }

    // Business logic for status changes
    if (status === 'CANCELLED') {
      // Return quantity to listing
      await prisma.listing.update({
        where: { id: order.listingId },
        data: { quantity: order.listing.quantity + order.quantity },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        listing: {
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update order status',
    });
  }
});

export default router;