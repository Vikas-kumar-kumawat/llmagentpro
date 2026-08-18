import React from 'react';
import {
  Brain,
  MessageSquare,
  Zap,
  Gift,
  TrendingDown,
  Headset,
  PanelLeft
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Sidebar({ activeAgent, setActiveAgent, isCollapsed, setIsCollapsed }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const agents = [
    { id: 'chatbot', name: 'BFibernet AI', icon: Brain },
    { id: 'feedback', name: 'Feedback Collector', icon: MessageSquare },
    { id: 'recharge', name: 'Recharge Reminder', icon: Zap },
    { id: 'offers', name: 'New Offers Call', icon: Gift, badge: 'Beta' },
    { id: 'competitor', name: 'Competitor Price Monitor', icon: TrendingDown },
    { id: 'outbound', name: 'Customer Support Agent', icon: Headset },
  ];

  return (
    <aside
      className={`h-screen transition-all duration-200 flex flex-col justify-between select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-[#000000] border-r border-[#27272a] text-[#ffffff] font-['Plus_Jakarta_Sans',sans-serif] shrink-0`}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Header Logo Branding & Collapse Toggle */}
        {!isCollapsed ? (
          <div className="p-3.5 flex items-center justify-between gap-2 border-b border-[#27272a] bg-[#000000]">
            <div
              className="flex items-center gap-2.5 cursor-pointer group flex-1"
              onClick={() => setActiveAgent('chatbot')}
              title="BFibernet AI Dashboard"
            >
              <div className={`px-2 py-1 rounded-lg border transition-all duration-200 group-hover:scale-105 ${
                isDark
                  ? 'bg-white border-[#27272a] shadow-sm'
                  : 'bg-[#09090b] border-slate-200 shadow-sm'
              }`}>
                <img
                  src="/bfibernet_logo.png"
                  alt="BFibernet Logo"
                  className="h-7 object-contain"
                />
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg transition cursor-pointer border bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a] shrink-0"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-3 w-full border-b border-[#27272a] bg-[#000000]">
            <button
              onClick={() => setIsCollapsed(false)}
              className="cursor-pointer group flex items-center justify-center p-1 rounded-lg transition"
              title="Expand Sidebar"
            >
              <div className={`p-1.5 rounded-lg border transition-transform group-hover:scale-105 ${
                isDark
                  ? 'bg-white border-[#27272a]'
                  : 'bg-[#09090b] border-slate-200'
              }`}>
                <img
                  src="/bfibernet_logo.png"
                  alt="BFibernet Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className={`py-4 space-y-1 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-3'}`}>
          {agents.map((agent) => {
            const isActive = activeAgent === agent.id;
            const IconComponent = agent.icon;

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
                className={`w-full transition-all duration-150 flex items-center cursor-pointer text-[14px] font-medium group rounded-lg ${
                  isCollapsed
                    ? `h-10 w-10 justify-center ${
                        isActive
                          ? 'bg-[#18181b] text-white border border-[#27272a]'
                          : 'hover:bg-[#121215] text-[#a1a1aa] hover:text-white border border-transparent'
                      }`
                    : `py-2.5 px-3 justify-between ${
                        isActive
                          ? 'bg-[#18181b] text-white border border-[#27272a]'
                          : 'hover:bg-[#121215] text-[#a1a1aa] hover:text-white border border-transparent'
                      }`
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <IconComponent
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#a1a1aa] group-hover:text-white'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate tracking-tight font-medium text-[14px]">
                      {agent.name}
                    </span>
                  )}
                </div>

                {!isCollapsed && agent.badge && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a] ml-2 shrink-0">
                    {agent.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
