import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ExternalLink,
  Leaf,
  Layers,
  Database,
  Satellite,
  Compass,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Global Command', path: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
    { name: 'Projects & Sites', path: '/projects', icon: FolderKanban, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#0a1215] border-r border-[#1c353d] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Navigation</span>
              <Compass className="w-3 h-3 text-slate-500" />
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/60 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-[#132328] border border-transparent hover:border-[#1c353d]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Geospatial Telemetry Widget */}
          <div className="space-y-2">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Telemetry Engine</span>
              <Satellite className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0f1b1f] border border-[#1c353d] space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MRV Certified</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  WGS84
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Live PostGIS geodesic spatial computations with automated carbon tonnes & NDVI time-series.
              </p>
              <div className="pt-2 border-t border-[#1c353d]/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Database className="w-2.5 h-2.5 text-emerald-400" />
                  PostGIS GiST
                </span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Profile Card & OpenAPI Specs */}
        <div className="p-3.5 border-t border-[#1c353d] space-y-2.5 bg-[#060c0e]/80">
          <a
            href="https://github.com/PASUPULASAITEJA/DarukaaEarth"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0e1c21] hover:bg-[#13262d] border border-[#1c353d] hover:border-emerald-500/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-emerald-950/60 flex-shrink-0 group-hover:scale-105 transition-transform">
              PT
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                <span>Pasupula Sai Teja</span>
                <Sparkles className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                Lead Architect & Engineer
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
          </a>

          <a
            href="http://localhost:8000/api/v1/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-[#132328] border border-transparent hover:border-[#1c353d] transition-all"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Swagger OpenAPI Specs</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </aside>
    </>
  );
};
