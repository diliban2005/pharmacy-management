import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  ExternalLink,
  Trash2,
  Sparkles,
  User,
  ShieldCheck,
  ShoppingCart,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import SoundFX from '../utils/SoundFX';

const STATUS_CONFIG = {
  UPLOADED: { label: 'Uploaded', color: 'bg-blue-950/80 text-blue-400 border-blue-500/40', icon: '📤' },
  AI_ANALYZING: { label: 'AI Reading', color: 'bg-purple-950/80 text-purple-400 border-purple-500/40', icon: '⚡' },
  UNDER_PHARMACIST_REVIEW: { label: 'Review Queue', color: 'bg-amber-950/80 text-amber-400 border-amber-500/40', icon: '⏳' },
  NEEDS_CLARIFICATION: { label: 'Clarification', color: 'bg-orange-950/80 text-orange-400 border-orange-500/40', icon: '💬' },
  VERIFIED: { label: 'Verified', color: 'bg-emerald-950/80 text-cyber-emerald border-cyber-emerald/40', icon: '✓' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-950/80 text-rose-400 border-rose-500/40', icon: '✕' },
  DISPENSED: { label: 'Dispensed', color: 'bg-teal-950/80 text-teal-300 border-teal-500/40', icon: '💊' },
  pending: { label: 'Pending', color: 'bg-amber-950/80 text-amber-400 border-amber-500/40', icon: '⏳' },
  verified: { label: 'Verified', color: 'bg-emerald-950/80 text-cyber-emerald border-cyber-emerald/40', icon: '✓' },
  dispensed: { label: 'Dispensed', color: 'bg-teal-950/80 text-teal-300 border-teal-500/40', icon: '💊' },
};

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'review', 'verified', 'dispensed'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleDeletePrescription = async (id, title) => {
    if (!window.confirm(`Permanently remove prescription record #${id.slice(-6).toUpperCase()}?`)) return;
    SoundFX.playClick();
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete prescription');
    }
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      if (activeTab === 'review') {
        if (!['UNDER_PHARMACIST_REVIEW', 'UPLOADED', 'AI_ANALYZING', 'pending'].includes(p.status)) return false;
      } else if (activeTab === 'verified') {
        if (!['VERIFIED', 'verified'].includes(p.status)) return false;
      } else if (activeTab === 'dispensed') {
        if (!['DISPENSED', 'dispensed'].includes(p.status)) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchDoctor = p.doctorName?.toLowerCase().includes(q);
        const matchPatient = p.customer?.name?.toLowerCase().includes(q);
        const matchNotes = p.notes?.toLowerCase().includes(q);
        const matchId = p._id.toLowerCase().includes(q);
        if (!matchDoctor && !matchPatient && !matchNotes && !matchId) return false;
      }

      return true;
    });
  }, [prescriptions, activeTab, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Prescription Pipeline & Multimodal OCR Verification
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan">
              Laser OCR Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multimodal doctor handwriting transcription, inventory formulation matching, and licensed pharmacist clearance.
          </p>
        </div>

        <Link
          to="/prescriptions/new"
          onClick={() => SoundFX.playClick()}
          className="btn-primary text-xs shadow-glow-emerald flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Prescription</span>
        </Link>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="subtab-bar flex-wrap">
        <button
          onClick={() => {
            SoundFX.playClick();
            setActiveTab('all');
          }}
          className={`subtab-btn ${activeTab === 'all' ? 'active' : ''}`}
        >
          <FileText className="w-4 h-4 text-cyber-emerald" />
          <span>Active Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => {
            SoundFX.playClick();
            setActiveTab('review');
          }}
          className={`subtab-btn ${activeTab === 'review' ? 'active' : ''}`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>
            Review Queue (
            {
              prescriptions.filter((p) =>
                ['UNDER_PHARMACIST_REVIEW', 'UPLOADED', 'AI_ANALYZING', 'pending'].includes(p.status)
              ).length
            }
            )
          </span>
        </button>

        <button
          onClick={() => {
            SoundFX.playClick();
            setActiveTab('verified')}
          }
          className={`subtab-btn ${activeTab === 'verified' ? 'active' : ''}`}
        >
          <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
          <span>
            Verified & Approved (
            {prescriptions.filter((p) => ['VERIFIED', 'verified'].includes(p.status)).length})
          </span>
        </button>

        <button
          onClick={() => {
            SoundFX.playClick();
            setActiveTab('dispensed');
          }}
          className={`subtab-btn ${activeTab === 'dispensed' ? 'active' : ''}`}
        >
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          <span>
            Dispensed Invoices (
            {prescriptions.filter((p) => ['DISPENSED', 'dispensed'].includes(p.status)).length})
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="cyber-card p-4 sm:p-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search by doctor name, patient name, or prescription ref ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs sm:text-sm py-2 rounded-xl"
          />
        </div>
      </div>

      {/* Prescription Table */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyber-emerald border-t-transparent" />
            <p className="text-xs font-mono font-bold text-slate-400">Querying clinical pipeline...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-base font-bold text-white">No Prescriptions Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No clinical records matched your active filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Prescription ID & Patient</th>
                  <th>Prescribing Doctor</th>
                  <th>Formulations</th>
                  <th>OCR Confidence</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((p) => {
                  const statusCfg = STATUS_CONFIG[p.status] || {
                    label: p.status,
                    color: 'bg-slate-900 text-slate-400 border-slate-700',
                    icon: '📋',
                  };
                  const confidence = p.aiAnalysis?.overallConfidence;
                  const isVerified = p.status === 'VERIFIED' || p.status === 'verified';

                  return (
                    <tr key={p._id} className="transition-colors">
                      <td>
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-cyber-emerald bg-cyber-emerald/10 px-2 py-0.5 rounded border border-cyber-emerald/30">
                            #{p._id.slice(-6).toUpperCase()}
                          </span>
                          <p className="font-bold text-sm text-white">{p.customer?.name || 'Walk-in Patient'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {p.customer?.phone || 'No mobile linked'}
                          </p>
                        </div>
                      </td>

                      <td>
                        <p className="font-bold text-xs text-slate-200">
                          {p.doctorName || 'Pending Doctor Extraction'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.notes || 'General OPD'}</p>
                      </td>

                      <td>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white">
                            {p.prescribedMedicines?.length || 0} formulation
                            {p.prescribedMedicines?.length === 1 ? '' : 's'}
                          </span>
                          {p.prescribedMedicines?.[0] && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs font-mono">
                              {p.prescribedMedicines[0].medicineName}
                              {p.prescribedMedicines.length > 1 && ` (+${p.prescribedMedicines.length - 1} more)`}
                            </p>
                          )}
                        </div>
                      </td>

                      <td>
                        {confidence ? (
                          <span className="badge badge-success text-[10px] font-black font-mono shadow-glow-emerald">
                            {(confidence * 100).toFixed(0)}% High OCR
                          </span>
                        ) : (
                          <span className="badge badge-info text-[10px] font-bold font-mono">
                            Multimodal Check
                          </span>
                        )}
                      </td>

                      <td className="text-xs text-slate-400 font-mono">
                        {new Date(p.date || p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td>
                        <span className={`badge ${statusCfg.color} text-[10px] font-bold border`}>
                          <span>{statusCfg.icon}</span>
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/prescriptions/${p._id}/review`}
                            onClick={() => SoundFX.playClick()}
                            className="btn-primary text-xs py-1.5 px-3 rounded-xl font-bold"
                          >
                            <span>Review & Verify</span>
                          </Link>
                          {isVerified && (
                            <Link
                              to={`/billing?prescriptionId=${p._id}`}
                              onClick={() => SoundFX.playClick()}
                              className="p-1.5 text-slate-400 hover:text-cyber-emerald hover:bg-slate-800 rounded-lg transition-colors"
                              title="Dispense in POS"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDeletePrescription(p._id, p.doctorName)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
