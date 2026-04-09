#!/usr/bin/env python
"""
Miraa Price Prediction - Dataset Management Utility
Helps add data and manage the prediction model training
"""

import pandas as pd
import os
from datetime import datetime, timedelta
import json

class DatasetManager:
    def __init__(self):
        self.csv_path = 'historical_data.csv'
        self.data = None
        self.load_data()
    
    def load_data(self):
        """Load existing CSV data"""
        try:
            self.data = pd.read_csv(self.csv_path)
            self.data['date'] = pd.to_datetime(self.data['date'])
            print(f"✅ Loaded {len(self.data)} historical records")
            return True
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return False
    
    def display_summary(self):
        """Display dataset summary"""
        if self.data is None or len(self.data) == 0:
            print("No data loaded")
            return
        
        print("\n" + "="*60)
        print("📊 DATASET SUMMARY")
        print("="*60)
        print(f"Total Records: {len(self.data)}")
        print(f"Date Range: {self.data['date'].min().date()} to {self.data['date'].max().date()}")
        print(f"\nPrice Statistics (KES/kg):")
        print(f"  Min: {self.data['price_kes'].min()}")
        print(f"  Max: {self.data['price_kes'].max()}")
        print(f"  Avg: {self.data['price_kes'].mean():.0f}")
        print(f"  Last: {self.data.iloc[-1]['price_kes']}")
        print(f"\nDemand Statistics (kg):")
        print(f"  Min: {self.data['demand_volume'].min()}")
        print(f"  Max: {self.data['demand_volume'].max()}")
        print(f"  Avg: {self.data['demand_volume'].mean():.0f}")
        print(f"  Last: {self.data.iloc[-1]['demand_volume']}")
        print(f"\nRegions: {self.data['region'].unique().tolist()}")
        print(f"Grades: {self.data['grade'].unique().tolist()}")
        print("="*60 + "\n")
    
    def add_entry(self, date_str, price, demand, region='Nairobi', grade='Grade A'):
        """Add a single data entry"""
        try:
            # Validate inputs
            date_obj = pd.to_datetime(date_str)
            price = int(price)
            demand = int(demand)
            
            if price <= 0 or demand <= 0:
                print("❌ Price and demand must be positive numbers")
                return False
            
            if price > 5000:
                print(f"⚠️  Warning: Price {price} seems very high. Continue? (y/n)")
                if input().lower() != 'y':
                    return False
            
            # Check for duplicate date
            if (self.data['date'].dt.date == date_obj.date()).any():
                print(f"⚠️  Entry for {date_str} already exists. Replace? (y/n)")
                if input().lower() == 'y':
                    self.data = self.data[self.data['date'].dt.date != date_obj.date()]
                else:
                    return False
            
            # Add new entry
            new_entry = {
                'date': date_str,
                'price_kes': price,
                'demand_volume': demand,
                'region': region,
                'grade': grade
            }
            
            self.data = pd.concat([self.data, pd.DataFrame([new_entry])], ignore_index=True)
            self.data['date'] = pd.to_datetime(self.data['date'])
            self.data = self.data.sort_values('date').reset_index(drop=True)
            
            print(f"✅ Added: {date_str} | KES {price}/kg | {demand} kg demand")
            return True
            
        except Exception as e:
            print(f"❌ Error adding entry: {e}")
            return False
    
    def add_multiple_entries(self, entries_list):
        """Add multiple entries at once
        entries_list format: [
            {'date': '2025-10-17', 'price': 1450, 'demand': 11100},
            ...
        ]
        """
        count = 0
        for entry in entries_list:
            if self.add_entry(
                entry['date'],
                entry['price'],
                entry['demand'],
                entry.get('region', 'Nairobi'),
                entry.get('grade', 'Grade A')
            ):
                count += 1
        
        print(f"\n✅ Successfully added {count}/{len(entries_list)} entries")
        return count == len(entries_list)
    
    def save_data(self):
        """Save data back to CSV"""
        try:
            self.data.to_csv(self.csv_path, index=False)
            print(f"✅ Data saved to {self.csv_path}")
            return True
        except Exception as e:
            print(f"❌ Error saving data: {e}")
            return False
    
    def export_for_model(self):
        """Prepare and validate data for model training"""
        if len(self.data) < 30:
            print(f"⚠️  Warning: Only {len(self.data)} records. Minimum 30 recommended for good predictions")
        
        print("\n✅ Data is ready for model training:")
        print(f"   Records: {len(self.data)}")
        print(f"   Date span: {(self.data['date'].max() - self.data['date'].min()).days} days")
        print("\nTo train the model:")
        print("   1. Ensure ML service is stopped")
        print("   2. Run: python miraa_predictor.py")
        return True
    
    def interactive_add(self):
        """Interactive mode to add data"""
        print("\n" + "="*60)
        print("➕ ADD NEW PRICE DATA")
        print("="*60)
        
        date_str = input("Enter date (YYYY-MM-DD) [default: today]: ").strip()
        if not date_str:
            date_str = datetime.now().strftime('%Y-%m-%d')
        
        price = input("Enter price (KES/kg): ").strip()
        demand = input("Enter demand (kg): ").strip()
        region = input("Enter region [default: Nairobi]: ").strip() or 'Nairobi'
        grade = input("Enter grade [default: Grade A]: ").strip() or 'Grade A'
        
        if self.add_entry(date_str, price, demand, region, grade):
            print("\n🤔 Save changes? (y/n)")
            if input().lower() == 'y':
                self.save_data()
                print("\n✨ Data updated!")
                return True
        
        return False
    
    def quick_add_realistic_data(self):
        """Add realistic trending data for testing"""
        print("\n📊 Generating realistic trending data...")
        
        # Create trending upward data for next 7 days
        today = pd.to_datetime(self.data['date'].max()) + timedelta(days=1)
        current_price = int(self.data.iloc[-1]['price_kes'])
        current_demand = int(self.data.iloc[-1]['demand_volume'])
        
        new_entries = [
            {
                'date': (today + timedelta(days=i)).strftime('%Y-%m-%d'),
                'price': int(current_price + (i * 5) + (i % 2 * 3)),  # Trending +
                'demand': int(current_demand + (i * 50))  # Trending +
            }
            for i in range(7)
        ]
        
        self.add_multiple_entries(new_entries)
        self.save_data()
        print("✅ Realistic trending data added\n")


def main():
    """Main interactive menu"""
    print("\n" + "="*60)
    print("🌿 MIRAA PRICE PREDICTION - DATASET MANAGER 🌿")
    print("="*60 + "\n")
    
    manager = DatasetManager()
    manager.display_summary()
    
    while True:
        print("\n📋 OPTIONS:")
        print("  1. View dataset summary")
        print("  2. Add new price entry (interactive)")
        print("  3. Add sample trending data")
        print("  4. Export data for model training")
        print("  5. View recent entries")
        print("  6. Exit")
        print("-" * 60)
        
        choice = input("Select option (1-6): ").strip()
        
        if choice == '1':
            manager.display_summary()
        
        elif choice == '2':
            if manager.interactive_add():
                manager.display_summary()
        
        elif choice == '3':
            manager.quick_add_realistic_data()
            manager.display_summary()
        
        elif choice == '4':
            manager.export_for_model()
        
        elif choice == '5':
            print("\n📝 LAST 7 ENTRIES:")
            print("="*60)
            print(manager.data[['date', 'price_kes', 'demand_volume', 'region', 'grade']].tail(7).to_string(index=False))
            print("="*60)
        
        elif choice == '6':
            print("\n👋 Goodbye!\n")
            break
        
        else:
            print("❌ Invalid option. Please try again.")


if __name__ == '__main__':
    main()
