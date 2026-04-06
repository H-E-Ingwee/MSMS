import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/atoms/SectionHeading';
import Card from '../components/atoms/Card';
import KpiCard from '../components/molecules/KpiCard';
import PrimaryButton from '../components/atoms/PrimaryButton';
import { Users, ShoppingCart, DollarSign, TrendingUp, Download, UserCheck, UserX } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      farmers: 0,
      buyers: 0,
      admins: 0,
      verified: 0,
      unverified: 0,
    },
    listings: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    orders: {
      total: 0,
      completed: 0,
      pending: 0,
    },
    revenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);

        // Fetch admin stats
        const statsResponse = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('msms_token')}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch users list
        const usersResponse = await fetch('/api/admin/users?page=1&limit=20', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('msms_token')}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const downloadReport = async (reportType) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('msms_token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading title="Admin Dashboard" subtitle="System overview and management tools." />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Users" value={stats.users.total} icon={Users} color="blue" />
        <KpiCard title="Active Listings" value={stats.listings.active} icon={ShoppingCart} color="green" />
        <KpiCard title="Total Orders" value={stats.orders.total} icon={TrendingUp} color="purple" />
        <KpiCard title="Revenue (KES)" value={stats.revenue.toLocaleString()} icon={DollarSign} color="yellow" />
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Farmers" value={stats.users.farmers} icon={Users} color="green" />
        <KpiCard title="Buyers" value={stats.users.buyers} icon={Users} color="blue" />
        <KpiCard title="Admins" value={stats.users.admins} icon={Users} color="red" />
      </div>

      {/* Verification Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard title="Verified Users" value={stats.users.verified} icon={UserCheck} color="green" />
        <KpiCard title="Unverified Users" value={stats.users.unverified} icon={UserX} color="red" />
      </div>

      {/* Reports Section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Download Reports</h3>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton
            onClick={() => downloadReport('users')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Users Report
          </PrimaryButton>
          <PrimaryButton
            onClick={() => downloadReport('transactions')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Transactions Report
          </PrimaryButton>
          <PrimaryButton
            onClick={() => downloadReport('listings')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Listings Report
          </PrimaryButton>
        </div>
      </Card>

      {/* Recent Users */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Verified</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-900">{user.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{user.phone}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'FARMER' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{user.location || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {user.verified ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
