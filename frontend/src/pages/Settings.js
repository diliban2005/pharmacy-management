import React, { useState } from 'react';

export default function Settings() {
  const [model, setModel] = useState('gemini-2.0-flash');
  const [highThreshold, setHighThreshold] = useState(90);
  const [medThreshold, setMedThreshold] = useState(70);
  const [pharmacyName, setPharmacyName] = useState('PharmaCare Smart Pharmacy');
  const [licenseNumber, setLicenseNumber] = useState('DL-2026-MED-9941');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900">System & AI Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure multimodal vision AI settings, confidence thresholds, and pharmacy licensing information.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Vision Model Configuration */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>⚡</span> AI Vision & OCR Engine Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Active AI Vision Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs font-semibold"
              >
                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Recommended - Multimodal Vision)</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Fast Multimodal OCR)</option>
                <option value="local-heuristic">Local Vision Heuristic Simulator (Offline Testing)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Multimodal model used to read doctor handwriting from images & PDFs
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">API Key Status</label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600">AI_API_KEY (.env)</span>
                <span className="badge badge-success text-[10px]">Loaded</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Configured securely in backend environment
              </span>
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                High Confidence Threshold (%)
              </label>
              <input
                type="number"
                value={highThreshold}
                onChange={(e) => setHighThreshold(e.target.value)}
                min={80}
                max={99}
                className="w-full text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Matches at or above this threshold receive the green High-Confidence badge (Current: ≥{highThreshold}%)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Medium Confidence Threshold (%)
              </label>
              <input
                type="number"
                value={medThreshold}
                onChange={(e) => setMedThreshold(e.target.value)}
                min={50}
                max={79}
                className="w-full text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Matches below this threshold receive the rose Low-Confidence warning (Current: &lt;{medThreshold}%)
              </span>
            </div>
          </div>
        </div>

        {/* Pharmacy Details */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🏪</span> Pharmacy & Licensing Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pharmacy Display Name</label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Drug License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary px-6 py-3 rounded-xl font-bold text-xs shadow-md"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
}
