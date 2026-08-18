import React from 'react';
import {
  Brain,
  MessageSquare,
  Zap,
  Gift,
  TrendingDown,
  Headset,
  PanelLeft,
  Wifi,
  X,
  ShoppingBag
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Sidebar({ activeAgent, setActiveAgent, isCollapsed, setIsCollapsed }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const agents = [
    { id: 'chatbot', name: 'BFibernet AI', icon: Brain },
    { id: 'feedback', name: 'Feedback Agent', icon: MessageSquare },
    { id: 'sales', name: 'Sales AI Agent', icon: ShoppingBag, badge: 'New' },
    { id: 'recharge', name: 'Recharge Reminder', icon: Zap },
    { id: 'offers', name: 'New Offers Call', icon: Gift, badge: 'Beta' },
    { id: 'competitor', name: 'Competitor Price Monitor', icon: TrendingDown },
    { id: 'outbound', name: 'Customer Support Agent', icon: Headset },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {!isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 animate-fadeIn"
        />
      )}

      <aside
        className={`h-screen transition-all duration-300 ease-in-out flex flex-col justify-between select-none ${
          isCollapsed
            ? 'max-md:hidden max-md:w-0 md:w-16'
            : 'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[84vw] max-md:max-w-[320px] max-md:shadow-2xl max-md:rounded-r-2xl w-64'
        } ${
          isDark 
            ? 'bg-[#09090b] border-r border-[#27272a] text-[#ffffff]' 
            : 'bg-gradient-to-b from-[#16436a] via-[#1b4b76] to-[#256499] border-r border-white/20 text-white shadow-2xl backdrop-blur-md'
        } font-['Plus_Jakarta_Sans',sans-serif] shrink-0`}
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Header Logo Branding & Collapse Toggle */}
          {!isCollapsed ? (
            <div className={`h-14 px-3.5 flex items-center justify-between gap-2 border-b max-md:rounded-tr-2xl ${
              isDark ? 'border-[#27272a] bg-[#09090b]' : 'border-white/20 bg-white/5'
            }`}>
              <div
                className="flex items-center gap-2.5 cursor-pointer group flex-1 overflow-hidden"
                onClick={() => {
                  setActiveAgent('chatbot');
                  if (window.innerWidth < 768) setIsCollapsed(true);
                }}
                title="BFibernet AI Dashboard"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  isDark ? 'bg-[#18181b] border-[#27272a] text-white shadow-xs' : 'bg-white/20 border-white/30 text-white shadow-xs'
                }`}>
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base tracking-tight text-white truncate font-['Plus_Jakarta_Sans',sans-serif] group-hover:text-white transition-colors">
                  BFibernet
                </span>
              </div>

              <button
                onClick={() => setIsCollapsed(true)}
                title="Close Navigation"
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer border hover:scale-105 shrink-0 ${
                  isDark 
                    ? 'bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a]' 
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <span className="hidden md:inline"><PanelLeft className="w-4 h-4" /></span>
                <span className="md:hidden"><X className="w-4 h-4 text-white" /></span>
              </button>
            </div>
          ) : (
            <div className={`h-14 flex flex-col items-center justify-center w-full border-b ${
              isDark ? 'border-[#27272a] bg-[#09090b]' : 'border-white/20 bg-white/5'
            }`}>
              <button
                onClick={() => setIsCollapsed(false)}
                className="cursor-pointer group flex items-center justify-center p-1 rounded-lg transition"
                title="Expand Sidebar"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  isDark ? 'bg-[#18181b] border-[#27272a] text-white shadow-xs' : 'bg-white/20 border-white/30 text-white shadow-xs'
                }`}>
                  <Wifi className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div className={`py-4 space-y-1.5 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-3'}`}>
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
                  className={`w-full transition-all duration-200 ease-out active:scale-95 flex items-center cursor-pointer text-[14px] font-medium group rounded-lg ${
                    isCollapsed
                      ? `h-10 w-10 justify-center ${
                          isActive
                            ? isDark ? 'bg-[#18181b] text-white border border-[#27272a] shadow-sm' : 'bg-white/25 text-white border border-white/40 shadow-sm font-semibold'
                            : isDark ? 'hover:bg-[#121215] text-[#a1a1aa] hover:text-white border border-transparent hover:scale-105' : 'hover:bg-white/15 text-white/80 hover:text-white border border-transparent hover:scale-105'
                        }`
                      : `py-3 px-3.5 sm:py-2.5 sm:px-3 justify-between ${
                          isActive
                            ? isDark ? 'bg-[#18181b] text-white border border-[#27272a] shadow-sm translate-x-0.5' : 'bg-white/25 text-white border border-white/40 shadow-sm translate-x-0.5 font-semibold'
                            : isDark ? 'hover:bg-[#121215] text-[#a1a1aa] hover:text-white border border-transparent hover:translate-x-1' : 'hover:bg-white/15 text-white/80 hover:text-white border border-transparent hover:translate-x-1'
                        }`
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <IconComponent
                      className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white scale-105' : isDark ? 'text-[#a1a1aa] group-hover:text-white' : 'text-white/80 group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate tracking-tight font-medium text-[14px] transition-colors">
                        {agent.name}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && agent.badge && (
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ml-2 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isDark 
                        ? 'bg-[#18181b] text-white border-[#27272a]' 
                        : 'bg-white/20 text-white border-white/30'
                    }`}>
                      {agent.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
