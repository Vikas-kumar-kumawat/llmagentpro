import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif] bg-[#000000] select-none">
      {/* Sleek, Compact Black & White Login Card */}
      <div className={`relative z-10 w-full max-w-[360px] p-6 sm:p-7 rounded-2xl border transition-all duration-300 shadow-2xl ${
        errorMsg ? 'animate-shake border-white' : 'border-[#27272a]'
      } bg-[#09090b] text-white`}>
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="px-3 py-1.5 rounded-xl bg-white flex items-center justify-center shadow-md mb-3">
            <img 
              src="/bfibernet_logo.png" 
              alt="BFibernet Logo" 
              className="h-8 object-contain"
            />
          </div>
          <h2 className="text-base font-semibold tracking-tight text-white mt-1">
            Admin Sign In
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">BFibernet AI Agent Platform</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-xs font-semibold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>Access Granted! Redirecting...</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Name */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5">
              Admin Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter admin username"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-[#000000] border border-[#27272a] text-white placeholder-[#71717a] focus:outline-none focus:border-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl text-xs bg-[#000000] border border-[#27272a] text-white placeholder-[#71717a] focus:outline-none focus:border-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition cursor-pointer border border-white disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 animate-spin text-black" />
                Signing in...
              </span>
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

