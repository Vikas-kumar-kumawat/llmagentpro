import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function SectionCard({ icon, title, subtitle, tag, isOpen, onToggle, children }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl border transition-all ${
      isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
    }`}>
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center justify-between text-left transition cursor-pointer ${
          isDark ? 'bg-[#212121] hover:bg-[#2a2a2a]' : 'bg-white hover:bg-slate-50/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`p-2.5 rounded-xl text-base font-bold border ${
            isDark ? 'bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
          }`}>
            {icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
              {tag && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  isDark ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}>
                  {tag}
                </span>
              )}
            </div>
            {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>{subtitle}</p>}
          </div>
        </div>
        <span className={`text-lg font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className={`p-6 pt-2 border-t space-y-4 ${
          isDark ? 'border-[#2d2d2d]' : 'border-slate-200/90'
        }`}>
          {children}
        </div>
      )}
    </div>
  );
}
