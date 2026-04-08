# MSMS AI Prediction Integration

## Overview

MSMS includes a predictive machine learning component designed to provide Miraa price and demand forecasts. The system combines time-series AI models with application-level trend analysis so buyers and farmers can make smarter decisions.

This predictive integration is built as a separate Python microservice and connected to the main Node/Express backend through a dedicated predictive API route.

## Where AI is integrated

### Backend Python ML service

The core AI logic lives in:
- `backend/ml/miraa_predictor.py`
- `backend/ml/historical_data.csv`

### Node/Express integration

The backend route that exposes prediction data is:
- `backend/routes/predictive.js`

This route is configured to use an ML service URL via `ML_SERVICE_URL` and return forecast payloads to the frontend.

### Frontend consumption

The React frontend consumes predictions via:
- `src/services/api.js`
  - `getPredictiveData()`

It displays forecast charts, price trend messages, and recommendations in the dashboard.

## AI architecture

### Algorithms used

The prediction service uses a hybrid time-series approach:
- **Facebook Prophet** for primary forecasting of price and demand
- **ARIMA** as a backup model for resilience and comparison

This combination supports seasonality and trend detection while allowing fallback behavior when data patterns change.

### Data inputs

The model is trained on historical Miraa market data stored in:
- `backend/ml/historical_data.csv`

Key columns include:
- `date`
- `price_kes`
- `demand_volume`

The service converts the `date` field into a datetime index and sorts records chronologically before training.

## Service workflow

### 1. Data loading

The Python service loads historical data via `load_historical_data()`.
It validates the CSV, parses dates, and prepares the dataset for forecasting.

### 2. Model training

The training pipeline executes two paths:

- `train_prophet_model()`
  - Targets: `price_kes`, `demand_volume`
  - Enables yearly and weekly seasonality
  - Uses changepoint priors to smooth trend adaptation

- `train_arima_model()`
  - Targets: `price_kes`, `demand_volume`
  - Uses ARIMA(p,d,q) on the same time series as a backup model

### 3. Forecast generation

The service generates N-day forecasts using `predict_future(days_ahead)`:
- Builds future dates after the last historical record
- Uses Prophet models to predict price and demand
- Outputs `yhat`, `yhat_lower`, and `yhat_upper`
- Rounds values and formats them for frontend display

### 4. Analysis and recommendations

Beyond numeric prediction, the service produces a simple trend analysis with a recommendation:
- Compares average future price to current price
- Determines if market is rising, falling, or stable
- Generates a business-friendly recommendation such as:
  - "Hold harvest for 2-3 days"
  - "Sell now to avoid losses"
  - "Proceed with normal schedule"

### 5. API payload

The prediction endpoint returns:
- `success`
- `currentAvgPrice`
- `forecast` array with daily predictions
- `analysis` object with trend and recommendation
- `chartData` for combined historical + forecast charts
- `modelInfo` including `lastTrained` and `dataPoints`

## Predictive service endpoints

The ML service exposes these Flask endpoints:

- `GET /health` — health check
- `POST /train` — train or re-train models
- `GET /forecast` — get the latest 7-day forecast
- `GET /predict/<days>` — get a variable horizon forecast

## Main backend integration

The Node backend route in `backend/routes/predictive.js` is set up to call the Python service via `ML_SERVICE_URL`. In the current architecture, it also provides a robust fallback path that generates a simple linear regression prediction when the external service is unavailable.

### Current integration behavior

- The backend route returns an ML-style forecast payload.
- It is designed to support a live Python AI service.
- If the service is unavailable, the route can still return fallback predictions using historical DB data and linear regression.

## Setup instructions

### Install Python dependencies

From `backend/ml`:

```bash
cd backend/ml
pip install -r requirements.txt
```

### Run the prediction service

```bash
python miraa_predictor.py
```

Or use the helper batch file on Windows:

```bash
cd backend/ml
./run_ml_service.bat
```

### Configure the main backend

Set the ML service URL in `backend/.env`:

```env
ML_SERVICE_URL=http://localhost:5000
```

### Train models

Call the Python service:

```bash
curl -X POST http://localhost:5000/train
```

Or rely on the auto-train behavior when the service starts.

## Frontend integration details

The frontend calls the Node API at `/api/predictive/forecast`, which returns the ML payload. This is used in the dashboard to show:
- predicted price curves
- demand forecasts
- future market trend
- AI-driven recommendations

## AI design rationale

The predictive engine is purpose-built for agricultural market forecasting with these priorities:
- **Robustness**: Use Prophet for seasonality and ARIMA for backup
- **Actionability**: Provide recommendations, not just numbers
- **Resilience**: Support fallback predictions when the ML service is offline
- **Explainability**: Expose price bounds and trend signals to users

## Future improvements

Potential AI enhancements include:
- integrating real-time listing and order volume data from the main database
- adding feature engineering for weather, location, crop grade, and seasonality
- migrating from Prophet/ARIMA to an ensemble of LSTM or transformer time-series models
- adding automated retraining pipelines with new historical data
- surfacing confidence intervals and anomaly alerts in the dashboard

## Key files

- `backend/ml/miraa_predictor.py`
- `backend/routes/predictive.js`
- `backend/ml/historical_data.csv`
- `backend/ml/requirements.txt`
- `src/services/api.js`

## How it works end to end

1. Historical Miraa price and demand data is loaded from CSV.
2. The Python service trains Prophet and ARIMA models on daily market data.
3. The service exposes forecasts through a Flask API.
4. The Node backend proxies or supplements this AI data via `/api/predictive/forecast`.
5. The React frontend fetches predictions and displays them as charts and recommendations.
6. Users can use the forecast to decide whether to sell now, wait, or monitor demand.
