import React from 'react';
import { Phone } from 'lucide-react';

export function BatchCallingBanner({ isBatchCalling, batchProgress, handleCancelBatchCall }) {
  const safeProgress = batchProgress || { total: 0, current: 0, currentCustomer: '', logs: [] };
  const logs = safeProgress.logs || [];

  if (!isBatchCalling && logs.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl border border-[#27272a] bg-[#09090b] text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isBatchCalling ? 'bg-white animate-ping' : 'bg-[#a1a1aa]'}`}></span>
          <h3 className="text-xs font-semibold text-white">
            {isBatchCalling ? 'Batch Outbound Voice Campaign Active' : 'Batch Outbound Voice Campaign Completed'}
          </h3>
        </div>
        <span className="text-[11px] font-mono font-medium text-[#a1a1aa]">
          {safeProgress.current} / {safeProgress.total} Customers Called
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#000000] rounded-full h-1.5 overflow-hidden mb-3 border border-[#27272a]">
        <div 
          className="bg-white h-1.5 transition-all duration-300 rounded-full"
          style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
        ></div>
      </div>

      {batchProgress.currentCustomer && isBatchCalling && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-medium text-white flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Calling: <strong>{batchProgress.currentCustomer}</strong></span>
          </p>
          <button
            onClick={handleCancelBatchCall}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-[#18181b] hover:bg-[#27272a] text-white border border-[#27272a] transition flex items-center gap-1 cursor-pointer"
          >
            <span>Stop Campaign</span>
          </button>
        </div>
      )}

      {/* Batch Logs */}
      <div className="max-h-28 overflow-y-auto space-y-1 pt-1 font-mono text-[11px]">
        {logs.map((log, idx) => (
          <div key={idx} className="p-1.5 rounded-lg border border-[#27272a] bg-[#000000] text-[#a1a1aa]">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

