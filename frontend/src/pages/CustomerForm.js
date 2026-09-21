import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const initialForm = { name: '', phone: '', email: '', address: '', dateOfBirth: '', gender: '' };

export default function CustomerForm() {
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
      api.get(`/customers/${id}`).then(r => {
        const c = r.data.data;
        setForm({ ...c, dateOfBirth: c.dateOfBirth?.split('T')[0] || '' });
      }).catch(() => setError('Failed to load customer')).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isEdit) await api.put(`/customers/${id}`, form);
      else await api.post('/customers', form);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" /></div>;

  return (
    <div className="animate-fade-in max-w-2xl">
      <button onClick={() => navigate('/customers')} className="text-teal-600 text-sm hover:underline mb-4 flex items-center gap-1">← Back to Customers</button>
      <h1 className="page-title mb-6">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
      <div className="card p-6">
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><label>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required /></div>
            <div><label>Phone Number *</label><input name="phone" value={form.phone} onChange={handleChange} required /></div>
            <div><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} /></div>
            <div><label>Date of Birth</label><input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} /></div>
            <div>
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select...</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label>Address</label><textarea name="address" value={form.address} onChange={handleChange} rows={3} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {loading ? 'Saving...' : (isEdit ? '✓ Update Customer' : '+ Add Customer')}
            </button>
            <button type="button" onClick={() => navigate('/customers')} className="px-6 py-2.5 rounded-lg font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
