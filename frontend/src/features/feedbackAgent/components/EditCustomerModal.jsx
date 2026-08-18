import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Phone, MessageSquare } from 'lucide-react';

export function EditCustomerModal({
  editingFeedback,
  setEditingFeedback,
  handleSaveEdit
}) {
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg rounded-xl border border-[#27272a] bg-[#09090b] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#27272a] bg-[#000000]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-white" />
            <h3 className="text-sm font-semibold tracking-tight text-white">Edit Customer Record</h3>
          </div>
          <button
            onClick={() => setEditingFeedback(null)}
            className="p-1 rounded-lg transition text-[#a1a1aa] hover:text-white hover:bg-[#18181b] border border-[#27272a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">
              Customer Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer Name..."
                className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
              >
                <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                <option value={3}>3 Stars ⭐⭐⭐</option>
                <option value={2}>2 Stars ⭐⭐</option>
                <option value={1}>1 Star ⭐</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">
                Sentiment
              </label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">
              Feedback Comment
            </label>
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-3" />
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Feedback notes..."
                className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#27272a]">
            <button
              type="button"
              onClick={() => setEditingFeedback(null)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-[#27272a] bg-[#000000] hover:bg-[#18181b] text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

