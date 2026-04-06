import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SectionHeading from '../components/atoms/SectionHeading';
import PrimaryButton from '../components/atoms/PrimaryButton';
import Input from '../components/atoms/Input';
import { useAuth } from '../context/AuthContext';
import { requestOtp } from '../services/api';

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
      await requestOtp(phone);
      setMessage('OTP sent successfully. Check the backend console or your phone.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      await login({ phone, otp });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-emerald-50 to-white py-10 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
        <SectionHeading title="Login" subtitle="Enter your phone and OTP to continue. Request OTP first if needed." />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., +254712345678" />
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input label="OTP" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="1234" />
            </div>
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isRequestingOtp}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              {isRequestingOtp ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
          {message && <p className="text-emerald-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <PrimaryButton type="submit" disabled={isSubmitting} variant="default" className="w-full">{isSubmitting ? 'Logging in...' : 'Login'} </PrimaryButton>
        </form>

        <p className="text-sm text-gray-500 mt-4">New to MiraaLink? <Link to="/register" className="text-emerald-600 font-medium">Register here</Link>.</p>
      </div>
    </div>
  );
}
