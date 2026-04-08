import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ShieldAlert, Users, Database, Activity, MapPin, 
  Phone, User, ShoppingCart, Wallet, Leaf, AlertCircle,
  CheckCircle, XCircle, Clock, Edit, Trash2, Eye,
  UserCheck, UserX, Crown, Ban, Check, MoreVertical,
  Download, Search, Filter
} from 'lucide-react';
import {
  getAdminStats,
  getAdminUsers,
  getAdminUserDetails,
  getAdminListings,
  updateListingStatus,
  updateListing,
  getAdminTrainingModules,
  createTrainingModule,
  updateTrainingModule,
  deleteTrainingModule,
  downloadAdminReport,
  getOrdersByStatus,
  approveOrder,
  updateUserVerification,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  bulkUserOperation,
} from '../services/api';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userDetailsModal, setUserDetailsModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Listings management state
  const [listings, setListings] = useState([]);
  const [listingsPage, setListingsPage] = useState(1);
  const [listingsStatusFilter, setListingsStatusFilter] = useState('ALL');
  const [editingListing, setEditingListing] = useState(null);

  // Training modules state
  const [trainingModules, setTrainingModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [currentPage, roleFilter, statusFilter]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const statsData = await getAdminStats();
      setStats(statsData);

      const usersResponse = await getAdminUsers(currentPage, 20);
      setUsers(usersResponse.users || []);
      setTotalPages(Math.ceil((usersResponse.pagination?.total || 0) / 20));

      // Load pending orders for approval
      const pendingOrdersData = await getOrdersByStatus('PENDING_APPROVAL');
      setPendingOrders(pendingOrdersData);
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
      setPendingOrders([]);
    } finally {
      setLoading(false);
    }
  };

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

  const loadListings = async () => {
    try {
      const response = await getAdminListings(listingsPage, 20, listingsStatusFilter);
      setListings(response.listings || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
    }
  };

  const loadTrainingModules = async () => {
    try {
      const response = await getAdminTrainingModules();
      setTrainingModules(response.modules || []);
    } catch (error) {
      console.error('Error loading training modules:', error);
      setTrainingModules([]);
    }
  };

  const handleListingStatusChange = async (listingId, status, notes = '') => {
    try {
      const result = await updateListingStatus(listingId, status, notes);
      alert(result.message);
      loadListings();
    } catch (error) {
      console.error('Error updating listing status:', error);
      alert('Failed to update listing status');
    }
  };

  const handleUpdateListing = async (listingId, updates) => {
    try {
      const result = await updateListing(listingId, updates);
      alert(result.message);
      setEditingListing(null);
      loadListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing');
    }
  };

  const handleCreateTrainingModule = async (moduleData) => {
    try {
      const result = await createTrainingModule(moduleData);
      alert(result.message);
      setShowModuleModal(false);
      loadTrainingModules();
    } catch (error) {
      console.error('Error creating training module:', error);
      alert('Failed to create training module');
    }
  };

  const handleUpdateTrainingModule = async (moduleId, updates) => {
    try {
      const result = await updateTrainingModule(moduleId, updates);
      alert(result.message);
      setEditingModule(null);
      loadTrainingModules();
    } catch (error) {
      console.error('Error updating training module:', error);
      alert('Failed to update training module');
    }
  };

  const handleDeleteTrainingModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this training module?')) return;

    try {
      const result = await deleteTrainingModule(moduleId);
      alert(result.message);
      loadTrainingModules();
    } catch (error) {
      console.error('Error deleting training module:', error);
      alert('Failed to delete training module');
    }
  };

  useEffect(() => {
    loadAdminData();
    loadListings();
    loadTrainingModules();
  }, [currentPage, roleFilter, statusFilter, listingsPage, listingsStatusFilter]);

  const handleOrderApproval = async (orderId, approved, notes = '') => {
    try {
      await approveOrder(orderId, approved, notes);
      alert(approved ? 'Order approved successfully!' : 'Order rejected.');
      
      // Reload pending orders
      const ordersData = await getOrdersByStatus('PENDING_APPROVAL');
      setPendingOrders(ordersData);
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to process order approval');
    }
  };

  // Member management functions
  const handleUserVerification = async (userId, verified) => {
    try {
      await updateUserVerification(userId, verified);
      alert(`User ${verified ? 'verified' : 'unverified'} successfully!`);
      loadAdminData();
    } catch (error) {
      console.error('Error updating user verification:', error);
      alert('Failed to update user verification');
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      alert(`User role updated to ${newRole} successfully!`);
      loadAdminData();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleUserStatusChange = async (userId, active) => {
    try {
      await updateUserStatus(userId, active);
      alert(`User account ${active ? 'activated' : 'suspended'} successfully!`);
      loadAdminData();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleUserDeletion = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId);
      alert('User deleted successfully!');
      loadAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (!confirm(`Are you sure you want to ${operation} ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      const result = await bulkUserOperation(operation, selectedUsers);
      alert(`${result.message} (${result.affected} users affected)`);
      setSelectedUsers([]);
      loadAdminData();
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      alert('Failed to perform bulk operation');
    }
  };

  const handleViewUserDetails = async (userId) => {
    try {
      const data = await getAdminUserDetails(userId);
      setUserDetailsModal(data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to fetch user details');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm) ||
                         user.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' ||
                         (statusFilter === 'VERIFIED' && user.verified) ||
                         (statusFilter === 'UNVERIFIED' && !user.verified);

    return matchesSearch && matchesRole && matchesStatus;
  });

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

      {/* Pending Orders for Approval */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
            <Clock size={20} className="text-orange-500" />
            Pending Order Approvals ({pendingOrders.length})
          </h3>
        </div>
        {pendingOrders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No pending orders for approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {order.quantity}kg {order.listing?.grade} Miraa
                    </h4>
                    <p className="text-sm text-gray-600">
                      Order #{order.id.substring(0, 8)} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">KES {order.totalPrice?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Buyer</p>
                    <p className="text-sm font-medium">{order.buyer?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Farmer</p>
                    <p className="text-sm font-medium">{order.listing?.farmer?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">{order.deliveryAddress || 'Pickup'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOrderApproval(order.id, true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Reason for rejection (optional):');
                      handleOrderApproval(order.id, false, notes);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingOrders.length > 5 && (
              <p className="text-center text-sm text-gray-500 pt-4">
                And {pendingOrders.length - 5} more pending orders...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* User Management */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 xl:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-gray-800 text-lg">Member Management</h3>
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkOperation('verify')}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Verify Selected
                </button>
                <button
                  onClick={() => handleBulkOperation('suspend')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Suspend Selected
                </button>
              </div>
            )}
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-800">View All</button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="ALL">All Roles</option>
            <option value="FARMER">Farmers</option>
            <option value="BUYER">Buyers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                <th className="pb-4 font-bold">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="pb-4 font-bold">User Name</th>
                <th className="pb-4 font-bold">Role</th>
                <th className="pb-4 font-bold">Location</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Activity</th>
                <th className="pb-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-4 font-bold text-gray-800">{user.name}</td>
                  <td className="py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs font-medium"
                    >
                      <option value="FARMER">Farmer</option>
                      <option value="BUYER">Buyer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 text-gray-600">{user.location || 'N/A'}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      user.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {user.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600 text-xs">
                    <div>{user._count.listings} listings</div>
                    <div>{user._count.orders} orders</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewUserDetails(user.id)}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleUserVerification(user.id, !user.verified)}
                        className={`p-1.5 rounded-lg ${
                          user.verified
                            ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                        title={user.verified ? 'Unverify' : 'Verify'}
                      >
                        {user.verified ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        onClick={() => handleUserStatusChange(user.id, false)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                        title="Suspend"
                      >
                        <Ban size={14} />
                      </button>
                      <button
                        onClick={() => handleUserDeletion(user.id)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Listings Management */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-500" />
            Marketplace Listings Management
          </h3>
          <div className="flex gap-2">
            <select
              value={listingsStatusFilter}
              onChange={(e) => setListingsStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                <th className="pb-4 font-bold">Grade</th>
                <th className="pb-4 font-bold">Farmer</th>
                <th className="pb-4 font-bold">Quantity</th>
                <th className="pb-4 font-bold">Price</th>
                <th className="pb-4 font-bold">Location</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Orders</th>
                <th className="pb-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{listing.grade}</td>
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-gray-800">{listing.farmer.name}</p>
                      <p className="text-xs text-gray-500">{listing.farmer.phone}</p>
                    </div>
                  </td>
                  <td className="py-4">{listing.quantity}kg</td>
                  <td className="py-4 font-medium">KES {listing.price.toLocaleString()}</td>
                  <td className="py-4 text-gray-600">{listing.location}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      listing.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      listing.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600">{listing._count.orders}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingListing(listing)}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                        title="Edit Listing"
                      >
                        <Edit size={14} />
                      </button>
                      {listing.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleListingStatusChange(listing.id, 'SUSPENDED', 'Suspended by admin')}
                          className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg"
                          title="Suspend"
                        >
                          <Ban size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleListingStatusChange(listing.id, 'ACTIVE')}
                          className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg"
                          title="Approve"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No listings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Training Materials Management */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
            <Leaf size={20} className="text-emerald-500" />
            Training Materials Management
          </h3>
          <button
            onClick={() => setShowModuleModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors"
          >
            Add New Module
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingModules.map((module) => (
            <div key={module.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-800 text-sm leading-tight">{module.title}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  module.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                  module.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {module.difficulty}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{module.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>{module.category.replace('_', ' ')}</span>
                <span>{module.duration} min</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingModule(module)}
                  className="flex-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTrainingModule(module.id)}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {trainingModules.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Leaf size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No training modules found</p>
            </div>
          )}
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
          <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors" onClick={() => handleDownloadAdminReport('audit')}>
            Download Audit Report
          </button>
        </div>
      </div>
    </div>
  );

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

      {/* Pending Orders for Approval */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
            <Clock size={20} className="text-orange-500" />
            Pending Order Approvals ({pendingOrders.length})
          </h3>
        </div>
        {pendingOrders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No pending orders for approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {order.quantity}kg {order.listing?.grade} Miraa
                    </h4>
                    <p className="text-sm text-gray-600">
                      Order #{order.id.substring(0, 8)} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">KES {order.totalPrice?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Buyer</p>
                    <p className="text-sm font-medium">{order.buyer?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Farmer</p>
                    <p className="text-sm font-medium">{order.listing?.farmer?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">{order.deliveryAddress || 'Pickup'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOrderApproval(order.id, true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Reason for rejection (optional):');
                      handleOrderApproval(order.id, false, notes);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingOrders.length > 5 && (
              <p className="text-center text-sm text-gray-500 pt-4">
                And {pendingOrders.length - 5} more pending orders...
              </p>
            )}
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 xl:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-gray-800 text-lg">Member Management</h3>
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkOperation('verify')}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Verify Selected
                </button>
                <button
                  onClick={() => handleBulkOperation('suspend')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Suspend Selected
                </button>
              </div>
            )}
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-800">View All</button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="ALL">All Roles</option>
            <option value="FARMER">Farmers</option>
            <option value="BUYER">Buyers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                <th className="pb-4 font-bold">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="pb-4 font-bold">User Name</th>
                <th className="pb-4 font-bold">Role</th>
                <th className="pb-4 font-bold">Location</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Activity</th>
                <th className="pb-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-4 font-bold text-gray-800">{user.name}</td>
                  <td className="py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs font-medium"
                    >
                      <option value="FARMER">Farmer</option>
                      <option value="BUYER">Buyer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 text-gray-600">{user.location || 'N/A'}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      user.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {user.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600 text-xs">
                    <div>{user._count.listings} listings</div>
                    <div>{user._count.orders} orders</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewUserDetails(user.id)}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleUserVerification(user.id, !user.verified)}
                        className={`p-1.5 rounded-lg ${
                          user.verified
                            ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                        title={user.verified ? 'Unverify' : 'Verify'}
                      >
                        {user.verified ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        onClick={() => handleUserStatusChange(user.id, false)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                        title="Suspend"
                      >
                        <Ban size={14} />
                      </button>
                      <button
                        onClick={() => handleUserDeletion(user.id)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
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
  );

  // User Details Modal
  if (userDetailsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">User Details</h3>
            <button
              onClick={() => setUserDetailsModal(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3">Basic Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{userDetailsModal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{userDetailsModal.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{userDetailsModal.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{userDetailsModal.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified:</span>
                  <span className={`font-medium ${userDetailsModal.verified ? 'text-green-600' : 'text-red-600'}`}>
                    {userDetailsModal.verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">{new Date(userDetailsModal.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3">Activity Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Listings:</span>
                  <span className="font-medium">{userDetailsModal._count.listings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders:</span>
                  <span className="font-medium">{userDetailsModal._count.orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium">{userDetailsModal._count.walletTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notifications:</span>
                  <span className="font-medium">{userDetailsModal._count.notifications}</span>
                </div>
              </div>
            </div>

            {/* Recent Listings */}
            {userDetailsModal.listings && userDetailsModal.listings.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
                <h4 className="font-bold text-gray-800 mb-3">Recent Listings</h4>
                <div className="space-y-2">
                  {userDetailsModal.listings.slice(0, 3).map((listing) => (
                    <div key={listing.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">{listing.grade}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {listing.quantity}kg • KES {listing.price}/kg
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            {userDetailsModal.walletTransactions && userDetailsModal.walletTransactions.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
                <h4 className="font-bold text-gray-800 mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {userDetailsModal.walletTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">{tx.description}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`font-medium ${
                        tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit Listing Modal
  if (editingListing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Edit Listing</h3>
            <button
              onClick={() => setEditingListing(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updates = {
              grade: formData.get('grade'),
              quantity: formData.get('quantity'),
              price: formData.get('price'),
              location: formData.get('location'),
              description: formData.get('description'),
            };
            handleUpdateListing(editingListing.id, updates);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select
                  name="grade"
                  defaultValue={editingListing.grade}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="Kangeta">Kangeta</option>
                  <option value="Alele">Alele</option>
                  <option value="Lomboko">Lomboko</option>
                  <option value="Giza">Giza</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  name="quantity"
                  defaultValue={editingListing.quantity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per kg (KES)</label>
                <input
                  type="number"
                  name="price"
                  defaultValue={editingListing.price}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingListing.location}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                defaultValue={editingListing.description || ''}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium"
              >
                Update Listing
              </button>
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Training Module Modal
  if (showModuleModal || editingModule) {
    const isEditing = !!editingModule;
    const module = editingModule || {};

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Training Module' : 'Create Training Module'}
            </h3>
            <button
              onClick={() => {
                setShowModuleModal(false);
                setEditingModule(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const moduleData = {
              title: formData.get('title'),
              category: formData.get('category'),
              content: formData.get('content'),
              description: formData.get('description'),
              duration: formData.get('duration'),
            };

            if (isEditing) {
              handleUpdateTrainingModule(module.id, moduleData);
            } else {
              handleCreateTrainingModule(moduleData);
            }
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={module.title || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  defaultValue={module.category || 'FARMING_TECHNIQUES'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="FARMING_TECHNIQUES">Farming Techniques</option>
                  <option value="BUSINESS_MANAGEMENT">Business Management</option>
                  <option value="QUALITY_MANAGEMENT">Quality Management</option>
                  <option value="SUSTAINABILITY">Sustainability</option>
                  <option value="TECHNOLOGY">Technology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  defaultValue={module.duration || 30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={module.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  name="content"
                  defaultValue={module.content || ''}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter the full training module content here..."
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium"
              >
                {isEditing ? 'Update Module' : 'Create Module'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModuleModal(false);
                  setEditingModule(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}