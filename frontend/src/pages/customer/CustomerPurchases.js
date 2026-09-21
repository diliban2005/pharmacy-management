import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';

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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Purchase History & Invoices</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your previous medication orders, payments, and printable invoices.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 space-y-3">
          <span className="text-5xl block">🧾</span>
          <p className="font-bold text-slate-700 text-base">No Invoices Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once you purchase verified medications from our pharmacy, your invoices and payment receipts will be accessible here.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment Method</th>
                  <th>Total Amount</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">
                        {p.invoiceId}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(p.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">
                          {p.items?.[0]?.medicineName || 'Medication'}
                        </span>
                        {p.items?.length > 1 && (
                          <span className="text-slate-400 ml-1">+{p.items.length - 1} more</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info text-[11px]">{p.paymentMethod}</span>
                    </td>
                    <td className="font-bold text-slate-800 text-sm">₹{p.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="text-teal-600 hover:text-teal-800 font-bold text-xs hover:underline"
                      >
                        View Invoice 🖨️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-black text-lg text-slate-900">Sales Invoice</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="btn-primary text-xs px-3 py-1.5 rounded-xl font-bold"
                >
                  Print Receipt 🖨️
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg p-1 leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            <div ref={printRef} className="space-y-6 p-2 text-slate-800">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-black text-teal-700">PharmaCare</h2>
                <p className="text-xs text-slate-400">Smart Pharmacy Management System</p>
                <p className="font-mono text-xs font-bold text-teal-600 mt-2">{selectedInvoice.invoiceId}</p>
                <p className="text-xs text-slate-400">
                  {new Date(selectedInvoice.date).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid grid-cols-2 text-xs gap-4">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Billed To</p>
                  <p className="font-bold text-slate-800">{selectedInvoice.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Payment Method</p>
                  <p className="font-bold text-slate-800">{selectedInvoice.paymentMethod}</p>
                  <span className="badge badge-success text-[10px]">PAID</span>
                </div>
              </div>

              <table className="text-xs">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">{it.medicineName}</td>
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
                  <span>₹{selectedInvoice.subtotal?.toFixed(2)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedInvoice.discount}%)</span>
                    <span>-₹{((selectedInvoice.subtotal * selectedInvoice.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-slate-900 border-t pt-2 mt-1">
                  <span>Total Paid</span>
                  <span className="text-teal-700">₹{selectedInvoice.totalAmount?.toFixed(2)}</span>
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
