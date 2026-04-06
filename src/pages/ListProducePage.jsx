import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, DollarSign, Hash } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import PrimaryButton from '../components/atoms/PrimaryButton';
import Input from '../components/atoms/Input';
import { postNewListing } from '../services/api';

export default function ListProducePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    grade: '',
    quantity: '',
    price: '',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const grades = ['Kangeta', 'Alele', 'Giza', 'Lomboko'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.grade) newErrors.grade = 'Please select a miraa grade';
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1 kg';
    if (!formData.price || formData.price < 1) newErrors.price = 'Price must be at least 1 KES per kg';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const listingData = {
        grade: formData.grade,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        description: formData.description.trim() || undefined,
      };

      await postNewListing(listingData);

      alert('✅ Listing created successfully! Your produce is now available in the marketplace.');
      navigate('/marketplace');
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('❌ Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Back to Marketplace
        </button>
      </div>

      <SectionHeading
        title="List Your Produce"
        subtitle="Add your miraa to the marketplace"
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        {/* Grade Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Miraa Grade *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {grades.map(grade => (
              <button
                key={grade}
                type="button"
                onClick={() => handleInputChange('grade', grade)}
                className={`p-3 rounded-xl border-2 text-left transition-colors ${
                  formData.grade === grade
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={18} />
                  <span className="font-medium">{grade}</span>
                </div>
              </button>
            ))}
          </div>
          {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
        </div>

        {/* Quantity and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (kg) *
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                placeholder="e.g. 50"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="pl-10"
                min="1"
                max="10000"
              />
            </div>
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per kg (KES) *
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                placeholder="e.g. 600"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="pl-10"
                min="1"
                max="10000"
                step="0.01"
              />
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="e.g. Meru Central"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="pl-10"
              maxLength="100"
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            placeholder="Describe your miraa quality, freshness, etc."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            rows="3"
            maxLength="500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <PrimaryButton
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Listing...' : 'List Produce'}
          </PrimaryButton>
        </div>
      </form>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">Listing Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose the correct miraa grade for accurate matching</li>
          <li>• Set competitive prices based on current market rates</li>
          <li>• Provide detailed descriptions to attract buyers</li>
          <li>• Your listing will be active immediately after creation</li>
        </ul>
      </div>
    </div>
  );
}