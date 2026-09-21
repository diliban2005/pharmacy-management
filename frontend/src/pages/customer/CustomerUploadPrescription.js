import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, ArrowRight, Sparkles } from 'lucide-react';
import api from '../../services/api';
import PrescriptionLaserScanner from '../../components/common/PrescriptionLaserScanner';
import SoundFX from '../../utils/SoundFX';

export default function CustomerUploadPrescription() {
  const [file, setFile] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const navigate = useNavigate();

  const handleFileSelected = (selectedFile) => {
    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a prescription document to upload.');
      return;
    }

    setUploading(true);
    setError('');
    SoundFX.playClick();

    try {
      const formData = new FormData();
      formData.append('prescriptionImage', file);
      if (doctorName) formData.append('doctorName', doctorName);
      if (notes) formData.append('notes', notes);

      const { data } = await api.post('/customer/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      SoundFX.playSuccess();
      setSuccessResult(data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Prescription upload failed. Please verify your file format and network connectivity.'
      );
    } finally {
      setUploading(false);
    }
  };

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto py-8 animate-fade-in">
        <div className="cyber-card p-8 text-center space-y-5 border-t-4 border-t-cyber-emerald shadow-glass-lg">
          <div className="w-16 h-16 bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40 rounded-full flex items-center justify-center text-3xl mx-auto shadow-glow-emerald">
            ✓
          </div>
          <h2 className="text-2xl font-black text-white">Prescription Uploaded to Dispensary!</h2>
          <p className="text-sm text-slate-300">
            Your document has entered our active clinical queue. The AI laser vision engine is extracting handwritten notations, and our licensed pharmacist will inspect and verify your medications.
          </p>

          <div className="bg-void-950/80 rounded-2xl p-4 text-left border border-slate-700/80 text-xs space-y-2 font-mono">
            <p>
              <span className="text-slate-400">Prescription Ref:</span>{' '}
              <strong className="text-cyber-emerald">#{successResult._id?.slice(-8)?.toUpperCase()}</strong>
            </p>
            <p>
              <span className="text-slate-400">Status:</span>{' '}
              <span className="badge badge-warning text-[10px]">UNDER PHARMACIST CHECK</span>
            </p>
            <p>
              <span className="text-slate-400">Archived File:</span>{' '}
              <span className="text-white">{successResult.originalFileName || file?.name}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                SoundFX.playClick();
                navigate('/customer/prescriptions');
              }}
              className="btn-primary flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>View In Prescriptions Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                SoundFX.playClick();
                setSuccessResult(null);
                setFile(null);
                setDoctorName('');
                setNotes('');
              }}
              className="btn-secondary px-5 py-3 rounded-xl font-bold text-xs"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal AI Vision & Pharmacist Inspection</span>
        </div>
        <h1 className="text-2xl font-black text-white">Upload Doctor Prescription</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your handwritten or printed doctor prescription. Our dynamic laser scanner and licensed pharmacy team will review and dispense your medications safely.
        </p>
      </div>

      <div className="cyber-card p-6 sm:p-8 space-y-6">
        {error && (
          <div className="bg-rose-950/80 text-rose-300 border border-rose-500/50 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interactive Laser Scanner Dropzone */}
          <PrescriptionLaserScanner
            onFileSelected={handleFileSelected}
            enableAutoExtract={true}
          />

          {/* Metadata Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Doctor Name <span className="text-slate-500 font-normal">(Optional — AI auto-extracts)</span>
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Arun Kumar, MBBS, MD"
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Notes for Pharmacist <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special instructions, dosage requests, or allergy history..."
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !file}
            className="btn-primary w-full py-3.5 rounded-xl font-black text-sm shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-void-950 border-t-transparent" />
                Encrypting & Submitting Prescription to Dispensary...
              </span>
            ) : (
              'Submit Prescription for Pharmacist Review →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
