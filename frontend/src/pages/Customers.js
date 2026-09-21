import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: search ? { search } : {} });
      setCustomers(data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customers Directory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">{customers.length} registered customers</p>
        </div>
        <Link to="/customers/new" className="btn-primary">
          <span>➕</span>
          <span>Add Customer</span>
        </Link>
      </div>

      <div className="card p-4">
        <input
          placeholder="🔍 Search customer by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="card overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <p className="text-5xl block">👥</p>
            <p className="font-bold text-base text-slate-700">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Details</th>
                  <th>Delivery Address</th>
                  <th>Total Spent</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm shadow-xs">
                          {c.name ? c.name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            Member since {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-xs">{c.phone || '—'}</p>
                      <p className="text-slate-400 text-xs">{c.email || '—'}</p>
                    </td>
                    <td className="text-slate-600 text-xs max-w-xs truncate">
                      {c.address || '—'}
                    </td>
                    <td>
                      <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 text-xs">
                        ₹{(c.totalPurchases || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Link
                          to={`/billing?customerId=${c._id}&customerName=${encodeURIComponent(c.name)}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1"
                        >
                          <span>🧾</span> Sell
                        </Link>
                        <Link
                          to={`/customers/edit/${c._id}`}
                          className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors inline-flex items-center gap-1"
                        >
                          <span>✏️</span> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(c._id, c.name)}
                          className="btn-danger-outline text-xs px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1 shadow-2xs"
                          title="Permanently delete customer"
                        >
                          <span>🗑️</span> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
