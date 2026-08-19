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
  ShoppingBag,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Sidebar({ activeAgent, setActiveAgent, isCollapsed, setIsCollapsed, onLogout }) {
  const { theme, toggleTheme, isDark } = useTheme();

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
            ? 'bg-[#050507] border-r border-[#1e1e24] text-white'
            : 'bg-slate-100 border-r border-slate-200 text-slate-800'
        } font-['Plus_Jakarta_Sans',sans-serif] shrink-0 z-30`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Logo Branding & Collapse Toggle */}
          {!isCollapsed ? (
            <div className={`h-14 px-3.5 flex items-center justify-between gap-2 max-md:rounded-tr-2xl shrink-0 ${
              isDark
                ? 'border-b border-[#1e1e24] bg-[#050507]'
                : 'border-b border-slate-200 bg-slate-100'
            }`}>

              <div
                className="flex items-center gap-2.5 cursor-pointer group flex-1 overflow-hidden"
                onClick={() => {
                  setActiveAgent('chatbot');
                  if (window.innerWidth < 768) setIsCollapsed(true);
                }}
                title="BFibernet AI Dashboard"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-105 ${
                  isDark
                    ? 'bg-[#121216] border-[#22222a] text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}>
                  <Wifi className="w-4 h-4" />
                </div>
                <span className={`font-extrabold text-base tracking-tight truncate transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  BFibernet <span className="text-xs font-mono font-normal text-zinc-400">AI</span>
                </span>
              </div>

              <button
                onClick={() => setIsCollapsed(true)}
                title="Close Navigation"
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer border hover:scale-105 shrink-0 ${
                  isDark
                    ? 'bg-[#0c0c0f] hover:bg-[#141418] text-zinc-400 hover:text-white border-[#22222a]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border-slate-200'
                }`}
              >
                <span className="hidden md:inline"><PanelLeft className="w-4 h-4" /></span>
                <span className="md:hidden"><X className="w-4 h-4" /></span>
              </button>
            </div>
          ) : (
            <div className={`h-14 flex flex-col items-center justify-center w-full shrink-0 ${
              isDark ? 'border-b border-[#1e1e24] bg-[#050507]' : 'border-b border-slate-200 bg-slate-100'
            }`}>
              <button
                onClick={() => setIsCollapsed(false)}
                className="cursor-pointer group flex items-center justify-center p-1 rounded-lg transition"
                title="Expand Sidebar"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-105 ${
                  isDark
                    ? 'bg-[#121216] border-[#22222a] text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}>
                  <Wifi className="w-4 h-4" />
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
                  className={`w-full transition-all duration-200 ease-out active:scale-95 flex items-center cursor-pointer text-[14px] font-medium group rounded-xl ${
                    isCollapsed
                      ? `h-10 w-10 justify-center ${
                          isActive
                            ? isDark
                              ? 'bg-white text-black border border-white font-extrabold shadow-sm'
                              : 'bg-slate-900 text-white border border-slate-900 shadow-xs font-bold'
                            : isDark
                              ? 'hover:bg-[#0c0c0f] text-zinc-400 hover:text-white border border-transparent hover:scale-105'
                              : 'hover:bg-white text-slate-600 hover:text-slate-900 border border-transparent hover:scale-105'
                        }`
                      : `py-3 px-3.5 sm:py-2.5 sm:px-3 justify-between ${
                          isActive
                            ? isDark
                              ? 'bg-white text-black border border-white shadow-sm translate-x-0.5 font-extrabold'
                              : 'bg-slate-900 text-white border border-slate-900 shadow-xs translate-x-0.5 font-bold'
                            : isDark
                              ? 'hover:bg-[#0c0c0f] text-zinc-400 hover:text-white border border-transparent hover:translate-x-1'
                              : 'hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:translate-x-1'
                        }`
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <IconComponent
                      className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? isDark ? 'text-black scale-105' : 'text-white scale-105'
                          : isDark ? 'text-zinc-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate tracking-tight font-medium text-[14px] transition-colors">
                        {agent.name}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && agent.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ml-2 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isActive
                        ? isDark ? 'bg-zinc-200 text-black border-zinc-300 font-bold' : 'bg-slate-800 text-white border-slate-700'
                        : isDark ? 'bg-[#18181c] text-zinc-300 border-[#282832] font-bold' : 'bg-slate-200 text-slate-800 border-slate-300 font-bold'
                    }`}>
                      {agent.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - User Info, Theme Switcher & Logout */}
        <div className={`p-3 border-t shrink-0 transition-colors ${
          isDark ? 'border-[#1e1e24] bg-[#050507]' : 'border-slate-200 bg-slate-100'
        }`}>

          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              {/* User Badge */}
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-0 ${
                  isDark
                    ? 'bg-[#0c0c0f] border-[#22222a] text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                title="Logged in as vikas"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono border shrink-0 ${
                  isDark
                    ? 'bg-[#18181c] text-white border-[#282832]'
                    : 'bg-white text-slate-900 border-slate-200 shadow-xs'
                }`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold truncate">vikas</span>
              </div>

              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
                className={`p-2.5 rounded-xl border transition cursor-pointer active:scale-95 shrink-0 ${
                  isDark
                    ? 'bg-[#0c0c0f] hover:bg-[#141418] text-amber-400 border-[#22222a]'
                    : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className={`p-2.5 rounded-xl border transition cursor-pointer active:scale-95 shrink-0 ${
                    isDark
                      ? 'bg-[#0c0c0f] hover:bg-[#141418] text-zinc-400 hover:text-white border-[#22222a]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                  isDark ? 'bg-[#0c0c0f] border-[#22222a] text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}
                title="Logged in as vikas"
              >
                <User className="w-4 h-4" />
              </div>

              <button
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer active:scale-95 ${
                  isDark ? 'bg-[#0c0c0f] hover:bg-[#141418] text-amber-400 border-[#22222a]' : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer active:scale-95 ${
                    isDark ? 'bg-[#0c0c0f] hover:bg-[#141418] text-zinc-400 hover:text-white border-[#22222a]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

