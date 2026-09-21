import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ShieldCheck, LogOut, Key, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TiltCard from '../../components/common/TiltCard';
import SoundFX from '../../utils/SoundFX';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    SoundFX.playClick();
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Encrypted Identity Vault</span>
          </div>
          <h1 className="text-2xl font-black text-white">Patient Profile & Security</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your patient records, communication preferences, and security access.
          </p>
        </div>

        {/* UNIVERSAL PROMINENT LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="btn-danger flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-bold shadow-glow-crimson"
          title="Sign out of your account"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Patient Portal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <TiltCard maxTilt={8} className="cyber-card p-6 text-center space-y-4 md:col-span-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyber-emerald to-cyber-cyan text-void-950 font-black text-3xl flex items-center justify-center mx-auto shadow-glow-emerald">
            {user?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{user?.name}</h3>
            <p className="text-xs text-cyber-emerald font-mono mt-0.5">Verified Patient ID</p>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40">
              <ShieldCheck className="w-3 h-3" />
              HIPAA Protected
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-left text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyber-cyan" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyber-emerald" />
              <span>{user?.phone || '+91 • Not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="truncate">{user?.address || 'Dispensary delivery active'}</span>
            </div>
          </div>
        </TiltCard>

        {/* Security & Account Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="cyber-card p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold text-cyber-emerald uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> Account Credentials & Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-void-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">Full Legal Name</span>
                <span className="font-bold text-white text-sm">{user?.name}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-void-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">Registered Email</span>
                <span className="font-bold text-white text-sm">{user?.email}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-void-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">Access Role</span>
                <span className="font-bold text-cyber-emerald uppercase font-mono">{user?.role || 'Patient'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-void-950/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">Prescription Authorization</span>
                <span className="font-bold text-cyber-cyan font-mono">CDSCO Schedule H Active</span>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6 flex items-center justify-between border border-rose-500/30 bg-rose-950/20">
            <div>
              <h4 className="text-sm font-bold text-white">Sign Out of All Sessions</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Safely disconnect your patient session from this computer or device.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-danger text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
