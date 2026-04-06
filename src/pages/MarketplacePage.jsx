import React, { useEffect, useState } from 'react';
import { MapPin, Phone, CheckCircle2, PlusCircle, ShoppingCart, MessageCircle, X } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import PrimaryButton from '../components/atoms/PrimaryButton';
import { getMarketListings, createOrder, processMpesaPayment } from '../services/api';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [processingPurchase, setProcessingPurchase] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const data = await getMarketListings();
      setListings(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const grades = ['All Grades', 'Kangeta', 'Alele', 'Giza', 'Lomboko'];
  const filtered = gradeFilter === 'All Grades' ? listings : listings.filter(item => item.grade === gradeFilter);

  const handleBuyNow = (listing) => {
    setSelectedListing(listing);
    setPurchaseQuantity(1);
    setDeliveryAddress('');
    setShowPurchaseModal(true);
  };

  const handleContactSeller = (listing) => {
    // For now, we'll use WhatsApp if available, otherwise direct call
    const phoneNumber = listing.farmerPhone || '0712345678'; // Fallback phone
    const message = `Hi ${listing.farmer}, I'm interested in your ${listing.grade} Miraa listing (${listing.qty}) at KES ${listing.price}/kg. Can we discuss the purchase?`;

    // Try WhatsApp first
    const whatsappUrl = `https://wa.me/254${phoneNumber.substring(1)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Fallback to phone call after a delay
    setTimeout(() => {
      window.location.href = `tel:+254${phoneNumber.substring(1)}`;
    }, 2000);
  };

  const handlePurchase = async () => {
    if (!selectedListing) return;

    setProcessingPurchase(true);
    try {
      // Create the order request (will be PENDING_APPROVAL)
      const orderData = {
        listingId: selectedListing.id,
        quantity: purchaseQuantity,
      };

      // Only include deliveryAddress if it's not empty
      if (deliveryAddress.trim()) {
        orderData.deliveryAddress = deliveryAddress.trim();
      }

      const order = await createOrder(orderData);

      alert(`Order request sent successfully! The farmer will review your order for ${purchaseQuantity}kg of ${selectedListing.grade}. You'll be notified once approved.`);

      setShowPurchaseModal(false);
      setSelectedListing(null);
      loadListings(); // Refresh listings

    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Order request failed. Please try again.');
    } finally {
      setProcessingPurchase(false);
    }
  };

  const maxQuantity = selectedListing ? parseInt(selectedListing.qty) : 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SectionHeading title="Marketplace" subtitle="Direct buyer-seller matching." />
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <PlusCircle size={18} /> List Produce
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {grades.map(grade => (
          <button
            key={grade}
            onClick={() => setGradeFilter(grade)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium border ${
              grade === gradeFilter ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading marketplace...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{item.grade}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {item.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-emerald-700">KES {item.price}</p>
                  <p className="text-xs text-gray-500">per kg</p>
                </div>
              </div>

              <div className="py-3 border-y border-gray-50 my-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {item.farmer.charAt(0)}
                  </div>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    {item.farmer} {item.verified && <CheckCircle2 size={14} className="text-blue-500" />}
                  </p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">{item.qty} kg</div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleBuyNow(item)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} /> Buy Now
                </button>
                <button
                  onClick={() => handleContactSeller(item)}
                  className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl"
                  title="Contact Seller"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Purchase Miraa</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedListing.grade}</span>
                  <span className="font-bold text-emerald-700">KES {selectedListing.price}/kg</span>
                </div>
                <p className="text-sm text-gray-600">Available: {selectedListing.qty} kg</p>
                <p className="text-sm text-gray-600">Seller: {selectedListing.farmer}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address (Optional)
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-700">KES {(purchaseQuantity * selectedListing.price).toLocaleString()}</span>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  This will send an order request to the farmer. Payment will be processed after approval.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handlePurchase}
                  disabled={processingPurchase}
                  className="flex-1"
                >
                  {processingPurchase ? 'Sending Request...' : 'Send Order Request'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
