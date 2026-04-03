import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SectionHeading from '../components/atoms/SectionHeading';
import PrimaryButton from '../components/atoms/PrimaryButton';
import Input from '../components/atoms/Input';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, phone, role, location });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-emerald-50 to-white py-10 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
        <SectionHeading title="Register" subtitle="Create an account to access the MiraaLink marketplace." />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Full Name" required value={name} onChange={e => setName(e.target.value)} placeholder="Joel Phineas" />
          <Input label="Phone" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254712345678" />
          <Input label="Location" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Meru" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <PrimaryButton type="submit" disabled={loading} variant="default" className="w-full">{loading ? 'Creating account...' : 'Register'} </PrimaryButton>
        </form>

        <p className="text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-emerald-600 font-medium">Login here</Link>.</p>
      </div>
    </div>
  );
}
