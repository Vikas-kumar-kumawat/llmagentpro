import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackHeader() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${
          isDark ? 'text-[#ececec]' : 'text-slate-900'
        }`}>
          Feedback Collector Agent <span className="inline-block">🤖</span>
        </h1>
        <p className={`text-xs md:text-sm font-medium mt-0.5 ${
          isDark ? 'text-[#8e8e8e]' : 'text-slate-500'
        }`}>
          Autonomous AI voice agent for customer feedback collection & sentiment analysis.
        </p>
      </div>
    </div>
  );
}
