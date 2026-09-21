import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerCart } from '../../context/CustomerCartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SoundFX from '../../utils/SoundFX';

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
      setOrderError('Please link an approved verified prescription for the prescription-required items.');
      return;
    }

    if (!shippingAddress.addressLine?.trim()) {
      setOrderError('Please provide a delivery street address.');
      return;
    }

    setSubmitting(true);
    SoundFX.playClick();
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
      SoundFX.playSuccess();
      setSuccessOrder(res.data.data);
      clearCart();
    } catch (err) {
      console.error('Checkout failed:', err);
      setOrderError(err.response?.data?.message || 'Checkout failed. Please review your cart.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in no-print">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-void-950/80 backdrop-blur-md transition-opacity"
        onClick={() => {
          SoundFX.playClick();
          closeCart();
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-void-900 border-l border-emerald-500/30 shadow-glass-lg flex flex-col h-full text-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-void-950/90">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan flex items-center justify-center text-void-950 font-black text-lg shadow-glow-emerald">
                🛒
              </div>
              <div>
                <h2 className="text-base font-black text-white leading-none">Your Dispensary Bag</h2>
                <p className="text-xs text-cyber-emerald font-mono mt-1">
                  {cartCount} item{cartCount === 1 ? '' : 's'} staged for dispatch
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                SoundFX.playClick();
                closeCart();
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          {/* Success Screen after Order */}
          {successOrder ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 flex items-center justify-center text-3xl shadow-glow-emerald animate-bounce">
                ✓
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-emerald bg-emerald-950 px-3 py-1 rounded-full border border-cyber-emerald/40">
                  Payment Verified & Placed
                </span>
                <h3 className="text-xl font-black text-white mt-3">Dispensary Order Confirmed!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Your medicine package is being prepared by licensed pharmacists for cold-chain delivery.
                </p>
              </div>

              <div className="w-full bg-void-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Invoice Number:</span>
                  <span className="font-mono font-bold text-cyber-emerald">{successOrder.invoiceId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="font-extrabold text-white text-sm">₹{successOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Payment Mode:</span>
                  <span className="font-semibold text-cyber-cyan">{successOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery To:</span>
                  <span className="font-medium text-slate-200 max-w-[200px] text-right truncate">
                    {shippingAddress.addressLine}, {shippingAddress.city}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full pt-4">
                <Link
                  to="/customer/purchases"
                  onClick={() => {
                    SoundFX.playClick();
                    closeCart();
                  }}
                  className="btn-primary w-full py-3 rounded-xl font-bold text-xs shadow-glow-emerald text-center"
                >
                  View Invoice & Thermal Receipts 🧾
                </Link>
                <button
                  onClick={() => {
                    SoundFX.playClick();
                    setSuccessOrder(null);
                    closeCart();
                  }}
                  className="btn-secondary w-full py-3 rounded-xl font-bold text-xs"
                >
                  Continue Shopping 🛍️
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Empty State */}
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <span className="text-5xl block text-slate-600">💊</span>
                    <h3 className="font-extrabold text-white text-base">Your Bag is Empty</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Explore our dispensary catalog to order everyday OTC essentials or upload a prescription for Schedule H drugs.
                    </p>
                    <Link
                      to="/customer/store"
                      onClick={() => {
                        SoundFX.playClick();
                        closeCart();
                      }}
                      className="inline-block mt-2 btn-primary text-xs px-5 py-2.5 rounded-xl font-bold"
                    >
                      Browse Medicine Store 🔍
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Cart Items List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                          Selected Medications
                        </span>
                        <button
                          onClick={() => {
                            SoundFX.playClick();
                            clearCart();
                          }}
                          className="text-[11px] font-mono text-rose-400 hover:underline"
                        >
                          Clear Bag
                        </button>
                      </div>

                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-void-950 shadow-md">
                        {cartItems.map((item) => {
                          const isRx =
                            item.requiresPrescription === true ||
                            ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(item.scheduleType);

                          return (
                            <div key={item._id} className="p-3.5 flex items-start gap-3 hover:bg-slate-900/40">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                                  {isRx ? (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40">
                                      Rx Required
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-cyber-emerald border border-cyber-emerald/40">
                                      OTC
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                                  {item.genericName || item.dosageForm} • ₹{item.sellingPrice?.toFixed(2)} each
                                </p>

                                {/* Stepper & Subtotal */}
                                <div className="flex items-center justify-between mt-2.5">
                                  <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        SoundFX.playClick();
                                        updateQuantity(item._id, -1);
                                      }}
                                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-white font-mono">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        SoundFX.playClick();
                                        updateQuantity(item._id, 1);
                                      }}
                                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-black text-sm text-cyber-emerald font-mono">
                                      ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        SoundFX.playClick();
                                        removeFromCart(item._id);
                                      }}
                                      className="text-slate-500 hover:text-rose-400 text-xs transition-colors"
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

                    {/* Rx Verification Section */}
                    {hasRxItems ? (
                      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl">⚠️</span>
                          <div>
                            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide font-mono">
                              Schedule H Compliance Active
                            </h4>
                            <p className="text-[11px] text-amber-400 mt-0.5 leading-relaxed">
                              Schedule H medications require an authorized prescription for licensed dispensation.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-amber-500/20">
                          <label className="text-xs font-mono font-bold text-amber-300 mb-1 block">
                            Attach Verified Prescription:
                          </label>

                          {loadingPrescriptions ? (
                            <p className="text-xs text-amber-400 font-mono">Checking verified records...</p>
                          ) : verifiedPrescriptions.length === 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs text-rose-400 font-semibold bg-rose-950/80 p-2.5 rounded-xl border border-rose-500/40">
                                ❌ No verified prescriptions found on your account. Please upload your doctor's note first.
                              </p>
                              <Link
                                to="/customer/upload"
                                onClick={() => {
                                  SoundFX.playClick();
                                  closeCart();
                                }}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl btn-primary text-xs font-bold"
                              >
                                <span>📤 Upload Doctor's Prescription</span>
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <select
                                value={selectedPrescriptionId}
                                onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                                className="text-xs font-semibold"
                              >
                                {verifiedPrescriptions.map((rx) => (
                                  <option key={rx._id} value={rx._id}>
                                    Prescription #{rx._id.slice(-6).toUpperCase()} • {rx.doctorName || 'Doctor'} (Verified)
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center justify-between text-[11px] text-cyber-emerald font-mono font-bold">
                                <span>✓ Pharmacist clearance linked</span>
                                <Link
                                  to="/customer/upload"
                                  onClick={() => {
                                    SoundFX.playClick();
                                    closeCart();
                                  }}
                                  className="text-amber-400 hover:underline"
                                >
                                  + Upload New Rx
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-cyber-emerald/30 flex items-center gap-2.5 text-cyber-emerald">
                        <span className="text-lg">🟢</span>
                        <div className="text-xs">
                          <p className="font-bold">All items in cart are OTC (Over-The-Counter)</p>
                          <p className="text-slate-400 text-[11px]">
                            No prescription required. Instant dispatch upon checkout!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Delivery Address Form */}
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Delivery Coordinates
                      </span>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Street Address / Door No."
                          value={shippingAddress.addressLine}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, addressLine: e.target.value })
                          }
                          required
                          className="text-xs"
                        />
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
                        <input
                          type="tel"
                          placeholder="Contact Mobile Number"
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, phone: e.target.value })
                          }
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
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
                            onClick={() => {
                              SoundFX.playClick();
                              setPaymentMethod(m.id);
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                              paymentMethod === m.id
                                ? 'border-cyber-emerald bg-cyber-emerald/15 text-cyber-emerald shadow-glow-emerald font-black'
                                : 'border-slate-800 bg-void-950 text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            <span className="text-base">{m.icon}</span>
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-slate-800 pt-4 space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Medications Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-cyber-emerald">
                        <span>Online Auto-Discount (5%)</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Delivery & Packaging</span>
                        <span className="text-cyber-cyan font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between font-black text-base text-white border-t border-slate-800 pt-2">
                        <span>Total Payable</span>
                        <span className="text-cyber-emerald font-mono">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {orderError && (
                      <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                        {orderError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Checkout Button */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t border-slate-800 bg-void-950/95">
                  <button
                    onClick={handleCheckout}
                    disabled={submitting || (hasRxItems && !selectedPrescriptionId)}
                    className="btn-primary w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-glow-emerald disabled:opacity-40"
                  >
                    {submitting ? (
                      <span>Processing Order...</span>
                    ) : hasRxItems && !selectedPrescriptionId ? (
                      <span>Attach Prescription to Checkout</span>
                    ) : (
                      <span>Pay ₹{totalAmount.toFixed(2)} & Complete Order →</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
