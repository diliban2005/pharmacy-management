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
  Sparkles,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
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
import TiltCard from '../components/common/TiltCard';
import SoundFX from '../utils/SoundFX';

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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyber-emerald border-t-transparent" />
        <p className="text-xs font-mono font-bold text-slate-400">Loading Clinical Operations Suite...</p>
      </div>
    );
  }

  const chartData = {
    labels:
      chartTimeframe === 'day'
        ? ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM']
        : chartTimeframe === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Dispensary Turnover (₹)',
        data:
          chartTimeframe === 'day'
            ? [1200, 3400, 5600, 4800, 7200, 8900, 6400]
            : chartTimeframe === 'week'
            ? [4200, 6100, 5800, 8900, 7400, 11200, 9500]
            : [24000, 32000, 28000, 41000],
        borderColor: '#00F5A0',
        backgroundColor: 'rgba(0, 245, 160, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00D9F6',
        pointBorderColor: '#070A10',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#070A10',
        borderColor: 'rgba(0, 245, 160, 0.4)',
        borderWidth: 1,
        titleFont: { family: 'JetBrains Mono', size: 12, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'JetBrains Mono', size: 11 }, color: '#64748b' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          font: { family: 'JetBrains Mono', size: 11 },
          color: '#64748b',
          callback: (val) => `₹${val}`,
        },
      },
    },
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* Top Header & Sub-Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Operations Dashboard
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30 shadow-glow-emerald">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time dispensary turnover, AI laser extractions, and inventory thresholds.
          </p>
        </div>

        {/* Dynamic Sub-Tab Bar */}
        <div className="subtab-bar self-start md:self-auto shadow-glass">
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('analytics');
            }}
            className={`subtab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4 text-cyber-emerald" />
            <span>Real-time Analytics</span>
          </button>
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('feed');
            }}
            className={`subtab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4 text-cyber-cyan" />
            <span>Live Activity Feed</span>
          </button>
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('shortcuts');
            }}
            className={`subtab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Quick Shortcuts</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metric Cards with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1 */}
        <TiltCard maxTilt={8} className="cyber-card p-5 border-l-4 border-l-cyber-emerald">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Today's Turnover
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                ₹{stats?.todayRevenue?.toFixed(2) || '0.00'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30 flex items-center justify-center shadow-glow-emerald">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-cyber-emerald font-mono font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{stats?.todayTransactions || 0} bills closed</span>
            </span>
            <Link to="/sales" onClick={() => SoundFX.playClick()} className="text-slate-400 hover:text-cyber-emerald font-bold">
              History →
            </Link>
          </div>
        </TiltCard>

        {/* KPI 2 */}
        <TiltCard maxTilt={8} className="cyber-card p-5 border-l-4 border-l-amber-400">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Prescription Queue
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1.5 font-mono">
                {stats?.pendingPrescriptionsCount || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-950 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              {stats?.verifiedPrescriptionsCount || 0} verified & cleared
            </span>
            <Link to="/prescriptions" onClick={() => SoundFX.playClick()} className="text-amber-400 hover:underline font-bold">
              Review →
            </Link>
          </div>
        </TiltCard>

        {/* KPI 3 */}
        <TiltCard maxTilt={8} className="cyber-card p-5 border-l-4 border-l-cyber-cyan">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Active Formulations
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                {stats?.totalMedicines || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 flex items-center justify-center shadow-glow-cyan">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Node network online</span>
            <Link to="/medicines" onClick={() => SoundFX.playClick()} className="text-cyber-cyan hover:underline font-bold">
              Nodes →
            </Link>
          </div>
        </TiltCard>

        {/* KPI 4 */}
        <TiltCard maxTilt={8} className="cyber-card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Critical Warnings
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-400 mt-1.5 font-mono">
                {stats?.lowStockCount || 0}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-glow-crimson">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-rose-400 font-mono">
              {stats?.expiringCount || 0} batches expiring
            </span>
            <Link to="/medicines?lowStock=true" onClick={() => SoundFX.playClick()} className="text-rose-400 hover:underline font-bold">
              Restock →
            </Link>
          </div>
        </TiltCard>
      </div>

      {/* Tab 1: Real-Time Analytics View */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left Chart */}
          <div className="lg:col-span-8 cyber-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white">Dispensary Revenue Velocity</h3>
                <p className="text-xs text-slate-400">Live operational financial throughput</p>
              </div>

              {/* Timeframe pills */}
              <div className="flex items-center gap-1 bg-void-950 p-1 rounded-xl text-xs font-bold border border-slate-800">
                {['day', 'week', 'month'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      SoundFX.playClick();
                      setChartTimeframe(tf);
                    }}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      chartTimeframe === tf
                        ? 'bg-cyber-emerald text-void-950 font-black shadow-glow-emerald'
                        : 'text-slate-400 hover:text-white'
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

          {/* Right Live Activity Feed */}
          <div className="lg:col-span-4 cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Live Clinical Feed</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald animate-pulse shadow-glow-emerald" />
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
              {stats?.recentSales?.length > 0 ? (
                stats.recentSales.map((sale) => (
                  <div
                    key={sale._id}
                    className="p-3 rounded-xl bg-void-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white truncate max-w-[140px]">
                        {sale.customer?.name || 'Walk-in Patient'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sale.invoiceId}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-cyber-emerald font-mono">
                        ₹{sale.totalAmount.toFixed(2)}
                      </span>
                      <span className="block text-[9px] font-mono font-bold text-slate-500">
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6 font-mono">
                  No recent sales in this window.
                </p>
              )}
            </div>

            <Link
              to="/sales"
              onClick={() => SoundFX.playClick()}
              className="block w-full py-2.5 text-center text-xs font-bold text-cyber-emerald bg-cyber-emerald/10 hover:bg-cyber-emerald/20 rounded-xl border border-cyber-emerald/30 transition-all shadow-glow-emerald"
            >
              View Complete Ledger →
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Full Live Activity Feed View */}
      {activeTab === 'feed' && (
        <div className="cyber-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white">Operational Stream & Audit Log</h3>
              <p className="text-xs text-slate-400">
                Chronological real-time ledger of dispensary sales and verified prescriptions
              </p>
            </div>
            <span className="badge badge-info text-xs font-mono">Real-Time</span>
          </div>

          <div className="divide-y divide-slate-800">
            {stats?.recentSales?.map((sale) => (
              <div key={sale._id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyber-emerald/15 border border-cyber-emerald/30 text-cyber-emerald flex items-center justify-center font-bold text-sm shadow-glow-emerald">
                    🧾
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Sale Completed: <strong className="text-cyber-emerald font-mono">{sale.invoiceId}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Billed to {sale.customer?.name || 'Walk-in'} • {new Date(sale.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className="badge badge-success text-xs font-black font-mono">
                  ₹{sale.totalAmount.toFixed(2)} PAID
                </span>
              </div>
            ))}

            {stats?.recentPrescriptions?.map((rx) => (
              <div key={rx._id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                    📋
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Prescription Uploaded: <strong className="text-cyber-cyan font-mono">#{rx._id.slice(-6).toUpperCase()}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Doctor: {rx.doctorName || 'Pending Extraction'}
                    </p>
                  </div>
                </div>
                <span className="badge badge-warning text-xs font-mono capitalize">{rx.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Quick Shortcuts */}
      {activeTab === 'shortcuts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <Link
            to="/billing"
            onClick={() => SoundFX.playClick()}
            className="p-6 rounded-2xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan text-void-950 shadow-glow-emerald flex flex-col justify-between hover:scale-105 transition-transform"
          >
            <div>
              <ShoppingCart className="w-8 h-8 mb-3" />
              <h3 className="text-base font-black">Holo Counter POS</h3>
              <p className="text-xs text-void-950/80 mt-1 leading-relaxed font-medium">
                Physical drag-and-drop laser scanning, live bill builder, and instant printable receipts.
              </p>
            </div>
            <span className="text-xs font-black uppercase mt-4 tracking-wider">
              Launch Billing Station →
            </span>
          </Link>

          <Link
            to="/medicines"
            onClick={() => SoundFX.playClick()}
            className="cyber-card p-6 flex flex-col justify-between hover:border-cyber-cyan transition-all group hover:scale-102"
          >
            <div>
              <Pill className="w-8 h-8 text-cyber-cyan mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-black text-white">Visual Node Radar</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Interactive spatial force graph with floating drug nodes and live batch radar cards.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyber-cyan mt-4">Inspect Nodes →</span>
          </Link>

          <Link
            to="/prescriptions"
            onClick={() => SoundFX.playClick()}
            className="cyber-card p-6 flex flex-col justify-between hover:border-amber-400 transition-all group hover:scale-102"
          >
            <div>
              <FileText className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-black text-white">Multimodal OCR Queue</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Review dynamic laser extractions, confirm Schedule H safety, and dispense refills.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 mt-4">Inspect Queue →</span>
          </Link>

          <Link
            to="/ai-audit"
            onClick={() => SoundFX.playClick()}
            className="cyber-card p-6 flex flex-col justify-between hover:border-purple-400 transition-all group hover:scale-102"
          >
            <div>
              <ShieldCheck className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-black text-white">AI Fairness Audit</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Multimodal vision confidence telemetry, audited medications, and safety compliance.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400 mt-4">View AI Logs →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
