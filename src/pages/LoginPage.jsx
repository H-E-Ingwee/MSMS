import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading.jsx';
import PrimaryButton from '../components/atoms/PrimaryButton.jsx';
import Input from '../components/atoms/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { requestOtp } from '../services/api.js';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    if (!phone) {
      setError('Please enter your phone number first.');
      return;
    }
    setError('');
    setMessage('');
    setIsRequestingOtp(true);
    
    try {
      const formattedPhone = phone.startsWith('+254') ? phone : `+254${phone}`;
      await requestOtp(formattedPhone);
      setMessage('OTP sent successfully. Check the backend console or your phone.');
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !otp) {
      setError('Please provide both phone number and OTP.');
      return;
    }
    
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      const formattedPhone = phone.startsWith('+254') ? phone : `+254${phone}`;
      const loggedInUser = await login({ phone: formattedPhone, otp });
      
      // Route based on role
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-emerald-50 to-white py-10 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg">
            <Leaf size={32} className="text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Login to MSMS to continue.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 font-medium">+254</span>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(-9))} 
                placeholder="707897640" 
                maxLength="9"
                className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">OTP / Password</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  placeholder="1234" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isRequestingOtp}
                className="px-5 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 transition-colors whitespace-nowrap"
              >
                {isRequestingOtp ? '...' : 'Get OTP'}
              </button>
            </div>
          </div>

          {message && <p className="text-emerald-600 text-sm font-medium text-center">{message}</p>}
          {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            {isSubmitting ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          New to MSMS? <Link to="/register" className="text-emerald-600 hover:underline font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}