import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'];

const initialForm = { name: '', manufacturer: '', category: 'Tablet', batchNumber: '', expiryDate: '', purchasePrice: '', sellingPrice: '', quantity: '', lowStockThreshold: 10, description: '' };

export default function MedicineForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      api.get(`/medicines/${id}`).then(r => {
        const m = r.data.data;
        setForm({ ...m, expiryDate: m.expiryDate?.split('T')[0] || '' });
      }).catch(() => setError('Failed to load medicine')).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isEdit) await api.put(`/medicines/${id}`, form);
      else await api.post('/medicines', form);
      navigate('/medicines');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" /></div>;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <button onClick={() => navigate('/medicines')} className="text-teal-600 text-sm hover:underline mb-2 flex items-center gap-1">← Back to Medicines</button>
        <h1 className="page-title">{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h1>
      </div>

      <div className="card p-6">
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label>Medicine Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Paracetamol 500mg" required />
            </div>
            <div>
              <label>Manufacturer *</label>
              <input name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. GSK" required />
            </div>
            <div>
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Batch Number *</label>
              <input name="batchNumber" value={form.batchNumber} onChange={handleChange} placeholder="e.g. B001" required />
            </div>
            <div>
              <label>Expiry Date *</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />
            </div>
            <div>
              <label>Purchase Price (₹) *</label>
              <input type="number" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} min="0" step="0.01" required />
            </div>
            <div>
              <label>Selling Price (₹) *</label>
              <input type="number" name="sellingPrice" value={form.sellingPrice} onChange={handleChange} min="0" step="0.01" required />
            </div>
            <div>
              <label>Quantity in Stock *</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0" required />
            </div>
            <div>
              <label>Low Stock Threshold</label>
              <input type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} min="0" />
            </div>
            <div className="sm:col-span-2">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Optional notes..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {loading ? 'Saving...' : (isEdit ? '✓ Update Medicine' : '+ Add Medicine')}
            </button>
            <button type="button" onClick={() => navigate('/medicines')} className="px-6 py-2.5 rounded-lg font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
