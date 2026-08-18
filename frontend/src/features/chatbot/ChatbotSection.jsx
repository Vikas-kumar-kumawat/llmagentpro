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
    <div className="min-h-[calc(100vh-4rem)] bg-[#000000] text-white font-['Plus_Jakarta_Sans',sans-serif] select-none flex flex-col justify-between p-2.5 sm:p-6 space-y-3 sm:space-y-4">
      
      {/* Top Header Banner */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 bg-[#18181b] border-[#27272a] text-white">
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight flex items-center gap-2">
              BFibernet <span className="text-[#a1a1aa] font-normal text-xs sm:text-base">AI Copilot</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                <Sparkles className="w-2.5 h-2.5" /> RAG v2.4 Active
              </span>
            </h1>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-[#18181b] border border-[#27272a] hover:border-zinc-600 px-2.5 py-1 rounded-lg transition"
          >
            <RefreshCw className="w-3 h-3" /> Clear Chat
          </button>
        )}
      </div>

      {/* Main Workspace Area: Action Cards or Message Log */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col overflow-y-auto py-1">
        {messages.length === 0 ? (
          <div className="my-auto space-y-4 sm:space-y-6 animate-fadeIn w-full">
            <div className="text-left border-b border-[#27272a] pb-3">
              <h2 className="text-base sm:text-xl font-semibold text-white tracking-tight">
                What can I assist you with today, <span className="text-zinc-400 font-normal">Vikas?</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Ask about BFibernet fiber plans, installation SLAs, billing policies, or launch an AI agent below.
              </p>
            </div>

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
                  className="text-xs bg-[#09090b] hover:bg-[#18181b] text-zinc-300 hover:text-white border border-[#27272a] hover:border-zinc-500 px-3 py-1.5 rounded-full transition text-left"
                >
                  💡 "{prompt}"
                </button>
              ))}
            </div>

            {/* 4 Agent Action Cards Console */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-2">
              <div 
                onClick={() => handleAgentLaunch('feedback')}
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-2 sm:space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border bg-[#000000] text-white border-[#27272a] group-hover:border-white transition-colors">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-[#a1a1aa] group-hover:text-white flex items-center gap-1 transition-colors">
                    <span>LAUNCH</span> <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-white transition">Feedback Agent</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Collect live voice feedback & support ratings</p>
                </div>
              </div>

              <div 
                onClick={() => handleAgentLaunch('recharge')}
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-2 sm:space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border bg-[#000000] text-white border-[#27272a] group-hover:border-white transition-colors">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-[#a1a1aa] group-hover:text-white flex items-center gap-1 transition-colors">
                    <span>LAUNCH</span> <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-white transition">Recharge Reminder</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Automated renewal reminders & plan extensions</p>
                </div>
              </div>

              <div 
                onClick={() => handleAgentLaunch('offers')}
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-2 sm:space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border bg-[#000000] text-white border-[#27272a] group-hover:border-white transition-colors">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-[#a1a1aa] group-hover:text-white flex items-center gap-1 transition-colors">
                    <span>LAUNCH</span> <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-white transition">New Offers Call</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Broadcast promotional upgrades & festive deals</p>
                </div>
              </div>

              <div 
                onClick={() => handleAgentLaunch('competitor')}
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-2 sm:space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border bg-[#000000] text-white border-[#27272a] group-hover:border-white transition-colors">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-[#a1a1aa] group-hover:text-white flex items-center gap-1 transition-colors">
                    <span>LAUNCH</span> <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-white transition">Competitor Price Monitor</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Compare JioFiber, Airtel & ACT market rates</p>
                </div>
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
                  className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-3.5 sm:p-5 space-y-2 shadow-lg border ${
                    msg.sender === 'human'
                      ? 'bg-zinc-100 text-zinc-900 border-white'
                      : 'bg-[#09090b] text-white border-[#27272a] bg-gradient-to-b from-[#121215] to-[#09090b]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
                    <span className={`font-semibold flex items-center gap-2 text-xs tracking-wide ${msg.sender === 'human' ? 'text-zinc-900 font-bold' : 'text-white'}`}>
                      {msg.sender === 'agent' ? (
                        <>
                          <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <Bot className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="font-bold text-white">BFIBERNET AI</span>
                          <span className="text-[10px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded font-mono border border-zinc-700/50">
                            Copilot
                          </span>
                        </>
                      ) : (
                        <>YOU</>
                      )}
                    </span>
                    <span className={`text-[11px] font-mono ${msg.sender === 'human' ? 'text-zinc-600' : 'text-zinc-500'}`}>{msg.time}</span>
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
                <div className="max-w-[85%] rounded-xl p-4 bg-[#09090b] border border-[#27272a] text-white flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                    <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      BFibernet AI Copilot <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </p>
                    <p className="text-[11px] text-zinc-400">Analyzing enterprise knowledge base...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Command Console Input Bar — Modern Monochrome Style */}
      <div className="max-w-4xl mx-auto w-full pt-2 sm:pt-3">
        <form onSubmit={handleSend}>
          <div className="p-2 sm:p-2.5 rounded-xl border border-[#27272a] bg-[#09090b] focus-within:border-zinc-500 transition flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg border shrink-0 bg-[#000000] text-white border-[#27272a]">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BFibernet AI about plans, SLAs, billing, or technical support..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 outline-none font-normal px-1 sm:px-2 py-1.5 min-w-0"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer border ${
                input.trim() && !isLoading
                  ? 'bg-white text-black border-white hover:bg-zinc-200 active:scale-95'
                  : 'bg-[#000000] text-zinc-600 border-[#27272a] cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
              ) : (
                <>
                  <span className="hidden xs:inline">Send</span>
                  <Send className="w-3.5 h-3.5 text-black" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info text */}
        <p className="text-center text-[9px] sm:text-[11px] mt-1.5 text-zinc-500">
          BFibernet Enterprise AI Copilot • Powered by Grounded RAG Knowledge Base
        </p>
      </div>

    </div>
  );
}

