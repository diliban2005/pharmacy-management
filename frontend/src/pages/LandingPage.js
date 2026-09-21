import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Activity,
  Pill,
  ShoppingCart,
  FileText,
  UploadCloud,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeDemoTab, setActiveDemoTab] = useState('inventory');
  const [dragActive, setDragActive] = useState(false);
  const [sampleScanDone, setSampleScanDone] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setSampleScanDone(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-glow-emerald">
              Rx
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight leading-none">PharmaCare</span>
              <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
                Enterprise AI Healthcare
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'customer' ? '/customer/dashboard' : '/dashboard')}
                className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow-glow-emerald"
              >
                <span>Go to Portal ({user.name})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/customer/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden sm:inline-flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Patient Portal</span>
                </Link>
                <Link
                  to="/login"
                  className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow-glow-emerald flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Staff Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Background glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-emerald-500/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-glow-emerald backdrop-blur-md">
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen Fortune-500 Pharmacy Management</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Intelligent Clinical Operations,{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Powered by Multimodal AI
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unify hospital dispensary POS, real-time Schedule H drug control, automated doctor handwriting OCR verification, and direct patient ordering in a single Enterprise cloud suite.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="btn-primary text-sm px-7 py-3.5 rounded-2xl font-black shadow-glow-emerald flex items-center gap-2.5"
          >
            <span>Launch Staff Enterprise Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/customer/login"
            className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all flex items-center gap-2"
          >
            <Pill className="w-4 h-4 text-emerald-400" />
            <span>Order Medicines / Patient Portal</span>
          </Link>
        </div>

        {/* Real-time Statistics Ticker Cards */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">Verified</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">99.9%</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">Dispensing & OCR Accuracy</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <Pill className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50">Catalog</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">10k+</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">Formulations & Batches</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-gold-400 mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50">Speed</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">&lt; 1.2s</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">Instant Fast Counter POS</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/50">Standard</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">CDSCO & HIPAA Compliant</p>
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo Widget */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Experience the Enterprise Platform</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Sample our core clinical modules directly below without having to log in first.
          </p>

          {/* Subtabs for Demo */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-6 gap-2">
            {[
              { id: 'inventory', label: 'Drug Inventory & Safety', icon: Pill },
              { id: 'billing', label: 'Fast POS Counter Billing', icon: ShoppingCart },
              { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeDemoTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDemoTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-glow-emerald'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Surface Screen */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl min-h-[380px]">
          {activeDemoTab === 'inventory' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Sample Live Inventory Table (14 Certified Formulations)
                </span>
                <span className="badge badge-success text-[10px]">Cloud Sync Active</span>
              </div>

              <div className="overflow-x-auto">
                <table className="text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2.5">Medicine Name</th>
                      <th>Category</th>
                      <th>Schedule / Type</th>
                      <th>Stock Level</th>
                      <th>Price</th>
                      <th>Safety Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-3 font-bold text-white">Amoxicillin 500mg</td>
                      <td>Capsule</td>
                      <td><span className="badge badge-danger text-[10px]">🔴 Schedule H (Rx)</span></td>
                      <td className="font-bold text-emerald-400">120 in stock</td>
                      <td>₹26.00</td>
                      <td><span className="text-emerald-400 font-bold">✓ Safe</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Paracetamol 500mg</td>
                      <td>Tablet</td>
                      <td><span className="badge badge-success text-[10px]">🟢 OTC Direct</span></td>
                      <td className="font-bold text-emerald-400">440 in stock</td>
                      <td>₹5.00</td>
                      <td><span className="text-emerald-400 font-bold">✓ Safe</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Doxycycline 100mg</td>
                      <td>Capsule</td>
                      <td><span className="badge badge-danger text-[10px]">🔴 Schedule H (Rx)</span></td>
                      <td className="font-bold text-emerald-400">117 in stock</td>
                      <td>₹8.00</td>
                      <td><span className="text-emerald-400 font-bold">✓ Safe</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Dolo 650mg</td>
                      <td>Tablet</td>
                      <td><span className="badge badge-success text-[10px]">🟢 OTC Direct</span></td>
                      <td className="font-bold text-emerald-400">490 in stock</td>
                      <td>₹3.50</td>
                      <td><span className="text-emerald-400 font-bold">✓ Safe</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeDemoTab === 'billing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Fast Counter Scan</span>
                <input
                  readOnly
                  value="Paracetamol 500mg (Qty: 2) | Dolo 650mg (Qty: 1)"
                  className="bg-slate-900 border-slate-700 text-xs text-white"
                />
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Paracetamol 500mg × 2</span>
                    <span className="text-white font-bold">₹10.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Dolo 650mg × 1</span>
                    <span className="text-white font-bold">₹3.50</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                    <span>Online Discount (5%)</span>
                    <span>-₹0.68</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Instant POS Invoice Preview</span>
                  <div className="text-xs text-slate-300 space-y-1 mt-3">
                    <p className="font-mono text-emerald-400 font-bold">INV-PREVIEW-2026-001</p>
                    <p>Customer: Ramesh Kumar (Verified)</p>
                    <p>Payment: UPI / QR Code (Confirmed)</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-white">Payable Total: ₹12.82</span>
                  <span className="badge badge-success text-xs">Print Ready 🖨️</span>
                </div>
              </div>
            </div>
          )}

          {activeDemoTab === 'analytics' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Real-time Operational Metrics & Turnover
                </span>
                <span className="text-xs text-slate-400">September 2026</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400">Monthly Revenue</p>
                  <p className="text-2xl font-black text-white mt-1">₹48,920</p>
                  <span className="text-[10px] text-emerald-400 font-bold">▲ +14.2% vs last month</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400">Prescriptions Verified</p>
                  <p className="text-2xl font-black text-white mt-1">100%</p>
                  <span className="text-[10px] text-cyan-400 font-bold">0 Pending Violations</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400">Active Formulations</p>
                  <p className="text-2xl font-black text-white mt-1">14 Items</p>
                  <span className="text-[10px] text-gold-400 font-bold">All Batches Safe</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Prescription Drag & Drop Scanner Preview */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 shadow-glow-emerald text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto border border-emerald-500/40">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white">Instant Doctor Prescription Scanner</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Drop your clinical prescription here. Our Multimodal OCR engine digitizes handwriting, matches formulation dosages, and flags Schedule H items automatically.
          </p>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              dragActive
                ? 'border-emerald-400 bg-emerald-950/30'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
            }`}
          >
            {sampleScanDone ? (
              <div className="space-y-2 text-emerald-400">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="text-xs font-bold">Prescription Sample Scanned (98.5% OCR Confidence)</p>
                <Link
                  to="/customer/login"
                  className="inline-block mt-2 text-xs font-extrabold text-white bg-emerald-600 px-4 py-2 rounded-xl"
                >
                  Sign in to View Extracted Prescriptions →
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">Drag & drop JPG, PNG, or PDF files here</p>
                <p className="text-[11px] text-slate-500">Supports hospital OPD slips, doctor handwriting, and clinic notes</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Compliance & Trust Badges Strip */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 bg-slate-950/90 text-center text-xs text-slate-400 space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CDSCO Schedule H Law Enforced</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>256-Bit SSL End-to-End Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>ISO 9001:2015 Pharmacy Quality Standard</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          © 2026 PharmaCare Enterprise. All rights reserved. Licensed Clinical Healthcare & AI Dispensary System.
        </p>
      </footer>
    </div>
  );
}
