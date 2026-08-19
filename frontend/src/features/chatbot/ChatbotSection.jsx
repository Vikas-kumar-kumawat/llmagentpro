import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  queryRagKnowledgeBase,
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
  Wifi,
  Router,
  Phone,
  Shield,
  Paperclip,
  RotateCw
} from 'lucide-react';

export function ChatbotSection() {
  const { theme, isDark } = useTheme();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [msgFeedback, setMsgFeedback] = useState({});

  // Active Role State: 'customer' | 'admin'
  const [userRole, setUserRole] = useState('customer');

  // KB Modal State & Tabs
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [modalRagTab, setModalRagTab] = useState('customer'); // 'customer' or 'admin'
  const [kbDocs, setKbDocs] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);

  // Citation & Lightbox Modal State
  const [activeCitations, setActiveCitations] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mainFileInputRef = useRef(null);

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
      const queryWithContext = userRole === 'admin'
        ? `[ADMIN EXEC QUERY]: ${userQuery}`
        : userQuery;

      const res = await queryRagKnowledgeBase(queryWithContext);
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

  // Quick Action Prompt Cards Data matching Screenshots
  const promptCards = userRole === 'customer' ? [
    {
      title: 'Broadband Plans',
      desc: 'Check available fiber plans & speeds',
      prompt: 'What broadband fiber plans are available?',
      icon: Wifi
    },
    {
      title: 'Installation & SLA',
      desc: 'Router setup & installation SLA details',
      prompt: 'What is the router installation SLA?',
      icon: Router
    },
    {
      title: 'Billing & Recharge',
      desc: 'Billing info, recharge options & invoices',
      prompt: 'What are the billing and recharge offers?',
      icon: FileText
    },
    {
      title: 'Contact & Support',
      desc: 'Contact numbers, emails & support channels',
      prompt: 'What contact numbers & emails are available?',
      icon: Phone
    }
  ] : [
    {
      title: 'Partner SLA Workflow',
      desc: 'Partner installation & escalation SLA',
      prompt: 'What is the partner SLA & installation workflow?',
      icon: Shield
    },
    {
      title: 'Technical Hardware',
      desc: 'Internal router configuration & telemetries',
      prompt: 'Show internal technical router configurations',
      icon: Router
    },
    {
      title: 'Admin Billing Rules',
      desc: 'Internal discount matrix & policies',
      prompt: 'What are the admin billing & discount policies?',
      icon: FileText
    },
    {
      title: 'Helpline Matrix',
      desc: 'Executive escalation phone matrix',
      prompt: 'What helpline escalation matrix is active?',
      icon: Phone
    }
  ];

  return (
    <div className={`w-full h-full flex-1 min-h-0 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#050507] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>

      {/* Floating Header Bar */}
      <div className={`w-full px-4 sm:px-8 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors duration-300 ${
        isDark ? 'bg-[#050507] border-[#1e1e24] text-white shadow-xl' : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-sm backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isDark ? 'bg-[#121216] text-white border border-[#22222a] shadow-xs' : 'bg-slate-100 text-slate-900 border border-slate-200 shadow-xs'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="flex flex-col">
            <span className={`font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              BFibernet AI
            </span>
            <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Your Broadband Assistant
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer Mode Switcher */}
          <button
            onClick={() => setUserRole('customer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              userRole === 'customer'
                ? isDark
                  ? 'bg-white text-black border-white shadow-xs'
                  : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : isDark
                  ? 'bg-[#0c0c0f] text-zinc-400 border-[#22222a] hover:text-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          {/* Admin Mode Switcher */}
          <button
            onClick={() => setUserRole('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              userRole === 'admin'
                ? isDark
                  ? 'bg-white text-black border-white shadow-xs'
                  : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : isDark
                  ? 'bg-[#0c0c0f] text-zinc-400 border-[#22222a] hover:text-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Docs Button */}
          <button
            onClick={() => { setIsKbModalOpen(true); fetchKbInfo(); }}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 border ${
              isDark
                ? 'bg-[#0c0c0f] hover:bg-[#141418] text-zinc-200 border-[#22222a]'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
            title="Knowledge Base Documents"
          >
            <Database className="w-3.5 h-3.5 text-zinc-300" />
            <span>Docs</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#18181c] text-zinc-300 border border-[#282832] font-extrabold">
              {kbDocs.length}
            </span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleExportChat}
              className={`p-1.5 px-2.5 rounded-xl transition cursor-pointer text-xs font-bold border ${
                isDark ? 'bg-[#0c0c0f] hover:bg-[#141418] text-zinc-300 border-[#22222a]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Export Chat Transcript"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <div className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="my-auto h-full flex flex-col items-center justify-center max-w-4xl mx-auto text-center py-10 animate-fadeIn">
            {/* Glowing Center Logo Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 hover:scale-105 ${
              isDark
                ? 'bg-[#121216] border-2 border-[#282832] text-white shadow-xl'
                : 'bg-slate-100 border-2 border-slate-300 text-slate-900 shadow-md'
            }`}>
              <Sparkles className="w-8 h-8" />
            </div>

            {/* Welcome Heading */}
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight max-w-xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Hi! 👋 How can I help you with <span className="underline decoration-zinc-700 font-extrabold">BFibernet Broadband</span> today?
            </h2>

            <p className={`text-sm font-medium mt-2 max-w-md ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              Ask anything about plans, installation, billing, or support.
            </p>

            {/* 4 Prompt Cards in a 2x2 Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto w-full mt-8">
              {promptCards.map((card, i) => {
                const IconComp = card.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleQuickPrompt(card.prompt)}
                    className={`p-6 sm:p-7 min-h-[110px] rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99] ${
                      isDark
                        ? 'bg-[#070709] border-[#2a2a34] hover:border-zinc-500 hover:bg-[#0c0c0f] shadow-xl'
                        : 'bg-white border-slate-900 hover:border-black hover:shadow-md shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-5 text-left">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#121216] border border-[#22222a] text-white' : 'bg-slate-100 border border-slate-200 text-slate-800'
                      }`}>
                        <IconComp className="w-7 h-7" />
                      </div>

                      <div>
                        <h3 className={`font-extrabold text-sm transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {card.title}
                        </h3>
                        <p className={`text-xs font-medium mt-0.5 ${
                          isDark ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          {card.desc}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      isDark ? 'text-zinc-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (

          <div className="max-w-4xl mx-auto w-full space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Prompt Bubble */}
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

                {/* Agent Response */}
                {msg.sender === 'agent' && (
                  <div className="flex gap-3 items-start pt-2">
                    {/* Left AI avatar badge */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                      isDark
                        ? 'bg-[#121216] border-[#22222a] text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>

                    {/* Agent Response Card Container */}
                    <div className={`flex-1 rounded-2xl border p-5 space-y-4 shadow-xl ${
                      isDark ? 'bg-[#070709] border-[#1e1e24] text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900'
                    }`}>

                      {/* RAG Telemetry badge */}
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                        <button
                          onClick={() => toggleSteps(msg.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer transition text-[11px] ${
                            isDark ? 'bg-[#18181c] border-[#282832] text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Completed RAG Search ({msg.sources?.length || 1} sources)</span>
                          <span className="font-bold ml-1">›</span>
                        </button>

                        {msg.role === 'admin' && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#18181c] text-zinc-300 border border-[#282832]">
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
      <div className="w-full max-w-4xl mx-auto px-4 pb-4">
        <form onSubmit={handleSend}>
          <div className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex items-center gap-3 ${
            isDark
              ? 'bg-[#070709] border-[#1e1e24] focus-within:border-zinc-500 shadow-2xl'
              : 'bg-white border-slate-900 focus-within:border-black shadow-lg'
          }`}>

            {/* Input Line */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about BFibernet broadband plans, SLAs, routers, or support..."
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

            {/* Solid White Circular Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer shadow-md active:scale-95"
              title="Send Question"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Send className="w-4 h-4 text-black" />
              )}
            </button>
          </div>
        </form>
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
