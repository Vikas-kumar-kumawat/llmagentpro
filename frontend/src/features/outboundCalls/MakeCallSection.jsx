import React, { useState } from 'react';
import { makeOutboundCall } from '../../services/apiService';
import { useTheme } from '../../context/ThemeContext';

function formatPhoneNumber(val) {
  const raw = val.trim();
  if (!raw) return '';
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return raw;
  if (cleaned.startsWith && cleaned.startsWith('+')) return cleaned;
  const noZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+91${noZero}`;
}

export function MakeCallSection({ onRefreshData, onTriggerCall }) {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [callResult, setCallResult] = useState(null);

  const handleMakeCall = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill in both Customer Name and Phone Number.');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    setPhone(formattedPhone);

    if (onTriggerCall) {
      onTriggerCall(name.trim(), formattedPhone);
      if (onRefreshData) onRefreshData();
      return;
    }

    setLoading(true);
    setCallResult(null);

    try {
      const data = await makeOutboundCall(name.trim(), formattedPhone, customMsg.trim());
      setCallResult(data);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setCallResult({
        success: false,
        status: 'error',
        message: 'Failed to connect to backend server.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-5 rounded-2xl border space-y-4 max-w-2xl mx-auto mt-4 font-['Plus_Jakarta_Sans',sans-serif] ${
      isDark ? 'border-[#1e1e24] bg-[#070709] text-white shadow-2xl' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
    }`}>
      <h3 className={`text-base font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <span>📞</span> Instant AI Outbound Dialer
      </h3>

      <form onSubmit={handleMakeCall} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Customer Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => phone.trim() && setPhone(formatPhoneNumber(phone))}
              placeholder="e.g. 9876543210"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Greeting Voice Script (Optional):
          </label>
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Custom TwiML speech script..."
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
              isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition duration-150 border cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-2 ${
            isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
          }`}
        >
          <span>{loading ? 'Initiating Call...' : '📞 Make Call Now'}</span>
        </button>
      </form>

      {callResult && (
        <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
          isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white' : 'border-slate-200 bg-slate-50 text-slate-900 shadow-xs'
        }`}>
          <div className="flex justify-between font-extrabold text-sm">
            <span>
              {callResult.success ? '✅ Call Placed' : callResult.status === 'configuration_error' ? '⚠️ Contact Stored (Twilio Pending)' : '❌ Call Failed'}
            </span>
            {callResult.call_sid && (
              <span className="font-mono text-xs text-emerald-400">SID: {callResult.call_sid}</span>
            )}
          </div>
          <p className="leading-relaxed opacity-80">{callResult.message}</p>
        </div>
      )}
    </div>
  );
}
