import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Pill,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Edit,
  TrendingUp,
  Package,
  Calendar,
  Layers,
} from 'lucide-react';

export default function MedicineDetailDrawer({ medicine, isOpen, onClose, onStockUpdate }) {
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [adjustingStock, setAdjustingStock] = useState(false);
  const [stockDelta, setStockDelta] = useState(1);

  if (!isOpen || !medicine) return null;

  const handleCopyBatch = () => {
    if (medicine.batchNumber) {
      navigator.clipboard.writeText(medicine.batchNumber);
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2000);
    }
  };

  const isRx =
    medicine.requiresPrescription === true ||
    ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(medicine.scheduleType);

  const expiry = new Date(medicine.expiryDate);
  const isExpired = new Date() > expiry;
  const daysUntilExpiry = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));

  const margin =
    medicine.sellingPrice > 0
      ? (((medicine.sellingPrice - medicine.purchasePrice) / medicine.sellingPrice) * 100).toFixed(1)
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-slate-200 animate-slide-in-right"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isRx ? (
                  <span className="badge badge-danger text-[11px] font-black">
                    🔴 Schedule H (Rx Required)
                  </span>
                ) : (
                  <span className="badge badge-success text-[11px] font-black">
                    🟢 Over-The-Counter (OTC)
                  </span>
                )}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-200/60 text-slate-700">
                  {medicine.category}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">{medicine.name}</h2>
              <p className="text-xs font-semibold text-slate-500">{medicine.genericName}</p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Stock & Margin Overview Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Current Stock</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">{medicine.quantity}</span>
                  <span className="text-xs text-slate-500 font-semibold">units</span>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Threshold: {medicine.lowStockThreshold || 10} units
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sapphire-50/60 border border-sapphire-100">
                <p className="text-[11px] font-bold text-sapphire-800 uppercase tracking-wider">Selling Price</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">₹{medicine.sellingPrice?.toFixed(2)}</span>
                  <span className="text-xs text-emerald-600 font-bold">+{margin}%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Cost: ₹{medicine.purchasePrice?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Quick Stock Adjustment */}
            {onStockUpdate && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Quick Stock Adjustment</span>
                  <span className="text-[11px] text-slate-400">Inline inventory sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStockUpdate(medicine._id, -1)}
                    disabled={medicine.quantity <= 0}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => onStockUpdate(medicine._id, 1)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => onStockUpdate(medicine._id, 10)}
                    className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100"
                  >
                    +10 Restock
                  </button>
                </div>
              </div>
            )}

            {/* Batch & Manufacturing Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Batch & Expiry Controls
              </h3>

              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    Batch Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{medicine.batchNumber}</span>
                    <button
                      onClick={handleCopyBatch}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded"
                      title="Copy batch code"
                    >
                      {copiedBatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Expiration Date
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{expiry.toLocaleDateString()}</span>
                    <span className={`block text-[10px] font-extrabold ${daysUntilExpiry <= 30 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {isExpired ? 'Expired' : `${daysUntilExpiry} days remaining`}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    Manufacturer
                  </span>
                  <span className="font-bold text-slate-900">{medicine.manufacturer}</span>
                </div>
              </div>
            </div>

            {/* Clinical Indications & Directions */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Clinical Pharmacology
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                {medicine.therapeuticClass && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Therapeutic Class</span>
                    <span className="font-bold text-slate-900">{medicine.therapeuticClass}</span>
                  </div>
                )}

                {medicine.dosageInstructions && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Standard Dosage & Directions</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{medicine.dosageInstructions}</p>
                  </div>
                )}

                {medicine.sideEffects && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Side Effects & Contraindications</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{medicine.sideEffects}</p>
                  </div>
                )}

                {medicine.description && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Pharmacology Description</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{medicine.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center gap-3">
            <Link
              to={`/medicines/edit/${medicine._id}`}
              className="btn-secondary flex-1 text-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Medicine Info</span>
            </Link>
            <Link
              to={`/billing?medSearch=${encodeURIComponent(medicine.name)}`}
              className="btn-primary flex-1 text-xs"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Dispense / Bill (POS)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
