import React, { useState } from 'react';
import SectionHeading from '../components/atoms/SectionHeading';
import Card from '../components/atoms/Card';
import Input from '../components/atoms/Input';
import PrimaryButton from '../components/atoms/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '' });

  const handleSave = () => {
    // For now we only update local state; call API during integration
    setEditing(false);
  };

  if (loading) {
    return <p className="p-4 text-gray-600">Loading profile…</p>;
  }

  if (!user) {
    return <p className="p-4 text-gray-600">Please login to see profile.</p>;
  }

  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeading title="My Profile" subtitle="Manage your account details." />

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="text-lg font-semibold text-green-700">{user.role}</p>
          </div>
          <PrimaryButton className="bg-red-600 text-white" onClick={logout}>Logout</PrimaryButton>
        </div>

        {editing ? (
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            <Input label="Phone" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
            <Input label="Location" value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))} />
            <div className="flex gap-3">
              <PrimaryButton className="bg-green-600 text-white" onClick={handleSave}>Save</PrimaryButton>
              <PrimaryButton className="bg-gray-200 text-gray-700" onClick={() => setEditing(false)}>Cancel</PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="text-base font-semibold text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-base font-semibold text-gray-900">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-base font-semibold text-gray-900">{user.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Joined</p>
              <p className="text-base font-semibold text-gray-900">{joinedDate}</p>
            </div>
            <PrimaryButton className="bg-green-600 text-white col-span-full" onClick={() => setEditing(true)}>Edit Profile</PrimaryButton>
          </div>
        )}
      </Card>
    </div>
  );
}
