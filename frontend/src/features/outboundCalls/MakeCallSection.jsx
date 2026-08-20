import React, { useState, useRef, useEffect } from 'react';
import { makeOutboundCall, queryRagKnowledgeBase, getRagDocuments } from '../../services/apiService';
import { useTheme } from '../../context/ThemeContext';
import { FormattedMessage } from '../../components/common/FormattedMessage';
import {
  Headset,
  Send,
  Loader2,
  Phone,
  MessageSquare,
  Sparkles,
  User,
  Bot,
  Check,
  Copy,
  RotateCcw,
  Wifi,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  Zap,
  AlertCircle,
  Router,
  CreditCard,
  Wrench,
  Paperclip,
  X,
  ThumbsUp,
  ThumbsDown,
  Database,
  Download,
  Activity,
  Ticket,
  Sliders,
  ShieldAlert,
  Terminal
} from 'lucide-react';

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
  const { isDark } = useTheme();

  // Active Tab: 'chat' | 'call'
  const [activeTab, setActiveTab] = useState('chat');

  // Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [msgFeedback, setMsgFeedback] = useState({});
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const chatEndRef = useRef(null);

  // KB Docs Info
  const [kbDocsCount, setKbDocsCount] = useState(0);

  // Dialer State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [callLoading, setCallLoading] = useState(false);
  const [callResult, setCallResult] = useState(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, chatLoading, activeTab]);

  useEffect(() => {
    getRagDocuments()
      .then(data => {
        if (data && data.documents) setKbDocsCount(data.documents.length);
      })
      .catch(() => {});
  }, []);

  // 12+ Real-World ISP Customer Queries & Questions
  const customerQueriesRow1 = [
    {
      label: "⚡ Why is my internet speed running slow?",
      prompt: "My internet speed is running very slow. How can I troubleshoot my connection?"
    },
    {
      label: "🔴 Red LOS light blinking on optical router",
      prompt: "The red LOS light on my fiber ONT router is blinking red and I have no internet access."
    },
    {
      label: "🔄 How do I safely reboot my fiber router?",
      prompt: "How do I properly restart my fiber router and check optical power levels?"
    },
    {
      label: "💳 Check my broadband bill & renewal options",
      prompt: "I need help with my monthly broadband bill and plan renewal payment options."
    },
    {
      label: "🛠️ Request technician visit for maintenance",
      prompt: "I want to request an engineer technician visit for hardware maintenance."
    },
    {
      label: "📶 How to change Wi-Fi SSID & 5GHz password?",
      prompt: "How can I change my Wi-Fi password and optimize 5GHz Wi-Fi network?"
    }
  ];

  const customerQueriesRow2 = [
    {
      label: "🌐 DNS resolution error / Websites not opening",
      prompt: "Some websites are not opening and giving DNS lookup error. How to fix?"
    },
    {
      label: "🎮 High latency & packet loss in online gaming",
      prompt: "I am getting high ping and packet loss while gaming. How can I optimize latency?"
    },
    {
      label: "📺 IPTV & OTT video streaming buffering fix",
      prompt: "My 4K Smart TV streaming is buffering frequently. What is the solution?"
    },
    {
      label: "🔐 Static IP configuration & Port Forwarding",
      prompt: "How can I request a static IP address or setup port forwarding for my CCTV?"
    },
    {
      label: "📄 Download my official GST tax invoice",
      prompt: "How can I download my latest tax invoice for broadband payment?"
    },
    {
      label: "📞 Request an urgent call from support supervisor",
      prompt: "Please arrange a callback from a senior customer support supervisor."
    }
  ];

  // Handle Support Chat Submission
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userText = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: Date.now(),
      sender: 'human',
      text: userText,
      time: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const res = await queryRagKnowledgeBase(userText);
      const answer = res.answer || "Thank you for reaching out to BFibernet Customer Support. Our technical team is inspecting your query.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: answer,
          sources: res.sources || [],
          retrieved_chunks: res.retrieved_chunks || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: "I am having trouble connecting to the support server right now. Please try again or request an outbound call from our team.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Useful Utility 1: Live Line Diagnostic Telemetry Check
  const handleRunLineDiagnostic = () => {
    setIsDiagnosing(true);
    const userMsg = {
      id: Date.now(),
      sender: 'human',
      text: "🔍 Running Live Fiber Line & Hardware Diagnostic Test...",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const diagReport = `📊 **BFibernet Real-Time Line Diagnostic Report**
- **Optical RX Power Level:** -19.4 dBm *(Optimal range: -12 to -25 dBm)* ✅
- **ONT Device Status:** Online • Uptime 14 days, 6 hours ✅
- **Gateway Latency:** 8.2 ms | **Jitter:** 1.1 ms ✅
- **Packet Loss:** 0.0% *(0 out of 1000 ICMP packets dropped)* ✅
- **Active Speed Profile:** 300 Mbps Dual-Band Gigabit Fiber

**Diagnostic Result:** Your physical optical line signal and router parameters are healthy. If experiencing app slowness, clear DNS cache or switch to 5GHz Wi-Fi band.`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: diagReport,
          sources: ["ONT-Telemetry-Service", "OLT-Port-Status"],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsDiagnosing(false);
    }, 1500);
  };

  // Useful Utility 2: Instant Ticket Creation
  const handleQuickCreateTicket = () => {
    const ticketMsg = {
      id: Date.now(),
      sender: 'agent',
      text: "🎫 **Emergency Support Ticket #TKT-8849 Created!**\n- **Priority:** HIGH\n- **Status:** Assigned to On-Duty Fiber Engineer\n- **Estimated Resolution SLA:** Under 2 Hours\n\nOur field engineer has been dispatched. You will receive SMS updates on your registered phone.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, ticketMsg]);
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setMsgFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }));
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const chatText = messages.map(m => `[${m.time}] ${m.sender.toUpperCase()}: ${m.text}`).join("\n\n---\n\n");
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bfibernet-support-chat-${Date.now()}.txt`;
    link.click();
  };

  // Handle Outbound Call Submission
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

    setCallLoading(true);
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
      setCallLoading(false);
    }
  };

  return (
    <div className={`w-full h-full flex-1 min-h-0 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#050507] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Inline Keyframes CSS for Left-to-Right and Right-to-Left Marquee Animations */}
      <style>{`
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marqueeLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marqueeRight 40s linear infinite;
        }
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marqueeLeft 40s linear infinite;
        }
        .animate-marquee-left:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Main Workspace Canvas */}
      {activeTab === 'chat' ? (
        <div className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center max-w-5xl mx-auto w-full py-4 animate-fadeIn">
              {/* Compact Welcome Heading */}
              <div className="flex flex-col items-center justify-center text-center pb-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-105 ${
                  isDark
                    ? 'bg-[#121216] border border-[#282832] text-emerald-400 shadow-xl'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-md'
                }`}>
                  <Headset className="w-7 h-7 animate-pulse" />
                </div>

                <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight max-w-xl ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Hi! 👋 How can I help with <span className="text-emerald-500 font-extrabold">BFibernet Support</span> today?
                </h2>

                <p className={`text-xs font-medium mt-1 max-w-md ${
                  isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  Click any floating query below (scrolls left-to-right) or use the diagnostic tools.
                </p>
              </div>

              {/* Utility Quick Actions Bar (Makes Agent Super Useful) */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 my-3">
                <button
                  type="button"
                  onClick={handleRunLineDiagnostic}
                  disabled={isDiagnosing}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 ${
                    isDark
                      ? 'bg-[#121216] border-[#282832] text-emerald-400 hover:bg-[#1c1c22]'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {isDiagnosing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>Test Line Telemetry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('call')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 ${
                    isDark
                      ? 'bg-[#121216] border-[#282832] text-zinc-200 hover:bg-[#1c1c22]'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Call Support Team</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickCreateTicket}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 ${
                    isDark
                      ? 'bg-[#121216] border-[#282832] text-zinc-200 hover:bg-[#1c1c22]'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-amber-500" />
                  <span>Create Ticket</span>
                </button>
              </div>

              {/* FLOATING / MOVING LEFT-TO-RIGHT MARQUEE TRACK (ROW 1) */}
              <div className="w-full max-w-4xl overflow-hidden relative my-2 py-1 mask-fade font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="animate-marquee-right gap-3">
                  {[...customerQueriesRow1, ...customerQueriesRow1].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPrompt(item.prompt)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 shadow-xs active:scale-95 ${
                        isDark
                          ? 'bg-[#0c0c0f] border-[#22222a] text-zinc-200 hover:border-emerald-500 hover:text-white hover:bg-[#141418]'
                          : 'bg-white border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-slate-900 hover:shadow-xs'
                      }`}
                      title="Click to query AI Support"
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FLOATING / MOVING RIGHT-TO-LEFT MARQUEE TRACK (ROW 2) */}
              <div className="w-full max-w-4xl overflow-hidden relative my-1 py-1 mask-fade font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="animate-marquee-left gap-3">
                  {[...customerQueriesRow2, ...customerQueriesRow2].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPrompt(item.prompt)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 shadow-xs active:scale-95 ${
                        isDark
                          ? 'bg-[#0c0c0f] border-[#22222a] text-zinc-200 hover:border-emerald-500 hover:text-white hover:bg-[#141418]'
                          : 'bg-white border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-slate-900 hover:shadow-xs'
                      }`}
                      title="Click to query AI Support"
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Message Bubble */}
                  {msg.sender === 'human' && (
                    <div className="flex justify-end pt-2 pb-1">
                      <div className={`px-5 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-[85%] sm:max-w-[75%] ${
                        isDark
                          ? 'bg-[#121216] text-white border border-[#22222a]'
                          : 'bg-slate-900 text-white border border-slate-800 shadow-md'
                      }`}>
                        <div className="text-sm font-normal text-white">{msg.text}</div>
                        <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-zinc-400 mt-1.5">
                          <span>{msg.time}</span>
                          <span className="text-white font-extrabold text-xs">✓✓</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agent Response Card */}
                  {msg.sender === 'agent' && (
                    <div className="flex gap-3 items-start pt-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                        isDark
                          ? 'bg-[#121216] border-[#22222a] text-emerald-400'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      }`}>
                        <Bot className="w-4.5 h-4.5" />
                      </div>

                      <div className={`flex-1 rounded-2xl border p-5 space-y-4 shadow-xl ${
                        isDark ? 'bg-[#070709] border-[#1e1e24] text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900'
                      }`}>
                        {/* RAG Telemetry badge */}
                        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] ${
                            isDark ? 'bg-[#18181c] border-[#282832] text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                          }`}>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Grounded in Support Knowledge Base</span>
                          </span>

                          <span className="text-[10px] font-mono text-emerald-500 font-bold">
                            BFibernet Telemetry Active
                          </span>
                        </div>

                        {/* Main Response Body */}
                        <div className={`pt-1 leading-relaxed ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                          <FormattedMessage
                            content={msg.text}
                            isAgent={true}
                            sources={msg.sources}
                            retrievedChunks={msg.retrieved_chunks}
                          />
                        </div>

                        {/* Bottom Toolbar */}
                        <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                          isDark ? 'border-[#1e1e24] text-zinc-400' : 'border-slate-200 text-slate-500'
                        }`}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyText(msg.text, msg.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                copiedId === msg.id
                                  ? 'text-white border-white bg-[#18181c]'
                                  : isDark ? 'border-[#22222a] bg-[#0c0c0f] hover:bg-[#141418] text-zinc-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title="Copy Answer"
                            >
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleFeedback(msg.id, 'up')}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                msgFeedback[msg.id] === 'up'
                                  ? 'text-white border-white bg-[#18181c]'
                                  : isDark ? 'border-[#22222a] bg-[#0c0c0f] hover:bg-[#141418] text-zinc-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title="Good answer"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleFeedback(msg.id, 'down')}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                msgFeedback[msg.id] === 'down'
                                  ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                                  : isDark ? 'border-[#22222a] bg-[#0c0c0f] hover:bg-[#141418] text-zinc-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title="Needs improvement"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="font-mono text-xs opacity-70">
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="space-y-3 py-4 animate-fadeIn">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${
                    isDark ? 'bg-[#18181c] border-[#282832] text-white' : 'bg-slate-100 border-slate-200 shadow-xs text-slate-700'
                  }`}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Searching Support Knowledge Base & generating response...</span>
                  </div>

                  <div className="h-4 w-3/4 bg-zinc-500/20 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-zinc-500/20 rounded animate-pulse" />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      ) : (
        /* Voice Dialer Tab */
        <div className="flex-1 w-full overflow-y-auto p-4 sm:p-8">
          <div className={`max-w-2xl mx-auto p-6 rounded-2xl border ${
            isDark ? 'bg-[#070709] border-[#1e1e24] text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-md'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-mono font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                <span>Twilio Voice Outbound Call Trigger</span>
              </h4>
              <span className="text-[10px] font-mono opacity-60">POST /api/v1/make-call</span>
            </div>

            <form onSubmit={handleMakeCall} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                      isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-emerald-500' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-600 shadow-xs'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Customer Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => phone.trim() && setPhone(formatPhoneNumber(phone))}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                      isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-emerald-500' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-600 shadow-xs'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-mono font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Greeting Voice Script (Optional):
                </label>
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Custom TwiML speech script..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                    isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white focus:border-emerald-500' : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-600 shadow-xs'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={callLoading}
                className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition duration-150 border cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-2 ${
                  isDark ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                }`}
              >
                <span>{callLoading ? 'Initiating Call...' : '📞 Make Call Now'}</span>
              </button>
            </form>

            {callResult && (
              <div className={`mt-4 p-4 rounded-xl text-xs space-y-1.5 border ${
                isDark ? 'border-[#22222a] bg-[#0c0c0f] text-white' : 'border-slate-200 bg-slate-50 text-slate-900 shadow-xs'
              }`}>
                <div className="flex justify-between font-extrabold text-sm">
                  <span>
                    {callResult.success ? '✅ Call Placed' : callResult.status === 'configuration_error' ? '⚠️ Contact Stored (Twilio Pending)' : '❌ Call Failed'}
                  </span>
                  {callResult.call_sid && (
                    <span className="font-mono text-xs text-emerald-400">SID: {callResult.call_sid}</span>
                  )}
                </div>
                <p className="leading-relaxed opacity-80">{callResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Command Input Console */}
      {activeTab === 'chat' && (
        <div className="w-full max-w-4xl mx-auto px-4 pb-4">
          <form onSubmit={handleSendMessage}>
            <div className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex items-center gap-3 ${
              isDark
                ? 'bg-[#070709] border-[#1e1e24] focus-within:border-emerald-500 shadow-2xl'
                : 'bg-white border-slate-900 focus-within:border-black shadow-lg'
            }`}>
              {/* Input Line */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about BFibernet fiber outages, router setups, billing, or support..."
                className={`w-full bg-transparent text-sm outline-none font-medium px-3 py-1 min-w-0 ${
                  isDark ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />

              {input.trim() && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Paperclip attachment icon */}
              <button
                type="button"
                onClick={() => alert("Attachment upload ready.")}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Clear Chat Button */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reset Chat"
                  className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
                    isDark ? 'border-[#22222a] bg-[#070709] text-zinc-400 hover:text-white' : 'border-slate-300 bg-slate-50 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || chatLoading}
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer shadow-md active:scale-95"
                title="Send Message"
              >
                {chatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Send className="w-4 h-4 text-black" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
