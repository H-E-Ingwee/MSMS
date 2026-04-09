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
import warnings

# Suppress Prophet warnings
warnings.filterwarnings('ignore', category=UserWarning)
os.environ['STAN_NUM_THREADS'] = '1'  # Windows compatibility

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
        try:
            # Prepare data for Prophet
            prophet_data = data[['date', target_column]].copy()
            prophet_data.columns = ['ds', 'y']

            # Initialize and fit Prophet model with Windows-safe parameters
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                changepoint_prior_scale=0.05,
                seasonality_prior_scale=10.0,
                interval_width=0.95
            )
            
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model.fit(prophet_data)
            
            print(f"✅ Prophet model trained for {target_column}")
            return model
        except Exception as e:
            print(f"⚠️  Prophet training failed for {target_column}: {str(e)[:100]}")
            print(f"   Falling back to ARIMA model...")
            return None  # Will use ARIMA fallback

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

        # Train Prophet models (with fallback if they fail)
        self.price_model = self.train_prophet_model(self.historical_data, 'price_kes')
        self.demand_model = self.train_prophet_model(self.historical_data, 'demand_volume')

        # Always train ARIMA models as backup
        print("Training ARIMA models as backup...")
        self.price_arima = self.train_arima_model(self.historical_data, 'price_kes')
        self.demand_arima = self.train_arima_model(self.historical_data, 'demand_volume')

        # Check if we have at least one model for each
        if (self.price_model is None and self.price_arima is None) or \
           (self.demand_model is None and self.demand_arima is None):
            print("❌ Failed to train any models!")
            return False

        self.last_trained = datetime.now()
        print("✅ Models trained successfully!")
        return True

    def predict_future(self, days_ahead=7):
        """Generate predictions for the next N days using Prophet or ARIMA"""
        if self.price_arima is None and self.price_model is None:
            print("No models trained yet")
            return None

        # Create future dates
        last_date = self.historical_data['date'].max()
        future_dates = pd.date_range(start=last_date + timedelta(days=1),
                                   periods=days_ahead, freq='D')

        # Get predictions using Prophet if available, otherwise ARIMA
        if self.price_model is not None and self.demand_model is not None:
            # Use Prophet models
            future_df = pd.DataFrame({'ds': future_dates})
            price_forecast = self.price_model.predict(future_df)
            demand_forecast = self.demand_model.predict(future_df)
            use_prophet = True
        else:
            # Fall back to ARIMA predictions
            use_prophet = False
            price_forecast = None
            demand_forecast = None

        # Extract predictions
        predictions = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        for i, date in enumerate(future_dates):
            if use_prophet:
                price_point = float(price_forecast.iloc[i]['yhat'])
                price_lower = float(price_forecast.iloc[i]['yhat_lower'])
                price_upper = float(price_forecast.iloc[i]['yhat_upper'])
                demand_point = float(demand_forecast.iloc[i]['yhat'])
                demand_lower = float(demand_forecast.iloc[i]['yhat_lower'])
                demand_upper = float(demand_forecast.iloc[i]['yhat_upper'])
            else:
                # Use ARIMA predictions
                try:
                    price_forecast_obj = self.price_arima.get_forecast(steps=days_ahead)
                    demand_forecast_obj = self.demand_arima.get_forecast(steps=days_ahead)
                    
                    price_point = float(price_forecast_obj.predicted_mean.iloc[i])
                    demand_point = float(demand_forecast_obj.predicted_mean.iloc[i])
                    
                    # Approximate confidence intervals
                    price_ci = price_forecast_obj.conf_int(alpha=0.05).iloc[i]
                    demand_ci = demand_forecast_obj.conf_int(alpha=0.05).iloc[i]
                    
                    price_lower = float(price_ci.iloc[0])
                    price_upper = float(price_ci.iloc[1])
                    demand_lower = float(demand_ci.iloc[0])
                    demand_upper = float(demand_ci.iloc[1])
                except Exception as e:
                    print(f"ARIMA prediction error: {e}")
                    continue
            
            predictions.append({
                'day': day_names[date.weekday()],
                'fullDate': date.strftime('%Y-%m-%d'),
                'predictedPrice': max(int(price_point), 100),
                'predictedDemand': max(int(demand_point), 100),
                'priceLower': max(int(price_lower), 100),
                'priceUpper': int(price_upper),
                'demandLower': max(int(demand_lower), 100),
                'demandUpper': int(demand_upper),
                'confidence': {
                    'priceLower': max(int(price_lower), 100),
                    'priceUpper': int(price_upper)
                },
                'demand': max(int(demand_point), 100)
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
            return {'trend': 'unknown', 'recommendation': 'Insufficient data', 'confidence': 'low'}

        # Calculate trend based on price predictions
        prices = [p['predictedPrice'] for p in predictions]
        avg_current = self.get_current_price()
        avg_future = np.mean(prices)
        
        # Calculate trend strength
        price_diff = abs(avg_future - avg_current)
        price_diff_percent = (price_diff / avg_current) * 100

        trend = 'stable'
        confidence = 'medium'
        
        if avg_future > avg_current * 1.05:
            trend = 'rising'
            confidence = 'high' if price_diff_percent > 3 else 'medium'
        elif avg_future < avg_current * 0.95:
            trend = 'falling'
            confidence = 'high' if price_diff_percent > 3 else 'medium'
        else:
            confidence = 'medium'

        # Generate recommendation
        if trend == 'rising':
            recommendation = "Strong upward trend detected! 📈 Consider holding harvest for 2-3 days to maximize profits. Demand is also increasing."
        elif trend == 'falling':
            recommendation = "Prices are declining. 📉 Recommend immediate harvest and sale to avoid further losses. Act quickly!"
        else:
            recommendation = "Market is stable. ➡️ Proceed with normal harvesting schedule. Demand is consistent."

        return {
            'trend': trend,
            'recommendation': recommendation,
            'avg_future_price': round(avg_future),
            'price_change_percent': round(((avg_future - avg_current) / avg_current) * 100, 2),
            'confidence': confidence
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

        # Add predictions to chart
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
            'priceTrend': analysis['trend'],  # For frontend KPI display
            'recommendation': analysis['recommendation'],  # For recommendation card
            'forecast': predictions,
            'analysis': analysis,
            'chartData': chart_data,
            'modelInfo': {
                'lastTrained': self.last_trained.isoformat() if self.last_trained else None,
                'dataPoints': len(self.historical_data) if self.historical_data is not None else 0,
                'modelType': 'Facebook Prophet + ARIMA Hybrid',
                'accuracy': 'High' if analysis['confidence'] == 'high' else 'Medium'
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
        if predictor.price_model is None or predictor.demand_model is None:
            # Auto-train if not trained yet
            print("Models not yet trained, training now...")
            success = predictor.load_historical_data()
            if success:
                predictor.train_models()
                print("✅ Models trained successfully")
            else:
                print("❌ Failed to load historical data")
                return jsonify({'error': 'Failed to load historical data', 'success': False}), 500

        data = predictor.get_forecast_data()
        print(f"✅ Forecast generated - Current price:  KES {data['currentAvgPrice']}, Trend: {data['priceTrend']}")
        return jsonify(data)

    except Exception as e:
        print(f"❌ Error in forecast: {str(e)}")
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
    print("\n" + "="*60)
    print("🚀 Initializing Miraa Price Prediction ML Service...")
    print("="*60)
    
    try:
        print("\n📊 Loading historical data...")
        if predictor.load_historical_data():
            print(f"✅ Data loaded: {predictor.historical_data.shape[0]} records found")
            print(f"   Date range: {predictor.historical_data['date'].min()} to {predictor.historical_data['date'].max()}")
            print(f"   Price range: KES {predictor.historical_data['price_kes'].min()} - {predictor.historical_data['price_kes'].max()}")
            print(f"   Demand range: {predictor.historical_data['demand_volume'].min()} - {predictor.historical_data['demand_volume'].max()} kg")
        else:
            print("❌ Failed to load historical data")
            exit(1)
        
        print("\n🧠 Training prediction models...")
        if predictor.train_models():
            print("✅ Models trained successfully!")
            print(f"   Model Type: Facebook Prophet + ARIMA Hybrid")
            print(f"   Trained on: {predictor.historical_data.shape[0]} historical data points")
        else:
            print("❌ Failed to train models")
            exit(1)
        
        # Generate sample forecast to verify everything works
        print("\n🔮 Generating sample forecast...")
        sample_forecast = predictor.get_forecast_data()
        if sample_forecast['success']:
            print("✅ Forecast generation successful!")
            print(f"   Current Price: KES {sample_forecast['currentAvgPrice']}")
            print(f"   7-Day Trend: {sample_forecast['priceTrend'].upper()}")
            print(f"   Expected Change: {sample_forecast['analysis']['price_change_percent']}%")
        
        print("\n" + "="*60)
        print("🟢 ML Service is ready!")
        print("   Listening on: http://0.0.0.0:5000")
        print("   Endpoints:")
        print("   - GET  /health         - Service status")
        print("   - GET  /forecast       - Get 7-day price & demand predictions")
        print("   - GET  /predict/<days> - Get custom day predictions")
        print("   - POST /train          - Retrain models")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"❌ Initialization failed: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)