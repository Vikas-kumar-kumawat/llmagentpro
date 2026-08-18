import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import finalimageai from '../../assets/finalimageai.png';

export function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      if (cleanUser === 'vikas' && cleanPass === '7014') {
        setIsSuccess(true);
        setTimeout(() => {
          localStorage.setItem('bfibernet_auth', 'true');
          localStorage.setItem('bfibernet_admin', username.trim());
          onLoginSuccess();
        }, 1000);
      } else {
        setIsSubmitting(false);
        setErrorMsg('Invalid Admin Name or Password');
      }
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 font-sans select-none">
      {/* High Visibility Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${finalimageai})` }}
      >
        {/* Subtle translucent tint so background image pops while keeping text readable */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Sleek, Compact Glassmorphic Login Card */}
      <div className={`relative z-10 w-full max-w-[350px] p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-2xl ${
        errorMsg ? 'animate-shake border-rose-500/60 shadow-rose-500/20' : 'border-white/20 shadow-black/50'
      } bg-black/65 text-white`}>
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow-md mb-2">
            <img 
              src="/bfibernet_logo.png" 
              alt="BFibernet Logo" 
              className="h-8 object-contain"
            />
          </div>
          <h2 className="text-base font-extrabold tracking-tight text-white mt-1">
            Admin Sign In
          </h2>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Access Granted! Redirecting...</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Admin Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Admin Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter admin username"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-black/80 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter password"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-black/80 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 animate-spin text-cyan-200" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Login
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
