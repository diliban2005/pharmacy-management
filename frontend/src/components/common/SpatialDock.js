import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  FileScan,
  Settings,
  LogOut,
  Home,
  UploadCloud,
  FileText,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SoundFX from '../../utils/SoundFX';

export default function SpatialDock({ mode = 'staff' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const handleLogout = () => {
    SoundFX.playClick();
    logout();
    navigate(mode === 'customer' ? '/customer/login' : '/login');
  };

  const staffItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/medicines', label: 'Node Stock', icon: Pill },
    { to: '/billing', label: 'Holo POS', icon: ShoppingCart },
    { to: '/prescriptions', label: 'OCR Scanner', icon: FileScan },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const customerItems = [
    { to: '/customer/dashboard', label: 'Portal Home', icon: Home },
    { to: '/customer/store', label: 'Drug Store', icon: Pill },
    { to: '/customer/upload', label: 'Laser Rx Scan', icon: UploadCloud },
    { to: '/customer/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/customer/purchases', label: 'Invoices', icon: Receipt },
  ];

  const items = mode === 'customer' ? customerItems : staffItems;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 no-print">
      <nav
        className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-void-900/80 backdrop-blur-2xl border border-emerald-500/25 shadow-glass-lg shadow-emerald-500/10 transition-all duration-300"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isHovered = hoveredIdx === idx;
          const isNeighbor =
            hoveredIdx !== null && (hoveredIdx === idx - 1 || hoveredIdx === idx + 1);

          let scaleClass = 'scale-100';
          if (isHovered) scaleClass = 'scale-125 -translate-y-2';
          else if (isNeighbor) scaleClass = 'scale-110 -translate-y-1';

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => {
                setHoveredIdx(idx);
                SoundFX.playClick();
              }}
              className={({ isActive }) =>
                `relative group p-2.5 sm:p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${scaleClass} ${
                  isActive
                    ? 'bg-gradient-to-tr from-cyber-emerald/25 to-cyber-cyan/15 text-cyber-emerald border border-cyber-emerald/50 shadow-glow-emerald'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform" />

              {/* Floating Tooltip Label */}
              <span className="absolute -top-9 px-2.5 py-1 rounded-lg bg-void-950/95 border border-emerald-500/30 text-cyber-emerald text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyber-emerald opacity-0 group-[.active]:opacity-100 shadow-glow-emerald" />
            </NavLink>
          );
        })}

        {/* Separator Line */}
        <div className="w-px h-6 bg-slate-700/60 mx-1" />

        {/* Prominent Log Out Button in Spatial Dock */}
        <button
          onClick={handleLogout}
          onMouseEnter={() => {
            setHoveredIdx(items.length);
            SoundFX.playClick();
          }}
          className={`relative group p-2.5 sm:p-3 rounded-xl text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 transition-all duration-200 flex flex-col items-center justify-center shadow-glow-crimson ${
            hoveredIdx === items.length ? 'scale-125 -translate-y-2' : 'scale-100'
          }`}
          title="Sign out of system"
        >
          <LogOut className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="absolute -top-9 px-2.5 py-1 rounded-lg bg-rose-950/95 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Log Out
          </span>
        </button>
      </nav>
    </div>
  );
}
