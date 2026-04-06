import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all listings (marketplace)
router.get('/', async (req, res) => {
  try {
    const {
      grade,
      location,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {
      status: 'ACTIVE',
      ...(grade && { grade }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    };

    // Build order by
    const orderBy = {};
    orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';

    const [listings, total] = await Promise.all([
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
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.listing.count({ where }),
    ]);

    // Transform to match frontend format
    const transformedListings = listings.map(listing => ({
      id: listing.id,
      grade: listing.grade,
      qty: `${listing.quantity}kg`,
      price: listing.price,
      farmer: listing.farmer.name,
      farmerPhone: listing.farmer.phone,
      location: listing.location,
      verified: listing.farmer.verified,
      date: new Date(listing.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    res.json({
      listings: transformedListings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch listings',
    });
  }
});

// Create new listing (farmers only)
router.post('/', [
  authenticateToken,
  requireRole('FARMER'),
  body('grade').isIn(['Kangeta', 'Alele', 'Giza', 'Lomboko']).withMessage('Invalid grade'),
  body('quantity').isInt({ min: 1, max: 10000 }).withMessage('Quantity must be between 1 and 10000 kg'),
  body('price').isFloat({ min: 1, max: 10000 }).withMessage('Price must be between 1 and 10000 KES per kg'),
  body('location').trim().isLength({ min: 2, max: 100 }).withMessage('Location must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
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

    const { grade, quantity, price, location, description } = req.body;

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        grade,
        quantity,
        price,
        location,
        description,
        farmerId: req.user.id,
      },
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
    });

    res.status(201).json({
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create listing',
    });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
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
        orders: {
          select: {
            id: true,
            quantity: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Listing not found',
      });
    }

    res.json({
      listing: {
        id: listing.id,
        grade: listing.grade,
        quantity: listing.quantity,
        price: listing.price,
        description: listing.description,
        location: listing.location,
        status: listing.status,
        farmer: listing.farmer,
        orders: listing.orders,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch listing',
    });
  }
});

// Create new listing (farmers only)
router.post('/', [
  authenticateToken,
  requireRole('FARMER'),
  body('grade').isIn(['Kangeta', 'Alele', 'Giza', 'Lomboko']).withMessage('Invalid grade'),
  body('quantity').isInt({ min: 1, max: 1000 }).withMessage('Quantity must be 1-1000 kg'),
  body('price').isFloat({ min: 1, max: 5000 }).withMessage('Price must be 1-5000 KES per kg'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('location').trim().isLength({ min: 2, max: 100 }),
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

    const { grade, quantity, price, description, location } = req.body;

    const listing = await prisma.listing.create({
      data: {
        grade,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
        description,
        location,
        farmerId: req.user.id,
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create listing',
    });
  }
});

// Update listing (owner only)
router.put('/:id', [
  authenticateToken,
  requireRole('FARMER'),
  body('quantity').optional().isInt({ min: 1, max: 1000 }),
  body('price').optional().isFloat({ min: 1, max: 5000 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ min: 2, max: 100 }),
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

    const { id } = req.params;
    const { quantity, price, description, location } = req.body;

    // Check ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Listing not found',
      });
    }

    if (listing.farmerId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own listings',
      });
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...(quantity && { quantity: parseInt(quantity, 10) }),
        ...(price && { price: parseFloat(price) }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
      },
    });

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update listing',
    });
  }
});

// Delete listing (owner only)
router.delete('/:id', [authenticateToken, requireRole('FARMER')], async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Listing not found',
      });
    }

    if (listing.farmerId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own listings',
      });
    }

    await prisma.listing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      message: 'Listing cancelled successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete listing',
    });
  }
});

// Get user's listings
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { farmerId: req.user.id },
      include: {
        orders: {
          select: {
            id: true,
            quantity: true,
            status: true,
            buyer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ listings });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch your listings',
    });
  }
});

export default router;