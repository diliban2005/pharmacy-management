import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAlerts = async () => {
        setLoading(true);
        try {
          const [lowRes, expRes] = await Promise.all([
            api.get('/medicines', { params: { lowStock: 'true' } }),
            api.get('/medicines', { params: { expiring: 'true' } }),
          ]);
          setAlerts({
            lowStock: lowRes.data.data || [],
            expiring: expRes.data.data || [],
          });
        } catch (err) {
          console.error('Error fetching alerts:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCount = alerts.lowStock.length + alerts.expiring.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-2xs" />

      <div className="absolute top-16 right-4 sm:right-8 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-none">System Alerts & Notices</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {totalCount} active inventory warning{totalCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">All Stock Levels Optimal</p>
              <p className="text-xs text-slate-400">No critically low stock or expiring batches detected.</p>
            </div>
          ) : (
            <>
              {/* Low Stock Alerts */}
              {alerts.lowStock.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Critically Low Stock ({alerts.lowStock.length})</span>
                  </div>
                  <div className="space-y-2">
                    {alerts.lowStock.map(med => (
                      <Link
                        key={med._id}
                        to={`/medicines?search=${encodeURIComponent(med.name)}`}
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between hover:bg-rose-100/60 transition-colors block"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{med.name}</p>
                          <p className="text-[10px] text-slate-500">{med.manufacturer} • Batch #{med.batchNumber}</p>
                        </div>
                        <span className="badge badge-danger text-[10px] font-black">
                          {med.quantity} left
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiring Batches */}
              {alerts.expiring.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expiring Soon ({alerts.expiring.length})</span>
                  </div>
                  <div className="space-y-2">
                    {alerts.expiring.map(med => (
                      <Link
                        key={med._id}
                        to={`/medicines?search=${encodeURIComponent(med.name)}`}
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between hover:bg-amber-100/60 transition-colors block"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{med.name}</p>
                          <p className="text-[10px] text-slate-500">
                            Expires: {new Date(med.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="badge badge-warning text-[10px] font-black">
                          Review Batch
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <Link
            to="/medicines?lowStock=true"
            onClick={onClose}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Open Complete Inventory Manager →
          </Link>
        </div>
      </div>
    </div>
  );
}
