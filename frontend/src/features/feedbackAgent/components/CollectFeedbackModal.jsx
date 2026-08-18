import React from 'react';
import { X, Sparkles, CheckCircle } from 'lucide-react';

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
  if (!showCollectModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg rounded-xl border border-[#27272a] bg-[#09090b] text-white p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <h3 className="font-semibold text-sm text-white">Collect New Customer Feedback</h3>
          </div>
          <button 
            onClick={() => setShowCollectModal(false)} 
            className="p-1 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] border border-[#27272a] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCollectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={fbName}
              onChange={(e) => setFbName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full p-2.5 rounded-lg text-xs border border-[#27272a] bg-[#000000] text-white focus:border-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={fbPhone}
              onChange={(e) => setFbPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full p-2.5 rounded-lg text-xs border border-[#27272a] bg-[#000000] text-white focus:border-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Rating Score</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFbRating(star)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold cursor-pointer transition border flex items-center justify-center ${
                    fbRating >= star
                      ? 'bg-white text-black border-white'
                      : 'bg-[#000000] text-[#71717a] border-[#27272a] hover:bg-[#18181b]'
                  }`}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Feedback Comments</label>
            <textarea
              rows={3}
              required
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
              placeholder="e.g. Speed is fast but technician installation was delayed."
              className="w-full p-2.5 rounded-lg text-xs border border-[#27272a] bg-[#000000] text-white focus:border-white focus:outline-none transition"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#27272a]">
            <button
              type="button"
              onClick={() => setShowCollectModal(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-[#27272a] bg-[#000000] text-white hover:bg-[#18181b] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Processing...' : 'Submit & Analyze'}
            </button>
          </div>
        </form>

        {/* Agent Execution Trace Output */}
        {agentTraceResult && (
          <div className="mt-3 p-3 rounded-lg border border-[#27272a] bg-[#18181b] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-white" />
                LangGraph Agent Execution Completed
              </span>
              <span className="text-[10px] font-mono text-[#a1a1aa]">Agent Trace</span>
            </div>

            <p className="font-mono text-[11px] leading-relaxed text-[#a1a1aa]">
              <strong>Sentiment:</strong> {agentTraceResult.result?.sentiment || 'Neutral'} | 
              <strong> Category:</strong> {agentTraceResult.result?.category || 'General'}
            </p>

            {agentTraceResult.trace_steps && (
              <div className="space-y-1 font-mono text-[10px] text-[#a1a1aa]">
                {agentTraceResult.trace_steps.map((step, idx) => (
                  <div key={idx} className="p-1 rounded bg-[#000000]">
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

