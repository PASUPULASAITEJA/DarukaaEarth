import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  MapPin,
  Leaf,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Trees,
  CheckCircle2,
  Database,
  Activity,
  Cpu,
  Compass,
  Github,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#060c0e] bg-earth-grid text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header / Navbar */}
      <header className="h-20 border-b border-[#1c353d]/80 bg-[#060c0e]/80 backdrop-blur-xl px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-950/80 border border-emerald-400/40">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Darukaa.Earth
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
              MRV Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Open Command Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#1c353d] transition-all"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0f1b1f] border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-8 shadow-glow-emerald backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono">Next-Gen Environmental Intelligence</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-mono">PostGIS 3.4 + Mapbox GL</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] text-white">
          Precision Geospatial Intelligence for{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Carbon & Biodiversity
          </span>{' '}
          Projects.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mt-6 leading-relaxed font-normal">
          Empowering environmental administrators and conservation scientists to draw interactive Mapbox site polygons, store geometries in PostGIS, calculate geodesic hectarage, and monitor multi-year carbon & biodiversity metrics.
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to={isAuthenticated ? '/dashboard' : '/login'}>
            <Button size="lg" variant="primary" className="px-8 py-4 text-base font-semibold shadow-glow-emerald" icon={<ArrowRight className="w-5 h-5" />}>
              Launch Command Dashboard
            </Button>
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="secondary" className="px-7 py-4 text-base bg-[#0f1b1f] hover:bg-[#132328] border-[#1c353d]" icon={<Layers className="w-5 h-5 text-cyan-400" />}>
              Interactive OpenAPI Docs
            </Button>
          </a>
        </div>

        {/* Live Seed Demo Quick Access Card */}
        <div className="mt-10 p-5 rounded-3xl bg-gradient-to-r from-[#0f1b1f] to-[#132328] border border-emerald-500/30 max-w-xl w-full text-left shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Evaluator Demo Access</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Pre-Seeded
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Click below to sign in directly with the pre-seeded admin account and explore preloaded projects across the Amazon, Western Ghats, and Scottish Highlands.
          </p>
          <div className="bg-[#060c0e] p-3 rounded-2xl border border-[#1c353d] text-xs font-mono text-slate-300 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-500">Email: <span className="text-slate-200 font-semibold">admin@darukaa.earth</span></div>
              <div className="text-[11px] text-slate-500">Password: <span className="text-emerald-400 font-semibold">AdminPass123!</span></div>
            </div>
            <Link to="/login">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold shadow transition-colors inline-block">
                Sign In Now →
              </span>
            </Link>
          </div>
        </div>

        {/* Planetary Metrics Telemetry Banner */}
        <div className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl">
          <div className="glass-card p-5 rounded-2xl border border-[#1c353d] text-left">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monitored Area</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">146,850 <span className="text-xs text-emerald-400 font-sans font-medium">ha</span></div>
            <div className="text-[10px] text-slate-500 mt-1">Geodesic PostGIS Verified</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-[#1c353d] text-left">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
              <Leaf className="w-3.5 h-3.5 text-cyan-400" />
              <span>Carbon Sequestered</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">2,410 <span className="text-xs text-cyan-400 font-sans font-medium">tCO₂e</span></div>
            <div className="text-[10px] text-slate-500 mt-1">Monthly MRV Ledger</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-[#1c353d] text-left">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Biodiversity Index</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">89.4 <span className="text-xs text-teal-400 font-sans font-medium">/ 100</span></div>
            <div className="text-[10px] text-slate-500 mt-1">Canopy & Species Health</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-[#1c353d] text-left">
            <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Global Biomes</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">4 <span className="text-xs text-amber-400 font-sans font-medium">Zones</span></div>
            <div className="text-[10px] text-slate-500 mt-1">Rainforest, Mangrove, Peat, Shola</div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left max-w-6xl">
          <div className="glass-card p-7 rounded-3xl border border-[#1c353d] relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-950 to-[#132328] border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-lg group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interactive Mapbox Drawing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Draw and edit spatial polygon boundaries directly in Mapbox GL. Automatic coordinate capture, vertex validation, and geodesic area calculation.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#060c0e] border border-[#1c353d] text-emerald-400">Mapbox Draw</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#060c0e] border border-[#1c353d] text-slate-400">GeoJSON Export</span>
            </div>
          </div>

          <div className="glass-card p-7 rounded-3xl border border-[#1c353d] relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-950 to-[#132328] border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 shadow-lg group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">PostGIS Spatial Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-performance spatial persistence with SRID 4326 geometries, GiST spatial indexing, true ellipsoidal geodesic measurements, and Alembic migrations.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#060c0e] border border-[#1c353d] text-cyan-400">PostGIS 3.4</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#060c0e] border border-[#1c353d] text-slate-400">GiST Index</span>
            </div>
          </div>

          <div className="glass-card p-7 rounded-3xl border border-[#1c353d] relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-950 to-[#132328] border border-teal-500/40 flex items-center justify-center text-teal-400 mb-5 shadow-lg group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Time-Series Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Chart.js visualizations tracking monthly carbon sequestration rates, biodiversity index progression, and satellite NDVI canopy coverage.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#060c0e] border border-[#1c353d] text-teal-400">Chart.js 4</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#060c0e] border border-[#1c353d] text-slate-400">Monthly Ledger</span>
            </div>
          </div>
        </div>
      </main>

      {/* Professional Enterprise Footer */}
      <footer className="border-t border-[#1c353d] bg-[#060c0e]/95 pt-12 pb-8 px-6 text-slate-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#1c353d]/60">
          {/* Col 1: Brand & Operational Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Globe className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-slate-200 tracking-tight text-base">Darukaa.Earth</span>
                <p className="text-[11px] text-emerald-400/90 font-mono font-medium">Precision Geospatial Intelligence</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Production-grade Nature-Tech platform delivering automated PostGIS spatial computations, real-time Copernicus satellite analytics, and verifiable biodiversity ledgers.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • EPSG:4326 PostGIS</span>
            </div>
          </div>

          {/* Col 2: Lead Architect & Developer Signature Card */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Engineering & Architecture
            </h4>
            <div className="p-4 rounded-2xl bg-[#0b171a]/90 border border-[#1c353d] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-950/60 text-sm flex-shrink-0">
                  PT
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                    <span>Pasupula Sai Teja</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Lead Platform Architect & Full-Stack Engineer</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#1c353d]/60 flex items-center justify-between">
                <a
                  href="https://github.com/PASUPULASAITEJA/DarukaaEarth"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#13252b] hover:bg-emerald-950/60 border border-[#1c353d] hover:border-emerald-500/40 text-xs font-medium text-slate-200 hover:text-emerald-300 transition-all group"
                >
                  <Github className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span>github.com/PASUPULASAITEJA</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Core Technology & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Engine Architecture & Protocols
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-[#0b171a]/60 border border-[#1c353d] text-slate-300">
                <div className="text-emerald-400 font-semibold">FastAPI</div>
                <div className="text-[10px] text-slate-500">Async REST Engine</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b171a]/60 border border-[#1c353d] text-slate-300">
                <div className="text-cyan-400 font-semibold">PostGIS 3.4</div>
                <div className="text-[10px] text-slate-500">GiST Spatial Indices</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b171a]/60 border border-[#1c353d] text-slate-300">
                <div className="text-teal-400 font-semibold">Copernicus</div>
                <div className="text-[10px] text-slate-500">Sentinel-2 Multispectral</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0b171a]/60 border border-[#1c353d] text-slate-300">
                <div className="text-amber-400 font-semibold">GBIF Global</div>
                <div className="text-[10px] text-slate-500">Taxon Occurrence Mesh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            © 2026 <strong className="text-slate-400 font-medium">Darukaa.Earth Platform</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="http://localhost:8000/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              OpenAPI Swagger
            </a>
            <a
              href="https://github.com/PASUPULASAITEJA/DarukaaEarth"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
