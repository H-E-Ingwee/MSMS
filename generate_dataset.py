import datetime
import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Create date range from 2025-04-01 to 2026-04-09
start_date = datetime.date(2025, 4, 1)
end_date = datetime.date(2026, 4, 9)
date_range = pd.date_range(start=start_date, end=end_date, freq='D')

# Initialize arrays for data
dates = []
prices = []
demand_volumes = []
regions = []
grades = []

# Base price and parameters
base_price = 630  # Middle of 560-700 range
price_std = 45

for i, date in enumerate(date_range):
    # Get month for seasonal variation
    month = date.month
    
    # Seasonal variation pattern (prices higher in certain months)
    # Higher prices in dry seasons (Jan-Feb, Jun-Sep) - lower miraa supply
    if month in [1, 2, 6, 7, 8, 9]:
        seasonal_factor = 1.15  # 15% higher
    elif month in [3, 4, 5, 10, 11, 12]:
        seasonal_factor = 0.95  # 5% lower
    else:
        seasonal_factor = 1.0
    
    # Generate price with:
    # - Base price + seasonal variation + random noise
    # - Occasional spikes
    random_noise = np.random.normal(0, price_std)
    spike_probability = np.random.random()
    
    if spike_probability > 0.97:  # 3% chance of spike
        price = base_price * seasonal_factor + random_noise + np.random.uniform(300, 600)
    else:
        price = base_price * seasonal_factor + random_noise
    
    # Constrain price between realistic bounds
    price = np.clip(price, 560, 1200)
    
    # Generate correlated demand volume
    # Inverse relationship: higher prices -> lower demand typically
    # Price range normalized to 0-1
    price_normalized = (price - 560) / (1200 - 560)
    
    # Base demand with inverse correlation to price
    base_demand = 500 - (price_normalized * 250)
    
    # Add realistic variation to demand
    demand_variation = np.random.normal(0, 50)
    demand_volume = int(np.clip(base_demand + demand_variation, 100, 600))
    
    # Append to lists
    dates.append(date)
    prices.append(round(price, 2))
    demand_volumes.append(demand_volume)
    regions.append('Nairobi')
    grades.append('Grade A')

# Create DataFrame
df = pd.DataFrame({
    'date': dates,
    'price_kes': prices,
    'demand_volume': demand_volumes,
    'region': regions,
    'grade': grades
})

# Format date column as string for CSV
df['date'] = df['date'].dt.strftime('%Y-%m-%d')

# Save to CSV
csv_path = 'backend/ml/historical_data.csv'
df.to_csv(csv_path, index=False)

print(f"Dataset generated and saved to {csv_path}")
print(f"Total records: {len(df)}")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")
print(f"Price range: {df['price_kes'].min()} - {df['price_kes'].max()} KES")
print(f"Average demand volume: {df['demand_volume'].mean():.0f} units")
print("\n--- First 10 records ---")
print(df.head(10).to_string(index=False))
print("\n--- Last 10 records ---")
print(df.tail(10).to_string(index=False))
