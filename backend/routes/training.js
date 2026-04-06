import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all training modules
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(category && { category }),
    };

    const [modules, total] = await Promise.all([
      prisma.trainingModule.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.trainingModule.count({ where }),
    ]);

    res.json({
      modules,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get training modules error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch training modules',
    });
  }
});

// Get single training module
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const module = await prisma.trainingModule.findUnique({
      where: { id },
    });

    if (!module) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Training module not found',
      });
    }

    res.json({ module });
  } catch (error) {
    console.error('Get training module error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch training module',
    });
  }
});

// Create training module (admin only)
router.post('/', [
  authenticateToken,
  requireRole('ADMIN'),
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('category').isIn(['FARMING_TECHNIQUES', 'MARKET_INSIGHTS', 'QUALITY_CONTROL', 'SUSTAINABILITY', 'BUSINESS_MANAGEMENT']),
  body('content').trim().isLength({ min: 50 }),
  body('duration').isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1-480 minutes'),
  body('difficulty').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
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

    const { title, description, category, content, duration, difficulty } = req.body;

    const module = await prisma.trainingModule.create({
      data: {
        title,
        description,
        category,
        content,
        duration,
        difficulty,
      },
    });

    res.status(201).json({
      message: 'Training module created successfully',
      module,
    });
  } catch (error) {
    console.error('Create training module error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create training module',
    });
  }
});

// Update training module (admin only)
router.put('/:id', [
  authenticateToken,
  requireRole('ADMIN'),
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('category').optional().isIn(['FARMING_TECHNIQUES', 'MARKET_INSIGHTS', 'QUALITY_CONTROL', 'SUSTAINABILITY', 'BUSINESS_MANAGEMENT']),
  body('content').optional().trim().isLength({ min: 50 }),
  body('duration').optional().isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1-480 minutes'),
  body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
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
    const updateData = req.body;

    const existingModule = await prisma.trainingModule.findUnique({
      where: { id },
    });

    if (!existingModule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Training module not found',
      });
    }

    const module = await prisma.trainingModule.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Training module updated successfully',
      module,
    });
  } catch (error) {
    console.error('Update training module error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update training module',
    });
  }
});

// Delete training module (admin only)
router.delete('/:id', [authenticateToken, requireRole('ADMIN')], async (req, res) => {
  try {
    const { id } = req.params;

    const existingModule = await prisma.trainingModule.findUnique({
      where: { id },
    });

    if (!existingModule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Training module not found',
      });
    }

    await prisma.trainingModule.delete({
      where: { id },
    });

    res.json({
      message: 'Training module deleted successfully',
    });
  } catch (error) {
    console.error('Delete training module error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete training module',
    });
  }
});

// Mark module as completed for user
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const module = await prisma.trainingModule.findUnique({
      where: { id },
    });

    if (!module) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Training module not found',
      });
    }

    // Check if already completed
    const existingCompletion = await prisma.trainingCompletion.findUnique({
      where: {
        userId_moduleId: {
          userId: req.user.id,
          moduleId: id,
        },
      },
    });

    if (existingCompletion) {
      return res.status(400).json({
        error: 'Already Completed',
        message: 'You have already completed this module',
      });
    }

    const completion = await prisma.trainingCompletion.create({
      data: {
        userId: req.user.id,
        moduleId: id,
      },
    });

    res.status(201).json({
      message: 'Training module marked as completed',
      completion,
    });
  } catch (error) {
    console.error('Complete training module error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to mark module as completed',
    });
  }
});

// Get user's completed modules
router.get('/user/completed', authenticateToken, async (req, res) => {
  try {
    const completions = await prisma.trainingCompletion.findMany({
      where: { userId: req.user.id },
      include: {
        module: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json({
      completions,
      total: completions.length,
    });
  } catch (error) {
    console.error('Get completed modules error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch completed modules',
    });
  }
});

export default router;