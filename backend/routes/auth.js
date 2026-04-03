const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Mock OTP
const MOCK_OTP = '1234';

// Register
router.post('/register', async (req, res) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().valid('FARMER', 'BUYER', 'ADMIN').default('FARMER'),
    location: Joi.string().optional()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const existingUser = await prisma.user.findUnique({ where: { phone: value.phone } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = await prisma.user.create({ data: value });
    res.status(201).json({ message: 'User registered', user: { id: user.id, phone: user.phone, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login - send OTP
router.post('/login', async (req, res) => {
  const schema = Joi.object({
    phone: Joi.string().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = await prisma.user.findUnique({ where: { phone: value.phone } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Mock send OTP
    console.log(`OTP sent to ${value.phone}: ${MOCK_OTP}`);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    otp: Joi.string().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  if (value.otp !== MOCK_OTP) return res.status(400).json({ error: 'Invalid OTP' });

  try {
    const user = await prisma.user.findUnique({ where: { phone: value.phone } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create session
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    res.json({ token, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Me
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;