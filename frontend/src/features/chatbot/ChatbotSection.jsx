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
  Activity,
  ArrowRight
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
        replyText += `You can execute our Feedback Collector Agent (LangGraph) from the sidebar.`;
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
    <div className="flex flex-col h-[calc(100vh-5rem)] justify-between max-w-4xl mx-auto px-2 md:px-4 font-sans select-none space-y-4 py-2">
      
      {/* Top Header Banner */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isDark ? 'bg-[#050505] border-[#161616]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <img
            src="/bfibernet_logo.png"
            alt="BFibernet Logo"
            className="h-10 object-contain rounded-xl bg-white px-2 py-0.5 border border-slate-200"
          />
          <div>
            <h1 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              BFibernet AI Copilot
            </h1>
            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              AI Voice Calling &amp; Customer Support Console
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-2 border ${
          isDark ? 'bg-[#0c0c0c] text-emerald-400 border-[#1a1a1a]' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Activity className="w-3 h-3" />
          <span>Engine Active</span>
        </div>
      </div>

      {/* Main Workspace Area: Action Cards or Message Log */}
      <div className="flex-1 flex flex-col overflow-y-auto py-2">
        {messages.length === 0 ? (
          <div className="my-auto space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                What can I help you with today, vikas?
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Select an AI Voice Agent command below or type your inquiry.
              </p>
            </div>

            {/* 4 Agent Action Cards Console */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
              <div 
                onClick={() => handleAgentLaunch('feedback')}
                className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer group flex flex-col justify-between space-y-2.5 ${
                  isDark 
                    ? 'bg-[#080808] hover:bg-[#111111] border-[#181818] hover:border-[#222222]' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    isDark ? 'bg-[#121212] text-purple-400 border-[#202020]' : 'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
                    isDark ? 'bg-[#121212] text-zinc-400 border-[#202020] group-hover:text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span>Launch</span> <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Feedback Collector</h3>
                  <p className={`text-[11px] mt-0.5 leading-normal ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Analyze ratings &amp; trigger outbound feedback calls.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => handleAgentLaunch('recharge')}
                className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer group flex flex-col justify-between space-y-2.5 ${
                  isDark 
                    ? 'bg-[#080808] hover:bg-[#111111] border-[#181818] hover:border-[#222222]' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    isDark ? 'bg-[#121212] text-amber-400 border-[#202020]' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
                    isDark ? 'bg-[#121212] text-zinc-400 border-[#202020] group-hover:text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span>Launch</span> <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recharge Reminder</h3>
                  <p className={`text-[11px] mt-0.5 leading-normal ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Trigger voice calls for upcoming plan expirations.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => handleAgentLaunch('offers')}
                className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer group flex flex-col justify-between space-y-2.5 ${
                  isDark 
                    ? 'bg-[#080808] hover:bg-[#111111] border-[#181818] hover:border-[#222222]' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    isDark ? 'bg-[#121212] text-pink-400 border-[#202020]' : 'bg-pink-50 text-pink-600 border-pink-100'
                  }`}>
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
                    isDark ? 'bg-[#121212] text-zinc-400 border-[#202020] group-hover:text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span>Launch</span> <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>New Offers Call</h3>
                  <p className={`text-[11px] mt-0.5 leading-normal ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Broadcast promotional fiber plan discount offers.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => handleAgentLaunch('competitor')}
                className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer group flex flex-col justify-between space-y-2.5 ${
                  isDark 
                    ? 'bg-[#080808] hover:bg-[#111111] border-[#181818] hover:border-[#222222]' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    isDark ? 'bg-[#121212] text-orange-400 border-[#202020]' : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
                    isDark ? 'bg-[#121212] text-zinc-400 border-[#202020] group-hover:text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span>Launch</span> <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Competitor Price Monitor</h3>
                  <p className={`text-[11px] mt-0.5 leading-normal ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Track rival ISP broadband rates &amp; launch counter-offers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3 px-1 my-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    msg.sender === 'human'
                      ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                      : isDark
                      ? 'bg-[#080808] border border-[#181818] text-zinc-200 rounded-bl-xs'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 pb-0.5">
                    <span className="font-bold flex items-center gap-1 text-[11px] text-blue-400">
                      {msg.sender === 'agent' ? <><Bot className="w-3.5 h-3.5" /> BFibernet AI</> : 'You'}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Console Input Bar */}
      <div className="w-full max-w-3xl mx-auto pt-1">
        <form onSubmit={handleSend}>
          <div
            className={`p-1.5 rounded-2xl border transition flex items-center gap-2 ${
              isDark
                ? 'bg-[#080808] border-[#181818] focus-within:border-[#282828]'
                : 'bg-white border-slate-200 focus-within:border-slate-300'
            }`}
          >
            <div className={`p-2 rounded-xl border shrink-0 ${
              isDark ? 'bg-[#121212] text-zinc-400 border-[#1f1f1f]' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <Terminal className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BFibernet AI or type a command..."
              className={`w-full bg-transparent text-xs outline-none font-medium px-1 ${
                isDark ? 'text-white placeholder-zinc-600' : 'text-slate-900 placeholder-slate-400'
              }`}
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                input.trim()
                  ? isDark
                    ? 'bg-[#181818] hover:bg-[#222222] text-white border-[#282828]'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600'
                  : isDark
                    ? 'bg-[#101010] text-zinc-600 border-[#181818] cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <span>Execute</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Footer info text */}
        <p className={`text-center text-[10px] mt-2 font-medium ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
          bfibernet powered by AI.
        </p>
      </div>

    </div>
  );
}
