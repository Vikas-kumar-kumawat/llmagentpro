import React, { useState } from 'react';
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

export function MakeCallSection({ onRefreshData, onTriggerCall }) {
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
    <div className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif] text-white">
      <form onSubmit={handleMakeCall} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
              Customer Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => phone.trim() && setPhone(formatPhoneNumber(phone))}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#a1a1aa] mb-1">
            Greeting Voice Script (Optional):
          </label>
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Custom TwiML speech script..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-xs transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-white hover:bg-zinc-200"
        >
          <span>{loading ? 'Initiating Call...' : '📞 Make Call Now'}</span>
        </button>
      </form>

      {callResult && (
        <div className="p-4 rounded-xl text-xs space-y-1.5 border border-[#27272a] bg-[#09090b] text-white">
          <div className="flex justify-between font-semibold text-sm">
            <span>
              {callResult.success ? '✅ Call Placed' : callResult.status === 'configuration_error' ? '⚠️ Contact Stored (Twilio Pending)' : '❌ Call Failed'}
            </span>
            {callResult.call_sid && (
              <span className="font-mono text-xs text-[#a1a1aa]">SID: {callResult.call_sid}</span>
            )}
          </div>
          <p className="leading-relaxed text-[#a1a1aa]">{callResult.message}</p>
        </div>
      )}
    </div>
  );
}

