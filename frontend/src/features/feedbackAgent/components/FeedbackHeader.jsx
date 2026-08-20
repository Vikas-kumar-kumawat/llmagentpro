import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { PhoneCall, Loader2 } from 'lucide-react';

export function FeedbackHeader({ onCollectAll, isBatchCalling }) {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b font-['Plus_Jakarta_Sans',sans-serif] ${
      isDark ? 'border-[#1e1e24]' : 'border-slate-200'
    }`}>
      {/* Page Title & Image */}
      <div>
        <div className="flex items-center gap-3">
          <img 
            src="https://api.dicebear.com/7.x/bottts/svg?seed=feedbackAgent&backgroundColor=10b981" 
            alt="Feedback Agent" 
            className={`w-10 h-10 rounded-xl shadow-md border ${isDark ? 'border-[#22222a]' : 'border-slate-200'}`}
          />
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Feedback <span className={`font-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Agent</span>
          </h1>
        </div>
      </div>

      {/* Collect All Feedbacks Button */}
      {onCollectAll && (
        <button
          onClick={onCollectAll}
          disabled={isBatchCalling}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            isDark
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isBatchCalling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PhoneCall className="w-4 h-4" />
          )}
          <span>Collect All Feedbacks</span>
        </button>
      )}
    </div>
  );
}
