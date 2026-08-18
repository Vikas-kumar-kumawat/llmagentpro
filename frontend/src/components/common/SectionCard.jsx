import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function SectionCard({ icon, title, subtitle, tag, isOpen, onToggle, children }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-lg border transition-all ${isDark
        ? 'bg-[#09090b] border-[#27272a] text-white'
        : 'bg-white border-white shadow-xl text-slate-900'
      }`}>
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center justify-between text-left transition cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] rounded-t-lg ${isDark ? 'bg-[#09090b] hover:bg-[#18181b]' : 'bg-white hover:bg-slate-50'
          }`}
      >
        <div className="flex items-center gap-3">
          <span className={`p-2.5 rounded-md text-base font-bold border shadow-xs ${isDark ? 'border-[#27272a] bg-[#18181b] text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}>
            {icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
              {tag && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${isDark ? 'border-[#27272a] bg-[#18181b] text-[#a1a1aa]' : 'border-slate-200 bg-slate-100 text-slate-700'
                  }`}>
                  {tag}
                </span>
              )}
            </div>
            {subtitle && <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#a1a1aa]' : 'text-slate-600'}`}>{subtitle}</p>}
          </div>
        </div>
        <span className={`text-lg font-bold ${isDark ? 'text-[#a1a1aa]' : 'text-slate-600'}`}>
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className={`p-6 pt-3 border-t space-y-4 ${isDark ? 'border-[#27272a]' : 'border-slate-200'
          }`}>
          {children}
        </div>
      )}
    </div>
  );
}
