import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { executeFeedbackAgent, makeOutboundCall, deleteCustomerRecord, updateCustomerRecord } from '../../services/apiService';
import { Zap } from 'lucide-react';

import { DEFAULT_FEEDBACKS, formatPhoneNumber } from './components/feedbackConstants';
import { FeedbackHeader } from './components/FeedbackHeader';
import { FeedbackMetricsCards } from './components/FeedbackMetricsCards';
import { FeedbackVoiceBanner } from './components/FeedbackVoiceBanner';
import { BatchCallingBanner } from './components/BatchCallingBanner';
import { FeedbackTable } from './components/FeedbackTable';
import { CollectFeedbackModal } from './components/CollectFeedbackModal';
import { FeedbackDetailModal } from './components/FeedbackDetailModal';
import { EditCustomerModal } from './components/EditCustomerModal';

export function FeedbackAgentSection({ feedbackEntries = [], isLoading = false, onRefreshData }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [localFeedbacks, setLocalFeedbacks] = useState(DEFAULT_FEEDBACKS);
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
    if (!feedbackEntries || !Array.isArray(feedbackEntries) || feedbackEntries.length === 0) {
      return localFeedbacks || [];
    }
    
    const backendMapped = feedbackEntries.map(entry => {
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

    const existingIds = new Set(backendMapped.map(b => b.id));
    const uniqueLocal = (localFeedbacks || []).filter(l => !existingIds.has(l.id));
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
      if (voicePersona === 'priya_sharma') {
        text = "Namaste! Main Priya Sharma hu. Aapke feedback record kar ke help karti hu.";
      } else if (voicePersona === 'arjun_kapoor') {
        text = "Hello! I am Arjun, your AI Voice Sales and Support Assistant.";
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
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
      setRowCallStatuses(prev => ({
        ...prev,
        [item.id]: res.success ? 'calling' : 'failed',
        [`${item.id}_sid`]: sid
      }));
      setCallingState({ 
        loading: false, 
        phone: customerPhone, 
        msg: res.success ? `Call initiated to ${customerName}! ${res.simulated ? '(Simulated Mode)' : ''}` : `Call Failed: ${res.message || 'Twilio Error'}`
      });

      if (res.simulated) {
        setTimeout(() => {
          setRowCallStatuses(prev => ({ ...prev, [item.id]: 'completed' }));
          if (onRefreshDataRef.current) onRefreshDataRef.current();
        }, 5000);
      } else if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      setCallingState({ loading: false, phone: customerPhone, msg: `Error initiating call.` });
    }
    setTimeout(() => setCallingState({ loading: false, phone: null, msg: '' }), 4000);
  };

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

    try {
      const res = await executeFeedbackAgent(fbName.trim(), formatted, fbRating, fbText.trim());
      setAgentTraceResult(res);

      const newItem = {
        id: Date.now(),
        customer_name: fbName.trim(),
        phone: formatted,
        avatar: fbName.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        avatarBg: 'bg-purple-600',
        feedback_text: fbText.trim(),
        sentiment: res.result?.sentiment || (fbRating >= 4 ? 'positive' : fbRating <= 2 ? 'negative' : 'neutral'),
        rating: fbRating,
        category: res.result?.category || 'general',
        created_at: 'Just now'
      };

      setLocalFeedbacks(prev => [newItem, ...prev]);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setAgentTraceResult({
        result: { sentiment: fbRating >= 4 ? 'positive' : 'neutral', category: 'general' },
        trace_steps: [{ step: 1, name: 'Fallback Execution', status: 'completed' }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12 font-['Plus_Jakarta_Sans',sans-serif] bg-[#000000] text-white select-none space-y-8">
      {/* 1. Header Bar */}
      <FeedbackHeader />

      {/* 2. Stat Metric Cards */}
      <FeedbackMetricsCards metrics={metrics} />

      {/* 3. AI Voice Persona Card */}
      <FeedbackVoiceBanner
        voicePersona={voicePersona}
        setVoicePersona={setVoicePersona}
        isPlayingDemo={isPlayingDemo}
        handlePlayDemo={handlePlayDemo}
      />

      {/* Action Toast */}
      {callingState.msg && (
        <div className="mb-6 p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] text-white text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-white animate-pulse" />
          <span>{callingState.msg}</span>
        </div>
      )}

      {/* 4. Batch Outbound Call Campaign Progress Banner */}
      <BatchCallingBanner
        isBatchCalling={isBatchCalling}
        batchProgress={batchProgress}
        handleCancelBatchCall={handleCancelBatchCall}
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
      <FeedbackDetailModal
        selectedFeedback={selectedFeedback}
        setSelectedFeedback={setSelectedFeedback}
        handleTriggerCall={handleTriggerCall}
        handleClearFeedback={handleClearFeedback}
        rowCallStatuses={rowCallStatuses}
      />
    </div>
  );
}

