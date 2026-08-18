import React from 'react';
import { Phone } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function BatchCallingBanner({ isBatchCalling, batchProgress, handleCancelBatchCall }) {
  const { isDark } = useTheme();

  const safeProgress = batchProgress || { total: 0, current: 0, currentCustomer: '', logs: [] };
  const logs = safeProgress.logs || [];

  if (!isBatchCalling && logs.length === 0) return null;

  return (
    <div className={`mb-6 p-4 rounded-xl border font-['Plus_Jakarta_Sans',sans-serif] ${
      isDark ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isBatchCalling ? 'bg-sky-500 animate-ping' : isDark ? 'bg-zinc-500' : 'bg-slate-400'
          }`}></span>
          <h3 className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isBatchCalling ? 'Batch Outbound Voice Campaign Active' : 'Batch Outbound Voice Campaign Completed'}
          </h3>
        </div>
        <span className={`text-[11px] font-mono font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {safeProgress.current} / {safeProgress.total} Customers Called
        </span>
      </div>

      {/* Progress Bar */}
      <div className={`w-full rounded-full h-1.5 overflow-hidden mb-3 border ${
        isDark ? 'bg-[#000000] border-[#27272a]' : 'bg-slate-100 border-slate-200'
      }`}>
        <div 
          className="bg-sky-500 h-1.5 transition-all duration-300 rounded-full"
          style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
        ></div>
      </div>

      {batchProgress.currentCustomer && isBatchCalling && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className={`text-xs font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Phone className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            <span>Calling: <strong>{batchProgress.currentCustomer}</strong></span>
          </p>
          <button
            onClick={handleCancelBatchCall}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1 cursor-pointer ${
              isDark 
                ? 'bg-[#18181b] hover:bg-[#27272a] text-white border-[#27272a]' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <span>Stop Campaign</span>
          </button>
        </div>
      )}

      {/* Batch Logs */}
      <div className="max-h-28 overflow-y-auto space-y-1 pt-1 font-mono text-[11px]">
        {logs.map((log, idx) => (
          <div key={idx} className={`p-1.5 rounded-lg border ${
            isDark ? 'bg-[#000000] border-[#27272a] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

