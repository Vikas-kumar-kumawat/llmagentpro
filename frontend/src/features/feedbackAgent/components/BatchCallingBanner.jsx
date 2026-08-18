import React from 'react';
import { Phone } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function BatchCallingBanner({ isBatchCalling, batchProgress, handleCancelBatchCall }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const safeProgress = batchProgress || { total: 0, current: 0, currentCustomer: '', logs: [] };
  const logs = safeProgress.logs || [];

  if (!isBatchCalling && logs.length === 0) return null;

  return (
    <div className={`mb-6 p-4 rounded-2xl border transition-all shadow-md ${
      isDark ? 'bg-[#212121] border-cyan-500/30 text-white' : 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 text-slate-900'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isBatchCalling ? 'bg-cyan-500 animate-ping' : 'bg-emerald-500'}`}></span>
          <h3 className={`text-sm font-extrabold ${isDark ? 'text-cyan-400' : 'text-cyan-800'}`}>
            {isBatchCalling ? '⚡ Batch Outbound Voice Campaign in Progress' : '✅ Batch Outbound Voice Campaign Completed'}
          </h3>
        </div>
        <span className={`text-xs font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
          {safeProgress.current} / {safeProgress.total} Customers Called
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 transition-all duration-300 rounded-full"
          style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
        ></div>
      </div>

      {batchProgress.currentCustomer && isBatchCalling && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className={`text-xs font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Phone className="w-3.5 h-3.5 text-cyan-600 animate-bounce" />
            <span>Currently Calling Customer: <strong>{batchProgress.currentCustomer}</strong></span>
          </p>
          <button
            onClick={handleCancelBatchCall}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <span>🛑 Stop Batch Calling</span>
          </button>
        </div>
      )}

      {/* Batch Logs */}
      <div className="max-h-28 overflow-y-auto space-y-1.5 pt-1 font-mono text-[11px]">
        {logs.map((log, idx) => (
          <div key={idx} className={`p-2 rounded-lg border leading-tight ${
            isDark ? 'bg-[#181818] border-[#2a2a2a] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
