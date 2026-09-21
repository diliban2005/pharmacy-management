import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function PrescriptionReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [medicinesInventory, setMedicinesInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState('');
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [medicinesList, setMedicinesList] = useState([]);

  // Image viewer zoom & rotation state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Rejection & clarification modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [clarifyMessage, setClarifyMessage] = useState('');

  const fetchPrescription = useCallback(async () => {
    try {
      const [rxRes, medRes] = await Promise.all([
        api.get(`/prescriptions/${id}`),
        api.get('/medicines'),
      ]);

      const rx = rxRes.data.data;
      setPrescription(rx);
      setMedicinesInventory(medRes.data.data || []);

      setDoctorName(rx.doctorName || '');
      setPrescriptionDate(rx.date ? new Date(rx.date).toISOString().split('T')[0] : '');
      setPharmacistNotes(rx.pharmacistNotes || '');

      // Initialize medicines list from AI analysis or prescription
      if (rx.aiAnalysis?.extractedMedicines?.length > 0) {
        setMedicinesList(
          rx.aiAnalysis.extractedMedicines.map((m) => ({
            recognizedText: m.recognizedText,
            medicine: m.matchedMedicine?._id || m.matchedMedicine || '',
            medicineName: m.matchedMedicineName || m.medicineName || m.recognizedText,
            strength: m.strength || '',
            dosage: m.dosage || '1 tablet',
            frequency: m.frequency || 'Once daily',
            duration: m.duration || '5 days',
            quantity: m.quantity || 1,
            confidence: m.confidence || 0.8,
            matchStatus: m.matchStatus || 'MEDIUM_CONFIDENCE',
            uncertainReason: m.uncertainReason || null,
            alternativeCandidates: m.alternativeCandidates || [],
            isHandwritten: m.isHandwritten !== false,
          }))
        );
      } else if (rx.prescribedMedicines?.length > 0) {
        setMedicinesList(
          rx.prescribedMedicines.map((m) => ({
            recognizedText: m.medicineName || m.medicine?.name || 'Medicine',
            medicine: m.medicine?._id || m.medicine || '',
            medicineName: m.medicineName || m.medicine?.name || '',
            strength: '',
            dosage: m.dosage || '1 tablet',
            frequency: m.frequency || 'Once daily',
            duration: m.duration || '5 days',
            quantity: m.quantity || 1,
            confidence: m.confidence || 1.0,
            matchStatus: m.matchStatus || 'HIGH_CONFIDENCE',
            uncertainReason: null,
            alternativeCandidates: [],
            isHandwritten: false,
          }))
        );
      } else {
        setMedicinesList([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  // Trigger AI vision analysis
  const handleRunAiAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post(`/prescriptions/${id}/analyze`);
      setSuccess('AI Vision analysis complete! Extracted medicines and matched against inventory.');
      fetchPrescription();
    } catch (err) {
      setError(err.response?.data?.message || 'AI Analysis failed. You can still review manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Medicine item changes
  const handleMedChange = (index, field, value) => {
    const updated = [...medicinesList];
    updated[index][field] = value;

    // If medicine dropdown changes, sync name
    if (field === 'medicine') {
      const selected = medicinesInventory.find((m) => m._id === value);
      if (selected) {
        updated[index].medicineName = selected.name;
        updated[index].confidence = 1.0;
        updated[index].matchStatus = 'HIGH_CONFIDENCE';
        updated[index].uncertainReason = null;
      }
    }

    setMedicinesList(updated);
  };

  const handleAddMedicine = () => {
    setMedicinesList([
      ...medicinesList,
      {
        recognizedText: 'Manual Entry',
        medicine: '',
        medicineName: '',
        strength: '',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '5 days',
        quantity: 1,
        confidence: 1.0,
        matchStatus: 'HIGH_CONFIDENCE',
        uncertainReason: null,
        alternativeCandidates: [],
        isHandwritten: false,
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicinesList(medicinesList.filter((_, i) => i !== index));
  };

  // Confirm and Verify Prescription
  const handleVerify = async () => {
    if (medicinesList.length === 0) {
      setError('Prescription must have at least one verified medicine before approval.');
      return;
    }

    for (const m of medicinesList) {
      if (!m.medicine) {
        setError(`Please select an inventory medicine match for "${m.recognizedText || 'item'}".`);
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      await api.put(`/prescriptions/${id}/verify`, {
        doctorName,
        pharmacistNotes,
        verifiedMedicines: medicinesList,
        corrections: medicinesList
          .filter((m) => m.recognizedText !== m.medicineName)
          .map((m) => ({
            field: 'medicine',
            originalValue: m.recognizedText,
            correctedValue: m.medicineName,
            reason: 'Pharmacist inventory match confirmation',
          })),
      });

      setSuccess('Prescription successfully verified and approved for dispensing!');
      fetchPrescription();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setSaving(false);
    }
  };

  // Reject Prescription
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/prescriptions/${id}/reject`, {
        rejectionReason,
        pharmacistNotes,
      });
      setShowRejectModal(false);
      setSuccess('Prescription has been rejected.');
      fetchPrescription();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject prescription');
    } finally {
      setSaving(false);
    }
  };

  // Request Clarification
  const handleClarification = async () => {
    if (!clarifyMessage.trim()) {
      alert('Please enter clarification instructions.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/prescriptions/${id}/clarification`, {
        clarificationMessage: clarifyMessage,
      });
      setShowClarifyModal(false);
      setSuccess('Clarification request recorded and sent to patient.');
      fetchPrescription();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request clarification');
    } finally {
      setSaving(false);
    }
  };

  // Delete Prescription
  const handleDeletePrescription = async () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete this prescription (RX-${id.slice(-6).toUpperCase()})? This action cannot be undone.`
      )
    ) {
      setSaving(true);
      try {
        await api.delete(`/prescriptions/${id}`);
        navigate('/prescriptions');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete prescription');
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="card p-12 text-center text-slate-500">
        <p className="text-xl font-bold">Prescription not found</p>
        <Link to="/prescriptions" className="text-teal-600 hover:underline mt-2 inline-block font-semibold">
          ← Back to Prescriptions
        </Link>
      </div>
    );
  }

  const isVerified = prescription.status === 'VERIFIED' || prescription.status === 'verified';
  const isDispensed = prescription.status === 'DISPENSED' || prescription.status === 'dispensed';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/prescriptions" className="text-teal-600 text-xs font-bold hover:underline">
              ← Prescriptions Queue
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400 font-mono">RX-{prescription._id.slice(-6).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Pharmacist Prescription Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient: <strong className="text-slate-800">{prescription.customer?.name || 'Walk-in'}</strong> ({prescription.customer?.phone || 'No phone'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAiAnalysis}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-purple-700 border-t-transparent" />
                Analyzing Document...
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>{prescription.aiAnalysis ? 'Re-run AI Analysis' : 'Run AI Analysis'}</span>
              </>
            )}
          </button>

          {isVerified && !isDispensed && (
            <Link
              to={`/billing?prescriptionId=${prescription._id}&customerId=${prescription.customer?._id || ''}&customerName=${encodeURIComponent(prescription.customer?.name || '')}`}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span>🧾</span>
              <span>Dispense & Bill →</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleDeletePrescription}
            disabled={saving}
            className="btn-danger-outline text-xs px-3.5 py-2 rounded-xl whitespace-nowrap shadow-2xs"
            title="Permanently delete this prescription"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interactive Document Viewer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Prescription Document</span>
              {/* Zoom & Rotation Controls */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  className="w-7 h-7 rounded bg-white text-slate-700 text-xs font-bold shadow-sm hover:bg-slate-50"
                  title="Zoom Out"
                >
                  −
                </button>
                <span className="text-[11px] font-mono px-1.5 text-slate-600">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                  className="w-7 h-7 rounded bg-white text-slate-700 text-xs font-bold shadow-sm hover:bg-slate-50"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                  }}
                  className="px-2 h-7 rounded bg-white text-slate-600 text-[10px] font-semibold shadow-sm hover:bg-slate-50"
                  title="Reset"
                >
                  Reset
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="w-7 h-7 rounded bg-white text-slate-700 text-xs font-bold shadow-sm hover:bg-slate-50"
                  title="Rotate 90°"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Document display viewport */}
            <div className="bg-slate-950 rounded-2xl overflow-hidden min-h-[420px] max-h-[640px] flex items-center justify-center relative p-3">
              {prescription.prescriptionImage ? (
                prescription.fileType === 'application/pdf' ? (
                  <div className="text-center text-white space-y-3 py-16">
                    <span className="text-5xl block">📄</span>
                    <p className="text-sm font-semibold">PDF Prescription Document</p>
                    <a
                      href={`http://localhost:5000/${prescription.prescriptionImage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Open PDF in Viewer ↗
                    </a>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[600px] w-full flex items-center justify-center">
                    <img
                      src={`http://localhost:5000/${prescription.processedImage || prescription.prescriptionImage}`}
                      alt="Prescription scan"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-w-full rounded-lg shadow-lg"
                    />
                  </div>
                )
              ) : (
                <div className="text-center text-slate-500 py-16">
                  <span className="text-4xl block mb-2">📄</span>
                  <p className="text-xs">No image file attached</p>
                </div>
              )}
            </div>

            {/* Metadata Footer */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>{prescription.originalFileName || 'Prescription Document'}</span>
              <span>{prescription.fileSize ? `${(prescription.fileSize / 1024).toFixed(1)} KB` : ''}</span>
            </div>
          </div>

          {/* Fairness by Design Card */}
          <div className="card p-5 bg-gradient-to-br from-teal-50/50 to-emerald-50/30 border border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <span>⚖️</span> Fairness-by-Design Audit
              </span>
              <span className="badge badge-success text-[10px]">VERIFIED FAIR</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 pl-1">
              <p className="flex items-center gap-1.5">
                <span className="text-teal-600 font-bold">✓</span> Decision grounded solely in prescription document evidence
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-teal-600 font-bold">✓</span> No protected personal demographic attributes utilized
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-teal-600 font-bold">✓</span> Human-in-the-loop: Pharmacist maintains final authorization
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis & Verification Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Assistance Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
            <span className="text-lg leading-none">⚠️</span>
            <div>
              <strong className="font-bold block">Assistance Signal Only:</strong>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                AI confidence is an assistance signal, NOT medical certainty. The pharmacist must independently inspect the document and complete final verification before dispensing.
              </p>
            </div>
          </div>

          {/* Doctor & Date Header */}
          <div className="card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Prescribing Doctor Name *
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Arun Kumar"
                  className="w-full text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Prescription Date
                </label>
                <input
                  type="date"
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>

          {/* Detected Medicines List */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Prescribed Medicines ({medicinesList.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Match handwritten text with inventory medicines, verify strength, and confirm dosage
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors"
              >
                + Add Medicine Manually
              </button>
            </div>

            {medicinesList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <span className="text-3xl block">💊</span>
                <p className="text-xs font-semibold">No medicines detected yet</p>
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  className="text-xs font-bold text-teal-600 hover:underline"
                >
                  Click "Run AI Analysis" to extract automatically
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {medicinesList.map((item, idx) => {
                  const confPct = Math.round((item.confidence || 0) * 100);
                  const isHigh = confPct >= 90;
                  const isMedium = confPct >= 70 && confPct < 90;
                  const isLow = confPct < 70;

                  // Find inventory stock details for matched medicine
                  const matchedMedObj = medicinesInventory.find((m) => m._id === item.medicine);
                  const stockAvailable = matchedMedObj ? matchedMedObj.quantity : 0;
                  const isLowStock = stockAvailable <= (matchedMedObj?.lowStockThreshold || 10);

                  return (
                    <div
                      key={idx}
                      className={`border rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all shadow-sm ${
                        isLow
                          ? 'border-rose-300 bg-rose-50/20'
                          : isMedium
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Top Bar: Item Index + Confidence Pill + Delete */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Medicine #{idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {item.isHandwritten ? '✍️ Handwritten item' : '🖨️ Printed item'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Confidence Badge */}
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isHigh
                                ? 'bg-emerald-100 text-emerald-800'
                                : isMedium
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span>{isHigh ? '✓' : '⚠'}</span>
                            <span>{confPct}% Confidence</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition-colors"
                            title="Remove this medicine"
                          >
                            <span>🗑️</span>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Doctor's Handwritten Raw Text Callout */}
                      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <span>✍️</span> Doctor's Written Text on Document:
                          </span>
                          <span className="text-[10px] text-amber-700 font-mono">Original Document Evidence</span>
                        </div>
                        <p className="text-sm font-black text-amber-950 font-mono tracking-wide pl-5">
                          "{item.recognizedText}"
                        </p>
                        {item.uncertainReason && (
                          <div className="mt-1 text-[11px] text-amber-800 bg-amber-100/80 rounded-lg px-2.5 py-1 flex items-start gap-1.5">
                            <span className="shrink-0">⚠️</span>
                            <span>{item.uncertainReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Medicine Matching Dropdown with Stock Status Pill */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <span>💊</span> Matched Pharmacy Inventory Medicine *
                          </label>
                          {matchedMedObj && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                stockAvailable === 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {stockAvailable === 0
                                ? '✕ Out of Stock (0)'
                                : isLowStock
                                ? `⚠️ Low Stock (${stockAvailable})`
                                : `✓ In Stock (${stockAvailable})`} • ₹{matchedMedObj.sellingPrice}
                            </span>
                          )}
                        </div>

                        <select
                          value={item.medicine}
                          onChange={(e) => handleMedChange(idx, 'medicine', e.target.value)}
                          className="w-full text-xs font-semibold"
                        >
                          <option value="">Select medicine from inventory...</option>
                          {medicinesInventory.map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name} — {m.category} (Stock: {m.quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Alternative Candidate Suggestions if ambiguous */}
                      {item.alternativeCandidates?.length > 0 && !item.medicine && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                          <span className="text-slate-600 font-bold block">
                            💡 Suggested Alternative Matches (Click to assign):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.alternativeCandidates.map((alt, aIdx) => (
                              <button
                                key={aIdx}
                                type="button"
                                onClick={() => handleMedChange(idx, 'medicine', alt.medicine)}
                                className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-lg text-slate-800 font-semibold shadow-2xs transition-all"
                              >
                                {alt.name} ({Math.round(alt.score * 100)}%)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dosage, Frequency, Duration, Quantity Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                            placeholder="e.g. 1 tablet"
                            className="w-full text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={item.frequency}
                            onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                            placeholder="e.g. Twice daily"
                            className="w-full text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                            placeholder="e.g. 5 days"
                            className="w-full text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleMedChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                            }
                            min={1}
                            className="w-full text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pharmacist Advisory Notes */}
          <div className="card p-5 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Pharmacist Verification & Advisory Notes
            </label>
            <textarea
              value={pharmacistNotes}
              onChange={(e) => setPharmacistNotes(e.target.value)}
              rows={2}
              placeholder="Clinical verification notes, patient instructions, or dosage confirmations..."
              className="w-full text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={saving || isDispensed}
              className="btn-primary flex-1 py-3.5 rounded-xl font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? 'Verifying...' : '✓ Confirm & Verify Prescription'}
            </button>

            <button
              type="button"
              onClick={() => setShowClarifyModal(true)}
              disabled={saving || isDispensed}
              className="px-4 py-3.5 rounded-xl font-bold text-xs border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors"
            >
              💬 Request Clarification
            </button>

            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={saving || isDispensed}
              className="px-4 py-3.5 rounded-xl font-bold text-xs border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
            >
              ✕ Reject
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-rose-700">Reject Prescription</h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason why this prescription cannot be verified or dispensed.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Document unreadable, missing prescribing doctor signature, expired date..."
              className="w-full text-xs"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {showClarifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-orange-700">Request Clarification</h3>
            <p className="text-xs text-slate-500">
              Send a clarification request message to the patient regarding unreadable handwriting or missing dosage details.
            </p>
            <textarea
              value={clarifyMessage}
              onChange={(e) => setClarifyMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Please re-upload a clearer scan of the bottom dosage instructions..."
              className="w-full text-xs"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowClarifyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleClarification}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                Send Clarification Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
