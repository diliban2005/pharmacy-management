import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import TiltCard from '../../components/common/TiltCard';
import SoundFX from '../../utils/SoundFX';
import { useCustomerCart } from '../../context/CustomerCartContext';

const STATUS_CONFIG = {
  UPLOADED: { label: 'Uploaded / Queued', color: 'bg-blue-950/80 text-blue-400 border-blue-500/40', icon: '📤' },
  AI_ANALYZING: { label: 'AI Reading Document', color: 'bg-purple-950/80 text-purple-400 border-purple-500/40', icon: '⚡' },
  UNDER_PHARMACIST_REVIEW: { label: 'Pharmacist Safety Check', color: 'bg-amber-950/80 text-amber-400 border-amber-500/40', icon: '⏳' },
  NEEDS_CLARIFICATION: { label: 'Clarification Needed', color: 'bg-orange-950/80 text-orange-400 border-orange-500/40', icon: '💬' },
  VERIFIED: { label: 'Verified & Approved', color: 'bg-emerald-950/80 text-cyber-emerald border-cyber-emerald/40', icon: '✓' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-950/80 text-rose-400 border-rose-500/40', icon: '✕' },
  DISPENSED: { label: 'Dispensed & Completed', color: 'bg-teal-950/80 text-teal-300 border-teal-500/40', icon: '💊' },
  pending: { label: 'Under Review', color: 'bg-amber-950/80 text-amber-400 border-amber-500/40', icon: '⏳' },
  verified: { label: 'Verified', color: 'bg-emerald-950/80 text-cyber-emerald border-cyber-emerald/40', icon: '✓' },
  dispensed: { label: 'Dispensed', color: 'bg-teal-950/80 text-teal-300 border-teal-500/40', icon: '💊' },
};

export default function CustomerPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);
  const [searchParams] = useSearchParams();
  const { addToCart, openCart } = useCustomerCart();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data } = await api.get('/customer/prescriptions');
        setPrescriptions(data.data || []);

        const targetId = searchParams.get('id');
        if (targetId) {
          const found = data.data?.find((p) => p._id === targetId);
          if (found) setSelectedRx(found);
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [searchParams]);

  const handleDeletePrescription = async (rxId) => {
    if (!window.confirm('Delete this prescription document from dispensary records?')) return;
    SoundFX.playClick();
    try {
      await api.delete(`/customer/prescriptions/${rxId}`);
      setPrescriptions((prev) => prev.filter((p) => p._id !== rxId));
      if (selectedRx?._id === rxId) setSelectedRx(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete prescription');
    }
  };

  const handleTransferToCart = (item) => {
    SoundFX.playDropChime();
    addToCart(
      {
        _id: item.medicine || `rx-item-${Math.random()}`,
        name: item.medicineName,
        sellingPrice: 45.0, // standard baseline
        quantity: 100,
        requiresPrescription: true,
      },
      item.quantity || 1
    );
    openCart();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prescription Status Pipeline</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Prescriptions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track real-time AI document reading, licensed pharmacist verification, and unlocked dispensing orders.
          </p>
        </div>
        <Link
          to="/customer/upload"
          onClick={() => SoundFX.playClick()}
          className="btn-primary shadow-glow-emerald flex items-center gap-2 text-xs"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Prescription</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyber-emerald border-t-transparent" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="cyber-card p-12 text-center text-slate-400 space-y-3">
          <span className="text-5xl block">📄</span>
          <p className="font-bold text-white text-base">No Prescriptions Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not uploaded any prescriptions yet. Upload your doctor's note to get started with instant digital verification.
          </p>
          <Link
            to="/customer/upload"
            onClick={() => SoundFX.playClick()}
            className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold mt-2 inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Prescription Now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Prescriptions */}
          <div className={`space-y-4 ${selectedRx ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            {prescriptions.map((rx) => {
              const statusCfg = STATUS_CONFIG[rx.status] || {
                label: rx.status,
                color: 'bg-slate-900 text-slate-400 border-slate-700',
                icon: '📋',
              };
              const isSelected = selectedRx?._id === rx._id;
              const cleanDoctorName = rx.doctorName
                ? rx.doctorName.replace(/^Dr\.?\s*/i, 'Dr. ')
                : 'Dr. Prescribing Physician';

              return (
                <TiltCard
                  key={rx._id}
                  maxTilt={6}
                  className={`cyber-card p-5 sm:p-6 transition-all border ${
                    isSelected
                      ? 'border-cyber-emerald ring-2 ring-cyber-emerald/20 shadow-glow-emerald bg-void-900'
                      : 'border-slate-800 hover:border-cyber-emerald/40 bg-void-950/90'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-cyber-emerald/15 border border-cyber-emerald/30 text-cyber-emerald flex items-center justify-center font-bold text-sm shadow-glow-emerald">
                        📄
                      </span>
                      <div>
                        <span className="font-mono font-bold text-sm text-white block">
                          RX-{rx._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(rx.date || rx.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.color}`}
                    >
                      <span>{statusCfg.icon}</span>
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  {/* Middle Info */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-sm">🩺</span>
                      <span className="text-slate-400">Doctor:</span>
                      <strong className="text-white font-bold">{cleanDoctorName}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                        <span>💊</span>
                        <span>{rx.prescribedMedicines?.length || 0} Meds</span>
                      </span>

                      {rx.prescribedMedicines?.slice(0, 2).map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="inline-block px-2 py-0.5 rounded-lg bg-cyber-emerald/10 text-cyber-emerald text-[11px] font-mono border border-cyber-emerald/30"
                        >
                          {m.medicineName || m.medicine?.name || 'Medicine'}
                        </span>
                      ))}

                      {rx.prescribedMedicines?.length > 2 && (
                        <span className="text-[11px] font-mono text-slate-400">
                          +{rx.prescribedMedicines.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {rx.pharmacistNotes ? '💬 Pharmacist note attached' : '✓ Securely encrypted'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          SoundFX.playClick();
                          setSelectedRx(isSelected ? null : rx);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyber-emerald text-void-950 shadow-glow-emerald font-black'
                            : 'btn-secondary'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Close' : 'Inspect'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrescription(rx._id);
                        }}
                        className="btn-danger-outline text-xs px-2.5 py-1.5 rounded-xl"
                        title="Delete from records"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>

          {/* Selected Prescription Detail Inspection Panel */}
          {selectedRx && (
            <div className="lg:col-span-2 cyber-card p-6 sm:p-8 space-y-6 animate-fade-in border border-cyber-emerald/40 bg-void-900/95 shadow-glass-lg">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white">
                      Prescription #{selectedRx._id.slice(-8).toUpperCase()}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                        STATUS_CONFIG[selectedRx.status]?.color || 'bg-slate-800'
                      }`}
                    >
                      <span>{STATUS_CONFIG[selectedRx.status]?.icon}</span>
                      <span>{STATUS_CONFIG[selectedRx.status]?.label}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Doctor: <strong className="text-white">{selectedRx.doctorName || 'Prescribing Physician'}</strong> •{' '}
                    Uploaded {new Date(selectedRx.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    SoundFX.playClick();
                    setSelectedRx(null);
                  }}
                  className="text-slate-400 hover:text-white text-lg leading-none p-1.5 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* 5-Step Stepper */}
              <div className="bg-void-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-cyber-emerald uppercase tracking-wider">
                    Dispensary Verification Stepper
                  </span>
                  <span className="text-[11px] font-mono text-cyber-cyan font-bold">
                    Active State: {STATUS_CONFIG[selectedRx.status]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 relative text-center">
                  {[
                    { key: 'UPLOADED', label: '1. Uploaded', icon: '📤' },
                    { key: 'AI_ANALYZING', label: '2. AI Vision', icon: '⚡' },
                    { key: 'UNDER_PHARMACIST_REVIEW', label: '3. Inspection', icon: '🩺' },
                    { key: 'VERIFIED', label: '4. Verified', icon: '✓' },
                    { key: 'DISPENSED', label: '5. Dispensed', icon: '💊' },
                  ].map((step, sIdx) => {
                    const statusWeights = {
                      UPLOADED: 1,
                      AI_ANALYZING: 2,
                      UNDER_PHARMACIST_REVIEW: 3,
                      pending: 3,
                      VERIFIED: 4,
                      verified: 4,
                      DISPENSED: 5,
                      dispensed: 5,
                    };
                    const curWeight = statusWeights[selectedRx.status] || 1;
                    const isDone = curWeight > sIdx + 1;
                    const isCur = curWeight === sIdx + 1;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-cyber-emerald text-void-950 shadow-glow-emerald'
                              : isCur
                              ? 'bg-cyber-cyan text-void-950 ring-4 ring-cyber-cyan/30 animate-pulse'
                              : 'bg-slate-900 border border-slate-700 text-slate-500'
                          }`}
                        >
                          {isDone ? '✓' : step.icon}
                        </div>
                        <span
                          className={`text-[10px] font-bold mt-1.5 leading-tight ${
                            isCur ? 'text-cyber-cyan' : isDone ? 'text-cyber-emerald' : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Medication List */}
              <div>
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                  <span>Prescribed Formulations</span>
                  <span className="text-[10px] font-mono font-bold text-cyber-cyan bg-cyber-cyan/15 px-2 py-0.5 rounded-full border border-cyber-cyan/30">
                    {selectedRx.prescribedMedicines?.length || 0} Extracted
                  </span>
                </h3>

                {selectedRx.prescribedMedicines?.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedRx.prescribedMedicines.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-void-950/80 rounded-xl p-3.5 border border-slate-800 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white text-sm">
                            {m.medicineName || m.medicine?.name || 'Medication'}
                          </p>
                          <p className="text-slate-400 mt-0.5 font-mono text-[11px]">
                            {m.dosage && `Dosage: ${m.dosage}`} {m.frequency && `• ${m.frequency}`}{' '}
                            {m.duration && `• ${m.duration}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-cyber-emerald font-bold">
                            Qty: {m.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTransferToCart(m)}
                            className="btn-primary text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-glow-emerald"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-void-950/60 rounded-xl p-4 text-center text-xs text-slate-400 font-mono">
                    Multimodal AI reading active. Formulations will populate as verified.
                  </div>
                )}
              </div>

              {/* Document Image Viewer */}
              {selectedRx.prescriptionImage && (
                <div>
                  <h3 className="text-sm font-black text-white mb-3">Scanned Document Document Preview</h3>
                  <div className="bg-void-950 rounded-2xl p-4 text-center border border-slate-800 max-h-80 overflow-hidden flex items-center justify-center">
                    <img
                      src={`http://localhost:5000/${selectedRx.prescriptionImage}`}
                      alt="Uploaded prescription"
                      className="max-h-72 rounded-xl object-contain mx-auto shadow-glass-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
