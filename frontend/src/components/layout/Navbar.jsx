import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Sun, Moon } from 'lucide-react';

export function Navbar({ onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`md:hidden w-full h-12 px-3 flex items-center justify-between select-none shrink-0 font-['Plus_Jakarta_Sans',sans-serif] transition-all duration-200 ${
      isDark
        ? 'bg-[#070709] border-b border-[#1e1e26] text-white'
        : 'bg-white border-b border-slate-200/90 text-slate-900 shadow-xs'
    }`}>
      {/* Mobile Menu Toggle */}
      <button
        onClick={onToggleSidebar}
        title="Toggle Navigation Menu"
        className={`p-1.5 rounded-lg border cursor-pointer transition-colors active:scale-95 ${
          isDark
            ? 'border-[#1e1e26] bg-[#0f0f14] text-white'
            : 'border-slate-200 bg-slate-100 text-slate-800'
        }`}
      >
        <Menu className="w-4 h-4" />
      </button>

      <span className={`text-xs font-extrabold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
        BFibernet <span className="font-mono text-xs font-normal opacity-60">AI</span>
      </span>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        className={`p-1.5 rounded-lg border cursor-pointer transition-colors active:scale-95 ${
          isDark
            ? 'border-[#1e1e26] bg-[#0f0f14] text-amber-400'
            : 'border-slate-200 bg-slate-100 text-amber-600'
        }`}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}

