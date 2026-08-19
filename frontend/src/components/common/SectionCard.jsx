import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function SectionCard({ icon, title, subtitle, tag, isOpen, onToggle, children }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl border transition-all ${isDark
      ? 'bg-[#0d1117] border-[#1f293d] text-white shadow-xl'
      : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
      }`}>
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center justify-between text-left transition cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] rounded-t-2xl ${isDark ? 'bg-[#0d1117] hover:bg-[#131822]' : 'bg-white hover:bg-slate-50/80'
          }`}
      >
        <div className="flex items-center gap-3">
          <span className={`p-2.5 rounded-xl text-base font-bold border shadow-xs ${isDark ? 'border-[#22c55e]/40 bg-[#0d2818] text-[#22c55e]' : 'border-emerald-200 bg-emerald-50 text-[#22c55e]'
            }`}>
            {icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
              {tag && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${isDark ? 'border-[#1f293d] bg-[#090d14] text-[#22c55e]' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}>
                  {tag}
                </span>
              )}
            </div>
            {subtitle && <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{subtitle}</p>}
          </div>
        </div>
        <span className={`text-lg font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className={`p-6 pt-3 border-t space-y-4 ${isDark ? 'border-[#1f293d]' : 'border-slate-200/90'
          }`}>
          {children}
        </div>
      )}
    </div>
  );
}
