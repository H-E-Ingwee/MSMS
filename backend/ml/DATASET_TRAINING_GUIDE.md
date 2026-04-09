# Miraa Price Prediction Model - Dataset & Training Guide

## 📊 Overview
This ML service uses **Facebook Prophet** and **ARIMA** models to predict Miraa prices and demand for the next 7 days based on historical data.

---

## 🗂️ Dataset Location
**File:** `historical_data.csv`

**Location:** `/backend/ml/historical_data.csv`

### Dataset Structure
```
Columns:
- date          : Date (YYYY-MM-DD format)
- price_kes     : Price in Kenyan Shillings per kg
- demand_volume : Quantity in kg that buyers want to purchase
- region        : Market region (e.g., Nairobi)
- grade         : Miraa grade (e.g., Grade A, Grade B)
```

### Current Data Sample
```
date,price_kes,demand_volume,region,grade
2025-04-01,450,1200,Nairobi,Grade A
2025-04-02,460,1250,Nairobi,Grade A
...
2025-10-16,1445,11000,Nairobi,Grade A
```

**Current Status:**
- Total Records: 200+ historical entries
- Date Range: April 1, 2025 - October 16, 2025
- Price Range: KES 450 - 1445/kg
- Demand Range: 1200 - 11000 kg

---

## 🔄 How the Model Works

### 1. **Data Loading**
- Reads CSV file with historical price and demand data
- Validates and sorts by date

### 2. **Model Training** 
Two models are trained for each metric (price and demand):
- **Facebook Prophet**: Captures seasonal trends and long-term patterns
- **ARIMA**: Captures short-term temporal dependencies

### 3. **Prediction Generation**
- Forecasts next 7 days using trained models
- Includes confidence intervals (upper/lower bounds)
- Generates trend analysis and recommendations

### 4. **API Response**
Returns comprehensive forecasts with:
- Predicted prices & demand
- Confidence ranges
- Market trend (rising/falling/stable)
- Actionable recommendations

---

## 🚀 Starting the ML Service

### Option 1: Using Batch File (Windows)
```bash
# Navigate to the ML folder and run:
run_ml_service.bat
```

### Option 2: Direct Python Command
```bash
# From backend/ml directory:
python miraa_predictor.py
```

### Successful Startup Output Expected:
```
============================================================
🚀 Initializing Miraa Price Prediction ML Service...
============================================================

📊 Loading historical data...
✅ Data loaded: 200 records found
   Date range: 2025-04-01 00:00:00 to 2025-10-16 00:00:00
   Price range: KES 450 - 1445
   Demand range: 1200 - 11000 kg

🧠 Training prediction models...
✅ Models trained successfully!
   Model Type: Facebook Prophet + ARIMA Hybrid
   Trained on: 200 historical data points

🔮 Generating sample forecast...
✅ Forecast generation successful!
   Current Price: KES 1445
   7-Day Trend: RISING
   Expected Change: 3.16%

============================================================
🟢 ML Service is ready!
   Listening on: http://0.0.0.0:5000
   Endpoints:
   - GET  /health         - Service status
   - GET  /forecast       - Get 7-day price & demand predictions
   - GET  /predict/<days> - Get custom day predictions
   - POST /train          - Retrain models
============================================================
```

---

## 📝 Adding New Data to the Dataset

### Method 1: Direct CSV Editing
1. Open `historical_data.csv` in Excel or text editor
2. Add new rows with:
   - **date**: Format as YYYY-MM-DD
   - **price_kes**: Actual market price for that day
   - **demand_volume**: Total kg buyers wanted to purchase
   - **region**: Market region (Nairobi, Mombasa, etc.)
   - **grade**: Product grade (Grade A, Grade B, etc.)

**Example new entry:**
```
2025-10-17,1450,11100,Nairobi,Grade A
2025-10-18,1455,11200,Nairobi,Grade A
```

3. Save the file (keep CSV format)

### Method 2: Through API (Coming Soon)
```bash
POST /api/predictive/update-data
{
  "date": "2025-10-17",
  "price_kes": 1450,
  "demand_volume": 11100,
  "region": "Nairobi",
  "grade": "Grade A"
}
```

---

## 🔧 Retraining the Model with New Data

### Manual Retraining
Call the training endpoint:
```bash
curl -X POST http://localhost:5000/train
```

Expected response:
```json
{
  "message": "Models trained successfully",
  "timestamp": "2025-10-17T10:30:00Z",
  "dataPoints": 201,
  "trend": "rising"
}
```

### Automatic Retraining
The model automatically retrains when:
1. The service starts (loads and trains on all historical data)
2. New data is added to CSV
3. You call the `/train` endpoint

---

## 📊 Testing the Model

### 1. Check Health Status
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "miraa-ml-service"
}
```

### 2. Get Next 7-Day Forecast
```bash
curl http://localhost:5000/forecast
```

Response Sample:
```json
{
  "success": true,
  "currentAvgPrice": 1445,
  "priceTrend": "rising",
  "recommendation": "Strong upward trend detected!...",
  "forecast": [
    {
      "day": "Mon",
      "fullDate": "2025-10-17",
      "predictedPrice": 1450,
      "predictedDemand": 11100,
      "confidence": {
        "priceLower": 1420,
        "priceUpper": 1480
      }
    },
    ...
  ],
  "analysis": {
    "trend": "rising",
    "price_change_percent": 3.16,
    "confidence": "high"
  },
  "chainData": [...]
}
```

### 3. Custom Period Prediction (e.g., 14 days)
```bash
curl http://localhost:5000/predict/14
```

---

## 📈 Performance Metrics

### Model Accuracy
The model's reliability is indicated by:
- **High Confidence**: Price change > 3%, historical pattern clear
- **Medium Confidence**: Price change 1-3% or moderate pattern
- **Low Confidence**: Price change < 1% or unclear pattern

### Current Performance
- Training Data Points: 200+
- Forecast Horizon: 7 days
- Model Type: Prophet + ARIMA Hybrid
- Seasonality: Captured (daily, weekly, yearly patterns)

---

## 🐛 Troubleshooting

### Problem: "Models not trained yet"
**Solution**: Service will auto-train on startup. Wait 10-15 seconds for initial training.

### Problem: Forecast seems unrealistic
**Solution**: 
1. Check if new data needs to be added to CSV
2. Retrain with: `POST /train`
3. Verify data in CSV is chronologically sorted

### Problem: Service won't start
**Solution**:
1. Ensure Python packages are installed:
   ```bash
   pip install pandas numpy prophet statsmodels scikit-learn flask flask-cors joblib
   ```
2. Check that `historical_data.csv` exists
3. Verify CSV file format is correct

### Problem: Empty/No Forecasts
**Solution**:
1. Verify CSV has at least 30 days of data
2. Check date format is YYYY-MM-DD
3. Ensure price_kes and demand_volume columns exist
4. Run: `POST /train` to retrain

---

## 🎯 Best Practices

### Data Quality
✅ **Do:**
- Update data daily with actual market prices
- Include both price and demand data
- Keep historical records for at least 3 months
- Verify prices are reasonable (between 100-5000 KES)

❌ **Don't:**
- Have gaps in dates (missing days)
- Enter unrealistic prices (0 or > 10000)
- Mix different regions without noting
- Delete historical data

### Regular Maintenance
1. **Daily**: Update `historical_data.csv` with actual prices
2. **Weekly**: Review if forecasts match actual prices
3. **Monthly**: Verify model performance and accuracy
4. **As Needed**: Retrain if adding many new data points

---

## 📞 Integration with Backend

The ML service integrates with your Node.js backend at:
**File:** `/backend/routes/predictive.js`

The backend:
1. Checks if ML service is running at `http://localhost:5000`
2. Calls `/forecast` endpoint
3. Returns data to frontend dashboard
4. Falls back to simple model if ML service unavailable

---

## 🚀 Next Steps

1. **Update historical data** with real market prices
2. **Start the ML service** using `run_ml_service.bat` or `python miraa_predictor.py`
3. **Monitor predictions** through the Dashboard
4. **Refine data** based on actual market conditions
5. **Retrain monthly** with accumulated data

---

## 📚 Technical Details

### Libraries Used
- **Pandas**: Data manipulation and time series handling
- **NumPy**: Numerical computations
- **Prophet**: Facebook's time series forecasting library
- **ARIMA**: AutoRegressive statistical forecasting
- **Flask**: Web API framework
- **scikit-learn**: ML utilities and metrics

### Model Parameters
- Prophet Seasonality: Yearly + Weekly
- Changepoint Prior Scale: 0.05 (high flexibility)
- Seasonality Prior Scale: 10.0 (strong seasonal component)
- ARIMA Order: (5,1,2) for prices, (1,1,1) for demand

---

## 💡 Tips for Better Predictions

1. **More Data = Better Predictions**
   - Minimum 30 days required
   - Ideal: 6+ months of data

2. **Include All Date Points**
   - Even weekends and holidays
   - Gaps affect trend analysis

3. **Monitor Real vs Predicted**
   - Track accuracy over time
   - Adjust if systematic bias detected

4. **Combine with Domain Knowledge**
   - Use AI predictions as guide, not gospel
   - Factor in season, holidays, events

---

**Last Updated:** April 9, 2026
**Service Version:** 2.0 (Prophet + ARIMA Hybrid)
