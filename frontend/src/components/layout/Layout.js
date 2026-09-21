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
import SpatialDock from '../common/SpatialDock';
import TrailingCursor from '../common/TrailingCursor';
import SoundFX from '../../utils/SoundFX';

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
        SoundFX.playClick();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    SoundFX.playClick();
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

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'pharmacist')
  );

  return (
    <div className="flex h-screen overflow-hidden cyber-grid-bg text-slate-100 relative">
      {/* Custom Trailing Glow Cursor */}
      <TrailingCursor />

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-void-950/80 backdrop-blur-md md:hidden"
        />
      )}

      {/* Left Collapsible Cyber Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 z-50 shrink-0 select-none bg-void-950/95 border-r border-emerald-500/20 backdrop-blur-2xl shadow-glass-lg ${
          mobileDrawerOpen
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl md:relative md:shadow-none'
            : `hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'}`
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
          <Link
            to="/dashboard"
            onClick={() => SoundFX.playClick()}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan flex items-center justify-center text-void-950 font-black text-xl shadow-glow-emerald shrink-0 group-hover:scale-105 transition-transform">
              Rx
            </div>
            {(sidebarOpen || mobileDrawerOpen) && (
              <div className="overflow-hidden">
                <p className="text-white font-black text-base tracking-tight leading-none group-hover:text-cyber-emerald transition-colors">
                  PharmaCare
                </p>
                <p className="text-cyber-emerald text-[10px] font-mono font-bold uppercase tracking-widest mt-1">
                  Dispensary Suite
                </p>
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

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {filteredNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                SoundFX.playClick();
                setMobileDrawerOpen(false);
              }}
              title={!sidebarOpen && !mobileDrawerOpen ? label : ''}
              className={({ isActive }) =>
                `relative flex items-center gap-3.5 px-3.5 py-3 text-xs font-bold rounded-xl transition-all ${
                  isActive
                    ? 'bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40 shadow-glow-emerald'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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

        {/* Dedicated Sidebar User Profile & Permanent Logout */}
        <div className="p-3 border-t border-slate-800 bg-void-950">
          {sidebarOpen || mobileDrawerOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-cyber-emerald/20 border border-cyber-emerald/40 text-cyber-emerald flex items-center justify-center font-bold text-sm shrink-0 shadow-glow-emerald">
                  {user?.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate leading-tight">{user?.name}</p>
                  <p className="text-cyber-emerald text-[10px] font-mono font-semibold truncate capitalize">
                    {isAdmin ? 'System Admin' : 'Chief Pharmacist'}
                  </p>
                </div>
              </div>

              {/* Sidebar Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 transition-all shadow-glow-crimson"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Log Out"
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 transition-colors shadow-glow-crimson"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Layout Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar Header */}
        <header className="bg-void-900/85 border-b border-emerald-500/20 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shrink-0 shadow-glass-lg backdrop-blur-2xl z-20">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                SoundFX.playClick();
                setCommandPaletteOpen(true);
              }}
              className="flex-1 hidden sm:flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-void-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-cyber-emerald/40 text-slate-400 text-xs font-semibold transition-all"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyber-emerald" />
                <span>Search medicines, nodes, or actions...</span>
              </span>
              <kbd className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-cyber-cyan bg-slate-800 rounded-md border border-slate-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/billing"
              onClick={() => SoundFX.playClick()}
              className="btn-primary text-xs px-3.5 py-2 rounded-xl font-bold whitespace-nowrap hidden sm:inline-flex"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Holo POS</span>
            </Link>

            {/* Notifications Bell */}
            <button
              onClick={() => {
                SoundFX.playClick();
                setNotificationsOpen(true);
              }}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="System Alerts & Warnings"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-glow-crimson" />
            </button>

            <button
              onClick={() => {
                SoundFX.playClick();
                setHowItWorksOpen(true);
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
              title="Learn system workflows"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyber-emerald" />
              <span>Guide</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-cyber-emerald/20 border border-cyber-emerald/40 text-cyber-emerald flex items-center justify-center font-black text-xs shadow-glow-emerald">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
                <span
                  className={`inline-block text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                    isAdmin
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                      : 'bg-emerald-950/80 text-cyber-emerald border border-cyber-emerald/40'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Pharmacist'}
                </span>
              </div>
            </div>

            {/* TOPBAR PROMINENT LOG OUT BUTTON */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all shadow-glow-crimson ml-1"
              title="Log Out of PharmaCare"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32">
          <Outlet />
        </main>
      </div>

      {/* Spatial Floating Dock for Staff */}
      <SpatialDock mode="staff" />

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
