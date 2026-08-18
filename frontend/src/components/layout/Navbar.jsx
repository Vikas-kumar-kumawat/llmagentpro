import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User, Menu } from 'lucide-react';

export function Navbar({ onLogout, onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`w-full h-13 sm:h-14 px-3 sm:px-6 flex items-center justify-between border-b select-none shrink-0 font-['Plus_Jakarta_Sans',sans-serif] transition-colors ${
      isDark 
        ? 'bg-[#000000] border-[#27272a] text-white' 
        : 'bg-gradient-to-r from-[#16436a] via-[#256499] to-[#3a86c0] border-cyan-400/30 text-white shadow-md'
    }`}>
      {/* Left side - Mobile Menu Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          className={`md:hidden p-2 rounded-lg border cursor-pointer transition-colors active:scale-95 ${
            isDark 
              ? 'border-[#27272a] bg-[#09090b] hover:bg-[#18181b] text-white' 
              : 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <Menu className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Info */}
        <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border ${
          isDark 
            ? 'bg-[#09090b] border-[#27272a]' 
            : 'bg-white/15 border-white/25 backdrop-blur-xs'
        }`} title="Logged in as vikas">
          <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono border shrink-0 ${
            isDark 
              ? 'bg-[#18181b] text-white border-[#27272a]' 
              : 'bg-white/20 text-white border-white/30'
          }`}>
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">vikas</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Toggle UI mode"
          className={`p-2 rounded-lg border transition cursor-pointer active:scale-95 ${
            isDark 
              ? 'bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a]' 
              : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            className={`p-2 rounded-lg border transition cursor-pointer active:scale-95 ${
              isDark 
                ? 'bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a]' 
                : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
            }`}
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </header>
  );
}
