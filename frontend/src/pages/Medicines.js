import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Pill,
  AlertTriangle,
  Clock,
  PlusCircle,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Check,
  Eye,
  Edit,
  Trash2,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MedicineDetailDrawer from '../components/common/MedicineDetailDrawer';

const CATEGORIES = ['All', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Other'];

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [scheduleFilter, setScheduleFilter] = useState('all'); // 'all', 'otc', 'rx'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lowStock', 'expiry', 'batches'
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(null);

  const [searchParams] = useSearchParams();
  const { isAdmin, user } = useAuth();
  const canManage = isAdmin || user?.role === 'pharmacist';

  useEffect(() => {
    if (searchParams.get('lowStock') === 'true') setActiveTab('lowStock');
    if (searchParams.get('expiring') === 'true') setActiveTab('expiry');
    if (searchParams.get('search')) setSearch(searchParams.get('search'));
  }, [searchParams]);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Inline stock adjustment
  const handleStockUpdate = async (medId, delta) => {
    const med = medicines.find(m => m._id === medId);
    if (!med) return;
    const newQty = Math.max(0, med.quantity + delta);

    // Optimistic UI update
    setMedicines(prev => prev.map(m => (m._id === medId ? { ...m, quantity: newQty } : m)));
    if (selectedMedicine && selectedMedicine._id === medId) {
      setSelectedMedicine(prev => ({ ...prev, quantity: newQty }));
    }

    try {
      await api.put(`/medicines/${medId}`, { quantity: newQty });
    } catch (err) {
      console.error('Failed to update stock:', err);
      fetchMedicines(); // rollback on error
    }
  };

  const handleCopyBatch = (batch, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(batch);
    setCopiedBatch(batch);
    setTimeout(() => setCopiedBatch(null), 2000);
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently remove "${name}" from dispensary inventory?`)) return;
    try {
      await api.delete(`/medicines/${id}`);
      setMedicines(prev => prev.filter(m => m._id !== id));
      if (selectedMedicine?._id === id) setDrawerOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete medicine');
    }
  };

  const openDrawer = (med) => {
    setSelectedMedicine(med);
    setDrawerOpen(true);
  };

  // Filtered and Sorted list
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter(med => {
        // Tab filter
        if (activeTab === 'lowStock') {
          if (med.quantity > (med.lowStockThreshold || 10)) return false;
        } else if (activeTab === 'expiry') {
          const thirtyDays = new Date();
          thirtyDays.setDate(thirtyDays.getDate() + 90);
          if (new Date(med.expiryDate) > thirtyDays) return false;
        }

        // Category filter
        if (category !== 'All' && med.category !== category) return false;

        // Schedule type filter
        const isRx = med.requiresPrescription || ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(med.scheduleType);
        if (scheduleFilter === 'otc' && isRx) return false;
        if (scheduleFilter === 'rx' && !isRx) return false;

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = med.name?.toLowerCase().includes(q);
          const matchGeneric = med.genericName?.toLowerCase().includes(q);
          const matchBatch = med.batchNumber?.toLowerCase().includes(q);
          const matchClass = med.therapeuticClass?.toLowerCase().includes(q);
          if (!matchName && !matchGeneric && !matchBatch && !matchClass) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (sortField === 'expiryDate') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [medicines, activeTab, category, scheduleFilter, search, sortField, sortOrder]);

  const exportCSV = () => {
    const headers = ['Name', 'Generic', 'Category', 'Schedule', 'Batch', 'Expiry', 'Cost Price', 'Selling Price', 'Stock'];
    const rows = filteredMedicines.map(m => [
      `"${m.name}"`,
      `"${m.genericName || ''}"`,
      m.category,
      m.requiresPrescription ? 'Schedule H (Rx)' : 'OTC',
      m.batchNumber,
      new Date(m.expiryDate).toLocaleDateString(),
      m.purchasePrice,
      m.sellingPrice,
      m.quantity,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inventory-report-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Drug Inventory & Stock Manager
            </h1>
            <span className="badge badge-info text-[10px] font-black">
              {medicines.length} Formulations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stock controls, batch expiry tracking, and Schedule H prescription governance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="btn-secondary text-xs shadow-2xs"
            title="Download CSV report"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          {canManage && (
            <Link to="/medicines/new" className="btn-primary text-xs shadow-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Add Medicine</span>
            </Link>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="subtab-bar shadow-2xs flex-wrap">
        <button
          onClick={() => setActiveTab('all')}
          className={`subtab-btn ${activeTab === 'all' ? 'active' : ''}`}
        >
          <Pill className="w-4 h-4 text-emerald-600" />
          <span>All Products ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lowStock')}
          className={`subtab-btn ${activeTab === 'lowStock' ? 'active' : ''}`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Low Stock Alerts ({medicines.filter(m => m.quantity <= (m.lowStockThreshold || 10)).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expiry')}
          className={`subtab-btn ${activeTab === 'expiry' ? 'active' : ''}`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Expiry Watchlist</span>
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`subtab-btn ${activeTab === 'batches' ? 'active' : ''}`}
        >
          <Layers className="w-4 h-4 text-sapphire-600" />
          <span>Batches & Storage</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 sm:p-5 flex flex-wrap items-center gap-3 border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search by drug name, generic formula, batch, or class..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 text-xs sm:text-sm py-2 rounded-xl"
          />
        </div>

        <div className="w-40">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="text-xs sm:text-sm py-2 rounded-xl"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Dosage Forms' : c}
              </option>
            ))}
          </select>
        </div>

        <div className="w-36">
          <select
            value={scheduleFilter}
            onChange={e => setScheduleFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 rounded-xl font-semibold"
          >
            <option value="all">All Drug Types</option>
            <option value="otc">🟢 OTC Only</option>
            <option value="rx">🔴 Schedule H (Rx)</option>
          </select>
        </div>
      </div>

      {/* Spacious Data Table */}
      <div className="card overflow-hidden border border-slate-200/90 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
            <p className="text-xs font-bold text-slate-400">Loading live stock data...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <Pill className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No Medications Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No inventory records matched your filters. Try clearing your search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Formulation / Drug</th>
                  <th>Classification</th>
                  <th>Batch Number</th>
                  <th>Expiration Date</th>
                  <th>Stock Inventory</th>
                  <th>Unit Price</th>
                  <th>Expiry Health</th>
                  <th className="text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map(med => {
                  const isRx =
                    med.requiresPrescription === true ||
                    ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(med.scheduleType);

                  const expiry = new Date(med.expiryDate);
                  const isExpired = new Date() > expiry;
                  const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                  const isLowStock = med.quantity <= (med.lowStockThreshold || 10);

                  return (
                    <tr
                      key={med._id}
                      onClick={() => openDrawer(med)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Medicine Name & Category */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center font-bold text-base transition-colors shrink-0">
                            💊
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {med.name}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              {med.genericName} • <span className="font-semibold text-slate-500">{med.category}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rx / OTC Badge */}
                      <td>
                        {isRx ? (
                          <span className="badge badge-danger text-[10px] font-black">
                            🔴 Schedule H
                          </span>
                        ) : (
                          <span className="badge badge-success text-[10px] font-black">
                            🟢 OTC Direct
                          </span>
                        )}
                      </td>

                      {/* Batch with quick copy */}
                      <td>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700">
                          <span>{med.batchNumber}</span>
                          <button
                            onClick={e => handleCopyBatch(med.batchNumber, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Copy batch number"
                          >
                            {copiedBatch === med.batchNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="text-xs text-slate-600 font-semibold">
                        {expiry.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Stock with Inline Adjustment */}
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleStockUpdate(med._id, -1)}
                              disabled={med.quantity <= 0}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs disabled:opacity-30"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span
                              className={`w-9 text-center font-black text-xs ${
                                isLowStock ? 'text-rose-600' : 'text-slate-800'
                              }`}
                            >
                              {med.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStockUpdate(med._id, 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                          {isLowStock && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Low Stock Alert" />
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <span className="font-black text-slate-900 text-sm">₹{med.sellingPrice?.toFixed(2)}</span>
                      </td>

                      {/* Expiry Status Pill */}
                      <td>
                        {isExpired ? (
                          <span className="badge badge-danger text-[10px] font-black animate-pulse">
                            Expired
                          </span>
                        ) : daysLeft <= 30 ? (
                          <span className="badge badge-danger text-[10px] font-black animate-pulse">
                            &lt; {daysLeft}d left
                          </span>
                        ) : daysLeft <= 90 ? (
                          <span className="badge badge-warning text-[10px] font-black">
                            &lt; 90d left
                          </span>
                        ) : (
                          <span className="badge badge-success text-[10px] font-black">
                            Safe ({daysLeft}d)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDrawer(med)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Inspect details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <Link
                                to={`/medicines/edit/${med._id}`}
                                className="p-1.5 text-slate-400 hover:text-sapphire-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit medicine"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={e => handleDelete(med._id, med.name, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete formulation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sliding Medicine Detail Drawer */}
      <MedicineDetailDrawer
        medicine={selectedMedicine}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStockUpdate={handleStockUpdate}
      />
    </div>
  );
}
