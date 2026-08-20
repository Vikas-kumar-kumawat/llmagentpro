import React from 'react';
import { Phone, CheckCircle2, Activity } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function BatchCallingBanner({ isBatchCalling, batchProgress, handleCancelBatchCall }) {
  const { isDark } = useTheme();

  const safeProgress = batchProgress || { total: 0, current: 0, currentCustomer: '', logs: [] };
  const logs = safeProgress.logs || [];

  if (!isBatchCalling && logs.length === 0) return null;

  return (
    <div className={`mb-8 p-5 sm:p-6 rounded-none border-l-4 font-['Plus_Jakarta_Sans',sans-serif] shadow-lg transition-all ${
      isDark 
        ? isBatchCalling ? 'bg-[#050507] border-l-emerald-500 border-t-[#121216] border-r-[#121216] border-b-[#121216] shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-[#050507] border-l-zinc-700 border-t-[#121216] border-r-[#121216] border-b-[#121216]'
        : isBatchCalling ? 'bg-white border-l-emerald-500 border-t-slate-100 border-r-slate-100 border-b-slate-100 shadow-emerald-500/10' : 'bg-white border-slate-200'
    }`}>
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {isBatchCalling ? (
            <div className="relative">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div className="absolute inset-0 bg-emerald-400 blur-sm opacity-50 animate-pulse"></div>
            </div>
          ) : (
            <CheckCircle2 className="w-5 h-5 text-zinc-500" />
          )}
          
          <h3 className={`text-sm sm:text-base font-extrabold uppercase tracking-widest ${isDark ? (isBatchCalling ? 'text-emerald-400' : 'text-zinc-500') : 'text-slate-900'}`}>
            {isBatchCalling ? 'Autonomous Batch Campaign Active' : 'Campaign Terminated'}
          </h3>
        </div>
        
        <span className={`text-xs sm:text-sm font-mono font-bold px-3 py-1 border rounded-none ${
          isDark ? 'text-emerald-400 border-emerald-500/30 bg-black/40' : 'text-emerald-700 border-emerald-200 bg-emerald-50'
        }`}>
          {safeProgress.current} <span className="opacity-50">/</span> {safeProgress.total} <span className="ml-1 uppercase tracking-widest text-[10px]">Agents Deployed</span>
        </span>
      </div>

      {/* Neon Progress Bar */}
      <div className={`relative w-full h-1.5 overflow-hidden mb-5 rounded-none border ${
        isDark ? 'bg-[#000] border-[#1e1e24]' : 'bg-slate-100 border-slate-200'
      }`}>
        <div 
          className="absolute top-0 left-0 h-1.5 bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,1)]"
          style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
        ></div>
      </div>

      {/* Active Call Status & Stop Button */}
      {batchProgress.currentCustomer && isBatchCalling && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 mb-4 border rounded-none ${
          isDark ? 'bg-[#0a0a0d] border-[#1e1e24]' : 'bg-slate-50 border-slate-200'
        }`}>
          <p className={`text-xs sm:text-sm font-bold flex items-center gap-3 ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
            <Phone className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Establishing link with: <span className="text-emerald-400 ml-1">{batchProgress.currentCustomer}</span></span>
          </p>
          <button
            onClick={handleCancelBatchCall}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-widest border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
              isDark 
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-500/60' 
                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
            }`}
          >
            Abort Campaign
          </button>
        </div>
      )}

      {/* Premium Terminal Logs */}
      <div className={`max-h-40 overflow-y-auto space-y-1.5 p-3 font-mono text-[11px] sm:text-xs border rounded-none shadow-inner ${
        isDark ? 'bg-[#000] border-[#1e1e24]' : 'bg-slate-100 border-slate-200'
      }`}>
        {logs.map((log, idx) => {
          const isError = log.includes('❌') || log.includes('Failed') || log.includes('🛑');
          const isSuccess = log.includes('✅') || log.includes('Placed');
          
          let logColor = isDark ? 'text-zinc-500' : 'text-slate-500';
          if (isError) logColor = 'text-red-400';
          else if (isSuccess) logColor = 'text-emerald-400';

          return (
            <div key={idx} className={`flex items-start gap-2 ${logColor}`}>
              <span className="opacity-50 mt-0.5">{`>`}</span>
              <span className="leading-relaxed">{log}</span>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-zinc-600 italic flex items-center gap-2">
            <span className="opacity-50 mt-0.5">{`>`}</span>
            Awaiting telemetry...
          </div>
        )}
      </div>
    </div>
  );
}
