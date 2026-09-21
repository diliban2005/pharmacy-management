import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [roleTab, setRoleTab] = useState('staff'); // 'staff' | 'customer'
  const [form, setForm] = useState({ email: 'john@pharmacy.com', password: 'john123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginStaff, loginCustomer } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setRoleTab(tab);
    setError('');
    if (tab === 'staff') {
      setForm({ email: 'john@pharmacy.com', password: 'john123' });
    } else {
      setForm({ email: 'ramesh@gmail.com', password: 'customer123' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (roleTab === 'staff') {
        const data = await loginStaff(form.email, form.password);
        if (data.user?.role === 'admin' || data.user?.role === 'pharmacist') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        await loginCustomer(form.email, form.password);
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #115e59 100%)' }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 text-white">
        <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center text-3xl font-black mb-8 shadow-lg">
          Rx
        </div>
        <h1 className="text-5xl font-black leading-tight mb-4">
          PharmaCare<br />
          <span className="text-teal-400">AI-Smart Pharmacy</span>
        </h1>
        <p className="text-slate-300 text-lg mb-10 max-w-md leading-relaxed">
          AI-assisted handwritten prescription recognition, real-time inventory matching, pharmacist-in-the-loop verification, and automated billing.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          {[
            ['✍️', 'Handwritten Vision AI'],
            ['💊', 'Drug Knowledge Base'],
            ['⚖️', 'Fairness-by-Design'],
            ['🧾', 'Integrated Billing'],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3.5 backdrop-blur-sm border border-white/10"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 lg:hidden shadow-md">
              Rx
            </div>
            <h2 className="text-2xl font-black text-slate-900">Welcome to PharmaCare</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Select your portal to continue</p>
          </div>

          {/* Role Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('staff')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                roleTab === 'staff'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              💊 Staff (Pharmacist / Admin)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                roleTab === 'customer'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              👤 Customer Portal
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-xs font-semibold mb-5 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {roleTab === 'staff' ? 'Staff Email' : 'Customer Email'}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading
                ? 'Authenticating...'
                : roleTab === 'staff'
                ? 'Sign In to Staff Dashboard →'
                : 'Sign In to Customer Portal →'}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">⚡ 1-Click Demo Login:</span>
              <span className="text-[10px] text-slate-400">Click to fill & test</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRoleTab('staff');
                  setForm({ email: 'john@pharmacy.com', password: 'john123' });
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  form.email === 'john@pharmacy.com'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                }`}
              >
                <span className="text-base block mb-0.5">💊</span>
                <span className="text-[11px] font-bold block">Pharmacist</span>
                <span className="text-[9px] text-slate-400 block font-normal">Dispensary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleTab('customer');
                  setForm({ email: 'ramesh@gmail.com', password: 'customer123' });
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  form.email === 'ramesh@gmail.com'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                }`}
              >
                <span className="text-base block mb-0.5">👤</span>
                <span className="text-[11px] font-bold block">Customer</span>
                <span className="text-[9px] text-slate-400 block font-normal">Patient Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleTab('staff');
                  setForm({ email: 'admin@pharmacy.com', password: 'admin123' });
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  form.email === 'admin@pharmacy.com'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                }`}
              >
                <span className="text-base block mb-0.5">👑</span>
                <span className="text-[11px] font-bold block">Admin</span>
                <span className="text-[9px] text-slate-400 block font-normal">Management</span>
              </button>
            </div>

            {/* Explanatory description of active role */}
            <p className="text-[11px] text-slate-500 leading-relaxed bg-white p-2 rounded-lg border border-slate-100">
              {form.email === 'john@pharmacy.com' && (
                <>
                  <strong className="text-teal-700">Pharmacist Role:</strong> Inspects uploaded doctor handwriting, verifies AI medicine matches against stock, and dispenses medication.
                </>
              )}
              {form.email === 'ramesh@gmail.com' && (
                <>
                  <strong className="text-blue-700">Customer Role:</strong> Uploads prescription photos/PDFs, tracks live status timeline, and accesses printable receipts.
                </>
              )}
              {form.email === 'admin@pharmacy.com' && (
                <>
                  <strong className="text-purple-700">Admin Role:</strong> Manages pharmacist accounts, medicine inventory, sales analytics, and fairness audit logs.
                </>
              )}
            </p>
          </div>

          {/* Footer link for customer registration */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {roleTab === 'customer' ? (
              <p>
                Don't have an account?{' '}
                <Link to="/customer/register" className="text-teal-600 font-bold hover:underline">
                  Register as a new customer →
                </Link>
              </p>
            ) : (
              <p>
                Patient or Customer?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('customer')}
                  className="text-teal-600 font-bold hover:underline"
                >
                  Switch to Customer Portal →
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
