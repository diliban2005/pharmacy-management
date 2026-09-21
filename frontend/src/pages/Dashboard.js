import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ icon, label, value, sub, iconBg, to }) => (
  <Link
    to={to || '#'}
    className="card stat-card p-6 flex flex-col justify-between hover:shadow-md transition-all group border border-slate-200/90 rounded-2xl"
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2 whitespace-nowrap">
          {value}
        </div>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-2xs border ${iconBg}`}>
        {icon}
      </div>
    </div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <span className="text-slate-500 font-semibold">{sub}</span>
      <span className="text-teal-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        Manage <span>→</span>
      </span>
    </div>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pharmacy Operations Dashboard</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitor real-time dispensary sales, inventory alerts, and AI-assisted prescription verifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/prescriptions"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>📋</span>
            <span>Prescription Queue ({stats?.pendingPrescriptionsCount || 0})</span>
          </Link>
          <Link
            to="/billing"
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <span>🧾</span>
            <span>New Sale (POS)</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Spacious 3-Column Grid (2 clean rows of 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon="📋"
          label="Prescriptions Queue"
          value={stats?.pendingPrescriptionsCount || 0}
          sub="Awaiting verification"
          iconBg="bg-amber-50 text-amber-600 border-amber-200/80"
          to="/prescriptions"
        />
        <StatCard
          icon="✓"
          label="Verified / Dispensed"
          value={stats?.verifiedPrescriptionsCount || 0}
          sub="Completed prescriptions"
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-200/80"
          to="/prescriptions"
        />
        <StatCard
          icon="💰"
          label="Today's Revenue"
          value={`₹${(stats?.todayRevenue || 0).toFixed(2)}`}
          sub={`${stats?.todayTransactions || 0} POS transactions`}
          iconBg="bg-teal-50 text-teal-600 border-teal-200/80"
          to="/sales"
        />
        <StatCard
          icon="💊"
          label="Total Medicines"
          value={stats?.totalMedicines || 0}
          sub="Active catalog items"
          iconBg="bg-indigo-50 text-indigo-600 border-indigo-200/80"
          to="/medicines"
        />
        <StatCard
          icon="⚠️"
          label="Low Stock Alert"
          value={stats?.lowStockCount || 0}
          sub="Items requiring reorder"
          iconBg="bg-amber-50 text-amber-600 border-amber-200/80"
          to="/medicines?lowStock=true"
        />
        <StatCard
          icon="🗓️"
          label="Expiring Soon"
          value={stats?.expiringCount || 0}
          sub="Expiring within 30 days"
          iconBg="bg-rose-50 text-rose-600 border-rose-200/80"
          to="/medicines?expiring=true"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Quick Dispensary Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/billing', icon: '🧾', label: 'Point of Sale (Billing)', sub: 'Dispense medicines', color: 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200' },
            { to: '/prescriptions', icon: '📋', label: 'Prescriptions Review', sub: 'Inspect doctor notes', color: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200' },
            { to: '/medicines/new', icon: '💊', label: 'Add New Medicine', sub: 'Update catalog & stock', color: 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200' },
            { to: '/customers/new', icon: '👥', label: 'Register Customer', sub: 'Walk-in or online account', color: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200' },
          ].map(({ to, icon, label, sub, color }) => (
            <Link key={to} to={to} className={`${color} rounded-2xl p-4 flex flex-col items-center text-center transition-all group shadow-sm`}>
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{icon}</span>
              <span className="text-xs font-bold">{label}</span>
              <span className="text-[11px] opacity-75 mt-0.5">{sub}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2-Column: Recent Prescriptions & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions Needing Verification */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Prescriptions</h2>
              <p className="text-xs text-slate-400">Doctor prescriptions awaiting inspection</p>
            </div>
            <Link to="/prescriptions" className="text-teal-600 text-xs font-bold hover:underline">
              View All Queue →
            </Link>
          </div>

          {stats?.recentPrescriptions?.length > 0 ? (
            <div className="space-y-2.5">
              {stats.recentPrescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/20 transition-all text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-700">
                        #{rx._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-900 truncate">
                        {rx.customer?.name || 'Walk-in Patient'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Doctor: {rx.doctorName || 'General Practice'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`badge text-[10px] font-bold ${
                        rx.status === 'VERIFIED'
                          ? 'badge-success'
                          : rx.status === 'DISPENSED'
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}
                    >
                      {rx.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      to={`/prescriptions/${rx._id}/review`}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-sm"
                    >
                      Review →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <span className="text-3xl block">📋</span>
              <p className="text-xs font-semibold">Prescription queue is clear</p>
              <p className="text-[11px] text-slate-400">All uploaded prescriptions have been verified</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Completed point-of-sale invoices</p>
            </div>
            <Link to="/sales" className="text-teal-600 text-xs font-bold hover:underline">
              View History →
            </Link>
          </div>

          {stats?.recentSales?.length > 0 ? (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale) => (
                    <tr key={sale._id}>
                      <td>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                          {sale.invoiceId}
                        </span>
                      </td>
                      <td className="font-medium text-xs text-slate-800">
                        {sale.customer?.name || sale.customerName || 'Walk-in'}
                      </td>
                      <td className="font-bold text-teal-600 text-xs">
                        ₹{sale.totalAmount.toFixed(2)}
                      </td>
                      <td>
                        <span className="badge badge-info text-[10px]">{sale.paymentMethod}</span>
                      </td>
                      <td className="text-slate-400 text-xs">
                        {new Date(sale.date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <span className="text-3xl block">🧾</span>
              <p className="text-xs font-semibold">No sales recorded yet today</p>
              <Link to="/billing" className="text-teal-600 text-xs font-bold hover:underline">
                Create new sale →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
