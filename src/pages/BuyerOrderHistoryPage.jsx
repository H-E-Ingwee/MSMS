import React, { useEffect, useState } from 'react';
import { Package, Star, MessageCircle, Calendar, DollarSign, Truck, CheckCircle, Clock } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import PrimaryButton from '../components/atoms/PrimaryButton';
import { getBuyerOrders, submitReview, processMpesaPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BuyerOrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    orderId: null
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getBuyerOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'text-blue-600 bg-blue-50';
      case 'DELIVERED':
        return 'text-emerald-600 bg-emerald-50';
      case 'SHIPPED':
        return 'text-blue-600 bg-blue-50';
      case 'PAID':
        return 'text-green-600 bg-green-50';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setReviewData({
      rating: 5,
      comment: '',
      orderId: order.id
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.comment.trim()) return;

    setSubmittingReview(true);
    try {
      await submitReview(reviewData);
      setShowReviewModal(false);
      setSelectedOrder(null);
      // Reload orders to update review status
      await loadOrders();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('0')) {
      return `254${digits.slice(1)}`;
    }
    if (digits.length === 12 && digits.startsWith('254')) {
      return digits;
    }
    if (digits.length === 13 && digits.startsWith('254')) {
      return digits.slice(1);
    }
    return digits;
  };

  const handlePayOrder = async (order) => {
    if (!user?.phone) {
      alert('Please add your phone number to your profile before making a payment.');
      return;
    }

    const formattedPhone = formatPhoneNumber(user.phone);
    if (!formattedPhone) {
      alert('Unable to format your phone number for M-Pesa. Please check your profile details.');
      return;
    }

    setProcessingPayment(true);
    try {
      const paymentData = await processMpesaPayment(order.id, formattedPhone, order.totalPrice);
      alert(paymentData?.message || `Payment initiated! Check your phone for the M-Pesa prompt. Total: KES ${order.totalPrice}`);
      loadOrders(); // Refresh orders
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error.message || 'Please try again.'}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>Order History</SectionHeading>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading>Order History</SectionHeading>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {['ALL', 'APPROVED', 'DELIVERED', 'SHIPPED', 'PAID', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {filter === 'ALL'
                  ? "You haven't placed any orders yet."
                  : `No ${filter.toLowerCase()} orders found.`
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-2" />
                          {order.quantity}kg {order.listing.grade} Miraa
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          KES {order.totalPrice.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Farmer:</strong> {order.listing.farmer.name}
                        {order.listing.farmer.phone && (
                          <span className="ml-2">
                            • <a
                              href={`https://wa.me/${order.listing.farmer.phone.replace('+', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                            >
                              WhatsApp
                            </a>
                          </span>
                        )}
                      </div>

                      {order.review && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < order.review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">Your review</span>
                          </div>
                          <p className="text-sm text-gray-700">{order.review.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {order.status === 'APPROVED' && (
                      <PrimaryButton
                        onClick={() => handlePayOrder(order)}
                        disabled={processingPayment}
                        className="text-sm px-4 py-2"
                      >
                        {processingPayment ? 'Processing...' : 'Pay Now with M-Pesa'}
                      </PrimaryButton>
                    )}
                    {order.status === 'DELIVERED' && !order.review && (
                      <PrimaryButton
                        onClick={() => openReviewModal(order)}
                        className="text-sm px-4 py-2"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Leave Review
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Your Order
              </h3>

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <PrimaryButton
                    type="submit"
                    disabled={submittingReview || !reviewData.comment.trim()}
                    className="flex-1"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}