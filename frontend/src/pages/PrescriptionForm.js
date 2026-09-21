import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PrescriptionForm() {
  const [form, setForm] = useState({ customer: '', doctorName: '', date: new Date().toISOString().split('T')[0], notes: '', prescribedMedicines: [] });
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [medEntry, setMedEntry] = useState({ medicine: '', medicineName: '', dosage: '', duration: '', quantity: 1 });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/customers').then(r => setCustomers(r.data.data));
    api.get('/medicines').then(r => setMedicines(r.data.data));
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleMedChange = e => {
    const { name, value } = e.target;
    if (name === 'medicine') {
      const med = medicines.find(m => m._id === value);
      setMedEntry(p => ({ ...p, medicine: value, medicineName: med?.name || '' }));
    } else {
      setMedEntry(p => ({ ...p, [name]: value }));
    }
  };

  const addMedicine = () => {
    if (!medEntry.medicineName) return;
    setForm(p => ({ ...p, prescribedMedicines: [...p.prescribedMedicines, { ...medEntry }] }));
    setMedEntry({ medicine: '', medicineName: '', dosage: '', duration: '', quantity: 1 });
  };

  const removeMedicine = idx => setForm(p => ({ ...p, prescribedMedicines: p.prescribedMedicines.filter((_, i) => i !== idx) }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'prescribedMedicines') formData.append(k, JSON.stringify(v));
        else formData.append(k, v);
      });
      if (imageFile) formData.append('prescriptionImage', imageFile);
      await api.post('/prescriptions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/prescriptions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <button onClick={() => navigate('/prescriptions')} className="text-teal-600 text-sm hover:underline mb-4 flex items-center gap-1">← Back to Prescriptions</button>
      <h1 className="page-title mb-6">New Prescription</h1>

      <div className="card p-6 space-y-6">
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label>Patient *</label>
              <select name="customer" value={form.customer} onChange={handleChange} required>
                <option value="">Select patient...</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>)}
              </select>
            </div>
            <div>
              <label>Doctor Name *</label>
              <input name="doctorName" value={form.doctorName} onChange={handleChange} placeholder="Dr. " required />
            </div>
            <div>
              <label>Prescription Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div>
              <label>Prescription Image</label>
              <input type="file" accept="image/*,.pdf" onChange={e => setImageFile(e.target.files[0])} className="text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Optional notes..." />
            </div>
          </div>

          {/* Add medicines */}
          <div>
            <label className="section-title">Prescribed Medicines</label>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 mt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <select name="medicine" value={medEntry.medicine} onChange={handleMedChange}>
                    <option value="">Select medicine...</option>
                    {medicines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <input name="dosage" value={medEntry.dosage} onChange={handleMedChange} placeholder="Dosage (e.g. 1-0-1)" />
                <input name="duration" value={medEntry.duration} onChange={handleMedChange} placeholder="Duration (e.g. 5 days)" />
                <input type="number" name="quantity" value={medEntry.quantity} onChange={handleMedChange} min={1} placeholder="Qty" />
                <button type="button" onClick={addMedicine} className="sm:col-span-3 btn-primary py-2 rounded-lg text-sm font-semibold">+ Add to Prescription</button>
              </div>

              {form.prescribedMedicines.length > 0 && (
                <div className="space-y-2 mt-3">
                  {form.prescribedMedicines.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                      <div className="flex-1">
                        <span className="font-semibold text-sm text-slate-800">{m.medicineName}</span>
                        <span className="text-slate-400 text-xs ml-2">{m.dosage} • {m.duration} • Qty: {m.quantity}</span>
                      </div>
                      <button type="button" onClick={() => removeMedicine(i)} className="text-red-400 hover:text-red-600 text-sm ml-3">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {loading ? 'Saving...' : '+ Create Prescription'}
            </button>
            <button type="button" onClick={() => navigate('/prescriptions')} className="px-6 py-2.5 rounded-lg font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
