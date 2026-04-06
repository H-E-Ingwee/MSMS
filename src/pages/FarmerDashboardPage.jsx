import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, DollarSign, Users, Calendar, BarChart3 } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import KpiCard from '../components/molecules/KpiCard';
import DemandBarChart from '../components/molecules/DemandBarChart';
import { getOrders, getWalletData } from '../services/api';

export default function FarmerDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalQuantitySold: 0,
    uniqueBuyers: 0,
    pendingApproval: 0,
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    try {
      setLoading(true);
      const [ordersData, walletData] = await Promise.all([
        getOrders(),
        getWalletData(),
      ]);

      const farmerOrders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      const paidOrders = farmerOrders.filter(o => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED');
      
      // Calculate statistics
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalQuantity = paidOrders.reduce((sum, order) => sum + order.quantity, 0);
      const uniqueBuyers = new Set(paidOrders.map(o => o.buyerId)).size;
      const pendingApproval = farmerOrders.filter(o => o.status === 'PENDING_APPROVAL').length;

      // Monthly revenue (simplified - last 6 months)
      const monthlyData = calculateMonthlyRevenue(paidOrders);

      setOrders(farmerOrders);
      setWallet(walletData);
      setStats({
        totalOrders: farmerOrders.length,
        completedOrders: paidOrders.length,
        totalRevenue,
        avgOrderValue: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
        totalQuantitySold: totalQuantity,
        uniqueBuyers,
        pendingApproval,
        monthlyRevenue: monthlyData,
      });
    } catch (error) {
      console.error('Failed to load farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 10000, // Placeholder data
    }));
    return data;
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <SectionHeading 
        title="Farmer Dashboard" 
        subtitle="Performance and sales analytics"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<Package size={24} />}
              trend="+12%"
              color="emerald"
            />
            <KpiCard
              title="Completed Orders"
              value={stats.completedOrders}
              icon={<TrendingUp size={24} />}
              trend="+8%"
              color="blue"
            />
            <KpiCard
              title="Total Revenue"
              value={`KES ${(stats.totalRevenue / 1000).toFixed(1)}k`}
              icon={<DollarSign size={24} />}
              trend="+24%"
              color="green"
            />
            <KpiCard
              title="Unique Buyers"
              value={stats.uniqueBuyers}
              icon={<Users size={24} />}
              trend="+5%"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Avg Order Value</h3>
                <DollarSign size={20} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                KES {stats.avgOrderValue?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">per transaction</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Total Quantity</h3>
                <Package size={20} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                {stats.totalQuantitySold} kg
              </p>
              <p className="text-sm text-gray-600">sold</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Pending</h3>
                <Calendar size={20} className="text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                {stats.pendingApproval}
              </p>
              <p className="text-sm text-gray-600">orders to approve</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-emerald-600" />
              <h3 className="font-semibold text-gray-800">Monthly Revenue (Last 6 Months)</h3>
            </div>
            <DemandBarChart data={stats.monthlyRevenue} />
          </div>

          {/* Wallet Summary */}
          {wallet && (
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">MSMS Wallet</h3>
                <DollarSign size={24} className="opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-2">Available Balance</p>
              <p className="text-4xl font-bold mb-6">KES {wallet.balance?.toLocaleString() || '0'}</p>
              <div className="flex gap-3">
                <button className="flex-1 bg-white text-emerald-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Withdraw
                </button>
                <button className="flex-1 bg-emerald-800 text-white py-2 rounded-lg font-semibold hover:bg-emerald-900 transition-colors">
                  View History
                </button>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Buyer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{order.id.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-gray-800 font-medium">{order.buyer?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-gray-600">{order.quantity} kg</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">KES {order.totalPrice?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
