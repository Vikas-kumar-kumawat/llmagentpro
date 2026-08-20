import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  MessageSquare,
  Activity,
  Radio,
  Star,
  RotateCw
} from 'lucide-react';
import { cancelActiveCall, getCustomerById, API_BASE_URL } from '../../../services/apiService';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackDetailModal({
  selectedFeedback,
  setSelectedFeedback,
  handleTriggerCall,
  handleClearFeedback,
  rowCallStatuses = {}
}) {
  const { isDark } = useTheme();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelledSids, setCancelledSids] = useState(new Set());
  const [liveData, setLiveData] = useState(null);
  const transcriptEndRef = useRef(null);
  const activeFeedback = liveData || selectedFeedback;
  const isRowCalling = rowCallStatuses[selectedFeedback?.id] === 'calling';
  const isLiveCalling = isRowCalling && activeFeedback?.status !== 'completed' && activeFeedback?.status !== 'failed';
  const activeSid = rowCallStatuses[`${selectedFeedback?.id}_sid`];

  useEffect(() => {
    setLiveData(null);
    if (!selectedFeedback?.id) return;

    const fetchLiveData = async () => {
      try {
        const data = await getCustomerById(selectedFeedback.id);
        if (data && !data.detail) {
          setLiveData(data);
        }
      } catch (e) { }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [selectedFeedback?.id]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveData, selectedFeedback]);

  const handleCancelCallClick = async () => {
    if (!activeSid || isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelActiveCall(activeSid);
      setCancelledSids((prev) => new Set(prev).add(activeSid));
    } catch (err) {
      console.error('Error cancelling call from detail modal:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const callWasCancelled = cancelledSids.has(activeSid);

  if (!selectedFeedback) return null;

  const getTranscriptThread = (item) => {
    if (!item) return [];
    if (item?.cleared || item?.feedback_text === 'No previous feedback recorded.') {
      return [];
    }

    let thread = [];
    if (item?.transcript) {
      try {
        let parsed = typeof item.transcript === 'string' ? JSON.parse(item.transcript) : item.transcript;
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch (e) { }
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          thread = parsed.map(t => ({
            speaker: t.speaker || (t.role === 'user' ? 'customer' : 'agent'),
            name: t.name || (t.speaker === 'agent' || t.speaker === 'ai' ? 'AI Voice Collector' : (item.customer_name || 'Customer')),
            time: t.time || 'Live',
            text: t.text || t.content || ''
          }));
        }
      } catch (e) {
        console.error('Error parsing transcript:', e);
      }
    }


    return thread;
  };

  const transcriptThread = getTranscriptThread(activeFeedback);

  return (
    <div 
      onClick={() => setSelectedFeedback(null)} 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`w-full max-w-4xl rounded-t-2xl sm:rounded-2xl border shadow-2xl overflow-hidden flex flex-col h-[94vh] sm:h-[88vh] max-h-[95vh] ${
          isDark ? 'border-[#1e1e24] bg-[#070709] text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >

        {/* Card Header Banner */}
        <div className={`p-3.5 sm:p-6 border-b flex items-center justify-between gap-2 shrink-0 ${
          isDark ? 'bg-[#050507] border-[#1e1e24]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
            <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full border font-semibold text-xs sm:text-base flex items-center justify-center shrink-0 shadow-sm ${
              isDark ? 'border-[#282832] bg-[#18181c] text-white' : 'border-slate-200 bg-white text-slate-800'
            }`}>
              {activeFeedback?.avatar || (activeFeedback?.customer_name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold text-sm sm:text-lg truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeFeedback?.customer_name || 'Customer'}</h3>
                {isLiveCalling ? (
                  <span className={`px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border animate-pulse flex items-center gap-1 ${
                    isDark ? 'bg-[#18181c] text-white border-[#282832]' : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> LIVE
                  </span>
                ) : (
                  <span className={`px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase border ${
                    isDark ? 'bg-[#18181c] text-zinc-300 border-[#282832]' : 'bg-slate-200 text-slate-800 border-slate-300'
                  }`}>
                    {activeFeedback?.sentiment || 'neutral'}
                  </span>
                )}
              </div>
              <p className={`text-[10px] sm:text-xs font-mono flex items-center gap-1.5 mt-0.5 truncate ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                <span>{activeFeedback?.phone || ''}</span> • <span>{activeFeedback?.created_at || ''}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFeedback(null)}
            className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
              isDark ? 'border-[#22222a] bg-[#0c0c0f] text-zinc-400 hover:text-white' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-xs'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 flex flex-col justify-between">
          {/* Recorded Customer Feedback Highlight Card */}
          <div className={`p-3.5 sm:p-4 rounded-xl border shrink-0 ${
            isDark ? 'border-[#1e1e24] bg-[#0c0c0f]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <MessageSquare className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                <span className={`font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Customer Feedback
                </span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>{parseInt(activeFeedback?.rating) || 0} / 5</span>
              </div>
            </div>
            <p className={`text-xs sm:text-sm font-medium leading-relaxed pt-0.5 ${
              isDark ? 'text-zinc-300' : 'text-slate-700'
            }`}>
              "{activeFeedback?.feedback_text || activeFeedback?.notes || 'No customer feedback text recorded.'}"
            </p>
            {activeFeedback?.recording_url && (
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-[#1e1e24]' : 'border-slate-200'}`}>
                <p className={`text-[10px] uppercase font-semibold mb-2 tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}>Call Recording</p>
                <audio controls className="w-full h-8" src={`${API_BASE_URL}/api/v1/twilio/proxy-recording?url=${encodeURIComponent(activeFeedback.recording_url)}`}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Conversation Transcript Thread */}
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <div className={`flex items-center justify-between pb-2 border-b shrink-0 ${
              isDark ? 'border-[#1e1e24]' : 'border-slate-200'
            }`}>
              <h4 className={`font-semibold text-xs uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                {isLiveCalling ? 'Live Call Transcript' : 'Conversation Transcript'}
              </h4>
              {isLiveCalling && (
                <span className={`flex items-center gap-1.5 text-xs font-mono font-semibold animate-pulse ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                  LIVE
                </span>
              )}
            </div>

            {/* Transcript messages */}
            <div className="space-y-2.5 max-h-[500px] sm:max-h-[550px] overflow-y-auto pr-2 flex-1">
              {transcriptThread.length === 0 ? (
                <div className={`p-6 text-center text-xs font-mono border border-dashed rounded-xl my-auto ${
                  isDark ? 'border-[#22222a] bg-[#0c0c0f] text-zinc-500' : 'border-slate-300 bg-slate-50 text-slate-500'
                }`}>
                  No active transcript history available for this customer.
                </div>
              ) : (
                transcriptThread.map((chat, index) => {
                  const isAgent = chat.speaker === 'agent';
                  const isHistory = chat.speaker === 'history';

                  if (isHistory) {
                    return (
                      <div key={index} className={`my-2 p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                        isDark ? 'border-[#1e1e24] bg-[#0c0c0f] text-zinc-400' : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}>
                        <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
                          <span>📜 {chat.name || 'Previous Feedback History'}</span>
                          <span>{chat.time}</span>
                        </div>
                        <p className={`text-xs italic ${isDark ? 'text-white' : 'text-slate-900'}`}>"{chat.text}"</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={`flex gap-2.5 items-start ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className={`w-7 h-7 rounded-full border text-[11px] flex items-center justify-center shrink-0 ${
                        isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white' : 'border-slate-300 bg-slate-100 text-slate-800'
                      }`}>
                        {isAgent ? '🤖' : '👤'}
                      </div>

                      <div className={`flex-1 flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-1.5 mb-0.5 px-1">
                          <span className={`text-[11px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {chat.name}
                          </span>
                          <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{chat.time}</span>
                        </div>

                        <div className={`py-2 px-3 rounded-lg max-w-[78%] text-xs leading-normal border ${
                          isAgent
                            ? isDark
                              ? 'bg-[#0c0c0f] border-[#22222a] text-white rounded-tl-none'
                              : 'bg-slate-100 border-slate-200 text-slate-900 rounded-tl-none font-medium'
                            : isDark
                              ? 'bg-white text-black border-white rounded-tr-none font-medium'
                              : 'bg-slate-900 text-white border-slate-900 rounded-tr-none font-medium shadow-xs'
                        }`}>
                          {chat.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className={`p-3.5 sm:p-5 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 ${
          isDark ? 'bg-[#050507] border-[#1e1e24]' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={() => handleClearFeedback && handleClearFeedback(selectedFeedback.id)}
            title="Remove previous feedback transcript & clear rating for this customer"
            className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
              isDark 
                ? 'bg-[#0c0c0f] hover:bg-[#141418] text-white border-[#22222a]' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Clear Previous Feedback</span>
          </button>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedFeedback(null)}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border flex-1 sm:flex-none text-center ${
                isDark 
                  ? 'bg-[#0c0c0f] hover:bg-[#141418] text-white border-[#22222a]' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              Close
            </button>

            {(isLiveCalling && !callWasCancelled) && (
              <button
                onClick={handleCancelCallClick}
                disabled={isCancelling}
                className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition border flex-1 sm:flex-none ${
                  isDark 
                    ? 'bg-[#0c0c0f] hover:bg-[#141418] text-white border-[#22222a]' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                }`}
              >
                <PhoneOff className="w-4 h-4" />
                <span>{isCancelling ? 'Cancelling...' : 'Cancel Call'}</span>
              </button>
            )}

            {!isLiveCalling && (
              <button
                onClick={() => {
                  handleTriggerCall(selectedFeedback.customer_name, selectedFeedback.phone, selectedFeedback);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                  isDark 
                    ? 'bg-white text-black border-white hover:bg-zinc-200' 
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Call Customer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

