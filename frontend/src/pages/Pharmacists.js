import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Pharmacists() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPharmacist, setEditingPharmacist] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', isActive: true });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPharmacists = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pharmacists');
      setPharmacists(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pharmacists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const openCreateModal = () => {
    setEditingPharmacist(null);
    setForm({ name: '', email: '', phone: '', password: '', isActive: true });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (ph) => {
    setEditingPharmacist(ph);
    setForm({ name: ph.name, email: ph.email, phone: ph.phone || '', password: '', isActive: ph.isActive });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingPharmacist) {
        const payload = { name: form.name, phone: form.phone, isActive: form.isActive };
        if (form.password) payload.password = form.password;
        await api.put(`/pharmacists/${editingPharmacist._id}`, payload);
        setSuccess('Pharmacist updated successfully');
      } else {
        await api.post('/pharmacists', form);
        setSuccess('Pharmacist account created successfully');
      }
      setShowModal(false);
      fetchPharmacists();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove pharmacist ${name}?`)) return;
    try {
      await api.delete(`/pharmacists/${id}`);
      setSuccess(`Pharmacist ${name} deleted.`);
      fetchPharmacists();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete pharmacist');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Pharmacists</h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin oversight: manage licensed pharmacist accounts, permissions, and active statuses.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Add Pharmacist</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : pharmacists.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <span className="text-4xl block">💊</span>
            <p className="font-semibold text-sm text-slate-600">No pharmacists found</p>
            <button
              onClick={openCreateModal}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold mt-2 inline-block"
            >
              Add First Pharmacist
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Pharmacist Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pharmacists.map((ph) => (
                  <tr key={ph._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                          {ph.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-bold text-xs text-slate-900">{ph.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-600">{ph.email}</td>
                    <td className="text-xs text-slate-600 font-mono">{ph.phone || '—'}</td>
                    <td>
                      <span
                        className={`badge text-[10px] ${
                          ph.isActive ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {ph.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(ph.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => openEditModal(ph)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ph._id, ph.name)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingPharmacist ? 'Edit Pharmacist' : 'Add New Pharmacist'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3 py-2 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Sarah Connor (R.Ph)"
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  disabled={!!editingPharmacist}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="pharmacist@pharmacy.com"
                  className={`w-full text-xs ${editingPharmacist ? 'bg-slate-50 text-slate-400' : ''}`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {editingPharmacist ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingPharmacist}
                  placeholder="Min 6 characters"
                  className="w-full text-xs"
                />
              </div>

              {editingPharmacist && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-slate-700 select-none">
                    Active Account Status
                  </label>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  {editingPharmacist ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
