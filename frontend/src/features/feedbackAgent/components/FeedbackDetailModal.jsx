import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  PhoneOff,
  Volume2, 
  Mic, 
  MessageSquare, 
  Play, 
  Pause,
  Activity,
  Radio
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cancelActiveCall, getCustomerById } from '../../../services/apiService';

export function FeedbackDetailModal({ 
  selectedFeedback, 
  setSelectedFeedback, 
  handleTriggerCall,
  rowCallStatuses = {} 
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelledSids, setCancelledSids] = useState(new Set());
  const [liveData, setLiveData] = useState(null); // real-time polled data
  const transcriptEndRef = useRef(null);

  const isLiveCalling = rowCallStatuses[selectedFeedback?.id] === 'calling';
  const activeSid = rowCallStatuses[`${selectedFeedback?.id}_sid`];

  // ── Live transcript polling: fetch fresh data every 2s while call is live ─
  useEffect(() => {
    if (!isLiveCalling || !selectedFeedback?.id) {
      setLiveData(null);
      return;
    }

    const fetchLiveData = async () => {
      try {
        const data = await getCustomerById(selectedFeedback.id);
        if (data && !data.detail) setLiveData(data);
      } catch (e) {
        // silent — don't crash UI on polling error
      }
    };

    fetchLiveData(); // immediate first fetch
    const interval = setInterval(fetchLiveData, 2000);
    return () => clearInterval(interval);
  }, [isLiveCalling, selectedFeedback?.id]);

  // ── Auto-scroll to latest transcript message ──────────────────────────────
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveData]);

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

  // Stop audio on modal close or change
  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [selectedFeedback]);

  if (!selectedFeedback) return null;

  // Use live polled data when call is active, otherwise use static prop
  const activeFeedback = liveData || selectedFeedback;

  // Generate conversation transcript thread based on customer feedback entry
  const getTranscriptThread = (item) => {
    let thread = [];
    if (item?.transcript) {
      try {
        const parsed = typeof item.transcript === 'string' ? JSON.parse(item.transcript) : item.transcript;
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

    if (thread.length === 0) {
      const isPos = item?.sentiment === 'positive';
      const isNeg = item?.sentiment === 'negative';

      return [
        {
          speaker: 'agent',
          name: 'AI Voice Collector',
          time: 'Just now',
          text: `Hello ${item?.customer_name || 'Customer'}! I am calling from BFibernet customer service regarding your internet connection. How is your experience?`
        },
        {
          speaker: 'customer',
          name: item?.customer_name || 'Customer',
          time: 'Just now',
          text: item?.feedback_text || 'Connecting...'
        },
        {
          speaker: 'agent',
          name: 'AI Voice Collector',
          time: 'Just now',
          text: isPos 
            ? `Thank you so much for your positive feedback! We have recorded your experience.`
            : isNeg
            ? `We apologize for the inconvenience. Our technical support team has been notified.`
            : `Thank you for sharing your feedback with BFibernet!`
        }
      ];
    }

    // Ensure customer message is present if feedback_text exists but hasn't been added to transcript array
    const hasCustomerMessage = thread.some(t => t.speaker === 'customer');
    if (!hasCustomerMessage && item?.feedback_text && item.feedback_text !== 'Calling customer...') {
      thread.push({
        speaker: 'customer',
        name: item?.customer_name || 'Customer',
        time: 'Recorded Feedback',
        text: item.feedback_text
      });
    }

    return thread;
  };

  const transcriptThread = getTranscriptThread(activeFeedback);

  // Play audio simulation
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    setAudioProgress(10);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const fullSpeech = transcriptThread.map(t => `${t.speaker === 'agent' ? 'AI Voice Assistant says' : 'Customer says'}: ${t.text}`).join('. ');
      const utterance = new SpeechSynthesisUtterance(fullSpeech);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlayingAudio(false);
        setAudioProgress(100);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      let current = 10;
      const interval = setInterval(() => {
        current += 20;
        setAudioProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          setIsPlayingAudio(false);
        }
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        isDark ? 'bg-[#1a1a1a] border-[#2c2c2c] text-[#ececec]' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Card Header Banner */}
        <div className={`p-5 border-b flex items-center justify-between gap-3 ${
          isLiveCalling 
            ? 'bg-amber-500/15 border-amber-500/20' 
            : isDark ? 'bg-[#222222] border-[#2c2c2c]' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${activeFeedback?.avatarBg || 'bg-gradient-to-tr from-cyan-600 to-blue-600'} text-white font-extrabold text-base flex items-center justify-center shadow-lg shrink-0`}>
              {activeFeedback?.avatar || (activeFeedback?.customer_name || '?').slice(0,2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>{activeFeedback?.customer_name || 'Customer'}</h3>
                {isLiveCalling ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-spin" /> LIVE CALLING
                  </span>
                ) : (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                    activeFeedback?.sentiment === 'positive'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : activeFeedback?.sentiment === 'negative'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {activeFeedback?.sentiment || 'neutral'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span>{activeFeedback?.phone || ''}</span> • <span>{activeFeedback?.created_at || ''}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={() => setSelectedFeedback(null)} 
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-[#2c2c2c]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Recorded Customer Feedback Highlight Card */}
          <div className={`p-4.5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-cyan-50/60 border-cyan-200/70 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-cyan-500">
                  Recorded Customer Feedback
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                activeFeedback?.sentiment === 'positive'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : activeFeedback?.sentiment === 'negative'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {activeFeedback?.sentiment || 'Neutral'}
              </span>
            </div>
            <p className={`text-sm italic font-medium leading-relaxed ${
              isDark ? 'text-zinc-200' : 'text-slate-800'
            }`}>
              "{activeFeedback?.feedback_text || activeFeedback?.notes || 'No customer feedback text recorded yet.'}"
            </p>
          </div>

          {/* Audio Player & Waveform Box */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#151515] border-[#2c2c2c]' : 'bg-slate-50 border-slate-100 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-cyan-500">
                  Voice Call Recording & Synthesis Player
                </span>
              </div>

              <span className="text-xs font-mono text-slate-400">
                {isPlayingAudio ? 'Playing...' : '0:42 / 1:15'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleAudio}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white transition cursor-pointer shrink-0 shadow-md ${
                  isPlayingAudio
                    ? 'bg-amber-600 hover:bg-amber-500 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              {/* Animated Waveform Visualization */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1 h-8">
                  {[25, 45, 75, 20, 90, 60, 30, 85, 50, 95, 30, 70, 45, 80, 20, 65, 90, 40, 75, 25, 85, 40, 60, 35, 75].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${
                        isPlayingAudio ? 'bg-cyan-500 animate-pulse' : isDark ? 'bg-zinc-800' : 'bg-slate-300'
                      }`}
                      style={{ height: isPlayingAudio ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : `${h}%` }}
                    ></div>
                  ))}
                </div>

                <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-1.5 transition-all duration-300 rounded-full"
                    style={{ width: `${audioProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Transcript Thread */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-500" />
                {isLiveCalling ? 'Live Call Transcript' : 'Conversation Transcript'}
              </h4>
              {isLiveCalling ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 animate-pulse">
                  <Radio className="w-3 h-3" />
                  LIVE · Updating every 2s
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">Recorded by LangGraph AI</span>
              )}
            </div>

            {/* Live status bar */}
            {isLiveCalling && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Call in progress — transcript updates automatically as the conversation happens
              </div>
            )}

            {/* Transcript messages */}
            <div className="space-y-5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {transcriptThread.map((chat, index) => {
                const isAgent = chat.speaker === 'agent';
                const isLastMsg = index === transcriptThread.length - 1;

                return (
                  <div
                    key={index}
                    className={`flex gap-3 items-start ${isAgent ? 'flex-row' : 'flex-row-reverse'} ${
                      isLiveCalling && isLastMsg ? 'animate-fadeIn' : ''
                    }`}
                  >
                    {/* Speaker Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow ${
                      isAgent 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {isAgent ? '🤖' : '👤'}
                    </div>

                    <div className={`flex-1 flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-xs font-bold ${isAgent ? 'text-cyan-500' : 'text-blue-500'}`}>
                          {chat.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{chat.time}</span>
                        {isLiveCalling && isLastMsg && (
                          <span className="text-[9px] font-bold text-rose-400 animate-pulse">● LIVE</span>
                        )}
                      </div>

                      <div className={`p-4 rounded-2xl max-w-[78%] text-[13px] md:text-sm leading-relaxed border shadow-xs ${
                        isAgent
                          ? isDark 
                            ? 'bg-[#222222] border-[#2d2d2d] text-zinc-200 rounded-tl-none' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 rounded-tl-none'
                          : isDark
                            ? 'bg-[#1e2d3d] border-[#2c4050] text-cyan-100 rounded-tr-none'
                            : 'bg-blue-600 text-white border-blue-700 rounded-tr-none shadow-sm'
                      }`}>
                        {chat.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator — shows while call is live and AI may be responding */}
              {isLiveCalling && !callWasCancelled && (
                <div className="flex gap-3 items-start flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    🤖
                  </div>
                  <div className={`p-3 rounded-2xl rounded-tl-none border ${
                    isDark ? 'bg-[#222222] border-[#2d2d2d]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-scroll anchor */}
              <div ref={transcriptEndRef} />
            </div>
          </div>


          {/* Call Metadata Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border ${
            isDark ? 'bg-[#151515] border-[#2c2c2c]' : 'bg-slate-50 border-slate-100'
          }`}>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Rating Given</span>
              <span className="font-extrabold text-amber-500 text-base">
                {'★'.repeat(Math.max(0, Math.min(5, parseInt(activeFeedback?.rating) || 0)))}
                {'☆'.repeat(Math.max(0, 5 - Math.min(5, parseInt(activeFeedback?.rating) || 0)))}
                {' '}<span className="text-xs text-slate-400 font-normal">({parseInt(activeFeedback?.rating) || 0}/5)</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Call Duration</span>
              <span className="font-mono text-sm font-semibold text-zinc-300">1 min 15 sec</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Category Tag</span>
              <span className="font-semibold text-sm text-cyan-400 capitalize">
                {(activeFeedback?.category || 'general').replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className={`p-5 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-[#222222] border-[#2c2c2c]' : 'bg-slate-50 border-slate-100'
        }`}>
          <button
            onClick={handleToggleAudio}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              isPlayingAudio
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : isDark ? 'bg-[#2c2c2c] hover:bg-[#333] text-zinc-200 border-[#383838]' : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4 text-cyan-500" />
            <span>{isPlayingAudio ? 'Stop Audio' : 'Play Voice Recording'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedFeedback(null)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border ${
                isDark ? 'bg-[#2c2c2c] text-zinc-300 border-[#383838]' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Close
            </button>

            {/* Cancel Call Button — shown during live call */}
            {(isLiveCalling && !callWasCancelled) && (
              <button
                onClick={handleCancelCall}
                disabled={isCancelling}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-md border ${
                  isCancelling
                    ? 'bg-rose-800/50 text-rose-300 border-rose-700/50 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-700 animate-pulse'
                }`}
              >
                <PhoneOff className="w-4 h-4" />
                <span>{isCancelling ? 'Cancelling...' : '⛔ Cancel Call'}</span>
              </button>
            )}

            {/* Cancelled confirmation badge */}
            {callWasCancelled && (
              <span className="px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-700/50 text-zinc-400 border border-zinc-600/40 flex items-center gap-2">
                <PhoneOff className="w-4 h-4" />
                Call Cancelled
              </span>
            )}

            {/* Call Again — shown when not live */}
            {!isLiveCalling && (
              <button
                onClick={() => {
                  handleTriggerCall(selectedFeedback.customer_name, selectedFeedback.phone);
                  setSelectedFeedback(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md cursor-pointer flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Customer Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
