import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Pill,
  FileText,
  ShoppingCart,
  Receipt,
  Users,
  ShieldCheck,
  Settings,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import api from '../../services/api';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search medicines when query changes
  useEffect(() => {
    if (!query.trim()) {
      setMedicines([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/medicines', { params: { search: query } });
        setMedicines((res.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('Command palette search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Default Quick Navigation Actions
  const staticActions = [
    { id: 'pos', title: 'New Sale / Point of Sale', category: 'Action', path: '/billing', icon: ShoppingCart },
    { id: 'add-med', title: 'Add New Medicine Formulation', category: 'Action', path: '/medicines/new', icon: PlusCircle },
    { id: 'low-stock', title: 'View Low Stock Inventory Alerts', category: 'Action', path: '/medicines?lowStock=true', icon: AlertTriangle },
    { id: 'dash', title: 'Executive Operations Dashboard', category: 'Page', path: '/dashboard', icon: LayoutDashboard },
    { id: 'inv', title: 'Drug Inventory & Stock Management', category: 'Page', path: '/medicines', icon: Pill },
    { id: 'rx', title: 'Prescription Verification Queue', category: 'Page', path: '/prescriptions', icon: FileText },
    { id: 'sales', title: 'Sales History & Financial Invoices', category: 'Page', path: '/sales', icon: Receipt },
    { id: 'customers', title: 'Patient & Customer Directory', category: 'Page', path: '/customers', icon: Users },
    { id: 'ai-audit', title: 'AI Fairness & Multimodal OCR Audit', category: 'Page', path: '/ai-audit', icon: ShieldCheck },
    { id: 'settings', title: 'System Configuration & Security', category: 'Page', path: '/settings', icon: Settings },
  ];

  const filteredActions = query.trim()
    ? staticActions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
    : staticActions;

  const allItems = [
    ...filteredActions.map(a => ({ type: 'action', data: a })),
    ...medicines.map(m => ({ type: 'medicine', data: m })),
  ];

  const handleSelect = (item) => {
    onClose();
    if (item.type === 'action') {
      navigate(item.data.path);
    } else {
      navigate(`/medicines?search=${encodeURIComponent(item.data.name)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < allItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-slide-up"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search medicines, navigation, or type an action..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-0 p-0"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-200/60 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {allItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No results matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by drug name or page name.</p>
            </div>
          ) : (
            <>
              {filteredActions.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Quick Actions & Pages
                </div>
              )}
              {filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSelect({ type: 'action', data: action })}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                      isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{action.title}</p>
                        <p className="text-[10px] text-slate-400">{action.category}</p>
                      </div>
                    </div>
                    {isSelected && <ArrowRight className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}

              {medicines.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-2">
                    Medicines & Stock ({medicines.length})
                  </div>
                  {medicines.map((med, idx) => {
                    const actualIdx = filteredActions.length + idx;
                    const isSelected = selectedIndex === actualIdx;
                    return (
                      <button
                        key={med._id}
                        onClick={() => handleSelect({ type: 'medicine', data: med })}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                          isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-teal-50 text-teal-700'}`}>
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{med.name}</p>
                            <p className="text-[10px] text-slate-400">{med.genericName} • Stock: {med.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">₹{med.sellingPrice}</span>
                          {isSelected && <ArrowRight className="w-4 h-4 text-emerald-600" />}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-semibold text-emerald-700">PharmaCare Command Engine</span>
        </div>
      </div>
    </div>
  );
}
