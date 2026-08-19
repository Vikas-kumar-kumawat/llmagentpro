import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Phone, MessageSquare } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function EditCustomerModal({
  editingFeedback,
  setEditingFeedback,
  handleSaveEdit
}) {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [sentiment, setSentiment] = useState('neutral');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingFeedback) {
      setName(editingFeedback.customer_name || '');
      setPhone(editingFeedback.phone || '');
      setRating(editingFeedback.rating || 5);
      setFeedbackText(editingFeedback.feedback_text || '');
      setSentiment(editingFeedback.sentiment || 'neutral');
    }
  }, [editingFeedback]);

  if (!editingFeedback) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Name and phone number are required.');
      return;
    }
    setIsSaving(true);
    await handleSaveEdit(editingFeedback.id, {
      customer_name: name.trim(),
      phone: phone.trim(),
      rating,
      feedback_text: feedbackText.trim(),
      sentiment
    });
    setIsSaving(false);
    setEditingFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden ${
        isDark ? 'border-[#1e1e24] bg-[#070709] text-white' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${
          isDark ? 'border-[#1e1e24] bg-[#050507]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <User className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <h3 className={`text-sm font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Customer Record</h3>
          </div>
          <button
            onClick={() => setEditingFeedback(null)}
            className={`p-1 rounded-lg transition border cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-[#141418] border-[#22222a]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              Customer Name
            </label>
            <div className="relative">
              <User className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-zinc-400' : 'text-slate-400'
              }`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer Name..."
                className={`w-full py-2.5 pl-9 pr-3 rounded-lg border text-xs focus:outline-none transition ${
                  isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              Phone Number
            </label>
            <div className="relative">
              <Phone className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-zinc-400' : 'text-slate-400'
              }`} />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className={`w-full py-2.5 pl-9 pr-3 rounded-lg border text-xs focus:outline-none transition ${
                  isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className={`w-full py-2.5 px-3 rounded-lg border text-xs focus:outline-none ${
                  isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white' : 'border-slate-300 bg-white text-slate-900 shadow-xs'
                }`}
              >
                <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                <option value={3}>3 Stars ⭐⭐⭐</option>
                <option value={2}>2 Stars ⭐⭐</option>
                <option value={1}>1 Star ⭐</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Sentiment
              </label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-lg border text-xs focus:outline-none ${
                  isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white' : 'border-slate-300 bg-white text-slate-900 shadow-xs'
                }`}
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              Feedback Comment
            </label>
            <div className="relative">
              <MessageSquare className={`w-3.5 h-3.5 absolute left-3 top-3 ${
                isDark ? 'text-zinc-400' : 'text-slate-400'
              }`} />
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Feedback notes..."
                className={`w-full py-2.5 pl-9 pr-3 rounded-lg border text-xs focus:outline-none transition ${
                  isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-zinc-500' : 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 shadow-xs'
                }`}
              />
            </div>
          </div>

          <div className={`pt-3 flex items-center justify-end gap-2.5 border-t ${
            isDark ? 'border-[#1e1e24]' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setEditingFeedback(null)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition ${
                isDark ? 'border-[#22222a] bg-[#0c0c0f] hover:bg-[#141418] text-white' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

