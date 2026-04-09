# ⚡ Quick Command Reference - MSMS ML & Database

## 🚀 START EVERYTHING

```bash
# Terminal 1: ML Service
cd backend/ml
python miraa_predictor.py
# Expected: 🟢 ML Service is ready!

# Terminal 2: Backend Server
cd backend
npm start
# Or: node server.js

# Terminal 3: Frontend
npm run dev
# Opens: http://localhost:5173
```

---

## 📊 VIEW DATA & PREDICTIONS

```bash
# View Database (Visual Interface)
cd backend
npx prisma studio
# Opens: http://localhost:5173 (Prisma Studio)

# View Historical Data
cat backend/ml/historical_data.csv

# View Data Visualization in Terminal
cd backend/ml
python visualize_data.py
```

---

## 🛠️ MANAGE DATASET

```bash
# Interactive Dataset Manager
cd backend/ml
python manage_dataset.py

# Options:
# 1 = View Summary
# 2 = Add new entry
# 3 = Generate test data
# 4 = Export for training
# 5 = View recent entries
```

---

## 🤖 ML MODEL OPERATIONS

```bash
# Check ML Service Status
curl http://localhost:5000/health

# Get 7-Day Forecast
curl http://localhost:5000/forecast

# Get Custom Days Forecast
curl http://localhost:5000/predict/14
# Gets 14-day forecast

# Retrain Models
curl -X POST http://localhost:5000/train
```

---

## 📈 ACCESS DASHBOARD

```
http://localhost:5173
    ↓
Click "Dashboard" in navigation
    ↓
View:
- Current price KES/kg
- 7-day predictions
- Price trend chart
- Demand forecast
- Farming recommendations
```

---

## 🔄 DAILY WORKFLOW

```bash
# 1. Start ML Service (if not running)
cd backend/ml && python miraa_predictor.py

# 2. Add today's actual market price
cd backend/ml && python manage_dataset.py
# Select option 2, enter date/price/demand

# 3. View updated dashboard
# Open http://localhost:5173/dashboard

# 4. Check predictions and recommendations
# Make farming decisions based on trends
```

---

## 📅 WEEKLY WORKFLOW

```bash
# 1. Add week's prices to dataset
cd backend/ml && python manage_dataset.py

# 2. Visualize trends
python visualize_data.py
# Option 5: View insights

# 3. Check data quality
python visualize_data.py
# Option 6: Data quality assessment

# 4. Restart ML service (automatic retraining)
# Stop and restart: python miraa_predictor.py

# 5. Review prediction accuracy
# Compare predicted vs actual prices from last week
```

---

## 📁 IMPORTANT FILES

```
backend/ml/
├── miraa_predictor.py           Main ML model
├── historical_data.csv          Add data here
├── manage_dataset.py            Data manager
├── visualize_data.py            Terminal visualization
├── DATASET_TRAINING_GUIDE.md    Full documentation
└── run_ml_service.bat           Windows start script

src/pages/
└── DashboardPage.jsx            Farmer dashboard

frontend/
├── nginx.conf                   Production config
└── index.html                   Entry point
```

---

## 🐛 TROUBLESHOOT

```bash
# ML Service not responding?
lsof -i :5000              # Check if port 5000 in use
netstat -ano | grep 5000   # Windows equivalent

# Models training slowly?
# Normal: Takes 5-15 seconds on first start
# Then uses cached models: < 100ms

# Predictions seem wrong?
cd backend/ml && python manage_dataset.py
# Add correct data, restart service

# Dashboard shows fallback data?
# ML service might not be running
# Check terminal: should see "🟢 ML Service is ready!"

# Port already in use?
# Change port in miraa_predictor.py line:
# app.run(host='0.0.0.0', port=5000)  ← Change 5000 to 5001
```

---

## 🔗 API ENDPOINTS

```
/health
  ↳ GET  Check if service running
  ↳ Returns: {"status": "healthy"}

/forecast
  ↳ GET  Get 7-day price & demand forecast
  ↳ Returns: {prices, trends, recommendations}

/predict/<days>
  ↳ GET  Custom period prediction
  ↳ Example: /predict/14 (14-day forecast)
  ↳ Returns: {predictions for N days}

/train
  ↳ POST  Retrain models immediately
  ↳ Returns: {status, dataPoints, trend}
```

---

## 💾 BACKUP & RESTORE

```bash
# Backup historical data
cp backend/ml/historical_data.csv backend/ml/historical_data.csv.backup

# Restore from backup
cp backend/ml/historical_data.csv.backup backend/ml/historical_data.csv

# Export to another format
python backend/ml/manage_dataset.py
# View and manually export
```

---

## 📊 DATA FORMAT

```csv
# CSV Format (in historical_data.csv):
date,price_kes,demand_volume,region,grade

# Example:
2025-10-17,1450,11100,Nairobi,Grade A
2025-10-18,1455,11200,Nairobi,Grade A

# Requirements:
# - date: Must be YYYY-MM-DD format
# - price_kes: Integer, 100-5000 range recommended
# - demand_volume: Integer, positive only
# - region: Text (Nairobi, Mombasa, etc)
# - grade: Text (Grade A, Grade B, etc)
```

---

## 🎯 PREDICTIONS EXPLAINED

```
Current Price: KES 1,445/kg
↓
AI analyzes 200+ days of history
↓
Identifies patterns (seasonality, trends)
↓
Predicts next 7 days with confidence intervals
↓
Generates farming advice:

Price Trend: RISING (Confidence: HIGH)
Recommendation: Hold harvest 2-3 days
Expected Price: KES 1,470/kg (+1.73%)
Buyer Demand: 11,200 kg (INCREASING)

→ Farmer Action: HOLD & SELL IN 3 DAYS
```

---

## 📞 HELP & RESOURCES

```
Quick Start:
  QUICK_START_ML_DATABASE.md

Full ML Guide:
  backend/ml/DATASET_TRAINING_GUIDE.md

System Summary:
  ML_SYSTEM_IMPROVEMENTS_SUMMARY.md

API Docs:
  backend/API_REFERENCE.md

Code:
  backend/ml/miraa_predictor.py
  src/pages/DashboardPage.jsx
```

---

## ⚙️ CONFIGURATION

**Change ML Service Port:**
```python
# File: backend/ml/miraa_predictor.py
# Line at bottom:
app.run(host='0.0.0.0', port=5000, debug=False)
                          ↑
                    Change this number
```

**Change Backend Port:**
```bash
# File: backend/server.js
# Or use environment variable:
PORT=8080 npm start
```

**Change Frontend Port:**
```bash
# File: vite.config.js
# Or use environment variable:
VITE_PORT=3000 npm run dev
```

---

## 🔐 DATABASE

```bash
# View all database tables
cd backend && npx prisma studio

# Check migrations
npx prisma migrate status

# Apply pending migrations
npx prisma migrate dev

# Seed sample data
node backend/prisma/seed.js
```

---

## 📝 LOGS & DEBUGGING

```bash
# Check ML Service Logs
# Keep terminal open running: python miraa_predictor.py
# Logs appear in real-time

# Check Backend Logs
# Keep terminal open running: npm start

# Browser Console Logs
# Press F12 → Console tab
# View frontend errors/logs
```

---

## 🚀 DEPLOYMENT

```bash
# Build for production
npm run build

# Start production server
npm start

# Use with Python backend
# Set: ML_SERVICE_URL=http://your-ml-server:5000

# Deploy ML service separately
# Keep always running: python miraa_predictor.py &
```

---

**Quick Links:**
- Dashboard: http://localhost:5173/dashboard
- Database: http://localhost:5173 (Prisma Studio)
- ML Service: http://localhost:5000/health
- API Forecast: http://localhost:5000/forecast

**All Systems Go! 🚀**
