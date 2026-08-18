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
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 bg-white/90 border-white/80 text-emerald-600 shadow-sm">
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight flex items-center gap-2 drop-shadow-xs">
              BFibernet <span className="text-white/90 font-medium text-xs sm:text-base">AI Copilot</span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/95 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                <Sparkles className="w-3 h-3 text-emerald-600" /> RAG v2.4 Active
              </span>
            </h1>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-slate-800 hover:text-slate-950 font-medium flex items-center gap-1.5 bg-white/90 hover:bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-slate-600" /> Clear Chat
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
                  className="text-xs bg-white/95 hover:bg-white text-slate-800 font-semibold border border-white/80 hover:border-sky-300 shadow-sm hover:shadow-md px-3.5 py-2 rounded-full transition-all duration-200 text-left flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="text-amber-500">💡</span> "{prompt}"
                </button>
              ))}
            </div>

            {/* 4 Agent Action Cards Console - Simple, Rectangular, Pythonish */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-2">
              {/* Feedback Agent */}
              <div 
                onClick={() => handleAgentLaunch('feedback')}
                className="p-3.5 sm:p-4 rounded-lg border border-slate-200 bg-white/95 hover:border-[#3776AB] hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-100 border border-slate-200 text-black group-hover:bg-[#3776AB]/10 transition-colors">
                    <MessageSquare className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 group-hover:bg-[#3776AB] group-hover:text-white transition-colors">
                    <span>launch()</span> <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3776AB] transition">Feedback Agent</h3>
                  <span className="text-[10px] font-mono text-slate-400">.py</span>
                </div>
              </div>

              {/* Recharge Reminder */}
              <div 
                onClick={() => handleAgentLaunch('recharge')}
                className="p-3.5 sm:p-4 rounded-lg border border-slate-200 bg-white/95 hover:border-[#3776AB] hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-100 border border-slate-200 text-black group-hover:bg-[#3776AB]/10 transition-colors">
                    <Zap className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 group-hover:bg-[#3776AB] group-hover:text-white transition-colors">
                    <span>launch()</span> <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3776AB] transition">Recharge Reminder</h3>
                  <span className="text-[10px] font-mono text-slate-400">.py</span>
                </div>
              </div>

              {/* New Offers Call */}
              <div 
                onClick={() => handleAgentLaunch('offers')}
                className="p-3.5 sm:p-4 rounded-lg border border-slate-200 bg-white/95 hover:border-[#3776AB] hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-100 border border-slate-200 text-black group-hover:bg-[#3776AB]/10 transition-colors">
                    <Gift className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 group-hover:bg-[#3776AB] group-hover:text-white transition-colors">
                    <span>launch()</span> <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3776AB] transition">New Offers Call</h3>
                  <span className="text-[10px] font-mono text-slate-400">.py</span>
                </div>
              </div>

              {/* Competitor Price Monitor */}
              <div 
                onClick={() => handleAgentLaunch('competitor')}
                className="p-3.5 sm:p-4 rounded-lg border border-slate-200 bg-white/95 hover:border-[#3776AB] hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-100 border border-slate-200 text-black group-hover:bg-[#3776AB]/10 transition-colors">
                    <TrendingDown className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 group-hover:bg-[#3776AB] group-hover:text-white transition-colors">
                    <span>launch()</span> <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3776AB] transition">Competitor Price Monitor</h3>
                  <span className="text-[10px] font-mono text-slate-400">.py</span>
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

      {/* Command Console Input Bar — Modern Styled Console */}
      <div className="max-w-4xl mx-auto w-full pt-2 sm:pt-3">
        <form onSubmit={handleSend}>
          <div className="p-2 sm:p-2.5 rounded-2xl border border-sky-200/90 bg-white/95 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all duration-200 flex items-center gap-2 sm:gap-3 shadow-lg shadow-sky-900/10">
            <div className="p-2 sm:p-2.5 rounded-xl shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 text-cyan-400 border border-slate-700 shadow-sm">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BFibernet AI about plans, SLAs, billing, or technical support..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-medium px-1 sm:px-2 py-1.5 min-w-0"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer border ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white border-transparent shadow-md shadow-sky-600/30 active:scale-95'
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
        <p className="text-center text-[10px] sm:text-xs mt-2 text-white/90 font-medium drop-shadow-xs">
          BFibernet Enterprise AI Copilot • Powered by Grounded RAG Knowledge Base
        </p>
      </div>

    </div>
  );
}

