import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  Shield,
  UploadCloud,
} from 'lucide-react';
import api from '../services/api';
import TiltCard from '../components/common/TiltCard';
import SoundFX from '../utils/SoundFX';

const CATEGORIES = ['All', 'Tablet', 'Capsule', 'Syrup', 'Cream', 'Soap'];

export default function Billing() {
  const [searchParams] = useSearchParams();
  const prescriptionId = searchParams.get('prescriptionId');
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'prescriptions', 'invoices'

  // POS State
  const [catalogMedicines, setCatalogMedicines] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ id: '', name: 'Walk-in Customer', phone: '' });
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Holographic Scanner Dropzone State
  const [dropzoneActive, setDropzoneActive] = useState(false);
  const [pulseWaveActive, setPulseWaveActive] = useState(false);

  // Financial Sliders
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [errorNotice, setErrorNotice] = useState('');

  // Auxiliary data
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  // Load inventory catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      try {
        const res = await api.get('/medicines');
        setCatalogMedicines(res.data.data || []);
      } catch (err) {
        console.error('Error fetching billing catalog:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, []);

  // Check if loaded with prescriptionId
  useEffect(() => {
    if (prescriptionId) {
      api.get(`/prescriptions/${prescriptionId}`)
        .then(({ data }) => {
          const rx = data.data;
          if (rx.customer) {
            setCustomer({
              id: rx.customer._id,
              name: rx.customer.name,
              phone: rx.customer.phone || '',
            });
          }
          if (Array.isArray(rx.prescribedMedicines)) {
            const loadedItems = rx.prescribedMedicines.map((m) => {
              const med = m.medicine;
              const unitPrice = med?.sellingPrice || 10;
              const qty = m.quantity || 1;
              return {
                medicine: med?._id || m.medicine,
                medicineName: m.medicineName || med?.name || 'Medicine',
                quantity: qty,
                unitPrice,
                totalPrice: qty * unitPrice,
                maxQty: med?.quantity || 999,
                isRx: true,
              };
            });
            setCart(loadedItems);
          }
        })
        .catch(console.error);
    }
  }, [prescriptionId]);

  // Load queue for tabs 2 & 3
  useEffect(() => {
    if (activeTab === 'prescriptions') {
      api.get('/prescriptions?status=VERIFIED')
        .then((res) => setPendingPrescriptions(res.data.data || []))
        .catch(console.error);
    } else if (activeTab === 'invoices') {
      api.get('/sales')
        .then((res) => setRecentSales(res.data.data || []))
        .catch(console.error);
    }
  }, [activeTab]);

  // Customer search
  useEffect(() => {
    if (!customerQuery.trim()) {
      setCustomerSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/customers', { params: { search: customerQuery } });
        setCustomerSuggestions(res.data.data || []);
        setShowCustomerDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [customerQuery]);

  const triggerPulseWave = () => {
    setPulseWaveActive(true);
    setTimeout(() => setPulseWaveActive(false), 800);
  };

  // Cart operations
  const addToCart = (med) => {
    if (med.quantity <= 0) {
      alert(`"${med.name}" is currently out of stock!`);
      return;
    }
    SoundFX.playDropChime();
    triggerPulseWave();

    setCart((prev) => {
      const existing = prev.find((i) => i.medicine === med._id);
      if (existing) {
        if (existing.quantity >= med.quantity) {
          alert(`Maximum available stock is ${med.quantity} units.`);
          return prev;
        }
        return prev.map((i) =>
          i.medicine === med._id
            ? {
                ...i,
                quantity: i.quantity + 1,
                totalPrice: Number(((i.quantity + 1) * i.unitPrice).toFixed(2)),
              }
            : i
        );
      }
      return [
        ...prev,
        {
          medicine: med._id,
          medicineName: med.name,
          quantity: 1,
          unitPrice: med.sellingPrice,
          totalPrice: med.sellingPrice,
          maxQty: med.quantity,
          isRx:
            med.requiresPrescription === true ||
            ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(med.scheduleType),
        },
      ];
    });
  };

  const updateQuantity = (medicineId, delta) => {
    SoundFX.playClick();
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.medicine === medicineId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.maxQty) {
              alert(`Only ${item.maxQty} units available.`);
              return item;
            }
            return {
              ...item,
              quantity: nextQty,
              totalPrice: Number((nextQty * item.unitPrice).toFixed(2)),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (medicineId) => {
    SoundFX.playClick();
    setCart((prev) => prev.filter((i) => i.medicine !== medicineId));
  };

  const clearCart = () => {
    SoundFX.playClick();
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Number(((taxableAmount * taxPercent) / 100).toFixed(2));
  const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

  // Checkout
  const handleCheckout = async () => {
    setErrorNotice('');
    if (cart.length === 0) {
      setErrorNotice('Please select or scan at least one medication to bill.');
      return;
    }

    setSubmitting(true);
    SoundFX.playClick();

    try {
      const payload = {
        items: cart.map((i) => ({
          medicine: i.medicine,
          quantity: i.quantity,
        })),
        customer: customer.id || undefined,
        customerName: customer.name || 'Walk-in Patient',
        discount: discountPercent,
        tax: taxPercent,
        paymentMethod,
        prescription: prescriptionId || undefined,
      };

      const res = await api.post('/sales', payload);
      SoundFX.playSuccess();
      setCompletedSale(res.data.data);
      clearCart();
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to complete sale transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSale = () => {
    SoundFX.playClick();
    setCompletedSale(null);
    clearCart();
    setCustomer({ id: '', name: 'Walk-in Customer', phone: '' });
    setDiscountPercent(0);
    setTaxPercent(0);
    setErrorNotice('');
  };

  const filteredCatalog = useMemo(() => {
    return catalogMedicines.filter((m) => {
      if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchGeneric = m.genericName?.toLowerCase().includes(q);
        const matchBatch = m.batchNumber?.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchBatch) return false;
      }
      return true;
    });
  }, [catalogMedicines, selectedCategory, catalogSearch]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Point of Sale (POS) & Holographic Terminal
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30 shadow-glow-emerald">
              Laser Terminal #1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Physical drag-and-drop laser scanning, live reactive tickers, and automated prescription matching.
          </p>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="subtab-bar shadow-glass">
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('pos');
            }}
            className={`subtab-btn ${activeTab === 'pos' ? 'active' : ''}`}
          >
            <ShoppingCart className="w-4 h-4 text-cyber-emerald" />
            <span>Fast Counter Sales</span>
          </button>
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('prescriptions');
            }}
            className={`subtab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4 text-cyber-cyan" />
            <span>Prescription Matching</span>
          </button>
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('invoices');
            }}
            className={`subtab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Recent Invoices</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Split-Screen POS Workspace */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* Left Side (55% width): Draggable Inventory Medicine Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Category Pills */}
            <div className="cyber-card p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Scan barcode or type medication / generic formula..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="pl-10 text-xs sm:text-sm py-2.5 rounded-xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      SoundFX.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyber-emerald text-void-950 font-black shadow-glow-emerald'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Draggable Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {loadingCatalog ? (
                <div className="col-span-2 py-20 text-center text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyber-emerald border-t-transparent mx-auto" />
                  <p className="text-xs font-bold mt-2 font-mono">Loading dispensary catalog...</p>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-slate-400">
                  <p className="text-xs font-bold">No formulations matching "{catalogSearch}"</p>
                </div>
              ) : (
                filteredCatalog.map((med) => {
                  const isRx =
                    med.requiresPrescription === true ||
                    ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(med.scheduleType);
                  const isOutOfStock = med.quantity <= 0;

                  return (
                    <div
                      key={med._id}
                      draggable={!isOutOfStock}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify(med));
                        SoundFX.playClick();
                      }}
                      onClick={() => !isOutOfStock && addToCart(med)}
                      className={`cyber-card p-4 flex flex-col justify-between text-left transition-all ${
                        isOutOfStock
                          ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800'
                          : 'cursor-grab active:cursor-grabbing hover:border-cyber-emerald hover:shadow-glow-emerald hover:-translate-y-1'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          {isRx ? (
                            <span className="badge badge-danger text-[9px] font-black">
                              🔴 Rx
                            </span>
                          ) : (
                            <span className="badge badge-success text-[9px] font-black">
                              🟢 OTC
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">{med.category}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm truncate leading-snug">
                          {med.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{med.genericName}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-base font-black text-cyber-emerald font-mono">
                          ₹{med.sellingPrice?.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-slate-800 text-slate-500'
                              : med.quantity <= 10
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-950 text-cyber-emerald border border-cyber-emerald/30'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : `${med.quantity} in stock`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side (45% width): Holographic Bill Builder & Laser Dropzone */}
          <div className="lg:col-span-5 space-y-4">
            {/* ANIMATED HOLOGRAPHIC LASER SCANNING DROPZONE */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDropzoneActive(true);
              }}
              onDragLeave={() => setDropzoneActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDropzoneActive(false);
                try {
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                  addToCart(data);
                } catch (err) {}
              }}
              className={`relative rounded-2xl border-2 border-dashed p-4 text-center transition-all overflow-hidden cursor-pointer ${
                dropzoneActive
                  ? 'border-cyber-emerald bg-cyber-emerald/20 scale-[1.02] shadow-glow-emerald'
                  : pulseWaveActive
                  ? 'border-cyber-cyan bg-cyber-cyan/20 scale-[1.01] shadow-glow-cyan'
                  : 'border-slate-700/80 bg-void-950/80 hover:border-cyber-emerald/50'
              }`}
            >
              <div className="laser-beam" />
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-cyber-emerald">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>
                  {dropzoneActive
                    ? '✨ Release to Scan Medication into Bill'
                    : 'Laser Dropzone • Drag & drop product card here'}
                </span>
              </div>
            </div>

            {/* Bill Builder Box */}
            <div className="cyber-card p-5 space-y-4">
              {/* Customer Selector */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                  <span>Billed Patient / Customer:</span>
                  <button
                    type="button"
                    onClick={() => setCustomer({ id: '', name: 'Walk-in Patient', phone: '' })}
                    className="text-[10px] text-cyber-emerald hover:underline font-bold"
                  >
                    Set as Walk-in
                  </button>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search patient by name or phone..."
                    value={customerQuery || customer.name}
                    onChange={(e) => {
                      setCustomerQuery(e.target.value);
                      setCustomer({ ...customer, name: e.target.value });
                    }}
                    className="pl-9 text-xs py-2 rounded-xl"
                  />
                </div>

                {/* Suggestions dropdown */}
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 bg-void-950 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-800 max-h-40 overflow-y-auto">
                    {customerSuggestions.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setCustomer({ id: c._id, name: c.name, phone: c.phone });
                          setCustomerQuery('');
                          setShowCustomerDropdown(false);
                          SoundFX.playClick();
                        }}
                        className="p-2.5 text-xs hover:bg-slate-800 cursor-pointer flex justify-between"
                      >
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-slate-400 font-mono">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Billed Items ({cart.length})
                  </span>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] font-bold text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 space-y-1">
                    <ShoppingCart className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-bold text-slate-400">Dispensary Tray is Empty</p>
                    <p className="text-[10px] text-slate-500">Drag or click medications from the left</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.medicine}
                        className="p-3 rounded-xl bg-void-950/80 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{item.medicineName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ₹{item.unitPrice.toFixed(2)} each
                          </p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.medicine, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-white font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.medicine, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-black text-cyber-emerald text-xs w-16 text-right font-mono">
                          ₹{item.totalPrice.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.medicine)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Financial Sliders */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                {/* Discount Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Discount Rate:</span>
                    <span className="font-black text-cyber-emerald">{discountPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={discountPercent}
                    onChange={(e) => {
                      SoundFX.playClick();
                      setDiscountPercent(Number(e.target.value));
                    }}
                    className="w-full accent-[#00F5A0] cursor-pointer"
                  />
                </div>

                {/* Tax / GST Split Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Tax / GST:</span>
                    <span className="font-black text-cyber-cyan">{taxPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="1"
                    value={taxPercent}
                    onChange={(e) => {
                      SoundFX.playClick();
                      setTaxPercent(Number(e.target.value));
                    }}
                    className="w-full accent-[#00D9F6] cursor-pointer"
                  />
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 mb-1.5 block">
                  Payment Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'Card', label: 'Card', icon: CreditCard },
                    { id: 'Cash', label: 'Cash', icon: Banknote },
                    { id: 'Insurance', label: 'Insurance', icon: Shield },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          SoundFX.playClick();
                          setPaymentMethod(m.id);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === m.id
                            ? 'bg-cyber-emerald/15 border-cyber-emerald text-cyber-emerald shadow-glow-emerald font-black'
                            : 'bg-void-950/80 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Financial Totals */}
              <div className="bg-void-950 rounded-xl p-3.5 border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-cyber-emerald">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-cyber-cyan">
                    <span>Tax ({taxPercent}%)</span>
                    <span>+₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base text-white border-t border-slate-800 pt-2 mt-1">
                  <span>Grand Total</span>
                  <span className="text-cyber-emerald font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {errorNotice && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {/* Checkout Trigger */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0}
                className="btn-primary w-full py-3.5 rounded-xl font-black text-sm shadow-glow-emerald disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Processing Laser Sale...</span>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Generate Bill & Print Receipt (₹{grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prescription Matching Queue */}
      {activeTab === 'prescriptions' && (
        <div className="cyber-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h3 className="text-base font-black text-white">Verified Prescription Queue</h3>
              <p className="text-xs text-slate-400">
                Prescriptions approved by pharmacists and ready to spring into POS billing
              </p>
            </div>
            <span className="badge badge-success text-xs font-mono">
              {pendingPrescriptions.length} Verified
            </span>
          </div>

          {pendingPrescriptions.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-bold text-white text-sm">No Pending Prescriptions</p>
              <p className="text-xs">All approved patient prescriptions have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPrescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="p-4 rounded-2xl bg-void-950/80 border border-slate-800 hover:border-cyber-emerald/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-cyber-emerald">
                      RX-{rx._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="badge badge-success text-[10px]">VERIFIED</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Patient: <strong className="text-white">{rx.customer?.name || 'Walk-in'}</strong>
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Doctor: {rx.doctorName || 'Prescribing Physician'}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        SoundFX.playClick();
                        setActiveTab('pos');
                        // Load items into cart
                        const items = (rx.prescribedMedicines || []).map((m) => ({
                          medicine: m.medicine?._id || m.medicine,
                          medicineName: m.medicineName || m.medicine?.name || 'Medicine',
                          quantity: m.quantity || 1,
                          unitPrice: m.medicine?.sellingPrice || 25,
                          totalPrice: (m.quantity || 1) * (m.medicine?.sellingPrice || 25),
                          maxQty: 100,
                          isRx: true,
                        }));
                        setCart(items);
                        if (rx.customer) {
                          setCustomer({
                            id: rx.customer._id,
                            name: rx.customer.name,
                            phone: rx.customer.phone || '',
                          });
                        }
                      }}
                      className="btn-primary text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Load into POS Station →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recent Invoices */}
      {activeTab === 'invoices' && (
        <div className="cyber-card overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
            <h3 className="text-base font-black text-white">Recent POS Billing Transactions</h3>
            <span className="text-xs text-slate-400 font-mono">{recentSales.length} Invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Timestamp</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Items</th>
                  <th>Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.slice(0, 15).map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <span className="font-mono text-xs font-bold text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/30 px-2 py-0.5 rounded-md">
                        {sale.invoiceId}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 font-mono">
                      {new Date(sale.date || sale.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="text-xs font-bold text-white">{sale.customerName}</td>
                    <td>
                      <span className="badge badge-info text-[10px] font-mono">{sale.paymentMethod}</span>
                    </td>
                    <td className="text-xs text-slate-300 font-mono">{sale.items?.length || 1} items</td>
                    <td className="font-black text-cyber-emerald font-mono text-sm">
                      ₹{sale.totalAmount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sale Completion / Printable Thermal Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-void-950/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="cyber-card max-w-md w-full p-6 space-y-6 border border-cyber-emerald/50 shadow-glass-lg">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 rounded-full flex items-center justify-center text-2xl mx-auto shadow-glow-emerald">
                ✓
              </div>
              <h3 className="text-xl font-black text-white">Transaction Verified</h3>
              <p className="text-xs text-slate-400">
                Invoice <strong className="font-mono text-cyber-emerald">{completedSale.invoiceId}</strong> generated successfully.
              </p>
            </div>

            {/* Printable Receipt Block */}
            <div ref={printRef} className="p-4 rounded-xl bg-white text-slate-900 text-xs space-y-3 font-mono shadow-md">
              <div className="text-center border-b pb-2">
                <p className="font-black text-base text-emerald-800">PharmaCare Dispensary</p>
                <p className="text-[10px] text-slate-500">Licensed Pharmacy & Clinical Dispensation</p>
                <p className="text-[11px] font-bold text-emerald-700 mt-1">{completedSale.invoiceId}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(completedSale.date || completedSale.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex justify-between text-[11px]">
                <span>Customer: {completedSale.customerName}</span>
                <span>Mode: {completedSale.paymentMethod}</span>
              </div>

              <div className="border-t pt-2 space-y-1">
                {completedSale.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[180px]">{it.medicineName}</span>
                    <span>
                      {it.quantity} x ₹{it.unitPrice?.toFixed(2)} = ₹{it.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 text-right space-y-0.5 font-bold">
                <div className="flex justify-between">
                  <span>Grand Total Paid:</span>
                  <span className="text-emerald-800 text-sm">₹{completedSale.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="btn-primary flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                onClick={handleNewSale}
                className="btn-secondary px-5 py-3 rounded-xl font-bold text-xs"
              >
                Next Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
