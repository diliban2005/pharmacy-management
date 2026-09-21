import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get('/sales', { params });
      setSales(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0);

  const exportCSV = () => {
    const headers = ['Invoice ID', 'Customer', 'Items', 'Subtotal', 'Discount%', 'Tax%', 'Total', 'Payment', 'Date'];
    const rows = sales.map(s => [
      s.invoiceId,
      s.customer?.name || s.customerName || 'Walk-in',
      s.items.map(i => `${i.medicineName}(x${i.quantity})`).join('; '),
      s.subtotal.toFixed(2),
      s.discount,
      s.tax,
      s.totalAmount.toFixed(2),
      s.paymentMethod,
      new Date(s.date).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sales_${startDate || 'all'}_to_${endDate || 'now'}.csv`;
    a.click();
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Sales History</h1>
          <p className="text-slate-500 text-sm">{sales.length} transactions · Total: <span className="font-bold text-teal-600">₹{totalRevenue.toFixed(2)}</span></p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">📥 Export CSV</button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-36">
          <label>From Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="flex-1 min-w-36">
          <label>To Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg">Clear</button>
      </div>

      {/* Summary cards */}
      {!loading && sales.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Sales', value: `₹${totalRevenue.toFixed(2)}`, icon: '💰' },
            { label: 'Transactions', value: sales.length, icon: '🧾' },
            { label: 'Avg Sale', value: `₹${(totalRevenue / sales.length).toFixed(2)}`, icon: '📊' },
            { label: 'Cash Sales', value: sales.filter(s => s.paymentMethod === 'Cash').length, icon: '💵' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card p-4">
              <p className="text-slate-400 text-xs mb-1">{icon} {label}</p>
              <p className="font-black text-slate-800 text-lg">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" /></div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><p className="text-4xl mb-3">🧾</p><p>No sales found for selected period</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Invoice</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date & Time</th><th>Details</th></tr></thead>
              <tbody>
                {sales.map(sale => (
                  <React.Fragment key={sale._id}>
                    <tr>
                      <td><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{sale.invoiceId}</span></td>
                      <td className="font-medium">{sale.customer?.name || sale.customerName || 'Walk-in'}</td>
                      <td><span className="text-slate-500 text-sm">{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</span></td>
                      <td className="font-bold text-teal-600">₹{sale.totalAmount.toFixed(2)}</td>
                      <td><span className="badge badge-info">{sale.paymentMethod}</span></td>
                      <td className="text-slate-500 text-sm">
                        <p>{new Date(sale.date).toLocaleDateString('en-IN')}</p>
                        <p className="text-xs text-slate-400">{new Date(sale.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td>
                        <button onClick={() => setExpanded(expanded === sale._id ? null : sale._id)} className="text-teal-600 text-sm hover:underline">
                          {expanded === sale._id ? 'Hide ▲' : 'View ▼'}
                        </button>
                      </td>
                    </tr>
                    {expanded === sale._id && (
                      <tr>
                        <td colSpan={7} className="bg-slate-50 p-0">
                          <div className="px-6 py-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Purchased Items</p>
                            <div className="space-y-1">
                              {sale.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                                  <span className="font-medium text-slate-700">{item.medicineName}</span>
                                  <span className="text-slate-400">x{item.quantity} @ ₹{item.unitPrice}</span>
                                  <span className="font-semibold text-slate-700">₹{item.totalPrice.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end gap-6 mt-3 text-sm">
                              {sale.discount > 0 && <span className="text-green-600">Discount: {sale.discount}%</span>}
                              {sale.tax > 0 && <span className="text-slate-500">Tax: {sale.tax}%</span>}
                              <span className="font-black text-teal-600">Total: ₹{sale.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
