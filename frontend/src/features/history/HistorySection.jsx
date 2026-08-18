import React from 'react';

export function HistorySection({ feedbackEntries, supportTickets, contacts, callLogs, onUseContact }) {
  return (
    <div className="space-y-5 font-['Plus_Jakarta_Sans',sans-serif] text-white">
      
      {/* Feedback History */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
          Customer Feedback Logs ({feedbackEntries.length})
        </h3>
        {feedbackEntries.length === 0 ? (
          <p className="text-xs text-[#a1a1aa] italic">No feedback entries recorded yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {feedbackEntries.map((fb) => (
              <div key={fb.id} className="p-3 rounded-lg border border-[#27272a] bg-[#000000] text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{fb.customer_name} ({fb.phone})</span>
                  <span className="font-mono text-white font-medium">{fb.rating} ★</span>
                </div>
                <p className="italic text-[#a1a1aa]">"{fb.feedback_text || 'No comment'}"</p>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-full uppercase bg-[#18181b] text-white border border-[#27272a]">{fb.sentiment}</span>
                  <span className="px-2 py-0.5 rounded-full uppercase bg-[#18181b] text-white border border-[#27272a]">{fb.category}</span>
                  <span className="ml-auto text-[#71717a]">{fb.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Tickets */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
          Auto-Generated Support Tickets ({supportTickets.length})
        </h3>
        {supportTickets.length === 0 ? (
          <p className="text-xs text-[#a1a1aa] italic">No support tickets generated yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {supportTickets.map((t) => (
              <div key={t.id} className="p-3 rounded-lg border border-[#27272a] bg-[#000000] text-xs space-y-1.5">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-white font-mono">Ticket #{t.id}: {t.subject}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a] text-[10px] font-mono uppercase">{t.priority}</span>
                </div>
                <p className="text-xs text-[#a1a1aa]">{t.description}</p>
                <div className="flex justify-between text-[10px] font-mono pt-1 text-[#71717a]">
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
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 sm:p-5">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
            Saved Directory ({contacts.length})
          </h4>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {contacts.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-[#27272a] bg-[#000000] flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="font-mono text-[#a1a1aa] text-[11px]">{c.phone}</p>
                </div>
                {onUseContact && (
                  <button
                    onClick={() => onUseContact(c.name, c.phone)}
                    className="px-3 py-1 rounded-md text-[11px] font-semibold bg-white text-black hover:bg-zinc-200 transition cursor-pointer border border-white"
                  >
                    Use
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 sm:p-5">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
            Call Audit Log ({callLogs.length})
          </h4>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {callLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg border border-[#27272a] bg-[#000000] text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-white font-mono">{log.name} ({log.phone})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase bg-[#18181b] text-white border border-[#27272a]">
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

