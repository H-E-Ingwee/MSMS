import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Generate OTP (simplified - in production use a proper SMS service)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP temporarily (in production use Redis or database)
const otpStore = new Map();

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').matches(/^\+254[0-9]{9}$/).withMessage('Phone must be in format +254XXXXXXXXX'),
  body('location').optional().trim().isLength({ min: 2, max: 100 }),
  body('role').optional().isIn(['FARMER', 'BUYER', 'ADMIN']).withMessage('Invalid role'),
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

    const { name, phone, location, role = 'FARMER' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this phone number already exists',
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        location,
        role,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        location: true,
        verified: true,
        createdAt: true,
      },
    });

    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      userId: user.id,
    });

    // In production, send OTP via SMS
    console.log(`📱 OTP for ${phone}: ${otp}`);

    // Generate token for immediate login (in production, require OTP verification first)
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
      otpSent: true, // In development mode
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user',
    });
  }
});

// Login with OTP
router.post('/login', [
  body('phone').matches(/^\+254[0-9]{9}$/).withMessage('Phone must be in format +254XXXXXXXXX'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
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

    const { phone, otp } = req.body;

    // Get stored OTP
    const storedOTP = otpStore.get(phone);

    if (!storedOTP) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'No OTP found for this phone number',
      });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({
        error: 'Expired OTP',
        message: 'OTP has expired, please request a new one',
      });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'Incorrect OTP code',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: storedOTP.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        location: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Clean up OTP
    otpStore.delete(phone);

    res.json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login',
    });
  }
});

// Request OTP (for login)
router.post('/request-otp', [
  body('phone').matches(/^\+254[0-9]{9}$/).withMessage('Phone must be in format +254XXXXXXXXX'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid phone number',
        details: errors.array(),
      });
    }

    const { phone } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found with this phone number',
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      userId: user.id,
    });

    // In production, send OTP via SMS
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      otpSent: true, // In development mode
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send OTP',
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get profile',
    });
  }
});

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
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

    const { name, location } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(location && { location }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        location: true,
        verified: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile',
    });
  }
});

export default router;