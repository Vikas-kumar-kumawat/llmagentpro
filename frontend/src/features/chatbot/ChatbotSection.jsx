import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { queryRagKnowledgeBase } from '../../services/apiService';
import { FormattedMessage } from '../../components/common/FormattedMessage';
import {
  MessageSquare,
  Zap,
  Gift,
  TrendingDown,
  Bot,
  Send,
  Terminal,
  ArrowRight,
  Wifi,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export function ChatbotSection({ onSwitchTab }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'human',
      text: userQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await queryRagKnowledgeBase(userQuery);
      const replyText = res.answer || "I am connected to the official BFibernet enterprise knowledge base. How can I help you today?";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: replyText,
          sources: res.sources || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: `Hello! I am your **BFibernet AI Copilot**. How can I assist you with your broadband service or enterprise fiber connection today?`,
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

  const handleAgentLaunch = (targetTab) => {
    if (targetTab && onSwitchTab) {
      onSwitchTab(targetTab);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] font-['Plus_Jakarta_Sans',sans-serif] select-none flex flex-col justify-between p-2.5 sm:p-6 space-y-3 sm:space-y-4 transition-colors duration-200 ${isDark ? 'bg-[#000000] text-white' : 'bg-transparent text-slate-900'}`}>

      {/* Top Header Banner */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${isDark ? 'bg-[#18181b] border-[#27272a] text-emerald-400' : 'bg-white text-slate-900 border-white shadow-md'
            }`}>
            <Wifi className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight leading-tight flex items-center gap-2 text-white">
              BFibernet <span className={isDark ? 'text-zinc-300 font-medium' : 'text-slate-200 font-medium'}>AI Copilot</span>
              <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-md border ${isDark
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-emerald-500 text-white border-emerald-400'
                }`}>
                <Sparkles className="w-3 h-3 text-white" /> RAG v2.4 Active
              </span>
            </h1>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition cursor-pointer ${isDark
              ? 'bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border-[#27272a]'
              : 'bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-md shadow-xs'
              }`}
          >
            <RefreshCw className="w-3 h-3 text-white" /> Clear Chat
          </button>
        )}
      </div>

      {/* Main Workspace Area: Action Cards or Message Log */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col overflow-y-auto py-1">
        {messages.length === 0 ? (
          <div className="my-auto space-y-4 sm:space-y-6 animate-fadeIn w-full">

            {/* Quick Suggested Prompts */}
            <div className="flex flex-wrap gap-2">
              {[
                'tell me about bfibernet',
                'What broadband fiber plans are available?',
                'What is the installation SLA & router details?',
                'What are the billing and recharge discounts?'
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className={`text-xs font-semibold border px-3.5 py-2 rounded-full transition-all duration-200 text-left flex items-center gap-1.5 cursor-pointer active:scale-95 ${isDark
                    ? 'bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border-[#27272a] hover:border-sky-500/50'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border-white shadow-md hover:shadow-lg'
                    }`}
                >
                  <span className="text-amber-500">💡</span> "{prompt}"
                </button>
              ))}
            </div>

            {/* 4 Agent Action Cards Console */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Feedback Agent */}
              <div
                onClick={() => handleAgentLaunch('feedback')}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group flex items-center gap-3.5 ${isDark
                    ? 'bg-[#09090b] border-[#27272a] hover:border-sky-500/80 hover:bg-[#121215]'
                    : 'bg-white border-white hover:border-blue-400 shadow-lg hover:shadow-xl'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${isDark ? 'bg-[#18181b] border-[#27272a] text-white' : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className={`text-base font-bold transition ${isDark ? 'text-white group-hover:text-sky-400' : 'text-slate-900 group-hover:text-blue-600'}`}>Launch Feedback Agent</h3>
              </div>

              {/* Recharge Reminder */}
              <div
                onClick={() => handleAgentLaunch('recharge')}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group flex items-center gap-3.5 ${isDark
                    ? 'bg-[#09090b] border-[#27272a] hover:border-sky-500/80 hover:bg-[#121215]'
                    : 'bg-white border-white hover:border-blue-400 shadow-lg hover:shadow-xl'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${isDark ? 'bg-[#18181b] border-[#27272a] text-white' : 'bg-amber-50 border-amber-100 text-amber-600'
                  }`}>
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className={`text-base font-bold transition ${isDark ? 'text-white group-hover:text-sky-400' : 'text-slate-900 group-hover:text-blue-600'}`}>Launch Recharge Reminder</h3>
              </div>

              {/* New Offers Call */}
              <div
                onClick={() => handleAgentLaunch('offers')}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group flex items-center gap-3.5 ${isDark
                    ? 'bg-[#09090b] border-[#27272a] hover:border-sky-500/80 hover:bg-[#121215]'
                    : 'bg-white border-white hover:border-blue-400 shadow-lg hover:shadow-xl'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${isDark ? 'bg-[#18181b] border-[#27272a] text-white' : 'bg-purple-50 border-purple-100 text-purple-600'
                  }`}>
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className={`text-base font-bold transition ${isDark ? 'text-white group-hover:text-sky-400' : 'text-slate-900 group-hover:text-blue-600'}`}>Launch New Offers Call</h3>
              </div>

              {/* Competitor Price Monitor */}
              <div
                onClick={() => handleAgentLaunch('competitor')}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group flex items-center gap-3.5 ${isDark
                    ? 'bg-[#09090b] border-[#27272a] hover:border-sky-500/80 hover:bg-[#121215]'
                    : 'bg-white border-white hover:border-blue-400 shadow-lg hover:shadow-xl'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${isDark ? 'bg-[#18181b] border-[#27272a] text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className={`text-base font-bold transition ${isDark ? 'text-white group-hover:text-sky-400' : 'text-slate-900 group-hover:text-blue-600'}`}>Launch Competitor Price Monitor</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4 sm:space-y-5 px-1 my-auto max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-3.5 sm:p-5 space-y-2 shadow-sm border ${msg.sender === 'human'
                    ? isDark ? 'bg-sky-600 text-white border-sky-500' : 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : isDark
                      ? 'bg-[#09090b] text-white border-[#27272a]'
                      : 'bg-white/92 backdrop-blur-md text-slate-900 border-white/90 shadow-xl'
                    }`}
                >
                  <div className={`flex items-center justify-between gap-3 pb-2 border-b ${msg.sender === 'human'
                    ? 'border-sky-500/60'
                    : isDark ? 'border-zinc-800' : 'border-slate-100'
                    }`}>
                    <span className={`font-semibold flex items-center gap-2 text-xs tracking-wide ${msg.sender === 'human' ? 'text-white font-bold' : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                      {msg.sender === 'agent' ? (
                        <>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'
                            }`}>
                            <Bot className="w-3 h-3 text-emerald-500" />
                          </div>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>BFIBERNET AI</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${isDark ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                            Copilot
                          </span>
                        </>
                      ) : (
                        <>YOU</>
                      )}
                    </span>
                    <span className={`text-[11px] font-mono ${msg.sender === 'human' ? 'text-sky-100' : isDark ? 'text-zinc-500' : 'text-slate-400'
                      }`}>{msg.time}</span>
                  </div>

                  {/* Formatted Content Rendering */}
                  {msg.sender === 'agent' ? (
                    <FormattedMessage content={msg.text} isAgent={true} sources={msg.sources} />
                  ) : (
                    <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Loading Animation */}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`max-w-[85%] rounded-xl p-4 border flex items-center gap-3 ${isDark ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white/78 backdrop-blur-md border-white/50 text-slate-900 shadow-sm'
                  }`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isDark ? 'bg-zinc-800' : 'bg-white/50'
                    }`}>
                    <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      BFibernet AI Copilot <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </p>
                    <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Analyzing enterprise knowledge base...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Command Console Input Bar */}
      <div className="max-w-4xl mx-auto w-full pt-2 sm:pt-3">
        <form onSubmit={handleSend}>
          <div className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2 sm:gap-3 ${isDark
              ? 'bg-[#09090b] border-[#27272a] focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20'
              : 'bg-white border-slate-200 shadow-xl focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20'
            }`}>
            <div className={`p-2.5 rounded-lg shrink-0 border shadow-xs ${isDark ? 'bg-[#18181b] border-[#27272a] text-sky-400' : 'bg-blue-600 border-blue-600 text-white shadow-xs'
              }`}>
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BFibernet AI about plans, SLAs, billing, or technical support..."
              className={`w-full bg-transparent text-xs sm:text-sm outline-none font-medium px-1 sm:px-2 py-1.5 min-w-0 ${isDark ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
                }`}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer border ${input.trim() && !isLoading
                ? isDark
                  ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500 shadow-md active:scale-95'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md active:scale-95'
                : isDark
                  ? 'bg-[#18181b] text-zinc-600 border-[#27272a] cursor-not-allowed'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : (
                <>
                  <span className="hidden xs:inline">Send</span>
                  <Send className="w-3.5 h-3.5 text-white" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info text */}
        <p className={`text-center text-[10px] sm:text-xs mt-2 font-medium ${isDark ? 'text-zinc-500' : 'text-slate-700'
          }`}>
          BFibernet Enterprise AI Copilot • Powered by Grounded RAG Knowledge Base
        </p>
      </div>

    </div>
  );
}

