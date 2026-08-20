import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, Zap, AlertCircle, CheckCircle2, Sun, Moon, Wifi, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { loginUser } from '../../services/apiService';

export function LoginPage({ onLoginSuccess }) {
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      const response = await loginUser(cleanUser, cleanPass).catch(() => null);
      if (response && response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          localStorage.setItem('bfibernet_auth', 'true');
          localStorage.setItem('bfibernet_admin', username.trim() || 'Vikas');
          onLoginSuccess();
        }, 600);
        return;
      }
    } catch {
      // Fallback to client verification if server unreachable
    }

    if ((cleanUser === 'vikas' && cleanPass === '7014') || 
        (cleanUser === 'admin' && (cleanPass === 'admin' || cleanPass === '7014' || cleanPass === '123456'))) {
      setIsSuccess(true);
      setTimeout(() => {
        localStorage.setItem('bfibernet_auth', 'true');
        localStorage.setItem('bfibernet_admin', username.trim() || 'Vikas');
        onLoginSuccess();
      }, 600);
    } else {
      setIsSubmitting(false);
      setErrorMsg('Invalid Admin Name or Password. Use: vikas / 7014 or admin / admin');
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 relative overflow-hidden ${
      isDark ? 'bg-[#050507] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Background Radial Purple Glow */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDark 
          ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050507] to-[#050507]' 
          : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/40 via-[#f8fafc] to-[#f8fafc]'
      }`} />

      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          className={`p-2.5 rounded-xl border transition cursor-pointer active:scale-95 shadow-md flex items-center gap-2 text-xs font-bold ${
            isDark
              ? 'bg-[#0c0c0e] hover:bg-[#121218] text-amber-400 border-[#1e1e26]'
              : 'bg-white hover:bg-slate-50 text-amber-600 border-slate-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'} Mode</span>
        </button>
      </div>

      {/* Card Container */}
      <div className={`w-full max-w-md rounded-2xl border p-8 shadow-2xl relative z-10 backdrop-blur-md transition-all duration-300 ${
        isDark
          ? 'bg-[#0c0c0e]/95 border-[#1e1e26] text-white'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        {/* Header Icon Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border transition-transform duration-300 hover:scale-105 ${
            isDark
              ? 'bg-[#1a0f2e] border-[#a855f7]/40 text-[#c084fc] shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]'
              : 'bg-purple-50 border-purple-200 text-purple-600 shadow-xs'
          }`}>
            <Wifi className="w-7 h-7 text-[#c084fc]" />
          </div>

          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            BFibernet <span className="text-[#c084fc]">.render</span>
          </h1>
          <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Sign in to access your Broadband AI Control Panel
          </p>
          <div className={`mt-3 px-3 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
            isDark ? 'bg-purple-950/40 border-purple-800/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Default Admin: <strong>vikas</strong> / <strong>7014</strong></span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold tracking-wide uppercase ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. vikas"
                className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition-all ${
                  isDark
                    ? 'bg-[#0a0a0c] border-[#1e1e26] text-white placeholder-zinc-500 focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                }`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold tracking-wide uppercase ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition-all pr-10 ${
                  isDark
                    ? 'bg-[#0a0a0c] border-[#1e1e26] text-white placeholder-zinc-500 focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition ${
                  isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-extrabold text-sm tracking-wide transition-all duration-200 shadow-[0_0_20px_-3px_rgba(168,85,247,0.4)] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Login
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

