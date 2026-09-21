import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ShoppingBag } from 'lucide-react';
import SoundFX from '../../utils/SoundFX';

export default function PrescriptionLaserScanner({
  onScanComplete,
  onFileSelected,
  enableAutoExtract = true,
  className = '',
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [extractedTokens, setExtractedTokens] = useState([]);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (onFileSelected) onFileSelected(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (enableAutoExtract) runLaserScan();
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('pdf');
      if (enableAutoExtract) runLaserScan();
    }
  };

  const runLaserScan = () => {
    setIsScanning(true);
    SoundFX.playLaserScan();
    setExtractedTokens([]);

    setTimeout(() => {
      SoundFX.playLaserScan();
    }, 1100);

    setTimeout(() => {
      setIsScanning(false);
      SoundFX.playSuccess();
      const mockExtracted = [
        {
          name: 'Amoxicillin Trihydrate 500mg',
          type: 'Capsule',
          confidence: 99.2,
          schedule: 'SCHEDULE_H',
          dosage: '1 Cap 3x Daily (5 Days)',
        },
        {
          name: 'Paracetamol IP 650mg',
          type: 'Tablet',
          confidence: 98.7,
          schedule: 'OTC',
          dosage: 'SOS for Fever/Pain',
        },
        {
          name: 'Cetirizine Hydrochloride 10mg',
          type: 'Tablet',
          confidence: 96.4,
          schedule: 'OTC',
          dosage: '1 Tab at Bedtime',
        },
      ];
      setExtractedTokens(mockExtracted);
      if (onScanComplete) onScanComplete(mockExtracted);
    }, 2400);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`cyber-card p-6 relative overflow-hidden space-y-5 ${className}`}>
      {/* Laser Scanner Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative min-h-[220px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden ${
          dragActive
            ? 'border-cyber-emerald bg-cyber-emerald/10 scale-[1.01]'
            : file
            ? 'border-cyber-cyan/60 bg-slate-900/60'
            : 'border-slate-700/80 hover:border-cyber-emerald/60 hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={(e) => handleFile(e.target.files[0])}
          className="hidden"
        />

        {preview ? (
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center space-y-3">
            {preview === 'pdf' ? (
              <div className="w-20 h-20 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl font-black shadow-glow-crimson">
                PDF
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-cyber-emerald/40 shadow-glass-lg max-h-56">
                <img
                  src={preview}
                  alt="Scanned Prescription"
                  className="w-full h-full object-contain"
                />
                {/* Active Dynamic Laser Sweep Beam */}
                {isScanning && <div className="laser-beam" />}
              </div>
            )}
            <div className="text-center">
              <p className="text-xs font-bold text-white truncate max-w-xs">{file?.name}</p>
              <p className="text-[10px] text-cyber-emerald font-mono mt-0.5">
                {isScanning ? '⚡ AI Multimodal Laser Scanner Active...' : '✓ High Resolution Capture Ready'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-cyber-emerald/30 text-cyber-emerald flex items-center justify-center text-2xl mx-auto shadow-glow-emerald">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Drag & drop prescription document here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports Doctor Handwritten Notes, Clinic E-Rxs, JPG, PNG & PDF
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-cyber-cyan">
              <Sparkles className="w-3 h-3 text-cyber-cyan" />
              Dynamic Laser Vision Engine 2.0
            </span>
          </div>
        )}

        {/* Ambient background grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,245,160,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,160,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Manual Trigger Button */}
      {file && !isScanning && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              runLaserScan();
            }}
            className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-Run AI Laser Scanner</span>
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            Laser Beam Resolution: 1200 DPI
          </span>
        </div>
      )}

      {/* Extracted Tokens Real-Time Feed */}
      {extractedTokens.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-700/60 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-cyber-emerald uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              AI Extracted Medication Candidates ({extractedTokens.length})
            </span>
            <span className="text-[10px] text-cyber-cyan font-mono font-bold bg-cyber-cyan/10 px-2 py-0.5 rounded-md border border-cyber-cyan/30">
              Avg. Confidence: 98.1%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {extractedTokens.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyber-emerald/50 transition-all text-xs space-y-1.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-white leading-tight">{item.name}</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      item.schedule === 'OTC'
                        ? 'bg-emerald-950/80 text-cyber-emerald border border-cyber-emerald/40'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {item.schedule}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{item.dosage}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-cyber-cyan font-mono">
                    {item.confidence}% match
                  </span>
                  <button
                    type="button"
                    onClick={() => SoundFX.playDropChime()}
                    className="text-[10px] font-bold text-cyber-emerald hover:underline flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Match</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
