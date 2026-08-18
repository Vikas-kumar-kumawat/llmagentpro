import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { makeOutboundCall } from '../../services/apiService';

function formatPhoneNumber(val) {
  const raw = val.trim();
  if (!raw) return '';
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return raw;
  if (cleaned.startsWith && cleaned.startsWith('+')) return cleaned;
  const noZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+91${noZero}`;
}

export function MakeCallSection({ onRefreshData }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="space-y-4">
      <form onSubmit={handleMakeCall} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Customer Name <span className="text-cyan-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500 transition ${
                isDark ? 'bg-[#171717] border-[#2f2f2f] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Customer Phone Number <span className="text-cyan-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => phone.trim() && setPhone(formatPhoneNumber(phone))}
              placeholder="e.g. 9876543210"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500 transition ${
                isDark ? 'bg-[#171717] border-[#2f2f2f] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Greeting Voice Script (Optional):
          </label>
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Custom TwiML speech script..."
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-cyan-500 transition ${
              isDark ? 'bg-[#171717] border-[#2f2f2f] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{loading ? 'Initiating Call...' : '📞 Make Call Now'}</span>
        </button>
      </form>

      {callResult && (
        <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
          callResult.success 
            ? isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : callResult.status === 'configuration_error'
            ? isDark ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-800'
            : isDark ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          <div className="flex justify-between font-bold text-sm">
            <span>
              {callResult.success ? '✅ Call Placed' : callResult.status === 'configuration_error' ? '⚠️ Contact Stored (Twilio Pending)' : '❌ Call Failed'}
            </span>
            {callResult.call_sid && (
              <span className="font-mono text-xs opacity-80">SID: {callResult.call_sid}</span>
            )}
          </div>
          <p className="leading-relaxed">{callResult.message}</p>
        </div>
      )}
    </div>
  );
}
