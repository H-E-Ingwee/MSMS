import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import africastalking from 'africastalking';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Africa's Talking (only if credentials are available)
let africasTalking = null;
if (process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME) {
  africasTalking = africastalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME,
  });
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Generate OTP (6-digit)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS OTP
const sendSMSOTP = async (phone, otp) => {
  try {
    // In development without Africa's Talking credentials, just log the OTP
    if (!africasTalking) {
      console.log(`📱 DEVELOPMENT MODE: SMS OTP for ${phone}: ${otp}`);
      console.log('⚠️  Add AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME to send real SMS');
      return true;
    }

    const sms = africasTalking.SMS;
    const message = `Your MiraaLink verification code is: ${otp}. Valid for 5 minutes.`;

    const result = await sms.send({
      to: phone,
      message: message,
      from: process.env.AFRICASTALKING_SENDER_ID || 'MiraaLink'
    });

    console.log('📱 SMS sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
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

    // Send OTP via SMS
    try {
      await sendSMSOTP(phone, otp);
    } catch (smsError) {
      console.error('SMS sending failed, but user created:', smsError);
      // Don't fail registration if SMS fails, but log it
    }

    // Generate token for immediate login (in production, require OTP verification first)
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
      otpSent: true,
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

    // Send OTP via SMS
    await sendSMSOTP(phone, otp);

    res.json({
      message: 'OTP sent successfully',
      otpSent: true,
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