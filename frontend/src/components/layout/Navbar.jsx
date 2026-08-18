import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

export function Navbar({ onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="w-full h-14 px-6 flex items-center justify-between border-b border-[#27272a] bg-[#000000] text-white select-none shrink-0 font-['Plus_Jakarta_Sans',sans-serif]">
      <div></div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-3">
        {/* User Info */}
        <div className="flex items-center gap-2 bg-[#09090b] px-3 py-1.5 rounded-lg border border-[#27272a]">
          <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono bg-[#18181b] text-white border border-[#27272a] shrink-0">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-medium text-white">vikas</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Toggle UI mode"
          className="p-1.5 rounded-lg border transition cursor-pointer bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a]"
        >
          {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg border transition cursor-pointer bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

