import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginCustomer(email, password);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-md animate-fade-in my-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-md">
            Rx
          </div>
          <h2 className="text-2xl font-black text-slate-900">Customer Portal Login</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Access your prescriptions, orders, and pharmacy receipts
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
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@gmail.com"
              required
              className="w-full text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 transition-all mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In as Customer →'}
          </button>
        </form>

        <div className="mt-5 p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-teal-900">Sample Customer Accounts:</p>
          <p>
            • <code className="font-mono text-teal-800">ramesh@gmail.com</code> /{' '}
            <code className="font-mono text-teal-800">customer123</code>
          </p>
          <p>
            • <code className="font-mono text-teal-800">priya@gmail.com</code> /{' '}
            <code className="font-mono text-teal-800">customer123</code>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 space-y-2 border-t border-slate-100 pt-4">
          <p>
            New patient?{' '}
            <Link to="/customer/register" className="text-teal-600 font-bold hover:underline">
              Register for Customer Portal
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
