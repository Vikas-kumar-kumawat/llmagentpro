import React from 'react';
import { PhoneCall, MessageSquare, Smile, Frown } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackMetricsCards({ metrics }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const safeMetrics = metrics || {
    callsMade: 0,
    feedbacks: 0,
    positivePercent: 0,
    negativePercent: 0
  };

  const cardStyle = isDark 
    ? 'bg-[#080808] border-[#181818] hover:border-[#222222]' 
    : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
      {/* Stat Card 1: Calls Made */}
      <div className={`p-5 rounded-2xl border transition-all duration-200 ${cardStyle}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-400'
          }`}>
            Calls Made
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
          }`}>
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {safeMetrics.callsMade}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
            +18%
          </span>
        </div>
      </div>

      {/* Stat Card 2: Feedbacks */}
      <div className={`p-5 rounded-2xl border transition-all duration-200 ${cardStyle}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-400'
          }`}>
            Feedbacks
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {safeMetrics.feedbacks}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
            +12%
          </span>
        </div>
      </div>

      {/* Stat Card 3: Positive */}
      <div className={`p-5 rounded-2xl border transition-all duration-200 ${cardStyle}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-400'
          }`}>
            Positive Sentiment
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'
          }`}>
            <Smile className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {safeMetrics.positivePercent}%
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
            +8%
          </span>
        </div>
      </div>

      {/* Stat Card 4: Negative */}
      <div className={`p-5 rounded-2xl border transition-all duration-200 ${cardStyle}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-400'
          }`}>
            Negative Sentiment
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'
          }`}>
            <Frown className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {safeMetrics.negativePercent}%
          </span>
          <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
            -5%
          </span>
        </div>
      </div>
    </div>
  );
}
