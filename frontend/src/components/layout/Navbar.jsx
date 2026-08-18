import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User, Menu } from 'lucide-react';

export function Navbar({ onLogout, onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="w-full h-11 sm:h-14 px-2 sm:px-6 flex items-center justify-between border-b border-[#27272a] bg-[#000000] text-white select-none shrink-0 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left side - Mobile Menu Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          className="md:hidden p-1.5 sm:p-2 rounded-lg border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] text-white cursor-pointer transition-colors active:scale-95"
        >
          <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-1 sm:gap-2.5">
        {/* User Info */}
        <div className="flex items-center gap-1 sm:gap-2 bg-[#09090b] px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#27272a]" title="Logged in as vikas">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center text-[10px] sm:text-xs font-mono bg-[#18181b] text-white border border-[#27272a] shrink-0">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-white hidden sm:inline">vikas</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Toggle UI mode"
          className="p-1.5 sm:p-2 rounded-lg border transition cursor-pointer bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a] active:scale-95"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 sm:p-2 rounded-lg border transition cursor-pointer bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a] active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

