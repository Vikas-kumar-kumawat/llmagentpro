import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  queryRagKnowledgeBase,
  querySuperAgent,
  getRagDocuments,
  uploadRagDocument,
  deleteRagDocument,
} from '../../services/apiService';
import { FormattedMessage } from '../../components/common/FormattedMessage';
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Database,
  Upload,
  Trash2,
  X,
  FileText,
  Search,
  Download,
  User,
  ArrowUp,
  ChevronRight,
  ChevronLeft,
  Wifi,
  Router,
  Phone,
  Shield,
  Paperclip,
  RotateCw,
  DollarSign,
  Crown,
  AlertTriangle,
  Cpu,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Activity,
  Gift,
  Ticket,
  Zap,
  Award,
  PhoneCall,
  CreditCard
} from 'lucide-react';

export function ChatbotSection() {
  const { theme, isDark } = useTheme();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [msgFeedback, setMsgFeedback] = useState({});

  // Active Role State: Restricted to Admin
  const [userRole] = useState('admin');

  // KB Modal State & Tabs
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [modalRagTab, setModalRagTab] = useState('admin'); // Defaults to 'admin'
  const [kbDocs, setKbDocs] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);

  // Citation & Lightbox Modal State
  const [activeCitations, setActiveCitations] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mainFileInputRef = useRef(null);
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fetchKbInfo = async () => {
    try {
      const data = await getRagDocuments();
      if (data && data.documents) {
        setKbDocs(data.documents);
        setTotalChunks(data.total_chunks || 0);
      }
    } catch (err) {
      console.error("Failed to load KB docs:", err);
    }
  };

  useEffect(() => {
    fetchKbInfo();
  }, []);

  // Filter docs into Customer RAG and Admin RAG
  const customerDocs = kbDocs.filter(d => !d.filename.toLowerCase().startsWith('admin_'));
  const adminDocs = kbDocs.filter(d => d.filename.toLowerCase().startsWith('admin_') || d.filename.toLowerCase().includes('admin') || d.filename.toLowerCase().includes('sla'));

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'human',
      text: userQuery,
      role: userRole,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await querySuperAgent(userQuery, userRole);
      const replyText = res.answer || `I am connected to the official BFibernet ${userRole.toUpperCase()} knowledge base. How can I help you today?`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: replyText,
          sources: res.sources || [],
          retrieved_chunks: res.retrieved_chunks || [],
          media_gallery: res.media_gallery || (res.image ? [res.image] : []),
          selected_agent: res.selected_agent,
          instructions: res.instructions,
          role: userRole,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: `Hello! I am your **BFibernet AI ${userRole === 'admin' ? 'Executive Admin' : 'Customer'} Copilot**. How can I assist you today?`,
          role: userRole,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setMsgFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }));
  };

  const toggleSteps = (id) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDirectUpload = async (e, targetRag = modalRagTab) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const res = await uploadRagDocument(file, targetRag);
      if (res && res.success) {
        await fetchKbInfo();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'agent',
            text: `✅ **Successfully uploaded and indexed \`${res.filename || file.name}\` into ${targetRag.toUpperCase()} RAG knowledge base.**`,
            sources: [res.filename || file.name],
            role: userRole,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      alert("Failed to upload document.");
    } finally {
      setIsLoading(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete '${filename}'?`)) return;

    try {
      await deleteRagDocument(filename);
      await fetchKbInfo();
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const chatText = messages.map(m => `[${m.time}] [${m.role?.toUpperCase() || 'MODE'}] ${m.sender.toUpperCase()}: ${m.text}`).join("\n\n---\n\n");
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bfibernet-${userRole}-chat-${Date.now()}.txt`;
  };

  // ISP Executive Row 1 Cards (Moving Left-to-Right)
  const promptCardsRow1 = [
    {
      title: 'Monthly Revenue & ARPU',
      desc: 'Total collections, renewals & ARPU growth',
      prompt: 'Show me this month revenue report, total collections, ARPU, and pending subscription renewals.',
      icon: DollarSign,
      badge: '💰 Revenue'
    },
    {
      title: 'Top 10 VIP Accounts',
      desc: 'Gigabit enterprise & high-billing clients',
      prompt: 'List our top premium ISP customers, VIP enterprise connections, and high-value subscribers.',
      icon: Crown,
      badge: '⭐ VIP'
    },
    {
      title: 'Top 5 Chronic Issues',
      desc: 'Speed drops, fiber cuts & outage trends',
      prompt: 'What are the top 5 most common problems and complaints customers are facing this month?',
      icon: AlertTriangle,
      badge: '⚠️ Outages'
    },
    {
      title: 'OLT Node & Optical Health',
      desc: 'Power levels, port load & ONT telemetries',
      prompt: 'Show hardware monitoring status, OLT optical power levels, and active router telemetries.',
      icon: Cpu,
      badge: '📡 Hardware'
    },
    {
      title: 'High Churn Risk Accounts',
      desc: 'Users expiring in 3 days & low usage',
      prompt: 'Which customers are at high risk of churning or have recharges expiring in the next 3 days?',
      icon: TrendingDown,
      badge: '📉 Churn'
    },
    {
      title: 'Competitor Tariff Benchmarks',
      desc: 'JioFiber & Airtel vs local fiber plans',
      prompt: 'Compare our broadband plans and pricing against JioFiber, Airtel Xstream, and local competitors.',
      icon: BarChart3,
      badge: '⚔️ Market'
    }
  ];

  // ISP Executive Row 2 Cards (Moving Right-to-Left)
  const promptCardsRow2 = [
    {
      title: 'New Subscriber Additions',
      desc: 'Net monthly signups & retention rate',
      prompt: 'Show monthly subscriber growth rate, net customer additions, and ARPU trends.',
      icon: TrendingUp,
      badge: '📈 Growth'
    },
    {
      title: 'Recharge Promos & ROI',
      desc: 'Festival discounts & plan upgrades',
      prompt: 'What active festival offers and promotional discounts are currently running?',
      icon: Gift,
      badge: '🎁 Offers'
    },
    {
      title: 'Core IP Backbone Peak',
      desc: 'Bandwidth utilization & OTT peering',
      prompt: 'Show core IP backbone traffic utilization, peering usage, and peak hour telemetries.',
      icon: Zap,
      badge: '⚡ Traffic'
    },
    {
      title: 'LCO Partner Payouts',
      desc: 'Franchisee commission & SLA splits',
      prompt: 'Show LCO partner revenue share payouts, franchisee commission logs, and partner SLAs.',
      icon: Shield,
      badge: '🤝 LCO'
    },
    {
      title: 'Critical SLA Breaches',
      desc: 'Unresolved outage tickets > 4 hours',
      prompt: 'List all open high-priority support tickets and SLA breach warnings.',
      icon: Ticket,
      badge: '🎫 SLA'
    },
    {
      title: 'Voice CSAT & Sentiment',
      desc: 'Satisfaction score & voice analytics',
      prompt: 'What is our current Customer Satisfaction (CSAT) score and voice feedback sentiment breakdown?',
      icon: Award,
      badge: '📊 CSAT'
    }
  ];

  return (
    <div className={`w-full h-full flex-1 min-h-0 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#050507] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>

      {/* Floating Header Bar */}
      <div className={`w-full px-4 sm:px-8 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors duration-300 ${
        isDark ? 'bg-[#070709] border-[#1e1e24] text-white shadow-xl' : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-sm backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${
            isDark ? 'bg-[#121216] text-emerald-400 border border-[#22222a] shadow-xs' : 'bg-slate-100 text-slate-900 border border-slate-200 shadow-xs'
          }`}>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex flex-col">
            <span className={`font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              BFibernet Admin AI
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Docs Button */}
          <button
            onClick={() => { setIsKbModalOpen(true); fetchKbInfo(); }}
            className={`px-3.5 py-1.5 rounded-none transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border ${
              isDark
                ? 'bg-[#0c0c0f] hover:bg-[#141418] text-zinc-200 border-[#22222a]'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
            title="Knowledge Base Documents"
          >
            <Database className="w-3.5 h-3.5 text-zinc-300" />
            <span>Docs</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-[#18181c] text-zinc-300 border border-[#282832] font-extrabold">
              {kbDocs.length}
            </span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleExportChat}
              className={`p-1.5 px-2.5 rounded-none transition cursor-pointer text-xs font-bold border ${
                isDark ? 'bg-[#050507] hover:bg-[#0c0c0f] text-zinc-300 border-[#1c1c20]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Export Chat Transcript"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

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
      <div className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6 flex flex-col">
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center max-w-6xl mx-auto w-full animate-fadeIn space-y-10">
            
            {/* Premium Welcome Header */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className={`w-14 h-14 rounded-none flex items-center justify-center mb-6 transition-transform duration-500 hover:rotate-180 hover:scale-110 ${
                isDark
                  ? 'bg-gradient-to-br from-[#0c0c0f] to-[#121216] border border-[#22222a] text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-lg'
              }`}>
                <Sparkles className="w-7 h-7" />
              </div>

              <h2 className={`mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight max-w-2xl ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Manage your work and agents using prompt.
              </h2>
            </div>

            {/* MARQUEE ROW: Single Moving Track with Fade Edges */}
            <div className="w-full relative py-2 font-['Plus_Jakarta_Sans',sans-serif]">
              {/* Fade Gradient Masks */}
              <div className="absolute inset-y-0 left-0 w-16 sm:w-32 z-10 pointer-events-none" style={{ background: isDark ? 'linear-gradient(to right, #050507, transparent)' : 'linear-gradient(to right, #f8fafc, transparent)' }}></div>
              <div className="absolute inset-y-0 right-0 w-16 sm:w-32 z-10 pointer-events-none" style={{ background: isDark ? 'linear-gradient(to left, #050507, transparent)' : 'linear-gradient(to left, #f8fafc, transparent)' }}></div>
              
              <div className="overflow-hidden flex">
                <div className="animate-marquee-right gap-4 flex items-center">
                  {[...promptCardsRow1, ...promptCardsRow2, ...promptCardsRow1, ...promptCardsRow2].map((card, i) => {
                    const IconComp = card.icon;
                    return (
                      <div
                        key={i}
                        onClick={() => handleQuickPrompt(card.prompt)}
                        className={`w-[240px] shrink-0 p-4 rounded-none border transition-all duration-300 cursor-pointer flex flex-col justify-between group/card relative overflow-hidden ${
                          isDark
                            ? 'bg-[#070709] border-[#1e1e24] hover:border-emerald-500/50 hover:bg-[#0a0a0d] shadow-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                            : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-3">
                            <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 transition-colors ${
                              isDark ? 'bg-[#121216] border border-[#22222a] text-emerald-400 group-hover/card:bg-emerald-500/10' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                            }`}>
                              <IconComp className="w-4 h-4" />
                            </div>

                            {card.badge && (
                              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none border ${
                                isDark ? 'bg-[#121216] text-zinc-300 border-[#22222a]' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {card.badge}
                              </span>
                            )}
                          </div>

                          <h4 className={`font-extrabold text-sm transition-colors mb-1 ${
                            isDark ? 'text-white group-hover/card:text-emerald-400' : 'text-slate-900 group-hover/card:text-emerald-600'
                          }`}>
                            {card.title}
                          </h4>
                          <p className={`text-[11px] font-medium leading-relaxed line-clamp-2 ${
                            isDark ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Agent Work Section - Structured & Sleek */}
            <div className={`w-full max-w-4xl mx-auto px-5 py-4 rounded-none border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDark
                ? 'bg-[#070709] border-[#1e1e24] text-white shadow-xl hover:border-[#2a2a34]'
                : 'bg-white border-slate-200 text-slate-900 shadow-md'
            }`}>
              <div className="flex items-center gap-3 shrink-0">
                <div className={`p-2 rounded-none border ${isDark ? 'bg-[#121216] border-[#22222a] text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">Manage Agents</h4>
                  <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Assign background tasks instantly</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Assign Agent: Feedback Agent - Call all pending feedback customers.")}
                  className={`px-3 py-1.5 rounded-none border transition cursor-pointer flex items-center gap-2 text-xs font-bold active:scale-95 ${
                    isDark
                      ? 'bg-[#0c0c0f] border-[#22222a] text-zinc-300 hover:border-emerald-500/50 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-slate-900'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Feedback Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Assign Agent: Network Agent - Monitor hardware telemetries & alert outages.")}
                  className={`px-3 py-1.5 rounded-none border transition cursor-pointer flex items-center gap-2 text-xs font-bold active:scale-95 ${
                    isDark
                      ? 'bg-[#0c0c0f] border-[#22222a] text-zinc-300 hover:border-emerald-500/50 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Network Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Assign Agent: Market Agent - Benchmark competitor tariffs vs Jio & Airtel.")}
                  className={`px-3 py-1.5 rounded-none border transition cursor-pointer flex items-center gap-2 text-xs font-bold active:scale-95 ${
                    isDark
                      ? 'bg-[#0c0c0f] border-[#22222a] text-zinc-300 hover:border-emerald-500/50 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Market Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt("Assign Agent: Billing Agent - Send recharge reminders to 3-day expiring accounts.")}
                  className={`px-3 py-1.5 rounded-none border transition cursor-pointer flex items-center gap-2 text-xs font-bold active:scale-95 ${
                    isDark
                      ? 'bg-[#0c0c0f] border-[#22222a] text-zinc-300 hover:border-emerald-500/50 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                  <span>Billing Agent</span>
                </button>
              </div>
            </div>
          </div>
        ) : (

          <div className="max-w-4xl mx-auto w-full space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Prompt Bubble */}
                {msg.sender === 'human' && (
                  <div className="flex justify-end pt-2 pb-1">
                    <div className={`px-5 py-3 rounded-none text-sm font-medium max-w-[85%] sm:max-w-[75%] ${
                      isDark
                        ? 'bg-[#050507] text-white border border-[#1c1c20]'
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

                {/* Agent Response */}
                {msg.sender === 'agent' && (
                  <div className="flex gap-3 items-start pt-2">
                    {/* Left AI avatar badge */}
                    <div className={`w-9 h-9 rounded-none flex items-center justify-center shrink-0 border ${
                      isDark
                        ? 'bg-[#050507] border-[#1c1c20] text-emerald-400'
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>

                    {/* Agent Response Card Container */}
                    <div className={`flex-1 rounded-none border p-5 space-y-4 ${
                      isDark ? 'bg-[#050507] border-[#1c1c20] text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>

                      {/* RAG Telemetry badge */}
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                        <button
                          onClick={() => toggleSteps(msg.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none border cursor-pointer transition text-[11px] ${
                            isDark ? 'bg-black border-[#1c1c20] text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                          }`}
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Completed RAG Search ({msg.sources?.length || 1} sources)</span>
                          <span className="font-bold ml-1">›</span>
                        </button>

                        {msg.role === 'admin' && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-none bg-black text-zinc-300 border border-[#1c1c20]">
                            🛡️ Admin RAG Grounded
                          </span>
                        )}
                      </div>

                      {/* Expanded Step Details */}
                      {expandedSteps[msg.id] && (
                        <div className={`p-3.5 rounded-xl border text-xs font-mono space-y-1.5 animate-fadeIn ${
                          isDark ? 'bg-[#0c0c0f] border-[#22222a] text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <div className={`font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <Search className="w-3 h-3" /> Hybrid BM25 Retrieval Telemetry:
                          </div>
                          <p>- Retreived {msg.retrieved_chunks?.length || 5} highest-scoring context chunks from vector store.</p>
                          <p>- Filtered sources: {msg.sources?.join(', ') || 'Official Knowledge Base'}.</p>
                        </div>
                      )}

                      {/* Multi-Media Thumbnail Carousel */}
                      {msg.media_gallery && msg.media_gallery.length > 0 && (
                        <div className="relative pt-1 pb-2">
                          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                            {msg.media_gallery.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => setLightboxImg(item)}
                                className={`group relative w-44 sm:w-52 h-28 sm:h-32 rounded-xl overflow-hidden border shrink-0 cursor-pointer transition-transform duration-300 hover:scale-[1.02] shadow-md ${
                                  isDark ? 'border-[#22222a] bg-[#0c0c0f]' : 'border-slate-200 bg-white'
                                }`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.caption || 'BFibernet Media'}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                  <p className="text-[11px] font-bold text-white line-clamp-1 transition">
                                    {item.caption || item.filename}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Right Chevron arrow scroll button */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black p-1.5 rounded-full border border-white/20 text-white cursor-pointer shadow-lg">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      )}

                      {/* Main Response Body */}
                      <div className={`pt-1 leading-relaxed ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                        {msg.selected_agent && msg.selected_agent !== 'none' && (
                          <div className={`mb-3 p-3 rounded-lg border flex flex-col gap-1.5 ${
                            isDark ? 'bg-[#0a0a0d] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                          }`}>
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                              <Zap className="w-3.5 h-3.5 animate-pulse" />
                              Deployed Sub-Agent: {msg.selected_agent.replace('_', ' ')}
                            </div>
                            {msg.instructions && (
                              <div className={`text-xs font-mono italic ${isDark ? 'text-zinc-400' : 'text-emerald-700'}`}>
                                "{msg.instructions}"
                              </div>
                            )}
                          </div>
                        )}
                        <FormattedMessage
                          content={msg.text}
                          isAgent={true}
                          sources={msg.sources}
                          retrievedChunks={msg.retrieved_chunks}
                          onOpenSources={() => setActiveCitations(msg.retrieved_chunks || [])}
                        />
                      </div>

                      {/* Bottom Action Toolbar inside Response Card */}
                      <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                        isDark ? 'border-[#1e1e24] text-zinc-400' : 'border-slate-200 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyMessage(msg.text, msg.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              copiedMsgId === msg.id
                                ? 'text-white border-white bg-[#18181c]'
                                : isDark ? 'border-[#22222a] bg-[#0c0c0f] hover:bg-[#141418] text-zinc-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Copy Answer"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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

                          <button
                            onClick={() => handleSend(null)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isDark ? 'border-[#22222a] bg-[#0c0c0f] hover:bg-[#141418] text-zinc-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Regenerate Answer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Timestamp on right */}
                        <div className="font-mono text-xs opacity-70">
                          {msg.time}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="space-y-3 py-4 animate-fadeIn">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${
                  isDark ? 'bg-[#18181c] border-[#282832] text-white' : 'bg-slate-100 border-slate-200 shadow-xs text-slate-700'
                }`}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching {userRole.toUpperCase()} knowledge base & synthesizing response...</span>
                </div>

                <div className="h-4 w-3/4 bg-zinc-500/20 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-zinc-500/20 rounded animate-pulse" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Command Input Console */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-6 pt-2">
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 rounded-none blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className={`relative p-3 sm:p-4 rounded-none border transition-all duration-300 flex items-center gap-3 ${
            isDark
              ? 'bg-[#0a0a0d] border-[#22222a] focus-within:border-emerald-500/50 focus-within:bg-[#0c0c10] shadow-[0_0_40px_rgba(0,0,0,0.5)]'
              : 'bg-white border-slate-300 focus-within:border-emerald-500 shadow-xl'
          }`}>
            {/* Input Line */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query internal knowledge, assign agents, or fetch metrics..."
              className={`w-full bg-transparent text-sm sm:text-base outline-none font-medium px-2 py-1 min-w-0 ${
                isDark ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
              }`}
            />

            {input.trim() && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="text-zinc-500 hover:text-zinc-300 p-2 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Solid Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 rounded-none flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer shadow-none active:scale-95 border ${
                !input.trim() || isLoading
                  ? isDark ? 'bg-[#121216] border-[#22222a] text-zinc-600' : 'bg-slate-100 border-slate-200 text-slate-400'
                  : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
              title="Send Command"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 ml-0.5" />
              )}
            </button>
          </div>
        </form>
        <div className={`text-center mt-3 text-[10px] font-mono tracking-wide ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
          AI Copilot may generate incorrect information. Verify critical data.
        </div>
      </div>

      {/* Docs Modal */}
      {isKbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className={`w-full max-w-2xl max-h-[88vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${isDark ? 'border-[#1f293d] bg-[#0d1117] text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}>

            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-[#1f293d]' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#0d2818] text-[#22c55e]' : 'bg-emerald-50 text-[#22c55e]'}`}>
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold tracking-tight">RAG Knowledge Management</h3>
              </div>

              <button
                onClick={() => setIsKbModalOpen(false)}
                className={`p-2 rounded-xl border cursor-pointer ${isDark ? 'bg-[#161c26] text-zinc-400 hover:text-white border-[#1f293d]' : 'bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Section Tabs */}
            <div className={`px-5 pt-3 flex items-center gap-3 border-b ${isDark ? 'border-[#1f293d]' : 'border-slate-200'}`}>
              <button
                onClick={() => setModalRagTab('customer')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${modalRagTab === 'customer'
                  ? 'border-[#22c55e] text-[#22c55e]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer RAG ({customerDocs.length})</span>
              </button>

              <button
                onClick={() => setModalRagTab('admin')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${modalRagTab === 'admin'
                  ? 'border-[#22c55e] text-[#22c55e]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin RAG ({adminDocs.length})</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleDirectUpload(e, modalRagTab)}
                accept=".pdf,.txt,.md,.json,.csv"
                className="hidden"
              />

              {/* Upload Dropzone */}
              <div className={`p-5 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center gap-2.5 transition ${isDark ? 'border-[#1f293d] bg-[#090d14]' : 'border-emerald-200 bg-emerald-50/40'
                }`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#22c55e]/15 text-[#22c55e]">
                  <Upload className="w-5 h-5" />
                </div>

                <div>
                  <h4 className="text-sm font-extrabold">
                    Upload Document to {modalRagTab === 'admin' ? 'Admin RAG' : 'Customer RAG'}
                  </h4>
                  <p className="text-xs opacity-70 mt-0.5">
                    {modalRagTab === 'admin'
                      ? 'Upload internal SLAs, partner commission policies, or technical router telemetry'
                      : 'Upload public broadband plans, FAQs, recharge offers, or helpline guides'}
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition cursor-pointer active:scale-95 bg-[#22c55e] hover:bg-[#16a34a] text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  + Select File to Upload
                </button>
              </div>

              {/* Document List */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-extrabold opacity-70 uppercase tracking-wider">
                  Indexed Files ({(modalRagTab === 'admin' ? adminDocs : customerDocs).length}):
                </h5>

                {(modalRagTab === 'admin' ? adminDocs : customerDocs).length === 0 ? (
                  <p className="text-xs italic opacity-60 py-2">No documents indexed yet.</p>
                ) : (
                  (modalRagTab === 'admin' ? adminDocs : customerDocs).map((doc, idx) => (
                    <div key={idx} className={`p-3.5 rounded-xl border flex items-center justify-between ${isDark ? 'border-[#1f293d] bg-[#090d14]' : 'border-slate-200 bg-slate-50'
                      }`}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#22c55e]" />
                        <div>
                          <h5 className="text-xs font-bold">{doc.filename}</h5>
                          <p className="text-[11px] opacity-70 font-mono">{doc.chunk_count} Chunks Indexed</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteDoc(doc.filename)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citation Inspector Modal */}
      {activeCitations && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className={`w-full max-w-xl max-h-[80vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${isDark ? 'border-[#1f293d] bg-[#0d1117] text-white' : 'border-slate-200 bg-white text-slate-900'
            }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-[#1f293d]' : 'border-slate-200'}`}>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Database className="w-4 h-4 text-[#22c55e]" /> Grounded Citations ({activeCitations.length})
              </h3>
              <button onClick={() => setActiveCitations(null)} className="p-1 opacity-70 hover:opacity-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {activeCitations.map((c, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-1.5 font-mono ${isDark ? 'bg-[#090d14] border-[#1f293d]' : 'bg-slate-50 border-slate-200'
                  }`}>
                  <div className="text-[#22c55e] font-extrabold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{c.source}</span>
                  </div>
                  <div className="leading-relaxed font-sans text-xs opacity-90">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-3xl w-full bg-[#0d1117] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxImg(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer z-10">
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImg.url} alt={lightboxImg.caption} className="w-full max-h-[75vh] object-contain bg-black" />
            <div className="p-4 bg-[#090d14] border-t border-[#1f293d]">
              <p className="text-sm font-bold text-white">{lightboxImg.caption || lightboxImg.filename}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
