import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, MessageCircle } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import { getOrders } from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

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
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
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
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
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
        {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium border ${
              filter === status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'All Orders' : status}
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
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-emerald-700">KES {order.totalPrice.toLocaleString()}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-2">Seller Information</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {order.listing.farmer.name.charAt(0)}
                    </div>
                    <span className="font-medium">{order.listing.farmer.name}</span>
                    {order.listing.farmer.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-600">{order.listing.location}</p>
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

              <div className="flex gap-2">
                <button
                  onClick={() => handleContactSeller(order)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Contact Seller
                </button>
                {order.status === 'PAID' && (
                  <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">
                    Track Delivery
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}