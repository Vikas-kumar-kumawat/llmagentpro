import React from 'react';

export function Header({ twilioConfigured }) {
  return (
    <header className="flex flex-wrap justify-between items-center pb-6 border-b border-slate-800 gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-cyan-400 tracking-tight flex items-center gap-2">
          <span>🤖</span> BCT Fibernet Multi-Agent Platform
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Enterprise Architecture — LangGraph, FastAPI &amp; Twilio Voice
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono">
          v2.0 Enterprise
        </span>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900">
          <span className={`w-2.5 h-2.5 rounded-full ${twilioConfigured ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'}`}></span>
          <span className="text-slate-300">
            Twilio: {twilioConfigured ? 'Active' : 'Pending (.env)'}
          </span>
        </div>
      </div>
    </header>
  );
}
