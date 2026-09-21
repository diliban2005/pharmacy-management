import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Pill,
  FileText,
  UploadCloud,
  Receipt,
  User,
  LogOut,
  ShoppingCart,
  Menu,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomerCartProvider, useCustomerCart } from '../../context/CustomerCartContext';
import CustomerCartDrawer from './CustomerCartDrawer';
import HowItWorksModal from '../common/HowItWorksModal';
import SpatialDock from '../common/SpatialDock';
import TrailingCursor from '../common/TrailingCursor';
import SoundFX from '../../utils/SoundFX';

function CustomerLayoutInner() {
  const { user, logout } = useAuth();
  const { cartCount, openCart } = useCustomerCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const handleLogout = () => {
    SoundFX.playClick();
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/customer/store', label: 'Order Medicines', icon: Pill },
    { to: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { to: '/customer/prescriptions', label: 'My Prescriptions', icon: FileText },
    { to: '/customer/upload', label: 'Upload Prescription', icon: UploadCloud },
    { to: '/customer/purchases', label: 'My Invoices', icon: Receipt },
    { to: '/customer/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen cyber-grid-bg flex flex-col text-slate-100 relative">
      {/* Custom Trailing Glow Cursor */}
      <TrailingCursor />

      {/* Top Navbar */}
      <header className="bg-void-900/85 border-b border-emerald-500/20 sticky top-0 z-30 shadow-glass-lg backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link
              to="/customer/dashboard"
              onClick={() => SoundFX.playClick()}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan flex items-center justify-center text-void-950 font-black text-xl shadow-glow-emerald shrink-0 group-hover:scale-105 transition-transform">
                Rx
              </div>
              <div>
                <span className="text-white font-black text-lg tracking-tight group-hover:text-cyber-emerald transition-colors">
                  PharmaCare
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30 font-mono">
                  Patient Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => SoundFX.playClick()}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-cyber-emerald/15 text-cyber-emerald shadow-glow-emerald font-extrabold border border-cyber-emerald/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-cyber-emerald" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Desktop Cart, User & Universal Prominent Logout */}
            <div className="hidden md:flex items-center gap-3">
              {/* Cart Drawer Trigger */}
              <button
                onClick={() => {
                  SoundFX.playClick();
                  openCart();
                }}
                className="relative px-3.5 py-2 rounded-xl bg-cyber-emerald/10 hover:bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/30 flex items-center gap-2 font-bold text-xs transition-all shadow-glow-emerald"
                title="View shopping bag"
              >
                <ShoppingCart className="w-4 h-4 text-cyber-emerald" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-cyber-emerald text-void-950 rounded-full px-1.5 py-0.2 text-[10px] font-black animate-pulse shadow-glow-emerald">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  SoundFX.playClick();
                  setHowItWorksOpen(true);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="How it works"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-700/60">
                <div className="w-8 h-8 rounded-full bg-cyber-emerald/20 border border-cyber-emerald/40 text-cyber-emerald flex items-center justify-center font-black text-xs shadow-glow-emerald">
                  {user?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[120px]">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-cyber-emerald/80 font-mono leading-none">Verified Patient</p>
                </div>
              </div>

              {/* UNIVERSAL PROMINENT LOGOUT BUTTON IN CUSTOMER PORTAL */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all shadow-glow-crimson"
                title="Log Out of Customer Portal"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Mobile Header Actions */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => {
                  SoundFX.playClick();
                  openCart();
                }}
                className="relative p-2 rounded-xl bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyber-emerald text-void-950 rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center shadow-glow-emerald">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 bg-void-950/95 px-4 pt-3 pb-5 space-y-1.5 shadow-2xl backdrop-blur-2xl animate-fade-in">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => {
                  SoundFX.playClick();
                  setMobileMenuOpen(false);
                }}
                className={({ isActive }) =>
                  `block px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 ${
                    isActive
                      ? 'bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30 font-extrabold'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-cyber-emerald" />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">{user?.name}</span>
              {/* MOBILE LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-500/40 hover:bg-rose-600 hover:text-white"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-32">
        <Outlet />
      </main>

      {/* Spatial Floating Dock for Customer Portal */}
      <SpatialDock mode="customer" />

      {/* Slide-out Cart Drawer */}
      <CustomerCartDrawer />

      {/* Customer Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-void-950/60">
        <p>© 2026 PharmaCare Cyber-Clinical System • Licensed Healthcare & Multimodal Vision Services</p>
      </footer>

      {/* Guide Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </div>
  );
}

export default function CustomerLayout() {
  return (
    <CustomerCartProvider>
      <CustomerLayoutInner />
    </CustomerCartProvider>
  );
}
