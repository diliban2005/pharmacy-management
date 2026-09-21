import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HowItWorksModal from '../common/HowItWorksModal';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: '⬡', label: 'Dashboard', roles: ['admin', 'pharmacist'] },
    { to: '/prescriptions', icon: '📋', label: 'Prescriptions', roles: ['admin', 'pharmacist'] },
    { to: '/medicines', icon: '💊', label: 'Medicines', roles: ['admin', 'pharmacist'] },
    { to: '/customers', icon: '👥', label: 'Customers', roles: ['admin', 'pharmacist'] },
    { to: '/billing', icon: '🧾', label: 'Billing', roles: ['admin', 'pharmacist'] },
    { to: '/sales', icon: '📊', label: 'Sales History', roles: ['admin', 'pharmacist'] },
    { to: '/pharmacists', icon: '🩺', label: 'Pharmacists', roles: ['admin'] },
    { to: '/reports', icon: '📈', label: 'Reports', roles: ['admin', 'pharmacist'] },
    { to: '/ai-audit', icon: '⚖️', label: 'AI Audit', roles: ['admin', 'pharmacist'] },
    { to: '/settings', icon: '⚙️', label: 'Settings', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'pharmacist')
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar flex flex-col transition-all duration-300 z-50 shrink-0 ${
          mobileDrawerOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl md:relative md:shadow-none'
            : `hidden md:flex ${sidebarOpen ? 'w-64' : 'w-16'}`
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md">
              Rx
            </div>
            {(sidebarOpen || mobileDrawerOpen) && (
              <div>
                <p className="text-white font-bold text-sm leading-tight tracking-tight">PharmaCare</p>
                <p className="text-teal-400 text-xs font-semibold">Smart Pharmacy</p>
              </div>
            )}
          </div>
          {mobileDrawerOpen && (
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="text-slate-400 hover:text-white md:hidden text-lg"
            >
              ✕
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
          {filteredNavItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileDrawerOpen(false)}
              className={({ isActive }) =>
                `sidebar-link flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive ? 'active' : ''
                }`
              }
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              {(sidebarOpen || mobileDrawerOpen) && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-slate-700">
          {sidebarOpen || mobileDrawerOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{user?.name}</p>
                <p className="text-slate-400 text-[10px] capitalize">
                  {isAdmin ? 'System Administrator' : 'Licensed Pharmacist'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="text-slate-400 hover:text-rose-400 text-xs p-1"
              >
                ↩
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Log Out"
              className="text-slate-400 hover:text-rose-400 w-full text-center text-sm py-1"
            >
              ↩
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Button */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden text-slate-600 hover:text-slate-900 text-xl p-1"
              aria-label="Toggle navigation drawer"
            >
              ☰
            </button>

            {/* Desktop Collapse Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:inline-block text-slate-500 hover:text-slate-800 text-sm p-1"
              title="Toggle sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>

            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
              {isAdmin ? 'Administrator Panel' : 'Pharmacist Dispensary Portal'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Learn how AI handwriting recognition and verification works"
            >
              <span>💡</span>
              <span className="hidden sm:inline">How It Works</span>
            </button>

            <span
              className={`badge text-xs font-bold ${
                isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
              }`}
            >
              {isAdmin ? '👑 Admin' : '💊 Pharmacist'}
            </span>
            <span className="text-slate-500 text-xs font-medium hidden sm:inline-block">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Guide Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </div>
  );
}
