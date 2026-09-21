import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TiltCard from '../components/common/TiltCard';
import TrailingCursor from '../components/common/TrailingCursor';
import SoundFX from '../utils/SoundFX';

export default function Login() {
  const [roleTab, setRoleTab] = useState('staff'); // 'staff' | 'customer'
  const [form, setForm] = useState({ email: 'john@pharmacy.com', password: 'john123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginStaff, loginCustomer } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    SoundFX.playClick();
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
    SoundFX.playClick();

    try {
      if (roleTab === 'staff') {
        const data = await loginStaff(form.email, form.password);
        SoundFX.playSuccess();
        navigate('/dashboard');
      } else {
        await loginCustomer(form.email, form.password);
        SoundFX.playSuccess();
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex cyber-grid-bg text-slate-100 relative selection:bg-cyber-emerald selection:text-void-950">
      <TrailingCursor />

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 text-white z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan flex items-center justify-center text-3xl font-black mb-8 shadow-glow-emerald text-void-950">
          Rx
        </div>
        <h1 className="text-5xl font-black leading-tight mb-4">
          PharmaCare<br />
          <span className="text-cyber-emerald">Cyber-Spatial Pharmacy</span>
        </h1>
        <p className="text-slate-300 text-lg mb-10 max-w-md leading-relaxed">
          AI-assisted handwritten prescription recognition, real-time inventory node matching, pharmacist verification, and holographic POS billing.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          {[
            ['✍️', 'Laser Multimodal Vision'],
            ['💊', '3D Node Inventory'],
            ['⚖️', 'CDSCO & HIPAA Safe'],
            ['🧾', 'Holographic POS'],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-void-900/80 rounded-2xl px-4 py-3.5 backdrop-blur-md border border-emerald-500/20 shadow-glass"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-semibold text-white">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <TiltCard
          maxTilt={6}
          className="cyber-card p-8 sm:p-10 w-full max-w-md animate-fade-in border border-cyber-emerald/40 bg-void-900/95 shadow-glass-lg"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan flex items-center justify-center text-void-950 text-2xl font-black mx-auto mb-4 lg:hidden shadow-glow-emerald">
              Rx
            </div>
            <h2 className="text-2xl font-black text-white">Welcome to PharmaCare</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Select your portal to continue</p>
          </div>

          {/* Role Tabs */}
          <div className="flex rounded-2xl bg-void-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => handleTabChange('staff')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                roleTab === 'staff'
                  ? 'bg-cyber-emerald text-void-950 font-black shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💊 Staff Terminal
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                roleTab === 'customer'
                  ? 'bg-cyber-cyan text-void-950 font-black shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👤 Patient Portal
            </button>
          </div>

          {error && (
            <div className="bg-rose-950/80 text-rose-300 border border-rose-500/50 rounded-xl px-4 py-3 text-xs font-semibold mb-5 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                {roleTab === 'staff' ? 'Staff Email' : 'Patient Email'}
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
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Password</label>
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
              className="btn-primary w-full py-3.5 rounded-xl font-black text-sm shadow-glow-emerald disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading
                ? 'Authenticating...'
                : roleTab === 'staff'
                ? 'Sign In to Staff Dashboard →'
                : 'Sign In to Patient Portal →'}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
            <p className="font-bold text-cyber-emerald">Demo Credentials:</p>
            {roleTab === 'staff' ? (
              <p>Pharmacist: <span className="text-white">john@pharmacy.com</span> / <span className="text-white">john123</span></p>
            ) : (
              <p>Patient: <span className="text-white">ramesh@gmail.com</span> / <span className="text-white">customer123</span></p>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs font-mono text-slate-400 hover:text-cyber-emerald hover:underline">
              ← Return to Public Landing Page
            </Link>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
