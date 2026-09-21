import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HowItWorksModal from '../common/HowItWorksModal';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/customer/prescriptions', label: 'My Prescriptions', icon: '📋' },
    { to: '/customer/upload', label: 'Upload Prescription', icon: '📤' },
    { to: '/customer/purchases', label: 'My Purchases', icon: '🧾' },
    { to: '/customer/profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/customer/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
                Rx
              </div>
              <div>
                <span className="text-slate-900 font-extrabold text-lg tracking-tight">PharmaCare</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Customer Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Customer User Info & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setHowItWorksOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Learn how prescription verification works"
              >
                <span>💡</span>
                <span>How It Works</span>
              </button>

              <div className="flex items-center gap-2 text-right border-l border-slate-200 pl-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
                  <p className="text-xs text-slate-400 leading-none">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                Log Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fade-in">
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${
                    isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Log Out ↪
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Portal Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Customer Portal Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>© 2026 PharmaCare Smart Pharmacy • Licensed Pharmacy Operations & AI-Assisted Patient Services</p>
      </footer>

      {/* Guide Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </div>
  );
}
