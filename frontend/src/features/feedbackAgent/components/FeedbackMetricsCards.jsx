import React from 'react';
import { PhoneCall, MessageSquare, Smile, Frown } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackMetricsCards({ metrics }) {
  const { isDark } = useTheme();

  const safeMetrics = metrics || {
    callsMade: 0,
    feedbacks: 0,
    positivePercent: 0,
    negativePercent: 0
  };

  const cards = [
    {
      title: "CALLS EXECUTED",
      value: safeMetrics.callsMade,
      change: "+18%",
      isPositive: true,
      icon: <PhoneCall className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`} />
    },
    {
      title: "FEEDBACKS COLLECTED",
      value: safeMetrics.feedbacks,
      change: "+12%",
      isPositive: true,
      icon: <MessageSquare className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`} />
    },
    {
      title: "POSITIVE SENTIMENT",
      value: `${safeMetrics.positivePercent}%`,
      change: "+8%",
      isPositive: true,
      icon: <Smile className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
    },
    {
      title: "NEGATIVE SENTIMENT",
      value: `${safeMetrics.negativePercent}%`,
      change: "-5%",
      isPositive: false,
      icon: <Frown className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`p-4 sm:p-5 border transition-all duration-200 rounded-xl flex flex-col justify-between ${
            isDark 
              ? 'bg-[#070709] border-[#1e1e24] hover:border-[#2a2a34] text-white shadow-xl' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-mono font-semibold truncate ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              {card.title}
            </span>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#121216] border-[#22222a]' : 'bg-slate-100 border-slate-200'
            }`}>
              {card.icon}
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {card.value}
            </span>
            <span className={`text-[10px] sm:text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${
              isDark 
                ? 'bg-[#141418] text-zinc-300 border-[#24242c]' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {card.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

