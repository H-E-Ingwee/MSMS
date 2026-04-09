import pandas as pd

# Load the CSV
df = pd.read_csv("historical_data.csv")

# Get current price stats
print(f"Current price range: {df['price_kes'].min()} - {df['price_kes'].max()}")
print(f"Current mean price: {df['price_kes'].mean():.2f}")

# Scale prices: map from current range to 450-1200
old_min = df["price_kes"].min()
old_max = df["price_kes"].max()
new_min = 450
new_max = 1200

df["price_kes"] = new_min + (df["price_kes"] - old_min) * (new_max - new_min) / (old_max - old_min)
df["price_kes"] = df["price_kes"].round(0).astype(int)

print(f"\nNew price range: {df['price_kes'].min()} - {df['price_kes'].max()}")
print(f"New mean price: {df['price_kes'].mean():.2f}")

# Save the scaled data
df.to_csv("historical_data.csv", index=False)
print("\n? Dataset updated successfully!")
