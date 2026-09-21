import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CustomerUploadPrescription() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, or PDF file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum supported size is 10 MB.');
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('pdf');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a prescription file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('prescriptionImage', file);
      if (doctorName) formData.append('doctorName', doctorName);
      if (notes) formData.append('notes', notes);

      const { data } = await api.post('/customer/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessResult(data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'We couldn’t upload this prescription right now. Please check your network and try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto py-8 animate-fade-in">
        <div className="card p-8 text-center space-y-5 border-t-4 border-emerald-500">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <h2 className="text-2xl font-black text-slate-900">Prescription Uploaded Successfully!</h2>
          <p className="text-sm text-slate-600">
            Your prescription has been sent to our pharmacy team. Our AI engine is currently assisting in reading the document, and a licensed pharmacist will review and verify your medicines shortly.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 text-xs space-y-1.5">
            <p>
              <span className="text-slate-400">Prescription ID:</span>{' '}
              <strong className="font-mono text-slate-800">#{successResult._id?.slice(-8)?.toUpperCase()}</strong>
            </p>
            <p>
              <span className="text-slate-400">Status:</span>{' '}
              <span className="badge badge-warning text-[11px]">UNDER REVIEW</span>
            </p>
            <p>
              <span className="text-slate-400">File:</span>{' '}
              <span className="font-medium text-slate-700">{successResult.originalFileName || file?.name}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/customer/prescriptions')}
              className="btn-primary flex-1 py-2.5 rounded-xl font-bold text-xs"
            >
              View My Prescriptions →
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setFile(null);
                setPreview(null);
                setDoctorName('');
                setNotes('');
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
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
        <h1 className="text-2xl font-black text-slate-900">Upload Prescription</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your handwritten or printed doctor prescription. Our pharmacy team will review and dispense your medicines safely.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {preview ? (
              <div className="space-y-3">
                {preview === 'pdf' ? (
                  <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-4xl mx-auto font-black shadow-sm">
                    PDF
                  </div>
                ) : (
                  <img
                    src={preview}
                    alt="Prescription preview"
                    className="max-h-64 mx-auto rounded-xl object-contain shadow-md border border-slate-200"
                  />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800">{file?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(file?.size / (1024 * 1024)).toFixed(2)} MB • Click or drop another file to replace
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-3xl mx-auto">
                  📤
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">
                    Drag & drop your prescription here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse from your device</p>
                </div>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-full">
                    Supported: JPG, JPEG, PNG, PDF (Max 10 MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Doctor Name <span className="text-slate-400 font-normal">(Optional — our AI can extract this)</span>
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Arun Kumar"
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Notes for Pharmacist <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special instructions, allergies, or dosage requests..."
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !file}
            className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Uploading & Processing Prescription...
              </span>
            ) : (
              'Upload Prescription Now'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
