import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'];

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const { isAdmin, user } = useAuth();
  const canManage = isAdmin || user?.role === 'pharmacist' || user?.role === 'admin';

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (searchParams.get('lowStock') === 'true') params.lowStock = 'true';
      if (searchParams.get('expiring') === 'true') params.expiring = 'true';
      const { data } = await api.get('/medicines', { params });
      setMedicines(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [search, category, searchParams]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the inventory? This cannot be undone.`)) return;
    try {
      await api.delete(`/medicines/${id}`);
      setMedicines(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete medicine');
    }
  };

  const exportCSV = () => {
    const headers = ['Name','Manufacturer','Category','Batch','Expiry','Purchase Price','Selling Price','Quantity'];
    const rows = medicines.map(m => [m.name,m.manufacturer,m.category,m.batchNumber,new Date(m.expiryDate).toLocaleDateString(),m.purchasePrice,m.sellingPrice,m.quantity]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medicines.csv'; a.click();
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="page-title">Drug Inventory</h1><p className="text-slate-500 text-sm">{medicines.length} medicines</p></div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">📥 Export CSV</button>
          <Link to="/medicines/new" className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold">+ Add Medicine</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-48" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="min-w-36">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" /></div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><p className="text-4xl mb-3">💊</p><p>No medicines found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Medicine</th><th>Category</th><th>Batch</th><th>Expiry</th><th>Stock</th><th>Buy Price</th><th>Sell Price</th><th>Status</th>{canManage && <th className="text-right">Actions</th>}</tr>
              </thead>
              <tbody>
                {medicines.map(m => {
                  const isExpired = new Date() > new Date(m.expiryDate);
                  const isExpiringSoon = !isExpired && new Date(m.expiryDate) <= new Date(Date.now() + 30*24*60*60*1000);
                  return (
                    <tr key={m._id} className={isExpired ? 'expired-row' : m.isLowStock ? 'low-stock-row' : ''}>
                      <td><p className="font-semibold text-slate-800">{m.name}</p><p className="text-xs text-slate-400">{m.manufacturer}</p></td>
                      <td><span className="badge badge-info">{m.category}</span></td>
                      <td className="font-mono text-xs">{m.batchNumber}</td>
                      <td className={`text-sm ${isExpired ? 'text-red-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-bold' : ''}`}>{new Date(m.expiryDate).toLocaleDateString('en-IN')}</td>
                      <td><span className={`font-bold ${m.quantity <= m.lowStockThreshold ? 'text-red-600' : 'text-slate-700'}`}>{m.quantity}</span></td>
                      <td>₹{m.purchasePrice}</td>
                      <td className="font-semibold">₹{m.sellingPrice}</td>
                      <td>
                        {isExpired ? <span className="badge badge-danger">Expired</span> :
                         isExpiringSoon ? <span className="badge badge-warning">Exp Soon</span> :
                         m.isLowStock ? <span className="badge badge-warning">Low Stock</span> :
                         <span className="badge badge-success">In Stock</span>}
                      </td>
                      {canManage && (
                        <td className="text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <Link
                              to={`/medicines/edit/${m._id}`}
                              className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors inline-flex items-center gap-1"
                            >
                              <span>✏️</span> Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(m._id, m.name)}
                              className="btn-danger-outline text-xs px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                              title="Permanently delete medicine"
                            >
                              <span>🗑️</span> Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
