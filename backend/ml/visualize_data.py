#!/usr/bin/env python
"""
Miraa Price Prediction - Data Visualization Tool
Visualizes historical data and predictions in the terminal
"""

import pandas as pd
import os
from datetime import datetime, timedelta


class DataVisualizer:
    def __init__(self):
        self.csv_path = 'historical_data.csv'
        self.data = None
        self.load_data()
    
    def load_data(self):
        """Load CSV data"""
        try:
            self.data = pd.read_csv(self.csv_path)
            self.data['date'] = pd.to_datetime(self.data['date'])
            print(f"✅ Loaded {len(self.data)} records")
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def simple_chart(self, values, height=10, label=""):
        """Create a simple ASCII chart"""
        if not values or all(v is None for v in values):
            return "No data"
        
        min_val = min(v for v in values if v is not None)
        max_val = max(v for v in values if v is not None)
        range_val = max_val - min_val if max_val > min_val else 1
        
        chart = f"\n{label} (Range: {min_val} - {max_val})\n"
        
        for row in range(height, 0, -1):
            line = f"{int(min_val + (row * range_val / height)):6d} |"
            for val in values:
                if val is None:
                    line += "  "
                else:
                    normalized = (val - min_val) / range_val
                    if normalized >= (row - 0.5) / height:
                        line += "██"
                    else:
                        line += "  "
            line += "|"
            chart += line + "\n"
        
        chart += "       +" + "─" * (len(values) * 2) + "+"
        return chart
    
    def show_trend(self):
        """Display recent price trend"""
        print("\n" + "="*60)
        print("📈 RECENT PRICE TREND (Last 20 Days)")
        print("="*60)
        
        recent = self.data.tail(20)
        prices = recent['price_kes'].tolist()
        
        # Calculate trend
        first_5_avg = sum(prices[:5]) / 5
        last_5_avg = sum(prices[-5:]) / 5
        trend_pct = ((last_5_avg - first_5_avg) / first_5_avg) * 100
        
        print(self.simple_chart(prices, height=8, label="KES per kg"))
        
        print(f"\n📊 Trend Analysis:")
        print(f"  First 5-day avg:  KES {first_5_avg:.0f}/kg")
        print(f"  Last 5-day avg:   KES {last_5_avg:.0f}/kg")
        print(f"  Change:           {trend_pct:+.1f}%")
        
        if trend_pct > 5:
            print(f"  🟢 Trend: RISING")
        elif trend_pct < -5:
            print(f"  🔴 Trend: FALLING")
        else:
            print(f"  🟡 Trend: STABLE")
    
    def show_demand_trend(self):
        """Display recent demand trend"""
        print("\n" + "="*60)
        print("👥 RECENT DEMAND TREND (Last 20 Days)")
        print("="*60)
        
        recent = self.data.tail(20)
        demand = recent['demand_volume'].tolist()
        
        # Calculate trend
        first_5_avg = sum(demand[:5]) / 5
        last_5_avg = sum(demand[-5:]) / 5
        trend_pct = ((last_5_avg - first_5_avg) / first_5_avg) * 100
        
        print(self.simple_chart(demand, height=8, label="kg"))
        
        print(f"\n📊 Demand Analysis:")
        print(f"  First 5-day avg:  {first_5_avg:.0f} kg")
        print(f"  Last 5-day avg:   {last_5_avg:.0f} kg")
        print(f"  Change:           {trend_pct:+.1f}%")
        
        if trend_pct > 5:
            print(f"  📈 Demand: INCREASING")
        elif trend_pct < -5:
            print(f"  📉 Demand: DECREASING")
        else:
            print(f"  ➡️  Demand: STABLE")
    
    def show_statistics(self):
        """Show data statistics"""
        print("\n" + "="*60)
        print("📊 STATISTICS")
        print("="*60)
        
        price_col = self.data['price_kes']
        demand_col = self.data['demand_volume']
        
        print("\n💰 PRICE (KES/kg):")
        print(f"  Min:       {price_col.min()}")
        print(f"  Max:       {price_col.max()}")
        print(f"  Mean:      {price_col.mean():.0f}")
        print(f"  Median:    {price_col.median():.0f}")
        print(f"  Std Dev:   {price_col.std():.0f}")
        print(f"  Latest:    {price_col.iloc[-1]}")
        
        # Price velocity (change from previous)
        if len(price_col) > 1:
            change = price_col.iloc[-1] - price_col.iloc[-2]
            pct_change = (change / price_col.iloc[-2]) * 100 if price_col.iloc[-2] != 0 else 0
            print(f"  Recent Change: {change:+.0f} KES ({pct_change:+.1f}%)")
        
        print(f"\n📦 DEMAND (kg):")
        print(f"  Min:       {demand_col.min()}")
        print(f"  Max:       {demand_col.max()}")
        print(f"  Mean:      {demand_col.mean():.0f}")
        print(f"  Median:    {demand_col.median():.0f}")
        print(f"  Std Dev:   {demand_col.std():.0f}")
        print(f"  Latest:    {demand_col.iloc[-1]}")
    
    def show_correlation(self):
        """Show price-demand correlation"""
        print("\n" + "="*60)
        print("🔗 PRICE vs DEMAND ANALYSIS")
        print("="*60)
        
        # Calculate correlation
        correlation = self.data['price_kes'].corr(self.data['demand_volume'])
        
        print(f"\nCorrelation: {correlation:.3f}")
        
        if correlation > 0.5:
            print("🟢 Strong correlation: High demand = High prices")
            print("   → Recommend: Sell when demand is high!")
        elif correlation > 0.3:
            print("🟡 Moderate correlation: Some relationship")
            print("   → Demand and prices move together somewhat")
        elif correlation > 0:
            print("🟡 Weak positive: Slight relationship")
            print("   → Demand slightly affects price")
        else:
            print("🔵 Negative/No correlation")
            print("   → Price and demand are independent")
    
    def show_insights(self):
        """Generate actionable insights"""
        print("\n" + "="*60)
        print("💡 ACTIONABLE INSIGHTS")
        print("="*60)
        
        recent_7 = self.data.tail(7)
        last_30 = self.data.tail(30)
        
        # Recent trend
        recent_avg = recent_7['price_kes'].mean()
        prev_avg = last_30[:-7]['price_kes'].mean() if len(last_30) > 7 else recent_avg
        
        price_trend = ((recent_avg - prev_avg) / prev_avg * 100) if prev_avg > 0 else 0
        
        print(f"\n📌 For Next Week:")
        
        if price_trend > 3:
            print("  ✅ Prices trending UP")
            print("     → Consider holding harvest for 2-3 days")
            print("     → Premium grades will fetch higher prices")
        elif price_trend < -3:
            print("  ⚠️  Prices trending DOWN")
            print("     → Sell now to avoid further losses")
            print("     → Contact regular buyers immediately")
        else:
            print("  ➡️  Prices STABLE")
            print("     → Harvest on your normal schedule")
            print("     → Monitor daily for sudden changes")
        
        # Demand insight
        demand_7 = recent_7['demand_volume'].mean()
        demand_prev = last_30[:-7]['demand_volume'].mean() if len(last_30) > 7 else demand_7
        
        demand_trend = ((demand_7 - demand_prev) / demand_prev * 100) if demand_prev > 0 else 0
        
        print(f"\n📌 Buyer Demand:")
        if demand_trend > 5:
            print(f"  👥 Demand UP by {demand_trend:.1f}%")
            print("     → More buyers in the market")
            print("     → Better time to bring product to market")
        elif demand_trend < -5:
            print(f"  ❌ Demand DOWN by {abs(demand_trend):.1f}%")
            print("     → Fewer buyers available")
            print("     → Consider bulk buyers or storage")
        else:
            print("  ➡️  Demand STABLE")
            print("     → Normal buyer activity expected")
    
    def show_quality_assessment(self):
        """Assess data quality for ML training"""
        print("\n" + "="*60)
        print("🔍 DATA QUALITY FOR ML TRAINING")
        print("="*60)
        
        # Check data completeness
        total_records = len(self.data)
        missing = self.data.isnull().sum().sum()
        
        print(f"\n✅ Data Completeness:")
        print(f"   Total records:  {total_records}")
        print(f"   Missing values: {missing}")
        print(f"   Completeness:   {(1 - missing/(total_records*5)) * 100:.1f}%")
        
        # Check date continuity
        date_diffs = self.data['date'].diff().dt.days
        date_gaps = len(date_diffs[date_diffs > 1])
        
        print(f"\n📅 Date Continuity:")
        print(f"   Gaps in data:   {date_gaps}")
        if date_gaps == 0:
            print("   ✅ Perfect - no gaps")
        elif date_gaps < 5:
            print("   ⚠️  Minor gaps (acceptable)")
        else:
            print("   ⚠️  Significant gaps (consider filling)")
        
        # Data range adequacy
        date_span = (self.data['date'].max() - self.data['date'].min()).days
        
        print(f"\n⏱️  Time Span:")
        print(f"   Days covered:   {date_span}")
        if date_span >= 180:
            print("   ✅ Excellent for training")
        elif date_span >= 90:
            print("   ✅ Good for training")
        elif date_span >= 30:
            print("   ⚠️  Minimum acceptable")
        else:
            print("   ❌ Too short (need more data)")
        
        # Outlier detection
        price_mean = self.data['price_kes'].mean()
        price_std = self.data['price_kes'].std()
        outliers = len(self.data[
            (self.data['price_kes'] < price_mean - 3*price_std) |
            (self.data['price_kes'] > price_mean + 3*price_std)
        ])
        
        print(f"\n⚠️  Outliers:")
        print(f"   Detected:       {outliers}")
        if outliers == 0:
            print("   ✅ No outliers detected")
        elif outliers < 5:
            print("   ✅ Minor outliers (acceptable)")
        else:
            print("   ⚠️  Review data quality")
        
        print(f"\n📊 ML Readiness: ", end="")
        if date_span >= 90 and missing == 0 and date_gaps == 0:
            print("🟢 EXCELLENT - Ready for training")
        elif date_span >= 60 and missing < 5:
            print("🟡 GOOD - Ready, could improve with more data")
        else:
            print("🔴 NEEDS WORK - Add more data before training")


def main():
    print("\n" + "="*60)
    print("📊 MIRAA PREDICTION DATA VISUALIZER")
    print("="*60 + "\n")
    
    viz = DataVisualizer()
    if viz.data is None:
        print("Failed to load data. Exiting.")
        return
    
    while True:
        print("\n📋 WHAT TO VIEW?")
        print("  1. Price Trend (last 20 days)")
        print("  2. Demand Trend (last 20 days)")
        print("  3. Statistics & Summaries")
        print("  4. Price vs Demand Correlation")
        print("  5. Actionable Insights")
        print("  6. Data Quality Assessment")
        print("  7. Full Dashboard")
        print("  8. Exit")
        print("-" * 60)
        
        choice = input("Select (1-8): ").strip()
        
        if choice == '1':
            viz.show_trend()
        elif choice == '2':
            viz.show_demand_trend()
        elif choice == '3':
            viz.show_statistics()
        elif choice == '4':
            viz.show_correlation()
        elif choice == '5':
            viz.show_insights()
        elif choice == '6':
            viz.show_quality_assessment()
        elif choice == '7':
            viz.show_trend()
            viz.show_demand_trend()
            viz.show_statistics()
            viz.show_correlation()
            viz.show_insights()
            viz.show_quality_assessment()
        elif choice == '8':
            print("\n👋 Goodbye!\n")
            break
        else:
            print("❌ Invalid choice")


if __name__ == '__main__':
    main()
