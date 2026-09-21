import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_CONFIG = {
  UPLOADED: { label: 'Uploaded', color: 'bg-blue-100 text-blue-800', icon: '📤' },
  AI_ANALYZING: { label: 'AI Reading', color: 'bg-purple-100 text-purple-800', icon: '⚡' },
  UNDER_PHARMACIST_REVIEW: { label: 'Under Review', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
  NEEDS_CLARIFICATION: { label: 'Clarification', color: 'bg-orange-100 text-orange-800', icon: '💬' },
  VERIFIED: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800', icon: '✕' },
  DISPENSED: { label: 'Dispensed', color: 'bg-teal-100 text-teal-800', icon: '💊' },
  // Backward compatibility
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
  verified: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
  dispensed: { label: 'Dispensed', color: 'bg-teal-100 text-teal-800', icon: '💊' },
};

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const { data } = await api.get('/prescriptions', { params });
      setPrescriptions(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const t = setTimeout(fetchPrescriptions, 250);
    return () => clearTimeout(t);
  }, [fetchPrescriptions]);

  const handleDeletePrescription = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete this prescription record (${title || '#' + id.slice(-6)})? This will remove all verification records.`)) {
      return;
    }
    try {
      await api.delete(`/prescriptions/${id}`);
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete prescription');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prescription Verification Queue</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Inspect AI-extracted doctor handwriting, match medicines against inventory stock, verify safety, or delete unwanted records.
          </p>
        </div>

        <Link
          to="/prescriptions/new"
          className="btn-primary shadow-sm"
        >
          <span>➕</span>
          <span>Add Prescription</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: '', label: 'All Records' },
            { id: 'UNDER_PHARMACIST_REVIEW', label: '⏳ Review Queue' },
            { id: 'VERIFIED', label: '✓ Verified' },
            { id: 'DISPENSED', label: '💊 Dispensed' },
            { id: 'REJECTED', label: '✕ Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === tab.id
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="🔍 Search doctor, patient, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <span className="text-5xl block">📋</span>
            <p className="font-bold text-base text-slate-700">No prescriptions found</p>
            <p className="text-xs text-slate-400">Try adjusting your status filter or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Prescription ID & Patient</th>
                  <th>Prescribing Doctor</th>
                  <th>Detected Medicines</th>
                  <th>AI Confidence</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => {
                  const statusCfg = STATUS_CONFIG[p.status] || {
                    label: p.status,
                    color: 'bg-slate-100 text-slate-800',
                    icon: '📋',
                  };
                  const confidence = p.aiAnalysis?.overallConfidence;
                  const isVerified = p.status === 'VERIFIED' || p.status === 'verified';
                  const isDispensed = p.status === 'DISPENSED' || p.status === 'dispensed';

                  return (
                    <tr key={p._id} className="hover:bg-teal-50/20 transition-colors">
                      <td>
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            #{p._id.slice(-6).toUpperCase()}
                          </span>
                          <p className="font-bold text-sm text-slate-900 mt-1">{p.customer?.name || 'Walk-in Patient'}</p>
                          <p className="text-xs text-slate-400 font-mono">{p.customer?.phone || 'No phone recorded'}</p>
                        </div>
                      </td>
                      <td>
                        <p className="font-bold text-xs text-slate-800">
                          {p.doctorName || 'Dr. Unspecified'}
                        </p>
                        <p className="text-[11px] text-slate-400">{p.notes ? p.notes.slice(0, 30) + '...' : 'Prescription'}</p>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {p.prescribedMedicines?.slice(0, 3).map((m, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                            >
                              {m.medicineName || m.medicine?.name || 'Medicine'}
                            </span>
                          ))}
                          {p.prescribedMedicines?.length > 3 && (
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                              +{p.prescribedMedicines.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {confidence !== undefined && confidence !== null ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                              confidence >= 0.9
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : confidence >= 0.7
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            <span>{Math.round(confidence * 100)}%</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Pending AI</span>
                        )}
                      </td>
                      <td className="text-xs text-slate-600 font-medium whitespace-nowrap">
                        {new Date(p.date || p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${statusCfg.color}`}
                        >
                          <span>{statusCfg.icon}</span>
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/prescriptions/${p._id}/review`}
                            className="btn-primary text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-xs whitespace-nowrap"
                          >
                            Review ✍️
                          </Link>

                          {isVerified && !isDispensed && (
                            <Link
                              to={`/billing?prescriptionId=${p._id}&customerId=${p.customer?._id || ''}&customerName=${encodeURIComponent(p.customer?.name || '')}`}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs whitespace-nowrap"
                            >
                              Bill 🧾
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeletePrescription(p._id, p.customer?.name || p.doctorName)}
                            className="btn-danger-outline whitespace-nowrap"
                            title="Delete this prescription"
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
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
