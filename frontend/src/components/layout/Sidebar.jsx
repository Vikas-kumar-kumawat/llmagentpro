import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  MessageSquare,
  PhoneCall,
  Brain,
  Ticket,
  PanelLeft,
  Zap,
  Gift,
  TrendingDown
} from 'lucide-react';

export function Sidebar({ activeAgent, setActiveAgent, isCollapsed, setIsCollapsed, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const agents = [
    { id: 'chatbot', name: 'BFibernet AI', icon: <Brain className="w-4 h-4 text-cyan-400" /> },
    { id: 'feedback', name: 'Feedback Collector', icon: <MessageSquare className="w-4 h-4 text-purple-400" /> },
    { id: 'recharge', name: 'Recharge Reminder', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { id: 'offers', name: 'New Offers Call', icon: <Gift className="w-4 h-4 text-pink-400" /> },
    { id: 'competitor', name: 'Competitor Price Monitor', icon: <TrendingDown className="w-4 h-4 text-orange-400" /> },
    { id: 'outbound', name: 'Direct Voice Call', icon: <PhoneCall className="w-4 h-4 text-emerald-400" /> },
    { id: 'history', name: 'Logs & Tickets', icon: <Ticket className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <aside
      className={`h-screen transition-all duration-300 flex flex-col justify-between select-none ${isCollapsed ? 'w-16' : 'w-64'
        } ${isDark ? 'bg-[#050505] border-r border-[#161616] text-[#f4f4f5]' : 'bg-white border-r border-slate-200 text-slate-800 shadow-sm'
        }`}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-1">
        {/* BFibernet Brand Logo Header */}
        {!isCollapsed ? (
          <div className="p-3 flex items-center justify-between gap-2">
            <div
              className="flex items-center gap-2 cursor-pointer group flex-1"
              onClick={() => setActiveAgent('chatbot')}
              title="BFibernet AI Dashboard"
            >
              <img
                src="/bfibernet_logo.png"
                alt="BFibernet Logo"
                className="h-12 object-contain rounded-xl bg-white px-2.5 py-1 shadow-sm border border-slate-200/90 transition-transform group-hover:scale-105"
              />
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              title="Minimize Sidebar"
              className={`p-2 rounded-xl transition cursor-pointer border shrink-0 ${
                isDark
                  ? 'bg-[#121212] hover:bg-[#1c1c1c] text-zinc-300 border-[#222222] hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-2.5 w-full">
            <div
              className="cursor-pointer group flex items-center justify-center"
              onClick={() => setIsCollapsed(false)}
              title="Click logo to expand sidebar"
            >
              <img
                src="/bfibernet_logo.png"
                alt="BFibernet Logo"
                className="w-10 h-10 object-contain rounded-xl bg-white p-1 shadow-sm border border-slate-200/90 transition-transform group-hover:scale-105"
              />
            </div>
          </div>
        )}

        {/* Navigation Items Directory */}
        <div className={`py-2 space-y-1.5 ${isCollapsed ? 'flex flex-col items-center px-1' : 'px-2.5'}`}>
          {!isCollapsed && (
            <p className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              Navigation
            </p>
          )}

          {agents.map((agent) => {
            const isActive = activeAgent === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgent(agent.id);
                  if (window.innerWidth < 768) {
                    setIsCollapsed(true);
                  }
                }}
                title={agent.name}
                className={`transition-all duration-200 flex items-center cursor-pointer text-xs group ${isCollapsed
                    ? `w-10 h-10 justify-center rounded-xl border ${isActive
                      ? isDark
                        ? 'bg-[#141414] text-white border-[#282828] shadow-sm'
                        : 'bg-slate-100 text-slate-900 font-bold border-slate-300'
                      : isDark
                        ? 'hover:bg-[#111111] text-zinc-400 hover:text-white border-transparent'
                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent'
                    }`
                    : `w-full py-2 px-2.5 rounded-xl justify-start ${isActive
                      ? isDark
                        ? 'bg-[#141414] text-white font-semibold border border-[#282828] shadow-sm'
                        : 'bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-2xs'
                      : isDark
                        ? 'hover:bg-[#111111] text-zinc-400 hover:text-white border-transparent'
                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent'
                    }`
                  }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden justify-center">
                  <span className="shrink-0 transition-transform group-hover:scale-105">{agent.icon}</span>
                  {!isCollapsed && (
                    <span className="truncate text-xs font-semibold">
                      {agent.name}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
