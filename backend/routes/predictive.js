import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get predictive data (7-day forecast)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { grade = 'Kangeta' } = req.query;

    // Get last 7 days of predictions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const predictions = await prisma.prediction.findMany({
      where: {
        grade,
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 7,
    });

    // Transform to match frontend format
    const data = predictions.map(prediction => ({
      day: prediction.date.toLocaleDateString('en-US', { weekday: 'short' }),
      actualPrice: prediction.actualPrice,
      predictedPrice: prediction.predictedPrice,
      demandVol: prediction.demandVolume,
    }));

    // Add current day if not in database
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const hasToday = data.some(d => d.day === today);

    if (!hasToday) {
      // Generate mock current day data
      const currentPrice = 450 + Math.random() * 50;
      data.unshift({
        day: today,
        actualPrice: Math.round(currentPrice),
        predictedPrice: Math.round(currentPrice + Math.random() * 20),
        demandVol: Math.round(1000 + Math.random() * 500),
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Predictive data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch predictive data',
    });
  }
});

// Get AI recommendation (simplified)
router.get('/recommendation', authenticateToken, async (req, res) => {
  try {
    // Get user's role and recent activity
    const user = req.user;

    let recommendation = '';

    if (user.role === 'FARMER') {
      // Get farmer's listings
      const listings = await prisma.listing.findMany({
        where: {
          farmerId: user.id,
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      if (listings.length === 0) {
        recommendation = 'Create your first listing to start selling!';
      } else {
        // Simple recommendation based on market trends
        const recentPredictions = await prisma.prediction.findMany({
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
          orderBy: {
            date: 'desc',
          },
          take: 7,
        });

        const avgPredictedPrice = recentPredictions.reduce((sum, p) => sum + p.predictedPrice, 0) / recentPredictions.length;
        const currentAvgPrice = listings.reduce((sum, l) => sum + l.price, 0) / listings.length;

        if (avgPredictedPrice > currentAvgPrice * 1.1) {
          recommendation = 'Market prices are rising! Consider holding your harvest for better prices.';
        } else if (avgPredictedPrice < currentAvgPrice * 0.9) {
          recommendation = 'Market prices are falling. Consider selling soon to maximize profits.';
        } else {
          recommendation = 'Market conditions are stable. Monitor prices closely for optimal timing.';
        }
      }
    } else if (user.role === 'BUYER') {
      recommendation = 'Browse current listings and place orders for fresh produce!';
    } else {
      recommendation = 'Monitor market trends and farmer activity.';
    }

    res.json({
      recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get recommendation',
    });
  }
});

// Get market insights (for admin dashboard)
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    // Get various market insights
    const [
      totalListings,
      activeListings,
      totalUsers,
      totalOrders,
      recentPredictions,
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.order.count(),
      prisma.prediction.findMany({
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    // Calculate average prices
    const avgPrices = recentPredictions.reduce((acc, p) => {
      if (!acc[p.grade]) acc[p.grade] = [];
      acc[p.grade].push(p.predictedPrice);
      return acc;
    }, {});

    const gradeAverages = Object.entries(avgPrices).map(([grade, prices]) => ({
      grade,
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    }));

    res.json({
      totalListings,
      activeListings,
      totalUsers,
      totalOrders,
      gradeAverages,
      marketHealth: activeListings > 0 ? 'Good' : 'Needs Attention',
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get insights',
    });
  }
});

export default router;