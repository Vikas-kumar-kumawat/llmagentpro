import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

export function Navbar({ onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`w-full px-3 sm:px-5 py-2 flex items-center justify-between border-b select-none shrink-0 ${
      isDark ? 'bg-[#000000] border-[#181818] text-[#e4e4e7]' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Left side online indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className={`text-[11px] sm:text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Active
        </span>
      </div>

      {/* Right side - Classic Simple Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Info */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${
            isDark ? 'bg-[#141414] text-zinc-300 border-[#242424]' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold truncate max-w-[90px] sm:max-w-none">admin-vikas</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className={`p-1.5 rounded-lg border transition cursor-pointer ${
            isDark ? 'bg-[#121212] hover:bg-[#1c1c1c] text-amber-400 border-[#222222]' : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-200'
          }`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Logout */}
        <button
          onClick={() => onLogout && onLogout()}
          title="Log Out"
          className={`p-1.5 rounded-lg border transition cursor-pointer ${
            isDark ? 'bg-[#121212] hover:bg-rose-950/40 text-rose-400 border-[#222222]' : 'bg-slate-100 hover:bg-rose-50 text-rose-600 border-slate-200'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
