import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerCart } from '../../context/CustomerCartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CustomerCartDrawer() {
  const {
    cartItems,
    cartCount,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    hasRxItems,
    rxMedicines,
  } = useCustomerCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [verifiedPrescriptions, setVerifiedPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine: user?.address || '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Fetch verified prescriptions whenever drawer opens and there are Rx items
  useEffect(() => {
    if (isCartOpen && hasRxItems) {
      const fetchVerified = async () => {
        setLoadingPrescriptions(true);
        try {
          const res = await api.get('/customer/prescriptions/verified');
          const data = res.data.data || [];
          setVerifiedPrescriptions(data);
          if (data.length > 0 && !selectedPrescriptionId) {
            setSelectedPrescriptionId(data[0]._id);
          }
        } catch (err) {
          console.error('Error fetching verified prescriptions:', err);
        } finally {
          setLoadingPrescriptions(false);
        }
      };
      fetchVerified();
    }
  }, [isCartOpen, hasRxItems]);

  if (!isCartOpen) return null;

  const discountAmount = Number(((subtotal * 5) / 100).toFixed(2));
  const totalAmount = Number((subtotal - discountAmount).toFixed(2));

  const handleCheckout = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    if (hasRxItems && !selectedPrescriptionId) {
      setOrderError(
        'Please link an approved verified prescription for the prescription-required items.'
      );
      return;
    }

    if (!shippingAddress.addressLine?.trim()) {
      setOrderError('Please provide a delivery street address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          medicineId: item._id,
          quantity: item.quantity,
        })),
        paymentMethod,
        shippingAddress,
        prescriptionId: hasRxItems ? selectedPrescriptionId : undefined,
      };

      const res = await api.post('/customer/orders/checkout', payload);
      setSuccessOrder(res.data.data);
      clearCart();
    } catch (err) {
      console.error('Checkout failed:', err);
      setOrderError(
        err.response?.data?.message || 'Checkout failed. Please review your cart and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                🛒
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-none">Your Pharmacy Cart</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {cartCount} item{cartCount === 1 ? '' : 's'} in bag
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          {/* Success Screen after Order */}
          {successOrder ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl animate-bounce">
                ✓
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Verified & Placed
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-3">Order Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Your medicine package is being packed by licensed pharmacists for express delivery.
                </p>
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 font-semibold">Invoice Number:</span>
                  <span className="font-mono font-bold text-teal-700">{successOrder.invoiceId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 font-semibold">Total Paid:</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹{successOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500 font-semibold">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{successOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Delivery To:</span>
                  <span className="font-medium text-slate-700 max-w-[200px] text-right truncate">
                    {shippingAddress.addressLine}, {shippingAddress.city}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full pt-4">
                <Link
                  to="/customer/purchases"
                  onClick={closeCart}
                  className="btn-primary w-full py-2.5 rounded-xl font-bold text-xs"
                >
                  View Invoice & Receipts 🧾
                </Link>
                <button
                  onClick={() => {
                    setSuccessOrder(null);
                    closeCart();
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Continue Shopping 🛍️
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Empty State */}
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <span className="text-5xl block text-slate-300">💊</span>
                    <h3 className="font-extrabold text-slate-800 text-base">Your Cart is Empty</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Explore our catalog to purchase everyday OTC essentials or upload a prescription for Schedule H drugs.
                    </p>
                    <Link
                      to="/customer/store"
                      onClick={closeCart}
                      className="inline-block mt-2 btn-primary text-xs px-5 py-2.5 rounded-xl font-bold"
                    >
                      Browse Medicines Store 🔍
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Selected Medications
                        </span>
                        <button
                          onClick={clearCart}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        {cartItems.map((item) => {
                          const isRx =
                            item.requiresPrescription === true ||
                            ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(item.scheduleType);

                          return (
                            <div key={item._id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/50">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-sm text-slate-900 truncate">
                                    {item.name}
                                  </h4>
                                  {isRx ? (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                      Rx Required
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      OTC
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {item.genericName || item.dosageForm} • ₹{item.sellingPrice?.toFixed(2)} each
                                </p>

                                {/* Stepper & Subtotal */}
                                <div className="flex items-center justify-between mt-2.5">
                                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item._id, -1)}
                                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item._id, 1)}
                                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs font-bold"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-extrabold text-sm text-slate-900">
                                      ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(item._id)}
                                      className="text-slate-400 hover:text-rose-500 text-xs transition-colors"
                                      title="Remove item"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prescription Verification Compliance Panel */}
                    {hasRxItems ? (
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl">⚠️</span>
                          <div>
                            <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                              Prescription Required (Schedule H Compliance)
                            </h4>
                            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                              By Indian Drug Regulations, Schedule H medicines cannot be dispensed without a verified doctor's prescription.
                            </p>
                          </div>
                        </div>

                        {/* List of flagged Rx drugs */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {rxMedicines.map((m) => (
                            <span
                              key={m._id}
                              className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 border border-amber-300/50"
                            >
                              💊 {m.name}
                            </span>
                          ))}
                        </div>

                        {/* Prescription Selector */}
                        <div className="pt-2 border-t border-amber-200/60">
                          <label className="text-xs font-bold text-amber-900 mb-1 block">
                            Attach Verified Doctor's Prescription:
                          </label>

                          {loadingPrescriptions ? (
                            <p className="text-xs text-amber-700">Checking verified prescriptions...</p>
                          ) : verifiedPrescriptions.length === 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                                ❌ No verified prescriptions found on your account. You must upload your doctor's prescription first.
                              </p>
                              <Link
                                to="/customer/upload"
                                onClick={closeCart}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
                              >
                                <span>📤 Upload Doctor's Prescription</span>
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <select
                                value={selectedPrescriptionId}
                                onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                                className="text-xs font-semibold bg-white border-amber-300 text-slate-800"
                              >
                                {verifiedPrescriptions.map((rx) => (
                                  <option key={rx._id} value={rx._id}>
                                    Prescription #{rx._id.slice(-6).toUpperCase()} • {rx.doctorName || 'Doctor'} (Verified)
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                                <span className="flex items-center gap-1">
                                  <span>✓</span>
                                  <span>Pharmacist approval verified</span>
                                </span>
                                <Link
                                  to="/customer/upload"
                                  onClick={closeCart}
                                  className="text-amber-800 hover:underline font-bold"
                                >
                                  + Upload New Rx
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800">
                        <span className="text-lg">🟢</span>
                        <div className="text-xs">
                          <p className="font-bold">All items in cart are OTC (Over-The-Counter)</p>
                          <p className="text-emerald-600 text-[11px]">
                            No prescription required. Instant dispatch upon checkout!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Delivery Address Form */}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Delivery Address
                      </span>

                      <div className="space-y-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Flat / House / Street Address"
                            value={shippingAddress.addressLine}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, addressLine: e.target.value })
                            }
                            required
                            className="text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, city: e.target.value })
                            }
                            className="text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Pincode"
                            value={shippingAddress.pincode}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, pincode: e.target.value })
                            }
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Recipient Contact Phone"
                            value={shippingAddress.phone}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, phone: e.target.value })
                            }
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Payment Method
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'UPI', label: 'UPI / QR', icon: '📱' },
                          { id: 'Card', label: 'Card', icon: '💳' },
                          { id: 'Cash', label: 'Cash / COD', icon: '💵' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                              paymentMethod === m.id
                                ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-base">{m.icon}</span>
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Order Price Breakdown */}
                    <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Medicines Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Digital Pharmacy Discount (5% OFF)</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Pharmacist Dispensing Review</span>
                        <span className="text-teal-700 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Express Delivery</span>
                        <span className="text-teal-700 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between font-black text-base text-slate-900 border-t border-slate-200 pt-2">
                        <span>Total Payable</span>
                        <span className="text-teal-700 font-black">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Error Notice */}
                    {orderError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {orderError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Footer Checkout Button */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/80">
                  <button
                    onClick={handleCheckout}
                    disabled={submitting || (hasRxItems && !selectedPrescriptionId)}
                    className={`btn-primary w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md ${
                      hasRxItems && !selectedPrescriptionId
                        ? 'opacity-50 cursor-not-allowed bg-slate-400'
                        : ''
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Processing Order...</span>
                      </>
                    ) : hasRxItems && !selectedPrescriptionId ? (
                      <span>Upload / Select Prescription to Checkout</span>
                    ) : (
                      <span>Pay ₹{totalAmount.toFixed(2)} & Place Order →</span>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    🔒 Licensed Pharmacy Guarantee • 100% Genuine Certified Medications
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
