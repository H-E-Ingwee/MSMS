import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/atoms/SectionHeading';
import Card from '../components/atoms/Card';
import KpiCard from '../components/molecules/KpiCard';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { getMarketListings, getOrders } from '../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const listings = await getMarketListings();
        // const orders = await getAllOrders(); // TODO: Implement getAllOrders for admin
        // For simplicity, mock stats
        setStats({
          totalUsers: 150, // Mock
          totalListings: listings.length,
          totalOrders: 42, // Mock
          totalRevenue: 125000, // Mock
        });
      } catch (err) {
        console.error('Error loading admin stats:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeading title="Admin Dashboard" subtitle="System overview and management tools." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
        <KpiCard title="Active Listings" value={stats.totalListings} icon={ShoppingCart} color="green" />
        <KpiCard title="Total Orders" value={stats.totalOrders} icon={TrendingUp} color="purple" />
        <KpiCard title="Revenue (KES)" value={stats.totalRevenue.toLocaleString()} icon={DollarSign} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-600">Admin tools for user management, order oversight, and system settings will be integrated here.</p>
          {/* Placeholder for admin features */}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
          <p className="text-gray-600">Monitor API status, database connections, and performance metrics.</p>
          {/* Placeholder */}
        </Card>
      </div>
    </div>
  );
}
