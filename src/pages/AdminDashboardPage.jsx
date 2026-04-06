import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ShieldAlert, Users, Database, Activity, MapPin, 
  Phone, User, ShoppingCart, Wallet, Leaf, AlertCircle
} from 'lucide-react';
import { getAdminStats, getAdminUsers, downloadAdminReport } from '../services/api';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        const statsData = await getAdminStats();
        setStats(statsData);

        const usersData = await getAdminUsers(1, 10);
        setUsers(usersData.users || []);
      } catch (error) {
        console.error('Error loading admin data:', error);
        // Fallback data
        setStats({
          users: { total: 0, farmers: 0, buyers: 0, admins: 0, verified: 0, unverified: 0 },
          listings: { total: 0, active: 0, inactive: 0 },
          orders: { total: 0, completed: 0, pending: 0 },
          revenue: 0,
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const handleDownloadAdminReport = async (reportType) => {
    try {
      const blob = await downloadAdminReport(reportType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={32} /> Admin Control Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">System-wide monitoring, verification, and user management.</p>
        </div>
        <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-700 flex items-center gap-2 w-fit">
          <Database size={16} className="text-blue-500 animate-pulse" /> 
          System Connected
        </div>
      </header>

      {/* Admin Identity Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-12">
          <ShieldAlert size={180} />
        </div>
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600 shadow-inner">
            <User size={36} className="text-gray-300" />
          </div>
          <div>
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Super Administrator</p>
            <h3 className="text-2xl md:text-3xl font-black">{user?.name}</h3>
            <p className="text-gray-400 font-medium text-sm flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1"><MapPin size={14} /> {user?.location}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {user?.phone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* System KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
            <div className="p-2 bg-blue-50 rounded-lg"><Users size={20} className="text-blue-500" /></div>
          </div>
          <h3 className="text-3xl font-black text-gray-800">{stats?.users?.total.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 w-fit px-2 py-1 rounded">+12 this week</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Listings</p>
            <div className="p-2 bg-orange-50 rounded-lg"><ShoppingCart size={20} className="text-orange-500" /></div>
          </div>
          <h3 className="text-3xl font-black text-gray-800">{stats?.listings?.active}</h3>
          <p className="text-xs text-gray-500 font-bold mt-2 bg-gray-50 w-fit px-2 py-1 rounded">Across all regions</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escrow Volume</p>
            <div className="p-2 bg-emerald-50 rounded-lg"><Wallet size={20} className="text-emerald-500" /></div>
          </div>
          <h3 className="text-3xl font-black text-gray-800">{(stats?.revenue / 1000).toFixed(0)}K</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 w-fit px-2 py-1 rounded">+15% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Health</p>
            <div className="p-2 bg-red-50 rounded-lg"><Activity size={20} className="text-red-500" /></div>
          </div>
          <h3 className="text-3xl font-black text-emerald-600">{stats?.health}</h3>
          <p className="text-xs text-gray-500 font-bold mt-2 bg-gray-50 w-fit px-2 py-1 rounded">Operational</p>
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 text-lg mb-4">Download Reports</h3>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => handleDownloadAdminReport('users')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Users size={16} />
            Users Report
          </button>
          <button 
            onClick={() => handleDownloadAdminReport('transactions')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Wallet size={16} />
            Transactions Report
          </button>
          <button 
            onClick={() => handleDownloadAdminReport('listings')}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={16} />
            Listings Report
          </button>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-800 text-lg">Verification Queue</h3>
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                  <th className="pb-4 font-bold">User Name</th>
                  <th className="pb-4 font-bold">Role</th>
                  <th className="pb-4 font-bold">Location</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.slice(0, 4).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-gray-800">{user.name}</td>
                    <td className="py-4 text-gray-600 font-medium">{user.role}</td>
                    <td className="py-4 text-gray-600">{user.location || 'N/A'}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                        user.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs hover:bg-black transition-colors">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-black text-gray-800 text-lg mb-6">Live Activity Log</h3>
          <div className="space-y-5 flex-1">
            {[
              { log: 'New harvest listed (Kangeta, 50kg)', time: '5 mins ago', icon: Leaf, color: 'text-emerald-500 bg-emerald-50' },
              { log: 'Escrow payment released (Order #402)', time: '12 mins ago', icon: Wallet, color: 'text-blue-500 bg-blue-50' },
              { log: 'Failed login attempt (+254711...)', time: '1 hour ago', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
              { log: 'New user registered (Agnes K.)', time: '2 hours ago', icon: Users, color: 'text-purple-500 bg-purple-50' },
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${act.color} shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{act.log}</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">{act.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors">
            Download Audit Report
          </button>
        </div>
      </div>
    </div>
  );
}