import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_CONFIG = {
  UPLOADED: { label: 'Uploaded / Queued', color: 'bg-blue-100 text-blue-800', icon: '📤' },
  AI_ANALYZING: { label: 'AI Analyzing Document', color: 'bg-purple-100 text-purple-800', icon: '⚡' },
  UNDER_PHARMACIST_REVIEW: { label: 'Under Pharmacist Review', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
  NEEDS_CLARIFICATION: { label: 'Clarification Needed', color: 'bg-orange-100 text-orange-800', icon: '💬' },
  VERIFIED: { label: 'Verified & Approved', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
  REJECTED: { label: 'Prescription Rejected', color: 'bg-rose-100 text-rose-800', icon: '✕' },
  DISPENSED: { label: 'Dispensed & Completed', color: 'bg-teal-100 text-teal-800', icon: '💊' },
  // Backwards compatibility
  pending: { label: 'Under Review', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
  verified: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
  dispensed: { label: 'Dispensed', color: 'bg-teal-100 text-teal-800', icon: '💊' },
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
    (p) => p.status === 'UPLOADED' || p.status === 'AI_ANALYZING' || p.status === 'UNDER_PHARMACIST_REVIEW' || p.status === 'pending'
  ).length;

  const completedCount = prescriptions.filter(
    (p) => p.status === 'VERIFIED' || p.status === 'DISPENSED' || p.status === 'verified' || p.status === 'dispensed'
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-teal-500/30 text-teal-200 text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Welcome back, {user?.name || 'Valued Customer'} 👋
          </h1>
          <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
            Manage your prescriptions, view pharmacist verifications, upload new doctor notes, and view your medication purchase history.
          </p>
        </div>
        <div className="absolute right-4 bottom-2 opacity-10 text-9xl font-black pointer-events-none select-none">
          Rx
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-5 border-l-4 border-teal-500 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prescriptions</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : prescriptions.length}</p>
          <p className="text-xs text-slate-500 mt-1">Uploaded to pharmacy</p>
        </div>

        <div className="card p-5 border-l-4 border-amber-500 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Under Review</p>
          <p className="text-3xl font-black text-amber-600 mt-2">{loading ? '...' : pendingCount}</p>
          <p className="text-xs text-slate-500 mt-1">Pharmacist reviewing</p>
        </div>

        <div className="card p-5 border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{loading ? '...' : completedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Verified & dispensed</p>
        </div>

        <div className="card p-5 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchases</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{loading ? '...' : purchases.length}</p>
          <p className="text-xs text-slate-500 mt-1">Completed orders</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/customer/upload"
            className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 flex flex-col items-center justify-center text-center transition-all group shadow-sm"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</span>
            <span className="text-sm font-bold text-teal-900">Upload Prescription</span>
            <span className="text-xs text-teal-600 mt-0.5">JPG, PNG, PDF</span>
          </Link>

          <Link
            to="/customer/prescriptions"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</span>
            <span className="text-sm font-bold text-slate-800">View Prescriptions</span>
            <span className="text-xs text-slate-500 mt-0.5">Track status timeline</span>
          </Link>

          <Link
            to="/customer/purchases"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧾</span>
            <span className="text-sm font-bold text-slate-800">Purchase History</span>
            <span className="text-xs text-slate-500 mt-0.5">Invoices & receipts</span>
          </Link>

          <Link
            to="/customer/profile"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</span>
            <span className="text-sm font-bold text-slate-800">My Profile</span>
            <span className="text-xs text-slate-500 mt-0.5">Contact & address</span>
          </Link>
        </div>
      </div>

      {/* Recent Prescriptions Timeline & Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Prescriptions</h2>
            <p className="text-xs text-slate-400">Track current status and pharmacist verification</p>
          </div>
          <Link to="/customer/prescriptions" className="text-teal-600 hover:text-teal-800 text-xs font-bold hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-semibold text-slate-600">No prescriptions uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Upload your doctor's handwritten or printed prescription to get started with instant pharmacy processing.
            </p>
            <Link
              to="/customer/upload"
              className="mt-4 inline-block btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              Upload Prescription Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.slice(0, 3).map((rx) => {
              const statusCfg = STATUS_CONFIG[rx.status] || {
                label: rx.status,
                color: 'bg-slate-100 text-slate-800',
                icon: '📋',
              };

              return (
                <div
                  key={rx._id}
                  className="border border-slate-100 rounded-2xl p-4 sm:p-5 bg-white hover:border-teal-200 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          Prescription #{rx._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${statusCfg.color}`}
                        >
                          <span>{statusCfg.icon}</span>
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Prescribed by: <strong className="text-slate-700">{rx.doctorName || 'Prescribing Doctor'}</strong> •{' '}
                        {new Date(rx.date || rx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <Link
                      to={`/customer/prescriptions?id=${rx._id}`}
                      className="text-teal-600 hover:text-teal-800 text-xs font-bold self-start sm:self-auto hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>

                  {/* Visual Status Progression Timeline */}
                  <div className="pt-3">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="space-y-1">
                        <div className="h-1.5 rounded-full bg-teal-500" />
                        <span className="text-slate-600 font-semibold block text-[11px]">1. Uploaded</span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            rx.status !== 'UPLOADED' ? 'bg-teal-500' : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`font-semibold block text-[11px] ${
                            rx.status !== 'UPLOADED' ? 'text-slate-600' : 'text-slate-400'
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
                              ? 'bg-teal-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`font-semibold block text-[11px] ${
                            ['UNDER_PHARMACIST_REVIEW', 'VERIFIED', 'DISPENSED', 'verified', 'dispensed'].includes(
                              rx.status
                            )
                              ? 'text-slate-600'
                              : 'text-slate-400'
                          }`}
                        >
                          3. Pharmacist Check
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            ['VERIFIED', 'DISPENSED', 'verified', 'dispensed'].includes(rx.status)
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`font-semibold block text-[11px] ${
                            ['VERIFIED', 'DISPENSED', 'verified', 'dispensed'].includes(rx.status)
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          4. Verified / Dispensed
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
