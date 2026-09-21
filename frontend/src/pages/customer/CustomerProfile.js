import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CustomerProfile() {
  const { user, updateCustomerUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'Other',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/customer-auth/me');
        if (data.customer) {
          setForm({
            name: data.customer.name || '',
            email: data.customer.email || '',
            phone: data.customer.phone || '',
            address: data.customer.address || '',
            dateOfBirth: data.customer.dateOfBirth
              ? new Date(data.customer.dateOfBirth).toISOString().split('T')[0]
              : '',
            gender: data.customer.gender || 'Other',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.put('/customer-auth/profile', {
        name: form.name,
        phone: form.phone,
        address: form.address,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender,
      });
      setSuccess('Profile updated successfully!');
      if (data.customer) {
        updateCustomerUser(data.customer);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your contact information and medical delivery address up to date.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        {success && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                className="w-full text-sm bg-slate-50 cursor-not-allowed text-slate-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email cannot be changed</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Home / Delivery Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder="Street address, apartment, city, state, postal code"
                className="w-full text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-3 rounded-xl font-bold text-sm shadow-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
