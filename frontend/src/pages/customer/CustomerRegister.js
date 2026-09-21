import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    dateOfBirth: '',
    gender: 'Other',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerCustomer(form);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-lg animate-fade-in my-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-md">
            Rx
          </div>
          <h2 className="text-2xl font-black text-slate-900">Create Customer Account</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Access online prescription uploads, status tracking, and order history
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-xs font-semibold mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              required
              className="w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ramesh@gmail.com"
                required
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
                className="w-full text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                className="w-full text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              placeholder="Your delivery address (street, city, pincode)"
              className="w-full text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 transition-all mt-2"
          >
            {loading ? 'Creating Account...' : 'Register as Customer →'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
          <p>
            Already have an account?{' '}
            <Link to="/customer/login" className="text-teal-600 font-bold hover:underline">
              Log in to Customer Portal
            </Link>
          </p>
          <p>
            Pharmacy Staff?{' '}
            <Link to="/login" className="text-slate-700 font-semibold hover:underline">
              Staff Login (Pharmacist / Admin)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
