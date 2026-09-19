import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, LogOut, ShieldCheck, Menu, Radio, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toUTCString().slice(17, 22) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-[#1c353d] bg-[#0a1215]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-[#1c353d] transition-all"
            aria-label="Toggle sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-950/80 border border-emerald-400/40 group-hover:scale-105 transition-all">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a1215] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Darukaa.Earth
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 shadow-inner">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                MRV Spatial v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Geospatial Carbon & Biodiversity Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Center Live Telemetry Pill */}
      <div className="hidden xl:flex items-center gap-4 px-3.5 py-1 rounded-full bg-[#0f1b1f] border border-[#1c353d] text-xs text-slate-300 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-emerald-300">PostGIS Live</span>
        </div>
        <span className="text-[#1c353d]">|</span>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Radio className="w-3 h-3 text-cyan-400" />
          <span>WGS84 Spheroid</span>
        </div>
        <span className="text-[#1c353d]">|</span>
        <span className="text-[11px] font-mono text-slate-400">{timeString}</span>
      </div>

      {/* User Controls */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {user.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400">{user.email}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-900 to-teal-950 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-950/40">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 border border-[#1c353d] hover:border-rose-800/50 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#1c353d] transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
