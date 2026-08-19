import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackHeader() {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b font-['Plus_Jakarta_Sans',sans-serif] ${
      isDark ? 'border-[#1e1e24]' : 'border-slate-200'
    }`}>
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Feedback <span className={`font-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Agent</span>
          </h1>
        </div>
      </div>
    </div>
  );
}



