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
      title: "Calls Executed",
      value: safeMetrics.callsMade,
      change: "+18%",
      isPositive: true,
      icon: <PhoneCall className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-800'}`} />
    },
    {
      title: "Feedbacks Collected",
      value: safeMetrics.feedbacks,
      change: "+12%",
      isPositive: true,
      icon: <MessageSquare className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-800'}`} />
    },
    {
      title: "Positive Sentiment",
      value: `${safeMetrics.positivePercent}%`,
      change: "+8%",
      isPositive: true,
      icon: <Smile className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
    },
    {
      title: "Negative Sentiment",
      value: `${safeMetrics.negativePercent}%`,
      change: "-5%",
      isPositive: false,
      icon: <Frown className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`p-3 sm:p-5 border transition-all duration-200 rounded-xl flex flex-col justify-between ${
            isDark 
              ? 'bg-[#09090b] border-[#27272a] hover:border-zinc-700 hover:bg-[#121215] text-white' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-medium truncate ${
              isDark ? 'text-[#a1a1aa]' : 'text-slate-500'
            }`}>
              {card.title}
            </span>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-100 border-slate-200'
            }`}>
              {card.icon}
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-base sm:text-2xl font-bold tracking-tight font-mono ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {card.value}
            </span>
            <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border ${
              isDark 
                ? 'bg-[#18181b] text-zinc-300 border-[#27272a]' 
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

