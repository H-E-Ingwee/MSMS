import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Package, Clock, CheckCircle2, X, AlertCircle } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import PrimaryButton from '../components/atoms/PrimaryButton';
import { getOrders } from '../services/api';

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [userRole, setUserRole] = useState('BUYER');

  useEffect(() => {
    loadOrders();
    
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('msms_auth') || '{}');
    setUserRole(user.role || 'BUYER');
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderStatuses = ['All', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  
  const filtered = selectedStatus === 'All' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const getStatusColor = (status) => {
    const colors = {
      'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'APPROVED': 'bg-blue-100 text-blue-800 border-blue-300',
      'PAID': 'bg-green-100 text-green-800 border-green-300',
      'SHIPPED': 'bg-purple-100 text-purple-800 border-purple-300',
      'DELIVERED': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Clock size={16} />;
      case 'APPROVED':
        return <CheckCircle2 size={16} />;
      case 'PAID':
        return <CheckCircle2 size={16} />;
      case 'SHIPPED':
        return <Package size={16} />;
      case 'DELIVERED':
        return <CheckCircle2 size={16} />;
      case 'CANCELLED':
        return <X size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeading 
        title="Order Tracking" 
        subtitle={userRole === 'FARMER' ? 'Manage incoming orders' : 'Track your purchases'}
      />

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {orderStatuses.map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium border transition-colors ${
              selectedStatus === status
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-300'
            }`}
          >
            {status === 'All' ? 'All Orders' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">No orders found</p>
          <p className="text-gray-500 text-sm mt-1">
            {userRole === 'FARMER' ? 'No incoming orders yet' : 'You haven\'t made any orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {order.listing?.grade || 'Unknown Grade'} Miraa
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Order ID: {order.id.substring(0, 8)}...
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-gray-100">
                {/* Left: Product Info */}
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="text-lg font-bold text-gray-800">{order.quantity} kg</p>
                </div>

                {/* Middle: Price Info */}
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-lg font-bold text-emerald-700">KES {order.totalPrice?.toLocaleString()}</p>
                </div>

                {/* Right: Date Info */}
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-lg font-bold text-gray-800">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Parties Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Farmer/Seller */}
                {userRole === 'BUYER' && order.listing?.farmer && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Seller</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {order.listing.farmer.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{order.listing.farmer.name}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {order.listing.farmer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buyer */}
                {userRole === 'FARMER' && order.buyer && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Buyer</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {order.buyer.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{order.buyer.name}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {order.buyer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Location */}
                {order.deliveryAddress && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Delivery Location</p>
                    <p className="text-sm text-gray-800 flex items-center gap-2">
                      <MapPin size={16} /> {order.deliveryAddress}
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">Timeline</p>
                <div className="space-y-2">
                  {[
                    { label: 'Order Placed', status: 'PENDING_APPROVAL' },
                    { label: 'Approved', status: 'APPROVED' },
                    { label: 'Payment Received', status: 'PAID' },
                    { label: 'In Transit', status: 'SHIPPED' },
                    { label: 'Delivered', status: 'DELIVERED' },
                  ].map((step) => (
                    <div key={step.status} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        ['PENDING_APPROVAL', 'APPROVED', 'PAID', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= 
                        ['PENDING_APPROVAL', 'APPROVED', 'PAID', 'SHIPPED', 'DELIVERED'].indexOf(step.status)
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        ✓
                      </div>
                      <span className="text-sm text-gray-700">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {order.farmerNotes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-semibold mb-1">Farmer's Note</p>
                  <p className="text-sm text-blue-800">{order.farmerNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                {order.status === 'PAID' && userRole === 'BUYER' && (
                  <PrimaryButton className="flex-1">
                    Contact Seller
                  </PrimaryButton>
                )}
                {order.status === 'PENDING_APPROVAL' && userRole === 'FARMER' && (
                  <>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                      Reject
                    </button>
                    <PrimaryButton className="flex-1">
                      Approve Order
                    </PrimaryButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
