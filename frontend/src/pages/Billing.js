import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../services/api';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const prescriptionId = searchParams.get('prescriptionId');
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [medSearch, setMedSearch] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ id: searchParams.get('customerId') || '', name: searchParams.get('customerName') || '' });
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [error, setError] = useState('');
  const printRef = useRef();

  // Automatically load verified prescription if prescriptionId param is present
  useEffect(() => {
    if (prescriptionId) {
      api.get(`/prescriptions/${prescriptionId}`)
        .then(({ data }) => {
          const rx = data.data;
          setPrescriptionData(rx);
          if (rx.customer) {
            setCustomer({ id: rx.customer._id, name: rx.customer.name });
          }
          if (Array.isArray(rx.prescribedMedicines) && rx.prescribedMedicines.length > 0) {
            const rxItems = rx.prescribedMedicines.map((m) => {
              const med = m.medicine;
              const unitPrice = med?.sellingPrice || 10;
              const qty = m.quantity || 1;
              return {
                medicine: med?._id || m.medicine,
                medicineName: m.medicineName || med?.name || 'Medicine',
                quantity: qty,
                unitPrice: unitPrice,
                totalPrice: qty * unitPrice,
                maxQty: med?.quantity || 999,
              };
            });
            setCart(rxItems);
          }
        })
        .catch(console.error);
    }
  }, [prescriptionId]);

  const searchMedicines = useCallback(async () => {
    if (!medSearch.trim()) { setMedicines([]); return; }
    try {
      const { data } = await api.get('/medicines', { params: { search: medSearch } });
      setMedicines(data.data.filter(m => m.quantity > 0));
      setShowMedDropdown(true);
    } catch (err) { console.error(err); }
  }, [medSearch]);

  useEffect(() => {
    const t = setTimeout(searchMedicines, 300);
    return () => clearTimeout(t);
  }, [searchMedicines]);

  const searchCustomers = useCallback(async () => {
    if (!customerSearch.trim()) { setCustomers([]); return; }
    try {
      const { data } = await api.get('/customers', { params: { search: customerSearch } });
      setCustomers(data.data);
      setShowCustomerDropdown(true);
    } catch (err) { console.error(err); }
  }, [customerSearch]);

  useEffect(() => {
    const t = setTimeout(searchCustomers, 300);
    return () => clearTimeout(t);
  }, [searchCustomers]);

  const addToCart = (medicine) => {
    setCart(prev => {
      const existing = prev.find(i => i.medicine === medicine._id);
      if (existing) {
        if (existing.quantity >= medicine.quantity) { alert(`Only ${medicine.quantity} units available`); return prev; }
        return prev.map(i => i.medicine === medicine._id ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice } : i);
      }
      return [...prev, { medicine: medicine._id, medicineName: medicine.name, quantity: 1, unitPrice: medicine.sellingPrice, totalPrice: medicine.sellingPrice, maxQty: medicine.quantity }];
    });
    setMedSearch('');
    setShowMedDropdown(false);
  };

  const updateQty = (medicineId, qty) => {
    const item = cart.find(i => i.medicine === medicineId);
    if (qty < 1) { removeFromCart(medicineId); return; }
    if (qty > item.maxQty) { alert(`Only ${item.maxQty} available`); return; }
    setCart(prev => prev.map(i => i.medicine === medicineId ? { ...i, quantity: qty, totalPrice: qty * i.unitPrice } : i));
  };

  const removeFromCart = (medicineId) => setCart(prev => prev.filter(i => i.medicine !== medicineId));

  const subtotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxAmt = ((subtotal - discountAmt) * tax) / 100;
  const total = subtotal - discountAmt + taxAmt;

  const handleCheckout = async () => {
    if (cart.length === 0) { setError('Add at least one medicine to the cart'); return; }
    setError(''); setLoading(true);
    try {
      const payload = {
        items: cart.map(i => ({ medicine: i.medicine, quantity: i.quantity })),
        customer: customer.id || undefined,
        customerName: customer.name || 'Walk-in Customer',
        discount, tax, paymentMethod,
        prescription: prescriptionId || undefined,
      };
      const { data } = await api.post('/sales', payload);
      setCompletedSale(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale');
    } finally { setLoading(false); }
  };

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const handleNewSale = () => {
    setCompletedSale(null); setCart([]); setCustomer({ id: '', name: '' });
    setDiscount(0); setTax(0); setPaymentMethod('Cash'); setError('');
  };

  // --- Invoice view after successful sale ---
  if (completedSale) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="flex gap-3 mb-6 no-print">
          <button onClick={handlePrint} className="btn-primary px-5 py-2.5 rounded-lg font-semibold text-sm flex-1">🖨️ Print Invoice</button>
          <button onClick={handleNewSale} className="px-5 py-2.5 rounded-lg font-semibold text-sm border-2 border-teal-600 text-teal-600 hover:bg-teal-50 flex-1">+ New Sale</button>
        </div>

        <div ref={printRef} className="card p-8">
          <div className="print-only mb-6">
            <h1 className="text-2xl font-black text-teal-700">PharmaCare</h1>
            <p className="text-slate-500 text-sm">Pharmacy Management System</p>
          </div>
          <div className="text-center mb-6 border-b pb-6">
            <h2 className="text-xl font-black text-slate-800">SALES INVOICE</h2>
            <p className="font-mono text-teal-600 font-bold mt-1">{completedSale.invoiceId}</p>
            <p className="text-slate-400 text-sm">{new Date(completedSale.date).toLocaleString('en-IN')}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Customer</p>
              <p className="font-semibold">{completedSale.customer?.name || completedSale.customerName}</p>
              {completedSale.customer?.phone && <p className="text-slate-500">{completedSale.customer.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Payment</p>
              <p className="font-semibold">{completedSale.paymentMethod}</p>
              <span className="badge badge-success">Paid</span>
            </div>
          </div>

          <table className="mb-6">
            <thead><tr><th>Medicine</th><th className="text-right">Qty</th><th className="text-right">Unit Price</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {completedSale.items.map((item, i) => (
                <tr key={i}>
                  <td className="font-medium">{item.medicineName}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="text-right font-semibold">₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t pt-4 space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">₹{completedSale.subtotal.toFixed(2)}</span></div>
            {completedSale.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({completedSale.discount}%)</span><span>-₹{((completedSale.subtotal * completedSale.discount) / 100).toFixed(2)}</span></div>}
            {completedSale.tax > 0 && <div className="flex justify-between"><span className="text-slate-500">Tax ({completedSale.tax}%)</span><span>₹{(completedSale.totalAmount - completedSale.subtotal + (completedSale.subtotal * completedSale.discount / 100)).toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-black border-t pt-2"><span>TOTAL</span><span className="text-teal-600">₹{completedSale.totalAmount.toFixed(2)}</span></div>
          </div>

          <div className="text-center mt-8 text-slate-400 text-xs border-t pt-4">
            <p>Thank you for choosing PharmaCare!</p>
            <p>Get well soon 💊</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Billing / POS view ---
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="page-title">Billing & Point of Sale</h1>
          <p className="text-xs text-slate-500 mt-1">Dispense medications, calculate discounts and taxes, and generate invoices.</p>
        </div>
      </div>

      {prescriptionData && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between text-xs text-teal-900 shadow-sm">
          <div className="space-y-0.5">
            <span className="font-bold flex items-center gap-1.5 text-sm">
              <span>✓</span> Dispensing Verified Prescription #{prescriptionData._id?.slice(-6).toUpperCase()}
            </span>
            <p className="text-slate-600">
              Prescribed by: <strong>{prescriptionData.doctorName}</strong> • Verified medicines automatically loaded into cart.
            </p>
          </div>
          <span className="badge badge-success text-[10px]">VERIFIED RX</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Medicine search + cart */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer selection */}
          <div className="card p-5">
            <label className="section-title mb-3 block">Customer (Optional)</label>
            <div className="relative">
              <input
                value={customer.name || customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setCustomer({ id: '', name: '' }); }}
                placeholder="Search customer by name or phone..."
              />
              {showCustomerDropdown && customers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {customers.map(c => (
                    <button key={c._id} type="button" className="w-full text-left px-4 py-2.5 hover:bg-teal-50 text-sm"
                      onClick={() => { setCustomer({ id: c._id, name: c.name }); setCustomerSearch(''); setShowCustomerDropdown(false); }}>
                      <span className="font-semibold">{c.name}</span><span className="text-slate-400 ml-2">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {customer.name && (
              <div className="flex items-center gap-2 mt-2 bg-teal-50 rounded-lg px-3 py-2">
                <span className="text-teal-700 font-semibold text-sm">👤 {customer.name}</span>
                <button onClick={() => setCustomer({ id: '', name: '' })} className="text-slate-400 hover:text-red-500 ml-auto text-sm">✕</button>
              </div>
            )}
          </div>

          {/* Medicine search */}
          <div className="card p-5">
            <label className="section-title mb-3 block">Search & Add Medicines</label>
            <div className="relative">
              <input
                value={medSearch}
                onChange={e => { setMedSearch(e.target.value); if (!e.target.value) setShowMedDropdown(false); }}
                placeholder="Type medicine name to search..."
              />
              {showMedDropdown && medicines.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {medicines.map(m => (
                    <button key={m._id} type="button" onClick={() => addToCart(m)}
                      className="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-slate-50 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.category} · {m.manufacturer}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-bold text-teal-600 text-sm">₹{m.sellingPrice}</p>
                          <p className="text-xs text-slate-400">Stock: {m.quantity}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showMedDropdown && medicines.length === 0 && medSearch && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-slate-400 text-sm">No medicines found</div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="section-title">Cart</h2>
              {cart.length > 0 && <button onClick={() => setCart([])} className="text-red-400 text-xs hover:underline">Clear all</button>}
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-2">🛒</p>
                <p className="text-sm">Search and add medicines above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead><tr><th>Medicine</th><th>Unit Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.medicine}>
                        <td className="font-medium text-slate-800">{item.medicineName}</td>
                        <td>₹{item.unitPrice.toFixed(2)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(item.medicine, item.quantity - 1)} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-sm">−</button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQty(item.medicine, item.quantity + 1)} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-sm">+</button>
                          </div>
                        </td>
                        <td className="font-bold text-teal-600">₹{item.totalPrice.toFixed(2)}</td>
                        <td><button onClick={() => removeFromCart(item.medicine)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary & Checkout */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="section-title">Order Summary</h2>

            <div>
              <label>Discount (%)</label>
              <input type="number" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))} min={0} max={100} />
            </div>
            <div>
              <label>Tax (%)</label>
              <input type="number" value={tax} onChange={e => setTax(Math.min(100, Math.max(0, Number(e.target.value))))} min={0} max={100} />
            </div>
            <div>
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                {['Cash', 'Card', 'UPI', 'Insurance'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({discount}%)</span><span>-₹{discountAmt.toFixed(2)}</span></div>}
              {tax > 0 && <div className="flex justify-between"><span className="text-slate-500">Tax ({tax}%)</span><span>₹{taxAmt.toFixed(2)}</span></div>}
              <div className="flex justify-between text-lg font-black border-t pt-3 mt-2">
                <span>Total</span>
                <span className="text-teal-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">⚠️ {error}</div>}

            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `🧾 Complete Sale · ₹${total.toFixed(2)}`}
            </button>
          </div>

          {/* Items count */}
          <div className="card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Items in cart</span>
              <span className="font-bold text-slate-800">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-500">Unique medicines</span>
              <span className="font-bold text-slate-800">{cart.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
