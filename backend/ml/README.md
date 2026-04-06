# Miraa Price Prediction ML Service

This directory contains the machine learning service for predicting Miraa market prices and demand volumes using advanced AI models.

## Features

- **Facebook Prophet**: Time series forecasting with seasonality detection
- **ARIMA Models**: Statistical time series analysis
- **Real-time Predictions**: 7-day price and demand forecasts
- **Confidence Intervals**: Uncertainty quantification for predictions
- **Historical Data**: 365+ days of Miraa price data

## Models Used

1. **Prophet Model**: Handles seasonality, holidays, and trend changes
2. **ARIMA Model**: Statistical approach for time series forecasting
3. **Ensemble Approach**: Combines multiple models for better accuracy

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the ML service:
```bash
python miraa_predictor.py
```

Or use the batch file:
```bash
run_ml_service.bat
```

The service will start on `http://localhost:5000`

## API Endpoints

### GET /forecast
Returns price and demand predictions for the next 7 days.

**Response:**
```json
{
  "success": true,
  "currentAvgPrice": 2280,
  "priceTrend": "rising",
  "recommendation": "Strong upward trend detected...",
  "forecast": [...],
  "analysis": {...},
  "chartData": [...],
  "modelInfo": {...}
}
```

### GET /health
Health check endpoint.

### POST /train
Retrain the ML models with latest data.

## Data Format

Historical data should be in CSV format with columns:
- `date`: YYYY-MM-DD format
- `price_kes`: Price in Kenyan Shillings
- `demand_volume`: Demand in kilograms
- `region`: Market region
- `grade`: Product grade

## Integration

The Node.js backend automatically calls this service at `/api/predictive/forecast`. If the ML service is unavailable, it falls back to simple linear regression.

## Performance

- **Training Time**: ~30 seconds on startup
- **Prediction Time**: <1 second per request
- **Memory Usage**: ~200MB with models loaded
- **Accuracy**: MAE typically 2-5% for price predictions