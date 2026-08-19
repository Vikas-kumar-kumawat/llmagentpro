import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function HistorySection({ feedbackEntries, supportTickets, contacts, callLogs, onUseContact }) {
  const { isDark } = useTheme();

  return (
    <div className={`space-y-5 font-['Plus_Jakarta_Sans',sans-serif] ${isDark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Feedback History */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${
        isDark ? 'bg-[#070709] border-[#1e1e24] shadow-2xl' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Customer Feedback Logs ({feedbackEntries.length})
        </h3>
        {feedbackEntries.length === 0 ? (
          <p className={`text-xs italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>No feedback entries recorded yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {feedbackEntries.map((fb) => (
              <div key={fb.id} className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-[#0c0c0f] border-[#22222a]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold">{fb.customer_name} ({fb.phone})</span>
                  <span className="font-mono text-emerald-400 font-bold">{fb.rating} ★</span>
                </div>
                <p className={`italic ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>"{fb.feedback_text || 'No comment'}"</p>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span className={`px-2 py-0.5 rounded-full uppercase border font-bold ${
                    isDark ? 'bg-[#18181c] text-zinc-300 border-[#282832]' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>{fb.sentiment}</span>
                  <span className={`px-2 py-0.5 rounded-full uppercase border ${
                    isDark ? 'bg-[#18181c] text-zinc-400 border-[#282832]' : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>{fb.category}</span>
                  <span className="ml-auto opacity-60">{fb.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Tickets */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${
        isDark ? 'bg-[#070709] border-[#1e1e24] shadow-2xl' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Auto-Generated Support Tickets ({supportTickets.length})
        </h3>
        {supportTickets.length === 0 ? (
          <p className={`text-xs italic ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>No support tickets generated yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {supportTickets.map((t) => (
              <div key={t.id} className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-[#0c0c0f] border-[#22222a]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center font-extrabold">
                  <span className="font-mono">Ticket #{t.id}: {t.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase ${
                    isDark ? 'bg-[#18181c] text-zinc-300 border-[#282832]' : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>{t.priority}</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{t.description}</p>
                <div className="flex justify-between text-[10px] font-mono pt-1 opacity-60">
                  <span>{t.customer_name} ({t.phone})</span>
                  <span>{t.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Contacts & Call Logs Sub-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-4 sm:p-5 ${
          isDark ? 'bg-[#070709] border-[#1e1e24] shadow-2xl' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <h4 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Saved Directory ({contacts.length})
          </h4>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {contacts.map((c) => (
              <div key={c.id} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                isDark ? 'bg-[#0c0c0f] border-[#22222a]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className="font-extrabold">{c.name}</p>
                  <p className="font-mono opacity-70 text-[11px]">{c.phone}</p>
                </div>
                {onUseContact && (
                  <button
                    onClick={() => onUseContact(c.name, c.phone)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer active:scale-95 shadow-xs border ${
                      isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    Use
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 sm:p-5 ${
          isDark ? 'bg-[#070709] border-[#1e1e24] shadow-2xl' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <h4 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Call Audit Log ({callLogs.length})
          </h4>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {callLogs.map((log) => (
              <div key={log.id} className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDark ? 'bg-[#0c0c0f] border-[#22222a]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between font-extrabold">
                  <span className="font-mono">{log.name} ({log.phone})</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase border ${
                    isDark ? 'bg-[#18181c] text-zinc-300 border-[#282832]' : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

