import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Receipt, Printer, Sparkles, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import TiltCard from '../../components/common/TiltCard';
import SoundFX from '../../utils/SoundFX';

export default function CustomerPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data } = await api.get('/customer/purchases');
        setPurchases(data.data || []);
      } catch (err) {
        console.error('Error fetching customer purchases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald text-xs font-mono font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Patient Ledger & Thermal Invoices</span>
        </div>
        <h1 className="text-2xl font-black text-white">Purchase History & Invoices</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review previous dispensary orders, verified payment receipts, and printable clinical tax invoices.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyber-emerald border-t-transparent" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="cyber-card p-12 text-center text-slate-400 space-y-3">
          <Receipt className="w-14 h-14 mx-auto text-slate-600" />
          <p className="font-bold text-white text-base">No Invoices on Record</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once you order medications or pick up verified prescriptions, your official digital receipts will populate here.
          </p>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date & Time</th>
                  <th>Primary Medication</th>
                  <th>Payment Type</th>
                  <th>Total Amount</th>
                  <th>Receipt Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="font-mono text-xs font-bold text-cyber-emerald bg-cyber-emerald/10 border border-cyber-emerald/30 px-2 py-1 rounded-lg">
                        {p.invoiceId}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 font-mono">
                      {new Date(p.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="text-xs">
                        <span className="font-bold text-white">
                          {p.items?.[0]?.medicineName || 'Medication Package'}
                        </span>
                        {p.items?.length > 1 && (
                          <span className="text-slate-400 font-mono ml-1">
                            +{p.items.length - 1} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info text-[11px] font-mono">{p.paymentMethod}</span>
                    </td>
                    <td className="font-bold text-cyber-emerald font-mono text-sm">
                      ₹{p.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          SoundFX.playClick();
                          setSelectedInvoice(p);
                        }}
                        className="text-cyber-cyan hover:text-white font-bold text-xs hover:underline flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
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
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-void-950/80 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-void-900 border border-cyber-emerald/40 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-glass-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-black text-lg text-white">Official Tax Invoice</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="btn-primary text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-white text-lg p-1.5 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div ref={printRef} className="space-y-6 p-4 rounded-2xl bg-white text-slate-900 shadow-md">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-black text-emerald-800">PharmaCare</h2>
                <p className="text-xs text-slate-500">Smart AI Pharmacy & Clinical Dispensary</p>
                <p className="font-mono text-xs font-bold text-emerald-700 mt-2">{selectedInvoice.invoiceId}</p>
                <p className="text-xs text-slate-400">
                  {new Date(selectedInvoice.date).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid grid-cols-2 text-xs gap-4">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Billed To</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Payment Method</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.paymentMethod}</p>
                  <span className="badge badge-success text-[10px]">VERIFIED PAID</span>
                </div>
              </div>

              <table className="text-xs text-slate-900">
                <thead>
                  <tr className="border-b">
                    <th className="bg-slate-50 text-slate-700 py-2">Item</th>
                    <th className="bg-slate-50 text-slate-700 text-right py-2">Qty</th>
                    <th className="bg-slate-50 text-slate-700 text-right py-2">Price</th>
                    <th className="bg-slate-50 text-slate-700 text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="font-medium text-slate-800 py-2">{it.medicineName}</td>
                      <td className="text-right text-slate-800 py-2">{it.quantity}</td>
                      <td className="text-right text-slate-800 py-2">₹{it.unitPrice?.toFixed(2)}</td>
                      <td className="text-right font-bold text-slate-900 py-2">₹{it.totalPrice?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-3 space-y-1 text-xs max-w-xs ml-auto">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{selectedInvoice.subtotal?.toFixed(2)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Online Discount ({selectedInvoice.discount}%)</span>
                    <span>-₹{((selectedInvoice.subtotal * selectedInvoice.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-slate-950 border-t pt-2 mt-1">
                  <span>Total Paid</span>
                  <span className="text-emerald-800 font-mono">₹{selectedInvoice.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-4 border-t">
                Thank you for choosing PharmaCare. Wish you a swift recovery! 💊
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
