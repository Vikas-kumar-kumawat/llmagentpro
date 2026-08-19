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

export function FeedbackDetailModal({
  selectedFeedback,
  setSelectedFeedback,
  handleTriggerCall,
  handleClearFeedback,
  rowCallStatuses = {}
}) {
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
    const interval = setInterval(fetchLiveData, 2000);
    return () => clearInterval(interval);
  }, [selectedFeedback?.id]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveData, activeFeedback?.transcript]);

  const handleCancelCall = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      const sid = activeSid || 'SIMULATED_SID';
      await cancelActiveCall(sid);
      setCancelledSids(prev => new Set([...prev, selectedFeedback?.id]));
    } catch (e) {
      console.error('Cancel call error:', e);
    } finally {
      setIsCancelling(false);
    }
  };

  const callWasCancelled = cancelledSids.has(selectedFeedback?.id);

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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-4xl rounded-t-2xl sm:rounded-2xl border border-[#27272a] bg-[#09090b] text-white shadow-2xl overflow-hidden flex flex-col h-[94vh] sm:h-[88vh] max-h-[95vh]"
      >

        {/* Card Header Banner */}
        <div className="p-3.5 sm:p-6 border-b flex items-center justify-between gap-2 bg-[#000000] border-[#27272a] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border border-[#27272a] bg-[#18181b] text-white font-semibold text-xs sm:text-base flex items-center justify-center shrink-0 shadow-sm">
              {activeFeedback?.avatar || (activeFeedback?.customer_name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-lg text-white truncate">{activeFeedback?.customer_name || 'Customer'}</h3>
                {isLiveCalling ? (
                  <span className="px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[#18181b] text-white border border-[#27272a] animate-pulse flex items-center gap-1">
                    <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-white" /> LIVE
                  </span>
                ) : (
                  <span className="px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-medium uppercase border bg-[#18181b] text-white border-[#27272a]">
                    {activeFeedback?.sentiment || 'neutral'}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-[#a1a1aa] font-mono flex items-center gap-1.5 mt-0.5 truncate">
                <span>{activeFeedback?.phone || ''}</span> • <span>{activeFeedback?.created_at || ''}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFeedback(null)}
            className="p-2 rounded-lg transition cursor-pointer text-[#a1a1aa] hover:text-white hover:bg-[#18181b] border border-[#27272a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 flex flex-col justify-between">
          {/* Recorded Customer Feedback Highlight Card */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-[#27272a] bg-[#000000] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span className="font-semibold text-xs uppercase tracking-wider text-white">
                  Customer Feedback
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-current text-white" />
                <span>{parseInt(activeFeedback?.rating) || 0} / 5</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#a1a1aa] pt-0.5">
              "{activeFeedback?.feedback_text || activeFeedback?.notes || 'No customer feedback text recorded.'}"
            </p>
            {activeFeedback?.recording_url && (
              <div className="mt-3 pt-3 border-t border-[#27272a]">
                <p className="text-[10px] uppercase font-semibold text-[#a1a1aa] mb-2 tracking-wider">Call Recording</p>
                <audio controls className="w-full h-8" src={`${API_BASE_URL}/api/v1/twilio/proxy-recording?url=${encodeURIComponent(activeFeedback.recording_url)}`}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Conversation Transcript Thread */}
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272a] shrink-0">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
                {isLiveCalling ? 'Live Call Transcript' : 'Conversation Transcript'}
              </h4>
              {isLiveCalling && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-white animate-pulse">
                  <Radio className="w-3.5 h-3.5 text-white" />
                  LIVE
                </span>
              )}
            </div>

            {/* Transcript messages */}
            <div className="space-y-2.5 max-h-[500px] sm:max-h-[550px] overflow-y-auto pr-2 flex-1">
              {transcriptThread.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#71717a] font-mono border border-dashed border-[#27272a] rounded-xl bg-[#000000] my-auto">
                  No active transcript history available for this customer.
                </div>
              ) : (
                transcriptThread.map((chat, index) => {
                  const isAgent = chat.speaker === 'agent';

                  return (
                    <div
                      key={index}
                      className={`flex gap-2.5 items-start ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className="w-7 h-7 rounded-full border border-[#27272a] bg-[#18181b] text-white text-[11px] flex items-center justify-center shrink-0">
                        {isAgent ? '🤖' : '👤'}
                      </div>

                      <div className={`flex-1 flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-1.5 mb-0.5 px-1">
                          <span className="text-[11px] font-semibold text-white">
                            {chat.name}
                          </span>
                          <span className="text-[10px] text-[#71717a] font-mono">{chat.time}</span>
                        </div>

                        <div className={`py-2 px-3 rounded-lg max-w-[78%] text-xs leading-normal border ${isAgent
                            ? 'bg-[#000000] border-[#27272a] text-white rounded-tl-none'
                            : 'bg-white text-black border-white rounded-tr-none font-medium'
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
        <div className="p-3.5 sm:p-5 border-t border-[#27272a] bg-[#000000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={() => handleClearFeedback && handleClearFeedback(selectedFeedback.id)}
            title="Remove previous feedback transcript & clear rating for this customer"
            className="px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#18181b] hover:bg-[#27272a] text-white border border-[#27272a] transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5 text-white" />
            <span>Clear Previous Feedback</span>
          </button>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedFeedback(null)}
              className="px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border bg-[#18181b] hover:bg-[#27272a] text-white border-[#27272a] flex-1 sm:flex-none text-center"
            >
              Close
            </button>

            {(isLiveCalling && !callWasCancelled) && (
              <button
                onClick={handleCancelCall}
                disabled={isCancelling}
                className="px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition bg-[#18181b] hover:bg-[#27272a] text-white border border-[#27272a] flex-1 sm:flex-none"
              >
                <PhoneOff className="w-4 h-4" />
                <span>{isCancelling ? 'Cancelling...' : 'Cancel Call'}</span>
              </button>
            )}

            {!isLiveCalling && (
              <button
                onClick={() => {
                  handleTriggerCall(selectedFeedback.customer_name, selectedFeedback.phone);
                  setSelectedFeedback(null);
                }}
                className="px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-none"
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

