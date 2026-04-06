import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from prophet import Prophet
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

class MiraaPricePredictor:
    def __init__(self):
        self.price_model = None
        self.demand_model = None
        self.price_arima = None
        self.demand_arima = None
        self.last_trained = None
        self.historical_data = None

    def load_historical_data(self, csv_path='historical_data.csv'):
        """Load historical Miraa price and demand data"""
        try:
            self.historical_data = pd.read_csv(csv_path)
            self.historical_data['date'] = pd.to_datetime(self.historical_data['date'])
            self.historical_data = self.historical_data.sort_values('date')
            print(f"Loaded {len(self.historical_data)} historical records")
            return True
        except Exception as e:
            print(f"Error loading historical data: {e}")
            return False

    def train_prophet_model(self, data, target_column):
        """Train Facebook Prophet model for time series forecasting"""
        # Prepare data for Prophet
        prophet_data = data[['date', target_column]].copy()
        prophet_data.columns = ['ds', 'y']

        # Initialize and fit Prophet model
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0
        )

        model.fit(prophet_data)
        return model

    def train_arima_model(self, data, target_column):
        """Train ARIMA model as backup"""
        # Prepare data
        ts_data = data.set_index('date')[target_column]

        # Fit ARIMA model (p,d,q) - we'll use auto parameters
        try:
            model = ARIMA(ts_data, order=(5,1,2))  # ARIMA(5,1,2) for price series
            fitted_model = model.fit()
            return fitted_model
        except:
            # Fallback to simpler model
            model = ARIMA(ts_data, order=(1,1,1))
            fitted_model = model.fit()
            return fitted_model

    def train_models(self):
        """Train both Prophet and ARIMA models for price and demand prediction"""
        if self.historical_data is None:
            print("No historical data loaded")
            return False

        print("Training price prediction models...")

        # Train Prophet models
        self.price_model = self.train_prophet_model(self.historical_data, 'price_kes')
        self.demand_model = self.train_prophet_model(self.historical_data, 'demand_volume')

        # Train ARIMA models as backup
        self.price_arima = self.train_arima_model(self.historical_data, 'price_kes')
        self.demand_arima = self.train_arima_model(self.historical_data, 'demand_volume')

        self.last_trained = datetime.now()
        print("Models trained successfully!")
        return True

    def predict_future(self, days_ahead=7):
        """Generate predictions for the next N days"""
        if self.price_model is None or self.demand_model is None:
            print("Models not trained yet")
            return None

        # Create future dates
        last_date = self.historical_data['date'].max()
        future_dates = pd.date_range(start=last_date + timedelta(days=1),
                                   periods=days_ahead, freq='D')

        # Prepare future dataframe for Prophet
        future_df = pd.DataFrame({'ds': future_dates})

        # Make predictions
        price_forecast = self.price_model.predict(future_df)
        demand_forecast = self.demand_model.predict(future_df)

        # Extract predictions
        predictions = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        for i, date in enumerate(future_dates):
            predictions.append({
                'day': day_names[date.weekday()],
                'fullDate': date.strftime('%Y-%m-%d'),
                'predictedPrice': round(float(price_forecast.iloc[i]['yhat'])),
                'predictedDemand': round(float(demand_forecast.iloc[i]['yhat'])),
                'priceLower': round(float(price_forecast.iloc[i]['yhat_lower'])),
                'priceUpper': round(float(price_forecast.iloc[i]['yhat_upper'])),
                'demandLower': round(float(demand_forecast.iloc[i]['yhat_lower'])),
                'demandUpper': round(float(demand_forecast.iloc[i]['yhat_upper']))
            })

        return predictions

    def get_current_price(self):
        """Get the most recent actual price"""
        if self.historical_data is None:
            return 450  # Default fallback

        return float(self.historical_data['price_kes'].iloc[-1])

    def analyze_trend(self, predictions):
        """Analyze price trend and generate recommendations"""
        if not predictions:
            return {'trend': 'unknown', 'recommendation': 'Insufficient data'}

        # Calculate trend based on price predictions
        prices = [p['predictedPrice'] for p in predictions]
        avg_current = self.get_current_price()
        avg_future = np.mean(prices)

        trend = 'stable'
        if avg_future > avg_current * 1.05:
            trend = 'rising'
        elif avg_future < avg_current * 0.95:
            trend = 'falling'

        # Generate recommendation
        if trend == 'rising':
            recommendation = "Strong upward trend detected. Consider holding harvest for 2-3 days to maximize profits."
        elif trend == 'falling':
            recommendation = "Prices are declining. Recommend immediate harvest and sale to avoid further losses."
        else:
            recommendation = "Market is stable. Proceed with normal harvesting schedule."

        return {
            'trend': trend,
            'recommendation': recommendation,
            'avg_future_price': round(avg_future),
            'price_change_percent': round(((avg_future - avg_current) / avg_current) * 100, 2)
        }

    def get_forecast_data(self):
        """Get complete forecast data for API response"""
        predictions = self.predict_future(7)
        analysis = self.analyze_trend(predictions)

        # Get recent historical data for charts (last 30 days)
        recent_data = self.historical_data.tail(30) if self.historical_data is not None else []

        # Combine actual and predicted data for charts
        chart_data = []
        for _, row in recent_data.iterrows():
            chart_data.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'actualPrice': float(row['price_kes']),
                'actualDemand': int(row['demand_volume']),
                'predictedPrice': None,
                'predictedDemand': None
            })

        # Add predictions
        for pred in predictions:
            chart_data.append({
                'date': pred['fullDate'],
                'actualPrice': None,
                'actualDemand': None,
                'predictedPrice': pred['predictedPrice'],
                'predictedDemand': pred['predictedDemand']
            })

        return {
            'success': True,
            'currentAvgPrice': self.get_current_price(),
            'forecast': predictions,
            'analysis': analysis,
            'chartData': chart_data,
            'modelInfo': {
                'lastTrained': self.last_trained.isoformat() if self.last_trained else None,
                'dataPoints': len(self.historical_data) if self.historical_data is not None else 0
            }
        }

# Global predictor instance
predictor = MiraaPricePredictor()

# Flask API
app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'miraa-ml-service'})

@app.route('/train', methods=['POST'])
def train_models():
    """Train the ML models"""
    try:
        success = predictor.load_historical_data()
        if not success:
            return jsonify({'error': 'Failed to load historical data'}), 500

        success = predictor.train_models()
        if not success:
            return jsonify({'error': 'Failed to train models'}), 500

        return jsonify({'message': 'Models trained successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forecast', methods=['GET'])
def get_forecast():
    """Get price and demand forecast"""
    try:
        if predictor.price_model is None:
            # Auto-train if not trained yet
            success = predictor.load_historical_data()
            if success:
                predictor.train_models()

        data = predictor.get_forecast_data()
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/predict/<int:days>', methods=['GET'])
def predict_days(days):
    """Predict for specific number of days"""
    try:
        predictions = predictor.predict_future(days)
        return jsonify({'predictions': predictions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize and train models on startup
    print("Initializing Miraa Price Prediction Service...")
    predictor.load_historical_data()
    predictor.train_models()

    print("Starting Flask API server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)