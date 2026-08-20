import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { PhoneCall, Loader2, Sparkles, Zap } from 'lucide-react';
import aiagentImage from '../../../assets/aiagentimage.jfif';

export function FeedbackHeader({ onCollectAll, isBatchCalling }) {
  const { isDark } = useTheme();

  return (
    <div className={`relative w-full mb-10 overflow-hidden rounded-3xl border transition-all duration-500 shadow-2xl flex flex-col items-center text-center justify-center min-h-[450px] p-10 sm:p-16 font-['Plus_Jakarta_Sans',sans-serif] group ${
      isDark 
        ? 'bg-[#050507] border-[#1e1e24] hover:border-emerald-500/50' 
        : 'bg-white border-slate-200 hover:border-emerald-500/80'
    }`}>
      
      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={aiagentImage}
          alt="AI Agent Background" 
          className="w-full h-full object-cover opacity-70 md:opacity-80 mix-blend-screen transition-transform duration-1000 scale-105 group-hover:scale-110"
        />
        {/* Gradients to blend text perfectly */}
        <div className={`absolute inset-0 z-0 ${isDark ? 'bg-gradient-to-t from-[#050507] via-[#050507]/30 to-transparent' : 'bg-gradient-to-t from-white via-white/50 to-transparent'}`}></div>
        <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#050507]/20' : 'bg-white/20'}`}></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto h-full justify-center">

        {/* Futuristic Huge Button */}
        {onCollectAll && (
          <button
            onClick={onCollectAll}
            disabled={isBatchCalling}
            className={`group/btn relative overflow-hidden rounded-xl px-6 py-3 font-extrabold text-sm sm:text-base tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 border w-full sm:w-auto ${
              isDark
                ? 'bg-[#0a0a0d]/80 backdrop-blur-lg border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]'
                : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700'
            }`}
          >
            {/* Hover Glare Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none"></div>

            {isBatchCalling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="relative">
                <Zap className="w-5 h-5 absolute -inset-1 blur-sm opacity-60 text-emerald-300 animate-pulse" />
                <Zap className={`relative w-5 h-5 ${isDark ? '' : 'text-white'}`} />
              </div>
            )}
            
            <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase">
              {isBatchCalling ? 'COLLECTING FEEDBACKS...' : 'COLLECT ALL FEEDBACKS'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
