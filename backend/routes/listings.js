const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Get listings
router.get('/', async (req, res) => {
  const { grade, location, minPrice, maxPrice, status } = req.query;
  const where = {};
  if (grade) where.grade = grade;
  if (location) where.location = location;
  if (status) where.status = status;
  if (minPrice) where.pricePerKg = { gte: parseFloat(minPrice) };
  if (maxPrice) where.pricePerKg = { lte: parseFloat(maxPrice) };

  try {
    const listings = await prisma.listing.findMany({
      where,
      include: { farmer: { select: { name: true, phone: true } } }
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create listing
router.post('/', authenticate, authorize('FARMER'), async (req, res) => {
  const schema = Joi.object({
    grade: Joi.string().required(),
    quantityKg: Joi.number().positive().required(),
    pricePerKg: Joi.number().positive().required(),
    location: Joi.string().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const listing = await prisma.listing.create({
      data: {
        ...value,
        farmerId: req.user.id
      }
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my listings
router.get('/my', authenticate, authorize('FARMER'), async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { farmerId: req.user.id }
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;