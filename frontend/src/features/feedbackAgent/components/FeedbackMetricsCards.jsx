import React from 'react';
import { PhoneCall, MessageSquare, Smile, Frown } from 'lucide-react';

export function FeedbackMetricsCards({ metrics }) {
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
      icon: <PhoneCall className="w-4 h-4 text-white" />,
      boxBg: "bg-[#18181b] border-[#27272a]"
    },
    {
      title: "Feedbacks Collected",
      value: safeMetrics.feedbacks,
      change: "+12%",
      isPositive: true,
      icon: <MessageSquare className="w-4 h-4 text-white" />,
      boxBg: "bg-[#18181b] border-[#27272a]"
    },
    {
      title: "Positive Sentiment",
      value: `${safeMetrics.positivePercent}%`,
      change: "+8%",
      isPositive: true,
      icon: <Smile className="w-4 h-4 text-white" />,
      boxBg: "bg-[#18181b] border-[#27272a]"
    },
    {
      title: "Negative Sentiment",
      value: `${safeMetrics.negativePercent}%`,
      change: "-5%",
      isPositive: false,
      icon: <Frown className="w-4 h-4 text-[#a1a1aa]" />,
      boxBg: "bg-[#18181b] border-[#27272a]"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="p-4 sm:p-5 bg-[#09090b] border border-[#27272a] hover:border-white hover:bg-[#18181b] transition-all duration-200 rounded-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              {card.title}
            </span>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.boxBg}`}>
              {card.icon}
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {card.value}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">
              {card.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

