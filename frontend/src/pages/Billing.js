import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import api from '../services/api';

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
        .then(res => setPendingPrescriptions(res.data.data || []))
        .catch(console.error);
    } else if (activeTab === 'invoices') {
      api.get('/sales')
        .then(res => setRecentSales(res.data.data || []))
        .catch(console.error);
    }
  }, [activeTab]);

  // Search customers
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

  // Cart operations
  const addToCart = (med) => {
    if (med.quantity <= 0) {
      alert(`"${med.name}" is currently out of stock!`);
      return;
    }
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
    setCart((prev) => prev.filter((i) => i.medicine !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Number(((taxableAmount * taxPercent) / 100).toFixed(2));
  const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

  // Checkout execution
  const handleCheckout = async () => {
    setErrorNotice('');
    if (cart.length === 0) {
      setErrorNotice('Please select at least one medication to bill.');
      return;
    }

    setSubmitting(true);
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
      setCompletedSale(res.data.data);
      clearCart();
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Failed to complete sale transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    clearCart();
    setCustomer({ id: '', name: 'Walk-in Customer', phone: '' });
    setDiscountPercent(0);
    setTaxPercent(0);
    setErrorNotice('');
  };

  // Filtered medicines in left POS grid
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
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Point of Sale (POS) & Billing Center
            </h1>
            <span className="badge badge-success text-[10px] font-black">
              Terminal #1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rapid barcode counter sales, automated prescription linking, and tax invoice generation.
          </p>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="subtab-bar shadow-2xs">
          <button
            onClick={() => setActiveTab('pos')}
            className={`subtab-btn ${activeTab === 'pos' ? 'active' : ''}`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Fast Counter Sales</span>
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`subtab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4 text-cyan-600" />
            <span>Prescription Matching</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`subtab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          >
            <Receipt className="w-4 h-4 text-amber-500" />
            <span>Recent Invoices</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Split-Screen POS Workspace */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* Left Side (55% width): Barcode/Search & Click-to-add Product Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Category Pills */}
            <div className="card p-4 space-y-3 border border-slate-200 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Scan barcode or type medication name / generic formula..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="pl-10 text-xs sm:text-sm py-2.5 rounded-xl border-slate-300"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {loadingCatalog ? (
                <div className="col-span-2 py-20 text-center text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto" />
                  <p className="text-xs font-bold mt-2">Loading dispensary catalog...</p>
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
                      onClick={() => !isOutOfStock && addToCart(med)}
                      className={`card p-4 flex flex-col justify-between border transition-all text-left ${
                        isOutOfStock
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                          : 'cursor-pointer hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 bg-white'
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
                          <span className="text-[10px] font-bold text-slate-400">{med.category}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm truncate leading-snug">
                          {med.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{med.genericName}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-base font-black text-slate-900">
                          ₹{med.sellingPrice?.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-slate-200 text-slate-600'
                              : med.quantity <= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : `${med.quantity} left`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side (45% width): Dynamic Invoice Bill Builder */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-5 space-y-4 border border-slate-200 shadow-md bg-white">
              {/* Customer Selector */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Billed Patient / Customer:</span>
                  <button
                    type="button"
                    onClick={() => setCustomer({ id: '', name: 'Walk-in Patient', phone: '' })}
                    className="text-[10px] text-emerald-700 hover:underline font-bold"
                  >
                    Set as Walk-in
                  </button>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search customer by name or mobile..."
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
                  <div className="absolute top-full left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {customerSuggestions.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setCustomer({ id: c._id, name: c.name, phone: c.phone });
                          setCustomerQuery('');
                          setShowCustomerDropdown(false);
                        }}
                        className="p-2.5 text-xs hover:bg-emerald-50 cursor-pointer flex justify-between"
                      >
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-slate-400">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Billed Items ({cart.length})
                  </span>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 space-y-1">
                    <ShoppingCart className="w-8 h-8 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Cart is empty</p>
                    <p className="text-[10px] text-slate-400">Click any product on the left to add</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.medicine}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.medicineName}</p>
                          <p className="text-[10px] text-slate-400">₹{item.unitPrice.toFixed(2)} each</p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.medicine, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.medicine, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-black text-slate-900 text-xs w-14 text-right">
                          ₹{item.totalPrice.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.medicine)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Discount & Tax Selectors */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Discount %</label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="text-xs py-1.5 rounded-xl font-bold"
                  >
                    <option value={0}>0% No Discount</option>
                    <option value={5}>5% Customer Discount</option>
                    <option value={10}>10% Special Discount</option>
                    <option value={15}>15% Senior / Staff</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Tax / GST %</label>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="text-xs py-1.5 rounded-xl font-bold"
                  >
                    <option value={0}>0% Exempt</option>
                    <option value={5}>5% Standard GST</option>
                    <option value={12}>12% Medical GST</option>
                    <option value={18}>18% High GST</option>
                  </select>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Payment Mode</label>
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
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === m.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grand Total Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-cyan-400 font-semibold">
                    <span>Tax ({taxPercent}%)</span>
                    <span>+₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-slate-200">Total Payable:</span>
                  <span className="font-black text-2xl text-emerald-400">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {errorNotice && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorNotice}
                </div>
              )}

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0}
                className="btn-primary w-full py-3 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processing Sale...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>Complete Bill & Generate Invoice →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prescription Matching Queue */}
      {activeTab === 'prescriptions' && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Verified Prescriptions Ready for POS</h3>
              <p className="text-xs text-slate-400">Load verified doctor prescriptions directly into the POS bill cart with 1 click</p>
            </div>
            <span className="badge badge-success text-xs">Verified Queue</span>
          </div>

          {pendingPrescriptions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Pending Verified Prescriptions</p>
              <p className="text-xs">All approved patient prescriptions have been dispensed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPrescriptions.map((rx) => (
                <div key={rx._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        Prescription #{rx._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="badge badge-success text-[10px]">Verified</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Patient: <strong className="text-slate-800">{rx.customer?.name}</strong> • Doctor: {rx.doctorName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Items: {rx.prescribedMedicines?.map((m) => m.medicineName).join(', ') || 'Medications'}
                    </p>
                  </div>

                  <Link
                    to={`/billing?prescriptionId=${rx._id}`}
                    onClick={() => setActiveTab('pos')}
                    className="btn-primary text-xs px-4 py-2 rounded-xl font-bold shadow-xs whitespace-nowrap self-start sm:self-auto"
                  >
                    <span>Load into POS Cart →</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recent Invoices */}
      {activeTab === 'invoices' && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Today's Sales & POS Invoices</h3>
              <p className="text-xs text-slate-400">View and reprint customer tax receipts</p>
            </div>
            <Link to="/sales" className="text-xs font-bold text-emerald-700 hover:underline">
              View All History →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total Amount</th>
                  <th>Date / Time</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                        {sale.invoiceId}
                      </span>
                    </td>
                    <td className="font-bold text-slate-900 text-xs">
                      {sale.customer?.name || sale.customerName}
                    </td>
                    <td>
                      <span className="badge badge-info text-[10px]">{sale.paymentMethod}</span>
                    </td>
                    <td className="font-black text-slate-900 text-sm">
                      ₹{sale.totalAmount?.toFixed(2)}
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(sale.date).toLocaleTimeString()}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setCompletedSale(sale)}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        Print Receipt 🖨️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 no-print">
              <div>
                <h3 className="font-black text-lg text-slate-900">Sales Invoice Created</h3>
                <p className="text-xs text-emerald-600 font-bold">Transaction Successfully Completed</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="btn-primary text-xs px-3 py-1.5 rounded-xl font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={handleNewSale}
                  className="btn-secondary text-xs px-3 py-1.5 rounded-xl font-bold"
                >
                  + New Sale
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div ref={printRef} className="space-y-5 p-2 text-slate-800 text-xs">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-black text-emerald-700">PharmaCare</h2>
                <p className="text-[11px] text-slate-400">Enterprise Smart Pharmacy • Lic: TN/PH/2026/089</p>
                <p className="font-mono text-xs font-bold text-emerald-600 mt-2">{completedSale.invoiceId}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(completedSale.date).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Customer</span>
                  <p className="font-bold text-slate-900">{completedSale.customer?.name || completedSale.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Payment Mode</span>
                  <p className="font-bold text-slate-900">{completedSale.paymentMethod} (PAID)</p>
                </div>
              </div>

              <table className="text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedSale.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{it.medicineName}</td>
                      <td className="text-right">{it.quantity}</td>
                      <td className="text-right">₹{it.unitPrice?.toFixed(2)}</td>
                      <td className="text-right font-bold">₹{it.totalPrice?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-3 space-y-1 text-xs max-w-xs ml-auto">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{completedSale.subtotal?.toFixed(2)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({completedSale.discount}%)</span>
                    <span>-₹{((completedSale.subtotal * completedSale.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-emerald-700">₹{completedSale.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t">
                Thank you for choosing PharmaCare. Wish you a swift recovery! 💊
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
