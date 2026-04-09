import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, TrendingUp, ShoppingCart, BookOpen, Wallet, Shield } from 'lucide-react';
import PrimaryButton from '../components/atoms/PrimaryButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-xl">
                <Leaf size={24} className="text-white" />
              </div>
              <span className="text-xl font-black text-gray-800 tracking-tight">MiraaLink<span className="text-green-600">.</span></span>
            </div>
            <div className="flex gap-3">
              <Link to="/login">
                <PrimaryButton className="bg-green-600 text-white border border-green-600 hover:bg-green-50">Login</PrimaryButton>
              </Link>
              <Link to="/register">
                <PrimaryButton className="bg-green-600 text-white hover:bg-green-700">Register</PrimaryButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Empowering Miraa Farmers with <span className="text-green-600">Smart Technology</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join MiraaLink MSMS – the ultimate marketplace for predictive analytics, training, and secure transactions. Connect, grow, and thrive in the miraa industry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <PrimaryButton className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 text-lg">Get Started</PrimaryButton>
            </Link>
            <Link to="/login">
              <PrimaryButton className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-8 py-3 text-lg">Sign In</PrimaryButton>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <TrendingUp size={32} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Predictive Analytics</h3>
              <p className="text-gray-600">AI-powered insights for better farming decisions and market predictions.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <ShoppingCart size={32} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Marketplace</h3>
              <p className="text-gray-600">Connect directly with buyers and sellers in a secure, transparent platform.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <BookOpen size={32} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Training Modules</h3>
              <p className="text-gray-600">Access educational resources to improve your farming techniques and business skills.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <Wallet size={32} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">M-Pesa Integration</h3>
              <p className="text-gray-600">Seamless mobile money transactions for fast and secure payments.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <Shield size={32} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Oversight</h3>
              <p className="text-gray-600">Comprehensive admin tools for system management and user support.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <Leaf size={32} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainable Growth</h3>
              <p className="text-gray-600">Promote eco-friendly practices and long-term success in the miraa sector.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">© 2026 MiraaLink MSMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
