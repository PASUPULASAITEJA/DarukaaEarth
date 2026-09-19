import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      showToast('Account registered successfully! Welcome to Darukaa.Earth.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || 'Registration failed. Please check your details.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Join Darukaa.Earth to manage verified spatial environmental projects
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 shadow-inner">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Goodall"
                className="w-full bg-[#060c0e] border border-[#1c353d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
              />
            </div>
          </div>

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
                placeholder="jane@conservation.org"
                className="w-full bg-[#060c0e] border border-[#1c353d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password (min. 6 chars)
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            Create Platform Account
          </Button>

          {/* Instant Demo Fill */}
          <button
            type="button"
            onClick={() => {
              setName('Pasupula Sai Teja');
              setEmail('saiteja@darukaa.earth');
              setPassword('DarukaaPass123!');
              setConfirmPassword('DarukaaPass123!');
              showToast('Demo registration details populated!', 'info');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Fill Demo User Credentials (Instant Access)</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Sign in
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
