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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomerCartProvider, useCustomerCart } from '../../context/CustomerCartContext';
import CustomerCartDrawer from './CustomerCartDrawer';
import HowItWorksModal from '../common/HowItWorksModal';

function CustomerLayoutInner() {
  const { user, logout } = useAuth();
  const { cartCount, openCart } = useCustomerCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const handleLogout = () => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link to="/customer/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-glow-emerald shrink-0">
                Rx
              </div>
              <div>
                <span className="text-slate-900 font-black text-lg tracking-tight">PharmaCare</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Patient Care
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-extrabold border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Desktop Cart, User & Prominent Logout */}
            <div className="hidden md:flex items-center gap-3">
              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                className="relative px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-2 font-bold text-xs transition-all shadow-2xs"
                title="View shopping bag"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-emerald-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-black animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setHowItWorksOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="How it works"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 leading-none">Verified Patient</p>
                </div>
              </div>

              {/* PROMINENT LOGOUT BUTTON IN CUSTOMER PORTAL */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all shadow-2xs"
                title="Log Out of Customer Portal"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Mobile Header Actions */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={openCart}
                className="relative p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-xl animate-fade-in">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 ${
                    isActive ? 'bg-emerald-50 text-emerald-800 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-emerald-600" />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{user?.name}</span>
              {/* MOBILE LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Slide-out Cart Drawer */}
      <CustomerCartDrawer />

      {/* Customer Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 PharmaCare Smart Pharmacy • Licensed Pharmacy Operations & AI Clinical Services</p>
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
