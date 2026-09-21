import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  FileText,
  ShoppingCart,
  Receipt,
  Users,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Settings,
  LogOut,
  Bell,
  Search,
  PlusCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import HowItWorksModal from '../common/HowItWorksModal';
import CommandPalette from '../common/CommandPalette';
import NotificationsDrawer from '../common/NotificationsDrawer';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'pharmacist'] },
    { to: '/medicines', icon: Pill, label: 'Drug Inventory', roles: ['admin', 'pharmacist'] },
    { to: '/prescriptions', icon: FileText, label: 'Prescriptions & OCR', roles: ['admin', 'pharmacist'] },
    { to: '/billing', icon: ShoppingCart, label: 'Billing & POS', roles: ['admin', 'pharmacist'] },
    { to: '/sales', icon: Receipt, label: 'Sales History', roles: ['admin', 'pharmacist'] },
    { to: '/customers', icon: Users, label: 'Patients & Customers', roles: ['admin', 'pharmacist'] },
    { to: '/pharmacists', icon: UserCheck, label: 'Staff & Pharmacists', roles: ['admin'] },
    { to: '/reports', icon: TrendingUp, label: 'Reports & Analytics', roles: ['admin', 'pharmacist'] },
    { to: '/ai-audit', icon: ShieldCheck, label: 'AI Fairness Audit', roles: ['admin', 'pharmacist'] },
    { to: '/settings', icon: Settings, label: 'System Settings', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role || 'pharmacist')
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Left Collapsible Sidebar */}
      <aside
        className={`sidebar flex flex-col transition-all duration-300 z-50 shrink-0 select-none ${
          mobileDrawerOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl md:relative md:shadow-none'
            : `hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'}`
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-glow-emerald shrink-0">
              Rx
            </div>
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="overflow-hidden">
                <p className="text-white font-black text-base tracking-tight leading-none">PharmaCare</p>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1">Enterprise Royal</p>
              </div>
            )}
          </Link>
          {mobileDrawerOpen && (
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="text-slate-400 hover:text-white md:hidden text-lg p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {filteredNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileDrawerOpen(false)}
              title={!sidebarOpen && !mobileDrawerOpen ? label : ''}
              className={({ isActive }) =>
                `sidebar-link flex items-center gap-3.5 px-3.5 py-3 text-xs font-semibold ${
                  isActive ? 'active' : ''
                } ${!sidebarOpen && !mobileDrawerOpen ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
              {(sidebarOpen || mobileDrawerOpen) && (
                <span className="truncate">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Dedicated Sidebar Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {sidebarOpen || mobileDrawerOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {user?.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate leading-tight">{user?.name}</p>
                  <p className="text-emerald-400 text-[10px] font-semibold truncate capitalize">
                    {isAdmin ? 'System Administrator' : 'Chief Pharmacist'}
                  </p>
                </div>
              </div>

              {/* Sidebar Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Log Out"
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Layout Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Enterprise Topbar Header */}
        <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shrink-0 shadow-xs z-20">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
            {/* Mobile Navigation Trigger */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse / Expand */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Command Palette Trigger Search Box */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex-1 hidden sm:flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-slate-400 text-xs font-semibold transition-all hover:border-slate-300"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search medicines, patients, or actions...</span>
              </span>
              <kbd className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-white rounded-md border border-slate-200 shadow-2xs">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick "+ New Sale" Button */}
            <Link
              to="/billing"
              className="btn-primary text-xs px-3.5 py-2 rounded-xl font-bold shadow-xs whitespace-nowrap hidden sm:inline-flex"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Sale (POS)</span>
            </Link>

            {/* Notifications Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="System Alerts & Warnings"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {/* How It Works Guide */}
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Learn system workflows"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guide</span>
            </button>

            {/* User Profile Card */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">{user?.name}</p>
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isAdmin ? 'Admin' : 'Pharmacist'}
                </span>
              </div>
            </div>

            {/* TOPBAR PROMINENT LOG OUT BUTTON */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all shadow-2xs ml-1"
              title="Log Out of PharmaCare"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Spacious Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Global Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Workflow Guide Modal */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />
    </div>
  );
}
