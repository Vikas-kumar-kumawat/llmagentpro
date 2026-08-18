import React from 'react';
import { Mic, Volume2, RotateCw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackVoiceBanner({ voicePersona, setVoicePersona, isPlayingDemo, handlePlayDemo }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`p-4 rounded-2xl border mb-6 transition-all ${isDark ? 'bg-[#080808] border-[#181818]' : 'bg-white border-slate-100 shadow-sm'
      }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#121212] text-cyan-400 border border-[#202020]' : 'bg-cyan-50 text-cyan-600'
            }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Voice Persona Configuration
            </h3>
            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              Active AI synthesis voice accent settings
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative">
            <select
              value={voicePersona}
              onChange={(e) => setVoicePersona(e.target.value)}
              className={`py-1.5 pl-3 pr-8 rounded-xl text-xs font-medium border cursor-pointer focus:outline-none transition ${isDark
                  ? 'bg-[#121212] text-zinc-200 border-[#222222] focus:border-cyan-500'
                  : 'bg-slate-50 text-slate-800 border-slate-200 focus:border-cyan-600'
                }`}
            >
              <option value="ratan_singh">Ratan Singh (Rajasthani Accent - Male)</option>
              <option value="priya_sharma">Priya Sharma (Neural Female - Hindi/English)</option>
              <option value="arjun_kapoor">Arjun Kapoor (Professional Male - English)</option>
            </select>
          </div>

          {/* Audio Demo Button */}
          <button
            onClick={handlePlayDemo}
            disabled={isPlayingDemo}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${isPlayingDemo
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
                : isDark
                  ? 'bg-[#121212] hover:bg-[#1a1a1a] text-zinc-200 border-[#222222]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'} ${isPlayingDemo ? 'animate-bounce' : ''}`} />
            <span>{isPlayingDemo ? 'Playing...' : 'Voice Sample'}</span>
          </button>

          {/* Reseed Button */}
          <button
            onClick={() => alert("Voice model reseeded successfully.")}
            title="Reseed Voice Model"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${isDark
                ? 'bg-[#2a2a2a] hover:bg-[#333] text-zinc-200 border-[#383838]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <span>Reseed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
