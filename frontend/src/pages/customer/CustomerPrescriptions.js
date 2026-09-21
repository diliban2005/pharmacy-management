import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';

const STATUS_CONFIG = {
  UPLOADED: { label: 'Uploaded', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📤' },
  AI_ANALYZING: { label: 'AI Processing', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '⚡' },
  UNDER_PHARMACIST_REVIEW: { label: 'Pharmacist Review', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '⏳' },
  NEEDS_CLARIFICATION: { label: 'Clarification Needed', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '💬' },
  VERIFIED: { label: 'Verified & Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '✓' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: '✕' },
  DISPENSED: { label: 'Dispensed & Completed', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: '💊' },
  pending: { label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '⏳' },
  verified: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '✓' },
  dispensed: { label: 'Dispensed', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: '💊' },
};

export default function CustomerPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);
  const [searchParams] = useSearchParams();

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
    if (!window.confirm('Are you sure you want to delete this uploaded prescription? This cannot be undone.')) return;
    try {
      await api.delete(`/customer/prescriptions/${rxId}`);
      setPrescriptions((prev) => prev.filter((p) => p._id !== rxId));
      if (selectedRx?._id === rxId) {
        setSelectedRx(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete prescription');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Prescriptions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your uploaded prescriptions, monitor pharmacist verification status, or manage your records.
          </p>
        </div>
        <Link to="/customer/upload" className="btn-primary shadow-sm">
          <span>➕</span>
          <span>Upload New Prescription</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 space-y-3">
          <span className="text-5xl block">📄</span>
          <p className="font-bold text-slate-700 text-base">No Prescriptions Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not uploaded any prescriptions yet. Upload your doctor's note to get your medicines verified and dispensed.
          </p>
          <Link to="/customer/upload" className="inline-block btn-primary px-5 py-2.5 rounded-xl text-xs font-bold mt-2">
            Upload Prescription Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Prescriptions */}
          <div className={`space-y-4 ${selectedRx ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            {prescriptions.map((rx) => {
              const statusCfg = STATUS_CONFIG[rx.status] || {
                label: rx.status,
                color: 'bg-slate-100 text-slate-800 border-slate-200',
                icon: '📋',
              };
              const isSelected = selectedRx?._id === rx._id;
              const cleanDoctorName = rx.doctorName
                ? rx.doctorName.replace(/^Dr\.?\s*/i, 'Dr. ')
                : 'Dr. Prescribing Physician';

              return (
                <div
                  key={rx._id}
                  className={`card p-5 sm:p-6 transition-all border ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-100 shadow-md bg-white'
                      : 'border-slate-200 hover:border-teal-300 hover:shadow-xs bg-white'
                  }`}
                >
                  {/* Top Bar: Rx Code + Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-100">
                        📄
                      </span>
                      <div>
                        <span className="font-mono font-bold text-sm text-slate-900 block">
                          RX-{rx._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Uploaded on{' '}
                          {new Date(rx.date || rx.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${statusCfg.color}`}
                    >
                      <span>{statusCfg.icon}</span>
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  {/* Middle: Doctor Info & Prescribed Medicines */}
                  <div className="py-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="text-sm">🩺</span>
                      <span className="text-slate-500">Prescribing Doctor:</span>
                      <strong className="text-slate-900 font-bold">{cleanDoctorName}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                        <span>💊</span>
                        <span>{rx.prescribedMedicines?.length || 0} Medicines</span>
                      </span>

                      {rx.prescribedMedicines?.slice(0, 3).map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="inline-block px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-100"
                        >
                          {m.medicineName || m.medicine?.name || 'Medicine'}
                        </span>
                      ))}

                      {rx.prescribedMedicines?.length > 3 && (
                        <span className="text-[11px] font-bold text-slate-400">
                          +{rx.prescribedMedicines.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Bar: View Details & Prominent Delete */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400">
                      {rx.pharmacistNotes ? '💬 Pharmacist note attached' : '✓ Stored in records'}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRx(isSelected ? null : rx)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                        }`}
                      >
                        <span>{isSelected ? '✕ Close Details' : '👁️ View Details'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrescription(rx._id);
                        }}
                        className="btn-danger-outline text-xs px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 shadow-2xs hover:bg-rose-100"
                        title="Delete this prescription from records"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Prescription Detail Drawer */}
          {selectedRx && (
            <div className="lg:col-span-2 card p-6 sm:p-8 space-y-6 animate-fade-in">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900">
                      Prescription #{selectedRx._id.slice(-8).toUpperCase()}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                        STATUS_CONFIG[selectedRx.status]?.color || 'bg-slate-100'
                      }`}
                    >
                      <span>{STATUS_CONFIG[selectedRx.status]?.icon}</span>
                      <span>{STATUS_CONFIG[selectedRx.status]?.label}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Doctor: <strong className="text-slate-800">{selectedRx.doctorName?.replace(/^Dr\.?\s*/i, 'Dr. ') || 'Not specified'}</strong> •{' '}
                    Uploaded on{' '}
                    {new Date(selectedRx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletePrescription(selectedRx._id)}
                    className="btn-danger-outline text-xs px-3 py-1.5 rounded-xl inline-flex items-center gap-1 shadow-2xs font-bold hover:bg-rose-100"
                    title="Delete this prescription"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setSelectedRx(null)}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Visual 5-Step Status Stepper */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Verification & Dispensing Progress
                  </span>
                  <span className="text-[11px] font-semibold text-teal-700">
                    Step {
                      selectedRx.status === 'UPLOADED' ? '1 of 5' :
                      selectedRx.status === 'AI_ANALYZING' ? '2 of 5' :
                      (selectedRx.status === 'UNDER_PHARMACIST_REVIEW' || selectedRx.status === 'pending' || selectedRx.status === 'NEEDS_CLARIFICATION') ? '3 of 5' :
                      (selectedRx.status === 'VERIFIED' || selectedRx.status === 'verified') ? '4 of 5' :
                      (selectedRx.status === 'DISPENSED' || selectedRx.status === 'dispensed') ? '5 of 5' : 'Status: ' + selectedRx.status
                    }
                  </span>
                </div>

                {/* Stepper Bar */}
                {(() => {
                  const steps = [
                    { key: 'UPLOADED', label: 'Uploaded', desc: 'Received', icon: '📤' },
                    { key: 'AI_ANALYZING', label: 'AI Scan', desc: 'Reading writing', icon: '⚡' },
                    { key: 'UNDER_PHARMACIST_REVIEW', label: 'Pharmacist Review', desc: 'Safety inspection', icon: '🩺' },
                    { key: 'VERIFIED', label: 'Verified', desc: 'Approved', icon: '✓' },
                    { key: 'DISPENSED', label: 'Dispensed', desc: 'Completed', icon: '💊' },
                  ];

                  const statusWeights = {
                    UPLOADED: 1,
                    AI_ANALYZING: 2,
                    UNDER_PHARMACIST_REVIEW: 3,
                    pending: 3,
                    NEEDS_CLARIFICATION: 3,
                    VERIFIED: 4,
                    verified: 4,
                    DISPENSED: 5,
                    dispensed: 5,
                    REJECTED: -1,
                  };

                  const currentWeight = statusWeights[selectedRx.status] || 1;
                  const isRejected = selectedRx.status === 'REJECTED';

                  if (isRejected) {
                    return (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2">
                        <span className="text-lg">✕</span>
                        <div>
                          <strong>Prescription Cannot Be Dispensed:</strong>
                          <p className="text-[11px] mt-0.5">{selectedRx.rejectionReason || 'Please contact our pharmacy or upload a clearer document.'}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-1 relative">
                        {steps.map((step, sIdx) => {
                          const stepWeight = sIdx + 1;
                          const isCompleted = currentWeight > stepWeight;
                          const isCurrent = currentWeight === stepWeight;

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center relative group">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-sm ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                                    : isCurrent
                                    ? 'bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse'
                                    : 'bg-white border border-slate-200 text-slate-400'
                                }`}
                              >
                                {isCompleted ? '✓' : step.icon}
                              </div>
                              <span
                                className={`text-[11px] sm:text-xs font-bold mt-1.5 leading-tight ${
                                  isCurrent ? 'text-teal-900' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                              <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Informational Guidance Alert */}
                      <div className="bg-teal-50/70 border border-teal-200/70 rounded-xl p-2.5 text-[11px] text-teal-900 flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>
                          {currentWeight === 1 && 'Your document is safely queued. Our AI assistant will extract handwritten text momentarily.'}
                          {currentWeight === 2 && 'Our AI multimodal vision is currently analyzing the doctor\'s handwriting and matching medicines.'}
                          {currentWeight === 3 && 'A licensed pharmacist is actively inspecting your prescription and confirming dosages for safe dispensing.'}
                          {currentWeight === 4 && 'Great news! Your prescription is verified and approved. You can pick up your medications or receive them soon.'}
                          {currentWeight === 5 && 'Your medication has been dispensed, packaged, and billed. Thank you for choosing PharmaCare!'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Clarification Alert if needed */}
              {selectedRx.status === 'NEEDS_CLARIFICATION' && selectedRx.clarificationMessage && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-orange-800 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>💬</span> Pharmacist Request for Clarification:
                  </p>
                  <p className="pl-5 text-slate-700">{selectedRx.clarificationMessage}</p>
                </div>
              )}

              {/* Rejection Alert if rejected */}
              {selectedRx.status === 'REJECTED' && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>✕</span> Prescription Rejected:
                  </p>
                  <p className="pl-5 text-slate-700">
                    {selectedRx.rejectionReason || 'Please contact the pharmacy for further details.'}
                  </p>
                </div>
              )}

              {/* Prescribed / Verified Medicines */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Medication List</h3>
                {selectedRx.prescribedMedicines?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRx.prescribedMedicines.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {m.medicineName || m.medicine?.name || 'Medication'}
                          </p>
                          <p className="text-slate-500 mt-0.5">
                            {m.dosage && `Dosage: ${m.dosage}`} {m.frequency && `• Frequency: ${m.frequency}`}{' '}
                            {m.duration && `• Duration: ${m.duration}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-700">Qty: {m.quantity || 1}</span>
                          {m.isVerified && (
                            <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                              ✓ Verified by Pharmacist
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-400">
                    Medicines are currently being analyzed and verified by the pharmacist.
                  </div>
                )}
              </div>

              {/* Document Image / PDF Viewer */}
              {selectedRx.prescriptionImage && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Uploaded Document</h3>
                  <div className="bg-slate-900 rounded-2xl p-3 text-center overflow-hidden max-h-96 flex items-center justify-center">
                    {selectedRx.fileType === 'application/pdf' ? (
                      <div className="py-8 text-white text-center space-y-2">
                        <span className="text-4xl block">📄</span>
                        <p className="text-xs font-semibold">PDF Document</p>
                        <a
                          href={`http://localhost:5000/${selectedRx.prescriptionImage}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs px-4 py-2 rounded-xl"
                        >
                          Open PDF in New Tab ↗
                        </a>
                      </div>
                    ) : (
                      <img
                        src={`http://localhost:5000/${selectedRx.prescriptionImage}`}
                        alt="Uploaded prescription"
                        className="max-h-80 rounded-xl object-contain mx-auto"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Pharmacist Notes */}
              {selectedRx.pharmacistNotes && (
                <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900">
                  <p className="font-bold mb-1">Pharmacist Advisory Note:</p>
                  <p className="text-slate-700">{selectedRx.pharmacistNotes}</p>
                </div>
              )}

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  Prescription Ref: #{selectedRx._id}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletePrescription(selectedRx._id)}
                    className="btn-danger-outline text-xs px-4 py-2 rounded-xl font-bold inline-flex items-center gap-1.5 shadow-2xs hover:bg-rose-100"
                  >
                    <span>🗑️</span>
                    <span>Delete This Prescription</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRx(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
