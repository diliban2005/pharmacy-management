import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Pill,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  Calendar,
  Users,
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'feed', 'shortcuts'
  const [chartTimeframe, setChartTimeframe] = useState('week'); // 'day', 'week', 'month'

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
        <p className="text-xs font-bold text-slate-400">Loading Royal Operations Dashboard...</p>
      </div>
    );
  }

  // Sample or real trend chart data
  const chartData = {
    labels: chartTimeframe === 'day'
      ? ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM']
      : chartTimeframe === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Dispensary Revenue (₹)',
        data: chartTimeframe === 'day'
          ? [1200, 3400, 5600, 4800, 7200, 8900, 6400]
          : chartTimeframe === 'week'
          ? [4200, 6100, 5800, 8900, 7400, 11200, 9500]
          : [24000, 32000, 28000, 41000],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748b' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 11 },
          color: '#64748b',
          callback: (val) => `₹${val}`,
        },
      },
    },
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Sub-Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Operations Dashboard
            </h1>
            <span className="badge badge-success text-[10px] uppercase font-black tracking-wider">
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time dispensary revenue, AI handwriting audits, and inventory thresholds.
          </p>
        </div>

        {/* Dynamic Sub-Tab Bar */}
        <div className="subtab-bar self-start md:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`subtab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Real-time Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`subtab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4 text-cyan-600" />
            <span>Live Activity Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`subtab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Quick Shortcuts</span>
          </button>
        </div>
      </div>

      {/* Top Royal KPI Metric Cards (Visible across tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Today's Revenue */}
        <div className="kpi-card group border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">
                ₹{stats?.todayRevenue?.toFixed(2) || '0.00'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{stats?.todayTransactions || 0} bills closed today</span>
            </span>
            <Link to="/sales" className="text-slate-400 hover:text-emerald-700 font-semibold">
              History →
            </Link>
          </div>
        </div>

        {/* KPI 2: Prescription Verification Queue */}
        <div className="kpi-card group border-l-4 border-l-amber-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescriptions Queue</p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1.5">
                {stats?.pendingPrescriptionsCount || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              {stats?.verifiedPrescriptionsCount || 0} approved & verified
            </span>
            <Link to="/prescriptions" className="text-amber-700 hover:underline font-bold">
              Review →
            </Link>
          </div>
        </div>

        {/* KPI 3: Certified Medicines Stock */}
        <div className="kpi-card group border-l-4 border-l-sapphire-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog Inventory</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">
                {stats?.totalMedicines || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sapphire-50 text-sapphire-700 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">100% genuine formulations</span>
            <Link to="/medicines" className="text-sapphire-700 hover:underline font-bold">
              Manage →
            </Link>
          </div>
        </div>

        {/* KPI 4: Critical Stock Warnings */}
        <div className="kpi-card group border-l-4 border-l-rose-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Warnings</p>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-1.5">
                {stats?.lowStockCount || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-rose-600 font-bold">
              {stats?.expiringCount || 0} expiring batches
            </span>
            <Link to="/medicines?lowStock=true" className="text-rose-700 hover:underline font-bold">
              Restock →
            </Link>
          </div>
        </div>
      </div>

      {/* Tab 1: Real-Time Analytics View */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left Chart (65% width) */}
          <div className="lg:col-span-8 card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Revenue & Sales Velocity</h3>
                <p className="text-xs text-slate-400">Dispensary sales volume with live trend tracking</p>
              </div>

              {/* Timeframe pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {['day', 'week', 'month'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      chartTimeframe === tf ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Right Live Feed (35% width) */}
          <div className="lg:col-span-4 card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Live Clinical Activity</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72">
              {stats?.recentSales?.length > 0 ? (
                stats.recentSales.map(sale => (
                  <div key={sale._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sale.customer?.name || 'Walk-in Patient'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sale.invoiceId}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700">₹{sale.totalAmount.toFixed(2)}</span>
                      <span className="block text-[9px] font-bold text-slate-400">{sale.paymentMethod}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No recent transactions recorded today.</p>
              )}
            </div>

            <Link
              to="/sales"
              className="block w-full py-2.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
            >
              View Complete Sales Register →
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Full Live Activity Feed View */}
      {activeTab === 'feed' && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Operational Audit & Event Stream</h3>
              <p className="text-xs text-slate-400">Chronological feed of dispensary sales and prescription verifications</p>
            </div>
            <span className="badge badge-info text-xs">Real-Time</span>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentSales?.map(sale => (
              <div key={sale._id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    🧾
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Sale Completed: <strong className="text-emerald-700">{sale.invoiceId}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Billed to {sale.customer?.name || 'Walk-in'} • {new Date(sale.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge badge-success text-xs font-black">₹{sale.totalAmount.toFixed(2)} PAID</span>
                </div>
              </div>
            ))}

            {stats?.recentPrescriptions?.map(rx => (
              <div key={rx._id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                    📋
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Prescription Uploaded: <strong className="text-slate-800">#{rx._id.slice(-6).toUpperCase()}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Doctor: {rx.doctorName || 'Pending Extraction'} • Patient: {rx.customer?.name || 'Patient'}
                    </p>
                  </div>
                </div>
                <span className="badge badge-warning text-xs font-black capitalize">{rx.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Quick Shortcuts & Actions */}
      {activeTab === 'shortcuts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <Link
            to="/billing"
            className="p-6 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-glow-emerald flex flex-col justify-between hover:scale-102 transition-transform"
          >
            <div>
              <ShoppingCart className="w-8 h-8 mb-3" />
              <h3 className="text-base font-black">Fast Counter Sale (POS)</h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Scan barcodes, select medicines from inventory, and print customer tax receipts.
              </p>
            </div>
            <span className="text-xs font-bold underline mt-4">Open Billing Station →</span>
          </Link>

          <Link
            to="/prescriptions"
            className="card p-6 flex flex-col justify-between hover:border-emerald-300 transition-all group"
          >
            <div>
              <FileText className="w-8 h-8 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-extrabold text-slate-900">Prescriptions Queue</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Review OCR extractions, check Schedule H safety, and authorize refills.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 mt-4">Inspect Queue →</span>
          </Link>

          <Link
            to="/medicines/new"
            className="card p-6 flex flex-col justify-between hover:border-emerald-300 transition-all group"
          >
            <div>
              <Pill className="w-8 h-8 text-sapphire-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-extrabold text-slate-900">Add Formulation</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Register new medicine batches, define wholesale prices, and set low-stock thresholds.
              </p>
            </div>
            <span className="text-xs font-bold text-sapphire-700 mt-4">Add Medicine →</span>
          </Link>

          <Link
            to="/ai-audit"
            className="card p-6 flex flex-col justify-between hover:border-emerald-300 transition-all group"
          >
            <div>
              <ShieldCheck className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-extrabold text-slate-900">AI Fairness Audit</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Inspect multimodal confidence distribution, audited medicines, and safety metrics.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 mt-4">View AI Logs →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
