import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, MessageCircle, Check, X, Eye } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import PrimaryButton from '../components/atoms/PrimaryButton';
import { getOrders, processMpesaPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [processingApproval, setProcessingApproval] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'PENDING_PAYMENT':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING_PAYMENT':
        return 'bg-orange-100 text-orange-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(order => order.status === filter);

  const handleContactSeller = (order) => {
    const phoneNumber = order.listing.farmer.phone;
    const message = `Hi ${order.listing.farmer.name}, regarding order ${order.id} for ${order.quantity}kg ${order.listing.grade}.`;

    const whatsappUrl = `https://wa.me/254${phoneNumber.substring(1)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleApproveOrder = (order) => {
    setSelectedOrder(order);
    setFarmerNotes('');
    setShowApprovalModal(true);
  };

  const handleApprovalDecision = async (approved) => {
    if (!selectedOrder) return;

    setProcessingApproval(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/orders/${selectedOrder.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('msms_token')}`,
        },
        body: JSON.stringify({
          approved,
          farmerNotes: farmerNotes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process approval');
      }

      alert(approved ? 'Order approved successfully!' : 'Order rejected.');
      setShowApprovalModal(false);
      setSelectedOrder(null);
      loadOrders(); // Refresh orders

    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setProcessingApproval(false);
    }
  };

  const handlePayOrder = async (order) => {
    try {
      const paymentData = await processMpesaPayment(
        order.id,
        user.phone.replace('+', ''), // Remove + prefix for M-Pesa
        order.totalPrice
      );
      alert(`Payment initiated! Check your phone for M-Pesa prompt. Total: KES ${order.totalPrice}`);
      loadOrders(); // Refresh orders

    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  const getActionButtons = (order) => {
    const isFarmer = user?.role === 'FARMER' && order.listing.farmerId === user.id;
    const isBuyer = user?.role === 'BUYER' && order.buyerId === user.id;

    if (isFarmer && order.status === 'PENDING_APPROVAL') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleApproveOrder(order)}
            className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <Check size={14} /> Review
          </button>
        </div>
      );
    }

    if (isBuyer && order.status === 'APPROVED') {
      return (
        <div className="flex gap-2">
          <PrimaryButton
            onClick={() => handlePayOrder(order)}
            className="px-3 py-1.5 text-sm"
          >
            Pay Now with M-Pesa
          </PrimaryButton>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleContactSeller(order)}
        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1"
      >
        <MessageCircle size={14} /> Contact
      </button>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeading title="My Orders" subtitle="Track your purchases and sales" />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading title="My Orders" subtitle="Track your purchases and sales" />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium border ${
              filter === status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {order.quantity}kg {order.listing.grade}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Order #{order.id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.farmerNotes && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        "{order.farmerNotes}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-emerald-700">KES {order.totalPrice.toLocaleString()}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  {order.mpesaReceiptNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      Receipt: {order.mpesaReceiptNumber}
                    </p>
                  )}
                  {order.paidAt && (
                    <p className="text-xs text-gray-500">
                      Paid: {new Date(order.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {user?.role === 'FARMER' ? 'Buyer' : 'Seller'} Information
                  </h4>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {user?.role === 'FARMER' ? order.buyer.name.charAt(0) : order.listing.farmer.name.charAt(0)}
                    </div>
                    <span className="font-medium">
                      {user?.role === 'FARMER' ? order.buyer.name : order.listing.farmer.name}
                    </span>
                    {(user?.role === 'FARMER' ? order.buyer.verified : order.listing.farmer.verified) && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {user?.role === 'FARMER' ? (order.buyer.location || 'Nairobi') : order.listing.location}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-2">Order Details</h4>
                  <p className="text-sm text-gray-600">Price per kg: KES {order.listing.price}</p>
                  <p className="text-sm text-gray-600">Quantity: {order.quantity}kg</p>
                  {order.deliveryAddress && (
                    <p className="text-sm text-gray-600">Delivery: {order.deliveryAddress}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {getActionButtons(order)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Review Order Request</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedOrder.listing.grade}</span>
                  <span className="font-bold text-emerald-700">KES {selectedOrder.listing.price}/kg</span>
                </div>
                <p className="text-sm text-gray-600">Requested: {selectedOrder.quantity}kg</p>
                <p className="text-sm text-gray-600">Buyer: {selectedOrder.buyer.name}</p>
                <p className="text-sm text-gray-600">Total: KES {selectedOrder.totalPrice.toLocaleString()}</p>
                {selectedOrder.deliveryAddress && (
                  <p className="text-sm text-gray-600">Delivery: {selectedOrder.deliveryAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={farmerNotes}
                  onChange={(e) => setFarmerNotes(e.target.value)}
                  placeholder="Add any notes for the buyer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprovalDecision(false)}
                  disabled={processingApproval}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  {processingApproval ? 'Processing...' : 'Reject Order'}
                </button>
                <PrimaryButton
                  onClick={() => handleApprovalDecision(true)}
                  disabled={processingApproval}
                  className="flex-1"
                >
                  {processingApproval ? 'Processing...' : 'Approve Order'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}