import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1315] text-slate-100">
      <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col justify-between">
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-12 pt-4 border-t border-[#1c353d]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-300">Darukaa.Earth Platform</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">EPSG:4326 PostGIS Engine</span>
            </div>
            <a
              href="https://github.com/PASUPULASAITEJA/DarukaaEarth"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#102026] border border-[#1c353d] hover:border-emerald-500/50 hover:bg-[#142830] transition-all text-slate-300 hover:text-emerald-300 group"
            >
              <span>Crafted & Engineered by</span>
              <strong className="text-emerald-400 font-semibold group-hover:underline">Pasupula Sai Teja</strong>
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
};
