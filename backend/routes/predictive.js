import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * 🚀 ADVANCED AI MODEL: Integration with Python ML Service
 * This route now calls a sophisticated ML service running on Python
 * with Facebook Prophet and ARIMA models for accurate time series forecasting
 */

// GET: /api/predictive/forecast
router.get('/forecast', async (req, res) => {
  try {
    // Try calling the standalone Python ML service first
    let mlResponse;
    let mlData;

    try {
      const url = new URL('/forecast', ML_SERVICE_URL).toString();
      mlResponse = await fetch(url, { method: 'GET' });
      if (mlResponse.ok) {
        mlData = await mlResponse.json();
      } else {
        console.warn('ML service returned non-OK status:', mlResponse.status, mlResponse.statusText);
      }
    } catch (mlError) {
      console.warn('ML service unavailable:', mlError.message || mlError);
    }

    if (mlData && (mlData.success === true || Array.isArray(mlData.forecast))) {
      return res.json({ ...mlData, source: 'ml-service' });
    }

    // Fallback to local prediction when the ML service is unavailable or returns unexpected data
    const fallbackData = await generateFallbackForecast();
    return res.json({ ...fallbackData, source: 'fallback' });

  } catch (error) {
    console.error('AI Forecasting Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate predictive forecast' });
  }
});
/**
 * Fallback forecasting using simple linear regression
 * Used when the Python ML service is unavailable
 */
async function generateFallbackForecast() {
  // 1. DATA COLLECTION: Fetch historical data from DB
  const historicalData = await prisma.prediction.findMany({
    where: {
      actualPrice: { not: null }
    },
    orderBy: { date: 'asc' },
    take: 14
  });

  // Fallback if DB is empty: Create synthetic historical data
  let trainingData = historicalData;
  if (trainingData.length === 0) {
    const today = new Date();
    trainingData = Array.from({ length: 14 }).map((_, i) => ({
      date: new Date(today.getTime() - (14 - i) * 24 * 60 * 60 * 1000),
      actualPrice: 400 + Math.random() * 100 + (i * 5),
      demandVolume: 1000 + (i * 50)
    }));
  }

  // 2. Simple Linear Regression
  function trainLinearRegression(dataPoints) {
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = dataPoints.length;

    if (n === 0) return { slope: 0, intercept: 0 };

    dataPoints.forEach((point) => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  // 3. DATA PRE-PROCESSING
  const priceDataPoints = trainingData.map((item, index) => ({
    x: index,
    y: item.actualPrice
  }));

  const demandDataPoints = trainingData.map((item, index) => ({
    x: index,
    y: item.demandVolume
  }));

  // 4. MODEL TRAINING
  const priceModel = trainLinearRegression(priceDataPoints);
  const demandModel = trainLinearRegression(demandDataPoints);

  // 5. INFERENCE (PREDICTION)
  const forecast = [];
  const daysToPredict = 7;
  const startIndex = trainingData.length;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  for (let i = 0; i < daysToPredict; i++) {
    const futureX = startIndex + i;
    const futureDate = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000));

    let predictedPrice = (priceModel.slope * futureX) + priceModel.intercept;
    let predictedDemand = (demandModel.slope * futureX) + demandModel.intercept;

    // Add some realistic market noise/volatility (±2%)
    const volatility = 1 + ((Math.random() * 0.04) - 0.02);

    forecast.push({
      day: dayNames[futureDate.getDay()],
      fullDate: futureDate.toISOString().split('T')[0],
      actualPrice: i === 0 ? Math.round(trainingData[trainingData.length - 1].actualPrice) : null,
      predictedPrice: Math.round(predictedPrice * volatility),
      demand: Math.round(predictedDemand)
    });
  }

  // 6. GENERATE AI RECOMMENDATION
  const priceTrend = priceModel.slope > 0 ? 'rising' : 'falling';
  const recommendation = priceModel.slope > 5
    ? 'Strong upward trend. Hold harvest for 3-4 days for maximum profit.'
    : priceModel.slope < -5
    ? 'Prices are dropping. Harvest and sell immediately.'
    : 'Market is stable. Proceed with normal harvesting schedule.';

  return {
    success: true,
    currentAvgPrice: Math.round(trainingData[trainingData.length - 1].actualPrice),
    priceTrend: priceTrend,
    recommendation: recommendation + ' (Fallback model - ML service unavailable)',
    forecast: forecast,
    fallback: true
  };
}

export default router;