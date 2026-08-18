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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!showCollectModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-all ${
        isDark ? 'bg-[#1e1e1e] border-[#2c2c2c] text-[#ececec]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-500 animate-pulse" />
            <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Collect New Customer Feedback</h3>
          </div>
          <button 
            onClick={() => setShowCollectModal(false)} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-black/25 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCollectSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Customer Name</label>
            <input
              type="text"
              required
              value={fbName}
              onChange={(e) => setFbName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition ${
                isDark 
                  ? 'bg-[#141414] border-[#2d2d2d] focus:border-cyan-500 text-white placeholder-zinc-700' 
                  : 'bg-slate-50 border-slate-200 focus:border-cyan-600 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
            <input
              type="text"
              required
              value={fbPhone}
              onChange={(e) => setFbPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition ${
                isDark 
                  ? 'bg-[#141414] border-[#2d2d2d] focus:border-cyan-500 text-white placeholder-zinc-700' 
                  : 'bg-slate-50 border-slate-200 focus:border-cyan-600 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Rating Score</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFbRating(star)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold cursor-pointer transition border flex items-center justify-center ${
                    fbRating >= star
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : isDark 
                      ? 'bg-[#141414] text-zinc-500 border-[#2d2d2d] hover:bg-zinc-800' 
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Feedback Comments</label>
            <textarea
              rows={3}
              required
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
              placeholder="e.g. Speed is fast but technician installation was delayed."
              className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition ${
                isDark 
                  ? 'bg-[#141414] border-[#2d2d2d] focus:border-cyan-500 text-white placeholder-zinc-700' 
                  : 'bg-slate-50 border-slate-200 focus:border-cyan-600 text-slate-900'
              }`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#2d2d2d]">
            <button
              type="button"
              onClick={() => setShowCollectModal(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${
                isDark ? 'bg-[#2a2a2a] text-slate-300 border-[#383838]' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Triggering AI Agent...' : 'Submit & Analyze'}
            </button>
          </div>
        </form>

        {/* Agent Execution Trace Output */}
        {agentTraceResult && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs space-y-2 ${
            isDark ? 'bg-[#141414] border-cyan-500/30' : 'bg-cyan-50/70 border-cyan-200/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-600 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-500 animate-pulse" />
                LangGraph Agent Execution Completed
              </span>
              <span className="text-[10px] font-mono text-slate-400">Agent Trace</span>
            </div>

            <p className={`font-mono text-[11px] leading-relaxed ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
              <strong>Sentiment:</strong> {agentTraceResult.result?.sentiment || 'Neutral'} | 
              <strong> Category:</strong> {agentTraceResult.result?.category || 'General'}
            </p>

            {agentTraceResult.trace_steps && (
              <div className="space-y-1 font-mono text-[10px] text-slate-400">
                {agentTraceResult.trace_steps.map((step, idx) => (
                  <div key={idx} className="p-1 rounded bg-black/20">
                    Step {step.step}: {step.name} ({step.status})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
