import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Receipt,
  ShoppingBag,
  UploadCloud,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import TiltCard from '../../components/common/TiltCard';
import SoundFX from '../../utils/SoundFX';

const STATUS_CONFIG = {
  UPLOADED: { label: 'Uploaded / Queued', color: 'bg-blue-950/80 text-blue-400 border-blue-500/40', icon: '📤' },
  AI_ANALYZING: { label: 'AI Multimodal Reading', color: 'bg-purple-950/80 text-purple-400 border-purple-500/40', icon: '⚡' },
  UNDER_PHARMACIST_REVIEW: { label: 'Pharmacist Safety Review', color: 'bg-amber-950/80 text-amber-400 border-amber-500/40', icon: '⏳' },
  NEEDS_CLARIFICATION: { label: 'Clarification Needed', color: 'bg-orange-950/80 text-orange-400 border-orange-500/40', icon: '💬' },
  VERIFIED: { label: 'Verified & Approved', color: 'bg-emerald-950/80 text-cyber-emerald border-cyber-emerald/40', icon: '✓' },
  REJECTED: { label: 'Prescription Rejected', color: 'bg-rose-950/80 text-rose-400 border-rose-500/40', icon: '✕' },
  DISPENSED: { label: 'Dispensed & Completed', color: 'bg-teal-950/80 text-teal-300 border-teal-500/40', icon: '💊' },
  pending: { label: 'Under Review', color: 'bg-amber-950/80 text-amber-400 border-amber-500/40', icon: '⏳' },
  verified: { label: 'Verified', color: 'bg-emerald-950/80 text-cyber-emerald border-cyber-emerald/40', icon: '✓' },
  dispensed: { label: 'Dispensed', color: 'bg-teal-950/80 text-teal-300 border-teal-500/40', icon: '💊' },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rxRes, purRes] = await Promise.all([
          api.get('/customer/prescriptions'),
          api.get('/customer/purchases'),
        ]);
        setPrescriptions(rxRes.data.data || []);
        setPurchases(purRes.data.data || []);
      } catch (err) {
        console.error('Customer dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = prescriptions.filter(
    (p) =>
      p.status === 'UPLOADED' ||
      p.status === 'AI_ANALYZING' ||
      p.status === 'UNDER_PHARMACIST_REVIEW' ||
      p.status === 'pending'
  ).length;

  const completedCount = prescriptions.filter(
    (p) =>
      p.status === 'VERIFIED' ||
      p.status === 'DISPENSED' ||
      p.status === 'verified' ||
      p.status === 'dispensed'
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 3D Tilt Welcome Banner */}
      <TiltCard
        maxTilt={8}
        className="rounded-3xl bg-gradient-to-r from-void-900 via-void-850 to-void-800 p-6 sm:p-8 text-white border border-cyber-emerald/30 shadow-glass-lg relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald text-xs font-mono font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-glow-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cyber-Clinical Patient Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, <span className="text-cyber-emerald">{user?.name || 'Valued Patient'}</span> 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Order OTC essentials directly with instant dispatch, monitor real-time AI doctor note digitization, and inspect verified prescription timelines.
          </p>
        </div>

        {/* Ambient Holographic Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyber-emerald/15 to-transparent pointer-events-none" />
        <div className="absolute right-6 -bottom-6 opacity-10 text-9xl font-black text-cyber-emerald pointer-events-none select-none">
          Rx
        </div>
      </TiltCard>

      {/* KPI Cards with 3D Tilt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <TiltCard
          maxTilt={10}
          className="cyber-card p-5 border-l-4 border-l-cyber-cyan"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Total Uploads
            </p>
            <FileText className="w-4 h-4 text-cyber-cyan" />
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">
            {loading ? '...' : prescriptions.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Prescription archives</p>
        </TiltCard>

        <TiltCard
          maxTilt={10}
          className="cyber-card p-5 border-l-4 border-l-amber-400"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              In Review
            </p>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 mt-2 font-mono">
            {loading ? '...' : pendingCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Under safety check</p>
        </TiltCard>

        <TiltCard
          maxTilt={10}
          className="cyber-card p-5 border-l-4 border-l-cyber-emerald"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Approved
            </p>
            <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
          </div>
          <p className="text-3xl font-black text-cyber-emerald mt-2 font-mono">
            {loading ? '...' : completedCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Verified & ready</p>
        </TiltCard>

        <TiltCard
          maxTilt={10}
          className="cyber-card p-5 border-l-4 border-l-blue-400"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Purchases
            </p>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400 mt-2 font-mono">
            {loading ? '...' : purchases.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Invoices & bills</p>
        </TiltCard>
      </div>

      {/* Direct Medicine Purchase Gateway Banner */}
      <div className="cyber-card p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-cyber-emerald/30 bg-gradient-to-r from-void-900 via-void-850 to-void-900 shadow-glow-emerald">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan text-void-950 flex items-center justify-center text-2xl shadow-glow-emerald shrink-0 font-black">
            💊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">Direct Medicine Purchase Active</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Order Over-The-Counter (OTC) pain, fever, immunity, and skin medications instantly with 0 paperwork, or select Schedule H medicines with your approved prescription.
            </p>
          </div>
        </div>
        <Link
          to="/customer/store"
          onClick={() => SoundFX.playClick()}
          className="btn-primary text-xs px-5 py-3 rounded-xl font-black whitespace-nowrap shadow-glow-emerald shrink-0 flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop Medicines Online</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Interactive Actions */}
      <div className="cyber-card p-6">
        <h2 className="text-sm font-mono font-bold text-cyber-emerald uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Quick Patient Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/customer/store"
            onClick={() => SoundFX.playClick()}
            className="p-4 rounded-2xl bg-gradient-to-b from-cyber-emerald/20 to-cyber-cyan/10 border border-cyber-emerald/40 hover:border-cyber-emerald text-white flex flex-col items-center justify-center text-center transition-all group shadow-glow-emerald hover:scale-102"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">💊</span>
            <span className="text-xs font-bold text-white">Buy Medicines</span>
            <span className="text-[10px] text-cyber-emerald font-mono mt-0.5">OTC & Rx Store</span>
          </Link>

          <Link
            to="/customer/upload"
            onClick={() => SoundFX.playClick()}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyber-cyan text-white flex flex-col items-center justify-center text-center transition-all group hover:scale-102"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</span>
            <span className="text-xs font-bold text-white">Laser Rx Scan</span>
            <span className="text-[10px] text-cyber-cyan font-mono mt-0.5">AI OCR Vision</span>
          </Link>

          <Link
            to="/customer/prescriptions"
            onClick={() => SoundFX.playClick()}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyber-emerald text-white flex flex-col items-center justify-center text-center transition-all group hover:scale-102"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</span>
            <span className="text-xs font-bold text-white">Prescriptions</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Timeline Status</span>
          </Link>

          <Link
            to="/customer/purchases"
            onClick={() => SoundFX.playClick()}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-blue-400 text-white flex flex-col items-center justify-center text-center transition-all group hover:scale-102"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧾</span>
            <span className="text-xs font-bold text-white">Invoices</span>
            <span className="text-[10px] text-blue-400 font-mono mt-0.5">Receipts & Bills</span>
          </Link>

          <Link
            to="/customer/profile"
            onClick={() => SoundFX.playClick()}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-amber-400 text-white flex flex-col items-center justify-center text-center transition-all group col-span-2 sm:col-span-1 hover:scale-102"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</span>
            <span className="text-xs font-bold text-white">Profile</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Security & Data</span>
          </Link>
        </div>
      </div>

      {/* Recent Prescriptions Status & Timeline */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-5 border-b border-slate-700/60 pb-3">
          <div>
            <h2 className="text-base font-black text-white">Recent Prescription Pipeline</h2>
            <p className="text-xs text-slate-400">Live AI OCR analysis and licensed pharmacist checks</p>
          </div>
          <Link
            to="/customer/prescriptions"
            onClick={() => SoundFX.playClick()}
            className="text-cyber-emerald hover:text-white text-xs font-bold font-mono hover:underline flex items-center gap-1"
          >
            <span>All Prescriptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyber-emerald border-t-transparent" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <p className="text-4xl">📄</p>
            <p className="font-bold text-white">No Prescriptions Uploaded Yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload your handwritten doctor note to initiate instant laser scanning and pharmacist dispensing.
            </p>
            <Link
              to="/customer/upload"
              onClick={() => SoundFX.playClick()}
              className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold mt-2 inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Prescription Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.slice(0, 3).map((rx) => {
              const statusCfg = STATUS_CONFIG[rx.status] || {
                label: rx.status,
                color: 'bg-slate-900 text-slate-400 border-slate-700',
                icon: '📋',
              };

              return (
                <div
                  key={rx._id}
                  className="rounded-2xl p-4 sm:p-5 bg-void-950/80 border border-slate-700/80 hover:border-cyber-emerald/50 transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-white">
                          Prescription #{rx._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}
                        >
                          <span>{statusCfg.icon}</span>
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Doctor: <strong className="text-slate-200">{rx.doctorName || 'Prescribing Physician'}</strong> •{' '}
                        {new Date(rx.date || rx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <Link
                      to={`/customer/prescriptions?id=${rx._id}`}
                      onClick={() => SoundFX.playClick()}
                      className="text-cyber-emerald hover:text-white text-xs font-bold self-start sm:self-auto hover:underline flex items-center gap-1"
                    >
                      <span>Track Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* 4-Step Animated Progress Line */}
                  <div className="pt-3">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="space-y-1">
                        <div className="h-1.5 rounded-full bg-cyber-emerald shadow-glow-emerald" />
                        <span className="text-cyber-emerald font-semibold block text-[11px]">1. Uploaded</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            rx.status !== 'UPLOADED' ? 'bg-cyber-cyan shadow-glow-cyan' : 'bg-slate-800'
                          }`}
                        />
                        <span
                          className={`font-semibold block text-[11px] ${
                            rx.status !== 'UPLOADED' ? 'text-cyber-cyan' : 'text-slate-500'
                          }`}
                        >
                          2. AI Reading
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            ['UNDER_PHARMACIST_REVIEW', 'VERIFIED', 'DISPENSED', 'verified', 'dispensed'].includes(
                              rx.status
                            )
                              ? 'bg-amber-400'
                              : 'bg-slate-800'
                          }`}
                        />
                        <span
                          className={`font-semibold block text-[11px] ${
                            ['UNDER_PHARMACIST_REVIEW', 'VERIFIED', 'DISPENSED', 'verified', 'dispensed'].includes(
                              rx.status
                            )
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          3. Pharmacist Check
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            ['VERIFIED', 'DISPENSED', 'verified', 'dispensed'].includes(rx.status)
                              ? 'bg-cyber-emerald shadow-glow-emerald'
                              : 'bg-slate-800'
                          }`}
                        />
                        <span
                          className={`font-semibold block text-[11px] ${
                            ['VERIFIED', 'DISPENSED', 'verified', 'dispensed'].includes(rx.status)
                              ? 'text-cyber-emerald'
                              : 'text-slate-500'
                          }`}
                        >
                          4. Verified / Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
