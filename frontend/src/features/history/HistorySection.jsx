import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function HistorySection({ feedbackEntries, supportTickets, contacts, callLogs, onUseContact }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      
      {/* Feedback History */}
      <div>
        <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-3">
          Customer Feedback Entries ({feedbackEntries.length})
        </h3>
        {feedbackEntries.length === 0 ? (
          <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No feedback entries recorded yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {feedbackEntries.map((fb) => (
              <div key={fb.id} className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{fb.customer_name} ({fb.phone})</span>
                  <span className="font-bold text-amber-500">{fb.rating} ★</span>
                </div>
                <p className={`italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fb.feedback_text || 'No comment'}</p>
                <div className="flex gap-2 text-[10px]">
                  <span className={`px-2 py-0.5 rounded uppercase ${isDark ? 'bg-[#2a2a2a] text-slate-400' : 'bg-slate-200 text-slate-600'}`}>{fb.sentiment}</span>
                  <span className={`px-2 py-0.5 rounded uppercase ${isDark ? 'bg-[#2a2a2a] text-slate-400' : 'bg-slate-200 text-slate-600'}`}>{fb.category}</span>
                  <span className={`ml-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fb.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Tickets */}
      <div className={`pt-4 border-t ${isDark ? 'border-[#2f2f2f]' : 'border-slate-200'}`}>
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
          Auto-Generated Support Tickets ({supportTickets.length})
        </h3>
        {supportTickets.length === 0 ? (
          <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No support tickets generated yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {supportTickets.map((t) => (
              <div key={t.id} className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-amber-500">Ticket #{t.id}: {t.subject}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px]">{t.priority}</span>
                </div>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.description}</p>
                <div className={`flex justify-between text-[10px] pt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>{t.customer_name} ({t.phone})</span>
                  <span>{t.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Contacts & Call Logs Sub-Grid */}
      <div className={`pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 ${isDark ? 'border-[#2f2f2f]' : 'border-slate-200'}`}>
        <div>
          <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
            Saved Contacts ({contacts.length})
          </h4>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {contacts.map((c) => (
              <div key={c.id} className={`p-2.5 rounded-lg border flex justify-between items-center text-xs ${
                isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{c.name}</p>
                  <p className="font-mono text-cyan-500 text-[11px]">{c.phone}</p>
                </div>
                {onUseContact && (
                  <button
                    onClick={() => onUseContact(c.name, c.phone)}
                    className={`px-2 py-1 rounded font-semibold text-[10px] transition cursor-pointer ${
                      isDark ? 'bg-[#2a2a2a] hover:bg-cyan-500 hover:text-slate-950 text-slate-300' : 'bg-slate-200 hover:bg-cyan-600 hover:text-white text-slate-700'
                    }`}
                  >
                    Use
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
            Call History ({callLogs.length})
          </h4>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {callLogs.map((log) => (
              <div key={log.id} className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between font-semibold">
                  <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>{log.name} ({log.phone})</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    isDark ? 'bg-[#2a2a2a] text-slate-300' : 'bg-slate-200 text-slate-700'
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
