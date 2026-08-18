import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  MessageSquare,
  Zap,
  Gift,
  TrendingDown,
  Bot,
  Send,
  Terminal,
  ArrowRight,
  Wifi
} from 'lucide-react';

export function ChatbotSection({ onSwitchTab }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    const userMsg = { 
      id: Date.now(), 
      sender: 'human', 
      text: userQuery, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let replyText = `Hello Vikas! I am your BFibernet AI Assistant. `;
      const lower = userQuery.toLowerCase();

      if (lower.includes('feedback') || lower.includes('rating') || lower.includes('sentiment')) {
        replyText += `You can execute our Feedback Collector Agent from the sidebar.`;
      } else if (lower.includes('recharge') || lower.includes('reminder') || lower.includes('expiry')) {
        replyText += `You can trigger automated Recharge Expiry Reminder calls & SMS notifications.`;
      } else if (lower.includes('offer') || lower.includes('discount') || lower.includes('promo')) {
        replyText += `You can launch the New Offers Promotional Broadcast Call Agent for fiber upgrades.`;
      } else if (lower.includes('competitor') || lower.includes('price') || lower.includes('rival')) {
        replyText += `You can monitor rival ISP pricing & trigger counter-offer call campaigns.`;
      } else {
        replyText += `How can I assist you with your broadband service, AI voice agents, or call operations today?`;
      }

      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now() + 1, 
          sender: 'agent', 
          text: replyText, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    }, 400);
  };

  const handleAgentLaunch = (targetTab) => {
    if (targetTab && onSwitchTab) {
      onSwitchTab(targetTab);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#000000] text-white font-['Plus_Jakarta_Sans',sans-serif] select-none flex flex-col justify-between p-2.5 sm:p-6 space-y-3 sm:space-y-4">
      
      {/* Top Header Banner */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-2 sm:pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border shrink-0 bg-[#18181b] border-[#27272a] text-white">
            <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
            BFibernet <span className="text-[#a1a1aa] font-normal text-xs sm:text-xl">AI Copilot</span>
          </h1>
        </div>
      </div>

      {/* Main Workspace Area: Action Cards or Message Log */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col overflow-y-auto py-1">
        {messages.length === 0 ? (
          <div className="my-auto space-y-3 sm:space-y-6 animate-fadeIn w-full">
            <div className="text-left border-b border-[#27272a] pb-2.5 sm:pb-4">
              <h2 className="text-sm sm:text-lg font-semibold text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                What can I launch for you, <span className="text-[#a1a1aa] font-normal">Vikas?</span>
              </h2>
            </div>

            {/* 4 Agent Action Cards Console */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
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
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3 sm:space-y-4 px-1 my-auto max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-xl p-3 sm:p-4 space-y-1 sm:space-y-1.5 shadow-sm border ${
                    msg.sender === 'human'
                      ? 'bg-white text-black border-white'
                      : 'bg-[#09090b] text-white border-[#27272a]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 pb-1 border-b border-zinc-800/40">
                    <span className={`font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider ${msg.sender === 'human' ? 'text-black' : 'text-white'}`}>
                      {msg.sender === 'agent' ? <><Bot className="w-4 h-4 text-white" /> BFibernet AI</> : 'You'}
                    </span>
                    <span className={`text-xs ${msg.sender === 'human' ? 'text-zinc-600' : 'text-[#a1a1aa]'}`}>{msg.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Console Input Bar — Monochrome Style */}
      <div className="max-w-4xl mx-auto w-full pt-2 sm:pt-3">
        <form onSubmit={handleSend}>
          <div className="p-2 sm:p-3 rounded-xl border border-[#27272a] bg-[#09090b] focus-within:border-white transition flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg border shrink-0 bg-[#000000] text-white border-[#27272a]">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BFibernet AI or type a command..."
              className="w-full bg-transparent text-xs sm:text-base text-white placeholder-[#71717a] outline-none font-medium px-1 sm:px-2 py-1.5 min-w-0"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className={`px-3.5 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer border ${
                input.trim()
                  ? 'bg-white text-black border-white hover:bg-zinc-200 active:scale-95'
                  : 'bg-[#000000] text-[#71717a] border-[#27272a] cursor-not-allowed'
              }`}
            >
              <span className="hidden xs:inline">Execute</span>
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
        </form>

        {/* Footer info text */}
        <p className="text-center text-[9px] sm:text-[11px] mt-1.5 text-[#71717a]">
          BFibernet AI Copilot • Powered by Enterprise AI Architecture
        </p>
      </div>

    </div>
  );
}
