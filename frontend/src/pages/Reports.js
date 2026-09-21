import React, { useEffect, useState, useCallback } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = ['#14b8a6','#f59e0b','#8b5cf6','#f43f5e','#3b82f6','#10b981','#ef4444','#6366f1','#ec4899','#0ea5e9'];

export default function Reports() {
  const [tab, setTab] = useState('overview');
  const [monthly, setMonthly] = useState(null);
  const [topMeds, setTopMeds] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [monthlyRes, topMedsRes, lowStockRes] = await Promise.all([
        api.get('/reports/monthly', { params: { month, year } }),
        api.get('/reports/top-medicines', { params: { limit: 10 } }),
        api.get('/reports/low-stock'),
      ]);
      setMonthly(monthlyRes.data.data);
      setTopMeds(topMedsRes.data.data);
      setLowStock(lowStockRes.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportLowStockCSV = () => {
    const headers = ['Medicine', 'Category', 'Stock', 'Threshold', 'Expiry'];
    const rows = lowStock.map(m => [m.name, m.category, m.quantity, m.lowStockThreshold, new Date(m.expiryDate).toLocaleDateString('en-IN')]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'low_stock_report.csv'; a.click();
  };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthlyChartData = {
    labels: monthly?.dailyBreakdown?.map(d => `Day ${d._id}`) || [],
    datasets: [{
      label: 'Revenue (₹)',
      data: monthly?.dailyBreakdown?.map(d => d.totalRevenue) || [],
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20,184,166,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#14b8a6',
      pointRadius: 4,
    }],
  };

  const topMedsChartData = {
    labels: topMeds.map(m => m._id.length > 18 ? m._id.substring(0, 18) + '…' : m._id),
    datasets: [{
      label: 'Units Sold',
      data: topMeds.map(m => m.totalQuantity),
      backgroundColor: CHART_COLORS,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const paymentDoughnutData = {
    labels: ['Cash', 'Card', 'UPI', 'Insurance'],
    datasets: [{ data: [60, 20, 15, 5], backgroundColor: ['#14b8a6','#8b5cf6','#f59e0b','#3b82f6'], borderWidth: 0 }],
  };

  const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } };

  const TABS = [{ id: 'overview', label: '📊 Overview' }, { id: 'medicines', label: '💊 Medicines' }, { id: 'stock', label: '⚠️ Low Stock' }];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="text-slate-500 text-sm">Business insights and performance metrics</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" /></div>
      ) : (
        <>
          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="space-y-5">
              {/* Month selector */}
              <div className="card p-4 flex flex-wrap gap-4 items-end">
                <div>
                  <label>Month</label>
                  <select value={month} onChange={e => setMonth(Number(e.target.value))}>
                    {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label>Year</label>
                  <select value={year} onChange={e => setYear(Number(e.target.value))}>
                    {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="bg-teal-50 rounded-xl px-5 py-3">
                  <p className="text-slate-400 text-xs">Monthly Revenue</p>
                  <p className="text-2xl font-black text-teal-600">₹{(monthly?.totalRevenue || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Monthly line chart */}
                <div className="card p-5 lg:col-span-2">
                  <h2 className="section-title mb-4">Daily Revenue — {monthNames[month - 1]} {year}</h2>
                  {monthly?.dailyBreakdown?.length > 0 ? (
                    <Line data={monthlyChartData} options={chartOptions} />
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-3xl mb-2">📈</p><p>No sales data for this period</p>
                    </div>
                  )}
                </div>

                {/* Payment method */}
                <div className="card p-5">
                  <h2 className="section-title mb-4">Payment Methods</h2>
                  <Doughnut data={paymentDoughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } }, cutout: '65%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Medicines Tab */}
          {tab === 'medicines' && (
            <div className="space-y-5">
              <div className="card p-5">
                <h2 className="section-title mb-4">Top Selling Medicines</h2>
                {topMeds.length > 0 ? (
                  <>
                    <Bar data={topMedsChartData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
                    <div className="mt-6">
                      <table>
                        <thead><tr><th>#</th><th>Medicine</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                        <tbody>
                          {topMeds.map((m, i) => (
                            <tr key={i}>
                              <td><span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: CHART_COLORS[i] }}>{i + 1}</span></td>
                              <td className="font-semibold">{m._id}</td>
                              <td><span className="font-bold text-slate-700">{m.totalQuantity}</span> units</td>
                              <td className="font-bold text-teal-600">₹{m.totalRevenue.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400"><p className="text-3xl mb-2">💊</p><p>No sales data available</p></div>
                )}
              </div>
            </div>
          )}

          {/* Low Stock Tab */}
          {tab === 'stock' && (
            <div className="space-y-5">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="section-title">Low Stock Alert</h2>
                    <p className="text-slate-400 text-sm mt-1">{lowStock.length} medicines need restocking</p>
                  </div>
                  <button onClick={exportLowStockCSV} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">📥 Export CSV</button>
                </div>
                {lowStock.length === 0 ? (
                  <div className="text-center py-12 text-slate-400"><p className="text-3xl mb-2">✅</p><p>All medicines are well-stocked!</p></div>
                ) : (
                  <table>
                    <thead><tr><th>Medicine</th><th>Category</th><th>Current Stock</th><th>Threshold</th><th>Expiry</th><th>Status</th></tr></thead>
                    <tbody>
                      {lowStock.map(m => {
                        const isExpired = new Date() > new Date(m.expiryDate);
                        const isExpiringSoon = !isExpired && new Date(m.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        return (
                          <tr key={m._id} className={isExpired ? 'expired-row' : 'low-stock-row'}>
                            <td><p className="font-semibold text-slate-800">{m.name}</p><p className="text-xs text-slate-400">{m.manufacturer}</p></td>
                            <td><span className="badge badge-info">{m.category}</span></td>
                            <td><span className="font-bold text-red-600 text-lg">{m.quantity}</span></td>
                            <td className="text-slate-500">{m.lowStockThreshold}</td>
                            <td className={`text-sm font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-600'}`}>
                              {new Date(m.expiryDate).toLocaleDateString('en-IN')}
                            </td>
                            <td>
                              {isExpired ? <span className="badge badge-danger">Expired</span> :
                               isExpiringSoon ? <span className="badge badge-warning">Expiring Soon</span> :
                               <span className="badge badge-warning">Low Stock</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
