import React from 'react';
import { X, Sparkles, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function CollectFeedbackModal({
  showCollectModal,
  setShowCollectModal,
  handleCollectSubmit,
  fbName,
  setFbName,
  fbPhone,
  setFbPhone,
  fbRating,
  setFbRating,
  fbText,
  setFbText,
  isSubmitting,
  agentTraceResult
}) {
  const { isDark } = useTheme();

  if (!showCollectModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className={`w-full max-w-lg rounded-xl border p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto ${
        isDark ? 'border-[#1e1e24] bg-[#070709] text-white' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        <div className={`flex justify-between items-center border-b pb-3 ${
          isDark ? 'border-[#1e1e24]' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Customer Record</h3>
          </div>
          <button 
            onClick={() => setShowCollectModal(false)} 
            className={`p-1 rounded-lg border transition cursor-pointer ${
              isDark 
                ? 'text-zinc-400 hover:text-white hover:bg-[#141418] border-[#22222a]' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCollectSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>Customer Name</label>
            <input
              type="text"
              required
              value={fbName}
              onChange={(e) => setFbName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={`w-full p-2.5 rounded-lg text-xs border focus:outline-none transition ${
                isDark 
                  ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>Phone Number</label>
            <input
              type="text"
              required
              value={fbPhone}
              onChange={(e) => setFbPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className={`w-full p-2.5 rounded-lg text-xs border focus:outline-none transition ${
                isDark 
                  ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' 
                  : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
              }`}
            />
          </div>

          <div className={`flex justify-end gap-2.5 pt-3 border-t ${
            isDark ? 'border-[#1e1e24]' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setShowCollectModal(false)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                isDark 
                  ? 'border-[#22222a] bg-[#0c0c0f] text-white hover:bg-[#141418]' 
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-2 border ${
                isDark 
                  ? 'bg-white text-black border-white hover:bg-zinc-200' 
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs'
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>

        {/* Agent Execution Trace Output */}
        {agentTraceResult && (
          <div className={`mt-3 p-3 rounded-lg border text-xs space-y-2 ${
            isDark ? 'border-[#22222a] bg-[#0c0c0f] text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                LangGraph Agent Execution Completed
              </span>
              <span className="text-[10px] font-mono opacity-70">Agent Trace</span>
            </div>

            <p className="font-mono text-[11px] leading-relaxed opacity-90">
              <strong>Sentiment:</strong> {agentTraceResult.result?.sentiment || 'Neutral'} | 
              <strong> Category:</strong> {agentTraceResult.result?.category || 'General'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

