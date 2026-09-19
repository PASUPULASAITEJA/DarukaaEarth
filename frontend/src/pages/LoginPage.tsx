import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Mail, Lock, ShieldCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back! Signed in to geospatial platform.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@darukaa.earth');
    setPassword('AdminPass123!');
    showToast('Demo admin credentials populated!', 'info');
  };

  return (
    <div className="min-h-screen bg-[#060c0e] bg-earth-grid flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Top Ambient Glow Orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-emerald-950/80 border border-emerald-400/40 group-hover:scale-105 transition-transform">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Darukaa.Earth
          </span>
          <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            Geospatial Environmental Platform
          </span>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md glass-panel border border-[#1c353d] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your spatial MRV environmental projects and telemetry
          </p>
        </div>

        {isExpired && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-950/80 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5 shadow-inner">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Session expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 shadow-inner">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@darukaa.earth"
                className="w-full bg-[#060c0e] border border-[#1c353d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#060c0e] border border-[#1c353d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-sm font-semibold shadow-glow-emerald"
            isLoading={isLoading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* 1-Click Demo Credentials Autofill */}
        <div className="mt-5 pt-4 border-t border-[#1c353d]">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Fill Demo Admin Credentials (Instant Access)</span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Create an account
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1c353d]/40 flex items-center justify-center">
          <a
            href="https://github.com/PASUPULASAITEJA/DarukaaEarth"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-mono hover:text-emerald-400 transition-colors"
          >
            <span>Engineered by</span>
            <strong className="text-emerald-400 font-semibold">Pasupula Sai Teja</strong>
          </a>
        </div>
      </div>
    </div>
  );
};
