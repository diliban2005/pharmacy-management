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
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import SoundFX from '../../utils/SoundFX';

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
    { id: 'pos', title: 'Holographic POS & Counter Billing', category: 'Action', path: '/billing', icon: ShoppingCart },
    { id: 'add-med', title: 'Add New Medicine Formulation', category: 'Action', path: '/medicines/new', icon: PlusCircle },
    { id: 'low-stock', title: 'View Low Stock Inventory Alerts', category: 'Action', path: '/medicines?lowStock=true', icon: AlertTriangle },
    { id: 'dash', title: 'Executive Operations Dashboard', category: 'Page', path: '/dashboard', icon: LayoutDashboard },
    { id: 'inv', title: 'Drug Inventory & Visual Node Radar', category: 'Page', path: '/medicines', icon: Pill },
    { id: 'rx', title: 'Prescription Multimodal OCR Queue', category: 'Page', path: '/prescriptions', icon: FileText },
    { id: 'sales', title: 'Sales History & Financial Invoices', category: 'Page', path: '/sales', icon: Receipt },
    { id: 'customers', title: 'Patient & Customer Directory', category: 'Page', path: '/customers', icon: Users },
    { id: 'ai-audit', title: 'AI Fairness & Multimodal OCR Audit', category: 'Page', path: '/ai-audit', icon: ShieldCheck },
    { id: 'settings', title: 'System Configuration & Security', category: 'Page', path: '/settings', icon: Settings },
  ];

  const filteredActions = query.trim()
    ? staticActions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
    : staticActions;

  const allItems = [
    ...filteredActions.map((a) => ({ type: 'action', data: a })),
    ...medicines.map((m) => ({ type: 'medicine', data: m })),
  ];

  const handleSelect = (item) => {
    SoundFX.playClick();
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
      SoundFX.playClick();
      setSelectedIndex((prev) => (prev + 1 < allItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      SoundFX.playClick();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allItems.length - 1));
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
      className="fixed inset-0 z-50 bg-void-950/80 backdrop-blur-xl flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-void-900 rounded-3xl shadow-glass-lg border border-emerald-500/40 overflow-hidden flex flex-col max-h-[80vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-void-950/80">
          <Search className="w-5 h-5 text-cyber-emerald shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, formulation name, or portal route..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none text-white placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-0 p-0"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-800 rounded-md border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {allItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Pill className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No nodes matching "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by formulation brand or module.</p>
            </div>
          ) : (
            <>
              {filteredActions.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-black uppercase tracking-wider text-cyber-emerald">
                  Actions & Modules
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
                      isSelected
                        ? 'bg-cyber-emerald/20 text-white font-bold border border-cyber-emerald/40 shadow-glow-emerald'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-cyber-emerald text-void-950 shadow-glow-emerald'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{action.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{action.category}</p>
                      </div>
                    </div>
                    {isSelected && <ArrowRight className="w-4 h-4 text-cyber-emerald" />}
                  </button>
                );
              })}

              {medicines.length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1 text-[10px] font-mono font-black uppercase tracking-wider text-cyber-cyan border-t border-slate-800 mt-2">
                    Active Medicines ({medicines.length})
                  </div>
                  {medicines.map((med, idx) => {
                    const actualIdx = filteredActions.length + idx;
                    const isSelected = selectedIndex === actualIdx;
                    return (
                      <button
                        key={med._id}
                        onClick={() => handleSelect({ type: 'medicine', data: med })}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-cyber-cyan/20 text-white font-bold border border-cyber-cyan/40 shadow-glow-cyan'
                            : 'text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? 'bg-cyber-cyan text-void-950 shadow-glow-cyan'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{med.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {med.genericName} • Stock: {med.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-cyber-emerald font-mono">
                            ₹{med.sellingPrice}
                          </span>
                          {isSelected && <ArrowRight className="w-4 h-4 text-cyber-cyan" />}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-void-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-bold text-cyber-emerald">PharmaCare Spotlight 2.0</span>
        </div>
      </div>
    </div>
  );
}
