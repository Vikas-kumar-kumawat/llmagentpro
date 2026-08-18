import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Phone, Star, MessageSquare } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function EditCustomerModal({
  editingFeedback,
  setEditingFeedback,
  handleSaveEdit
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
        isDark ? 'bg-[#212121] border-[#2f2f2f] text-[#ececec]' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 md:p-5 flex items-center justify-between border-b ${
          isDark ? 'border-[#2d2d2d] bg-[#1a1a1a]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-500" />
            <h3 className="text-base font-extrabold tracking-tight">Edit Customer Entry</h3>
          </div>
          <button
            onClick={() => setEditingFeedback(null)}
            className={`p-1.5 rounded-xl transition ${
              isDark ? 'hover:bg-[#2b2b2b] text-zinc-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Customer Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer Name..."
                className={`w-full py-2 pl-9 pr-3 rounded-xl border focus:outline-none transition ${
                  isDark
                    ? 'bg-[#181818] border-[#2d2d2d] text-white focus:border-cyan-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-600'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className={`w-full py-2 pl-9 pr-3 rounded-xl border focus:outline-none transition ${
                  isDark
                    ? 'bg-[#181818] border-[#2d2d2d] text-white focus:border-cyan-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-600'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className={`w-full py-2 px-3 rounded-xl border focus:outline-none font-semibold ${
                  isDark ? 'bg-[#181818] border-[#2d2d2d] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sentiment
              </label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl border focus:outline-none font-semibold ${
                  isDark ? 'bg-[#181818] border-[#2d2d2d] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Feedback Comment
            </label>
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Feedback notes..."
                className={`w-full py-2 pl-9 pr-3 rounded-xl border focus:outline-none transition ${
                  isDark
                    ? 'bg-[#181818] border-[#2d2d2d] text-white focus:border-cyan-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-600'
                }`}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingFeedback(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                isDark ? 'border-[#2d2d2d] hover:bg-[#282828] text-zinc-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Customer Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
