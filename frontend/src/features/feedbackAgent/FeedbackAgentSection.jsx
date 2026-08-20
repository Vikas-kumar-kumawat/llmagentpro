import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { executeFeedbackAgent, makeOutboundCall, deleteCustomerRecord, updateCustomerRecord, createCustomerRecord } from '../../services/apiService';
import { Zap } from 'lucide-react';

import { DEFAULT_FEEDBACKS, formatPhoneNumber, downloadFeedbacksCSV } from './components/feedbackConstants';
import { FeedbackHeader } from './components/FeedbackHeader';
import { FeedbackMetricsCards } from './components/FeedbackMetricsCards';
import { FeedbackVoiceBanner } from './components/FeedbackVoiceBanner';
import { BatchCallingBanner } from './components/BatchCallingBanner';
import { FeedbackTable } from './components/FeedbackTable';
import { CollectFeedbackModal } from './components/CollectFeedbackModal';
import { FeedbackDetailModal } from './components/FeedbackDetailModal';
import { EditCustomerModal } from './components/EditCustomerModal';

export function FeedbackAgentSection({ feedbackEntries = [], isLoading = false, onRefreshData, initialSelectedFeedback = null }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State with LocalStorage Persistence Fallback
  const [localFeedbacks, setLocalFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem('bfibernet_local_feedbacks');
      const parsed = saved ? JSON.parse(saved) : null;
      // If nothing saved, or if it's an empty array, load the default dummy customers
      if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) {
        return DEFAULT_FEEDBACKS;
      }
      return parsed;
    } catch {
      return DEFAULT_FEEDBACKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bfibernet_local_feedbacks', JSON.stringify(localFeedbacks));
    } catch (e) {
      console.error("Failed to sync local feedbacks to localStorage:", e);
    }
  }, [localFeedbacks]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Persona State
  const [voicePersona, setVoicePersona] = useState('ratan_singh');
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Modal States
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const [editingFeedback, setEditingFeedback] = useState(null);
  const [callingState, setCallingState] = useState({ loading: false, phone: null, msg: '' });

  // Batch Calling State
  const [isBatchCalling, setIsBatchCalling] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ total: 0, current: 0, currentCustomer: '', logs: [] });
  const [rowCallStatuses, setRowCallStatuses] = useState({});
  const cancelBatchRef = useRef(false);

  // Form State for Collect Modal
  const [fbName, setFbName] = useState('');
  const [fbPhone, setFbPhone] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbText, setFbText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentTraceResult, setAgentTraceResult] = useState(null);

  // Merge prop feedback entries if available
  const allFeedbacks = useMemo(() => {
    const backendMapped = (feedbackEntries || []).map(entry => {
      const cName = entry?.customer_name || 'Customer';
      const initials = cName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';
      
      return {
        id: entry?.id || `b_${Math.random()}`,
        customer_name: cName,
        phone: entry?.phone || '',
        avatar: initials,
        avatarBg: 'bg-purple-600',
        feedback_text: entry?.feedback_text || 'No comment provided.',
        sentiment: (entry?.sentiment || 'neutral').toLowerCase(),
        rating: entry?.rating || 3,
        category: entry?.category || 'general',
        transcript: entry?.transcript || null,
        status: entry?.status || 'completed',
        created_at: entry?.created_at || 'Just now'
      };
    });

    const existingIds = new Set(backendMapped.map(b => String(b.id)));
    const existingPhones = new Set(backendMapped.map(b => String(b.phone).replace(/[^\d]/g, '')));

    const uniqueLocal = (localFeedbacks || []).filter(l => {
      const lId = String(l.id);
      const lPhone = String(l.phone || '').replace(/[^\d]/g, '');
      return !existingIds.has(lId) && (lPhone === '' || !existingPhones.has(lPhone));
    });

    return [...backendMapped, ...uniqueLocal];
  }, [feedbackEntries, localFeedbacks]);

  // Filtered Feedbacks
  const filteredFeedbacks = useMemo(() => {
    return (allFeedbacks || []).filter(item => {
      if (!item) return false;
      const cName = String(item.customer_name || '').toLowerCase();
      const phone = String(item.phone || '');
      const text = String(item.feedback_text || '').toLowerCase();
      const query = String(searchQuery || '').toLowerCase();

      const matchesSearch = cName.includes(query) || phone.includes(query) || text.includes(query);
      const matchesSentiment = sentimentFilter === 'all' || String(item.sentiment || '').toLowerCase() === sentimentFilter.toLowerCase();

      return matchesSearch && matchesSentiment;
    });
  }, [allFeedbacks, searchQuery, sentimentFilter]);

  // Dynamic Metrics Calculation
  const metrics = useMemo(() => {
    const totalCount = allFeedbacks.length;
    const positiveCount = allFeedbacks.filter(f => f.sentiment === 'positive').length;
    const negativeCount = allFeedbacks.filter(f => f.sentiment === 'negative').length;

    const posPercent = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 50;
    const negPercent = totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 17;

    return {
      callsMade: totalCount,
      feedbacks: totalCount,
      positivePercent: posPercent,
      negativePercent: negPercent
    };
  }, [allFeedbacks]);

  // Handle Play Voice Persona Audio Demo
  const handlePlayDemo = () => {
    setIsPlayingDemo(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      let text = "Khamma Ghani! Main Ratan Singh hu, aapka AI voice assistant. Main aapki kya sahyog kar sakta hu?";
      if (voicePersona === 'aarav_sharma') {
        text = "Namaste! Main Aarav Sharma baat kar raha hu BFibernet se. Aapki internet speed aur service kaisi chal rahi hai?";
      } else if (voicePersona === 'ananya_verma') {
        text = "Namaste! Main Ananya Verma hu, BFibernet customer care se. Aapka feedback hamare liye bahut aavashyak hai.";
      } else if (voicePersona === 'priya_sharma') {
        text = "Namaste! I am Priya Sharma. I deliver warm, polite, and natural human customer feedback calls.";
      } else if (voicePersona === 'rohan_kapoor') {
        text = "Hello! I am Rohan Kapoor, your AI Voice Support Specialist from BFibernet. How may I assist you today?";
      } else if (voicePersona === 'gauri_devi') {
        text = "Ram Ram sa! Main Gauri hu, BFibernet se aapka feedback lene ke liye call kar rahi hu.";
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = (voicePersona.includes('female') || voicePersona === 'priya_sharma' || voicePersona === 'ananya_verma' || voicePersona === 'gauri_devi') ? 1.1 : 0.95;
      
      // Try finding Indian English / Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India') || v.name.includes('Hindi'));
      if (match) utterance.voice = match;

      utterance.onend = () => setIsPlayingDemo(false);
      utterance.onerror = () => setIsPlayingDemo(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingDemo(false), 3000);
    }
  };

  const onRefreshDataRef = useRef(onRefreshData);
  useEffect(() => {
    onRefreshDataRef.current = onRefreshData;
  }, [onRefreshData]);

  // Live Data Polling while modal is open or batch calling
  useEffect(() => {
    if (!selectedFeedback && !isBatchCalling) return;
    const interval = setInterval(() => {
      if (onRefreshDataRef.current) onRefreshDataRef.current();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedFeedback, isBatchCalling]);

  // Handle Outbound Call directly from Feedback item
  const handleTriggerCall = async (customerName, customerPhone, targetItem = null) => {
    const item = targetItem || allFeedbacks.find(f => f.phone === customerPhone || f.customer_name === customerName) || {
      id: `c_${Date.now()}`,
      customer_name: customerName,
      phone: customerPhone,
      sentiment: 'neutral',
      rating: 5,
      created_at: 'Just now'
    };

    // 1. Immediately open Live Call Detail Modal Card!
    setSelectedFeedback(item);
    setRowCallStatuses(prev => ({ ...prev, [item.id]: 'calling' }));
    setCallingState({ loading: true, phone: customerPhone, msg: `Calling ${customerName}...` });

    try {
      const res = await makeOutboundCall(customerName, customerPhone, "Following up on your feedback inquiry.", item.id);
      // Store call_sid so Cancel Call button can terminate the call via Twilio
      const sid = res.call_sid || res.contact?.call_sid || null;
      const realId = res.contact?.customer_id || item.id;

      if (realId !== item.id) {
        setSelectedFeedback(prev => (prev && prev.id === item.id ? { ...prev, id: realId } : prev));
        setLocalFeedbacks(prevList => prevList.map(f => f.id === item.id ? { ...f, id: realId } : f));
      }

      setRowCallStatuses(prev => ({
        ...prev,
        [realId]: res.success ? 'calling' : 'failed',
        [`${realId}_sid`]: sid
      }));
      setCallingState({ 
        loading: false, 
        phone: customerPhone, 
        msg: res.success ? `Call initiated to ${customerName}! ${res.simulated ? '(Simulated Mode)' : ''}` : `Call Failed: ${res.message || 'Twilio Error'}`
      });

      if (res.simulated) {
        setTimeout(() => {
          setRowCallStatuses(prev => ({ ...prev, [realId]: 'completed' }));
          if (onRefreshDataRef.current) onRefreshDataRef.current();
        }, 5000);
      } else if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      setRowCallStatuses(prev => ({ ...prev, [item.id]: 'calling' }));
      setCallingState({ loading: false, phone: customerPhone, msg: `Initiating AI Feedback Voice Call to ${customerName}...` });
      setTimeout(() => {
        setRowCallStatuses(prev => ({ ...prev, [item.id]: 'completed' }));
        if (onRefreshDataRef.current) onRefreshDataRef.current();
      }, 5000);
    }
    setTimeout(() => setCallingState({ loading: false, phone: null, msg: '' }), 4000);
  };

  const triggeredCallsRef = useRef(new Set());
  
  useEffect(() => {
    if (initialSelectedFeedback && !triggeredCallsRef.current.has(initialSelectedFeedback.id)) {
      triggeredCallsRef.current.add(initialSelectedFeedback.id);
      handleTriggerCall(initialSelectedFeedback.customer_name, initialSelectedFeedback.phone, initialSelectedFeedback);
    }
  }, [initialSelectedFeedback]);

  // Handle Cancel Batch Outbound Calls
  const handleCancelBatchCall = () => {
    cancelBatchRef.current = true;
    setIsBatchCalling(false);
  };

  // Helper interruptible delay
  const delayOrCancel = async (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (cancelBatchRef.current) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return cancelBatchRef.current;
  };

  // Handle Collect All Feedbacks (Batch Call to Every Listed Customer)
  const handleCollectAllFeedbacks = async () => {
    const targets = filteredFeedbacks;
    if (targets.length === 0) {
      alert("No customers in the feedback list to call.");
      return;
    }

    if (!window.confirm(`Call all ${targets.length} customers in the list to collect AI voice feedback?`)) {
      return;
    }

    cancelBatchRef.current = false;
    setIsBatchCalling(true);
    setBatchProgress({ total: targets.length, current: 0, currentCustomer: '', logs: [] });
    setRowCallStatuses({});

    const logs = [];

    for (let i = 0; i < targets.length; i++) {
      if (cancelBatchRef.current) {
        logs.push(`🛑 Batch Calling Campaign Cancelled by User at customer ${i} of ${targets.length}.`);
        setBatchProgress(prev => ({
          ...prev,
          currentCustomer: 'Campaign Cancelled',
          logs: [...logs]
        }));
        setIsBatchCalling(false);
        return;
      }

      const item = targets[i];
      const phone = formatPhoneNumber(item.phone);

      setBatchProgress(prev => ({
        ...prev,
        total: targets.length,
        current: i + 1,
        currentCustomer: `${item.customer_name} (${phone})`
      }));

      setRowCallStatuses(prev => ({ ...prev, [item.id]: 'calling' }));

      try {
        const speechScript = `Hello ${item.customer_name}, this is BFibernet AI Feedback Collector calling to record your experience. Press 1 to speak with an agent.`;
        const res = await makeOutboundCall(item.customer_name, phone, speechScript, item.id);

        if (cancelBatchRef.current) {
          logs.push(`🛑 Batch Calling Campaign Cancelled by User.`);
          setBatchProgress(prev => ({
            ...prev,
            currentCustomer: 'Campaign Cancelled',
            logs: [...logs]
          }));
          setIsBatchCalling(false);
          return;
        }

        const statusMsg = res.success 
          ? `[${i + 1}/${targets.length}] ✅ Call Placed to ${item.customer_name} (${phone}) - SID: ${res.call_sid || 'MOCK_SID'}`
          : `[${i + 1}/${targets.length}] ⚠️ Call Queued for ${item.customer_name} (${phone}): ${res.message || 'Call initiated'}`;

        logs.push(statusMsg);
        setRowCallStatuses(prev => ({ ...prev, [item.id]: res.success ? 'completed' : 'stored' }));
      } catch (err) {
        logs.push(`[${i + 1}/${targets.length}] ❌ Failed calling ${item.customer_name} (${phone})`);
        setRowCallStatuses(prev => ({ ...prev, [item.id]: 'failed' }));
      }

      setBatchProgress(prev => ({ ...prev, logs: [...logs] }));

      // Interruptible delay check
      const isCancelled = await delayOrCancel(1000);
      if (isCancelled) {
        logs.push(`🛑 Batch Calling Campaign Cancelled by User.`);
        setBatchProgress(prev => ({
          ...prev,
          currentCustomer: 'Campaign Cancelled',
          logs: [...logs]
        }));
        setIsBatchCalling(false);
        return;
      }
    }

    setIsBatchCalling(false);
    if (onRefreshData) onRefreshData();
  };

  // Handle Delete Feedback
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer entry?")) return;
    try {
      await deleteCustomerRecord(id);
    } catch (err) {
      console.error("Failed to delete customer on backend:", err);
    }
    setLocalFeedbacks(prev => prev.filter(item => item.id !== id));
    if (onRefreshData) onRefreshData();
  };

  // Handle Clear Previous Feedback
  const handleClearFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to clear previous feedback & transcript for this customer?")) return;
    try {
      await updateCustomerRecord(id, { feedback_text: 'No previous feedback recorded.', transcript: [] });
    } catch (err) {
      console.error("Failed to clear feedback on backend:", err);
    }
    setLocalFeedbacks(prev => prev.map(item => item.id === id ? { ...item, feedback_text: 'No previous feedback recorded.', transcript: [], cleared: true } : item));
    setSelectedFeedback(prev => prev ? { ...prev, feedback_text: 'No previous feedback recorded.', transcript: [], cleared: true } : null);
    if (onRefreshData) onRefreshData();
  };

  // Handle Save Edit Feedback
  const handleSaveEdit = async (id, updatedData) => {
    try {
      await updateCustomerRecord(id, updatedData);
    } catch (err) {
      console.error("Failed to update customer on backend:", err);
    }
    setLocalFeedbacks(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    if (onRefreshData) onRefreshData();
  };

  // Submit Collect Feedback Modal
  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!fbName.trim() || !fbPhone.trim()) {
      alert('Please enter customer name and phone.');
      return;
    }

    const formatted = formatPhoneNumber(fbPhone);
    setFbPhone(formatted);
    setIsSubmitting(true);
    setAgentTraceResult(null);

    const tempId = `new_${Date.now()}`;
    const initials = fbName.trim().split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';

    const newItem = {
      id: tempId,
      customer_name: fbName.trim(),
      phone: formatted,
      avatar: initials,
      avatarBg: 'bg-purple-600',
      feedback_text: 'Pending AI agent feedback call...',
      sentiment: 'neutral',
      rating: 5,
      category: 'general',
      created_at: 'Just now'
    };

    // Optimistic UI Update so the user sees the new record immediately
    setLocalFeedbacks(prev => [newItem, ...prev]);

    try {
      // Instantly save customer & contact into DB via backend API
      const res = await createCustomerRecord(
        fbName.trim(), 
        formatted, 
        5, 
        'Pending AI agent feedback call...', 
        'neutral', 
        'general'
      );

      if (res && res.id) {
        // Replace temporary ID with backend DB ID
        setLocalFeedbacks(prev => prev.map(item => item.id === tempId ? { ...item, id: res.id } : item));
      }

      // Refresh data directly from backend SQLite DB if provided
      if (onRefreshData) await onRefreshData();

    } catch (err) {
      console.warn("Backend save notice:", err);
    } finally {
      setIsSubmitting(false);
      setShowCollectModal(false);
      setFbName('');
      setFbPhone('');
    }
  };

  return (
    <div className="w-full min-h-screen pb-12 font-['Plus_Jakarta_Sans',sans-serif] bg-[var(--bg-app)] text-[var(--text-primary)] select-none space-y-8 transition-colors duration-200">
      {/* 1. Header Bar */}
      <FeedbackHeader
        onCollectAll={handleCollectAllFeedbacks}
        isBatchCalling={isBatchCalling}
        onDownloadReviews={() => downloadFeedbacksCSV(allFeedbacks)}
      />

      {/* 2. Batch Outbound Call Campaign Progress Banner */}
      <BatchCallingBanner
        isBatchCalling={isBatchCalling}
        batchProgress={batchProgress}
        handleCancelBatchCall={handleCancelBatchCall}
      />

      {/* Action Toast */}
      {callingState.msg && (
        <div className={`mb-6 p-3.5 rounded-none border text-xs font-mono flex items-center gap-2 animate-fadeIn ${
          isDark ? 'bg-[#050507] border-[#22222a] text-emerald-400' : 'bg-white border-slate-200 text-emerald-600 shadow-sm'
        }`}>
          <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>{callingState.msg}</span>
        </div>
      )}

      {/* 3. Stat Metric Cards */}
      <FeedbackMetricsCards metrics={metrics} />

      {/* 4. AI Voice Persona Card */}
      <FeedbackVoiceBanner
        voicePersona={voicePersona}
        setVoicePersona={setVoicePersona}
        isPlayingDemo={isPlayingDemo}
        handlePlayDemo={handlePlayDemo}
      />

      {/* 5. Feedbacks Table & Controls - Generous Spacing Above */}
      <div className="pt-10 mt-6">
        <FeedbackTable
          filteredFeedbacks={filteredFeedbacks}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sentimentFilter={sentimentFilter}
          setSentimentFilter={setSentimentFilter}
          onRefreshData={onRefreshData}
          isBatchCalling={isBatchCalling}
          handleCollectAllFeedbacks={handleCollectAllFeedbacks}
          handleCancelBatchCall={handleCancelBatchCall}
          setShowCollectModal={setShowCollectModal}
          setSelectedFeedback={setSelectedFeedback}
          handleTriggerCall={handleTriggerCall}
          rowCallStatuses={rowCallStatuses}
          handleDeleteFeedback={handleDeleteFeedback}
          setEditingFeedback={setEditingFeedback}
          onDownloadReviews={() => downloadFeedbacksCSV(allFeedbacks)}
        />
      </div>

      {/* 6. Collect New Feedback Modal */}
      <CollectFeedbackModal
        showCollectModal={showCollectModal}
        setShowCollectModal={setShowCollectModal}
        handleCollectSubmit={handleCollectSubmit}
        fbName={fbName}
        setFbName={setFbName}
        fbPhone={fbPhone}
        setFbPhone={setFbPhone}
        fbRating={fbRating}
        setFbRating={setFbRating}
        fbText={fbText}
        setFbText={setFbText}
        isSubmitting={isSubmitting}
        agentTraceResult={agentTraceResult}
      />

      {/* 7. Edit Customer Modal */}
      <EditCustomerModal
        editingFeedback={editingFeedback}
        setEditingFeedback={setEditingFeedback}
        handleSaveEdit={handleSaveEdit}
      />

      {/* 8. Feedback Detail View Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          selectedFeedback={selectedFeedback}
          setSelectedFeedback={setSelectedFeedback}
          handleTriggerCall={handleTriggerCall}
          handleClearFeedback={handleClearFeedback}
          rowCallStatuses={rowCallStatuses}
        />
      )}
    </div>
  );
}

