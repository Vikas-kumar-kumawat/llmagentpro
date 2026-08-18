import React from 'react';
import { Mic, Volume2, RotateCw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackVoiceBanner({ voicePersona, setVoicePersona, isPlayingDemo, handlePlayDemo }) {
  const { isDark } = useTheme();

  return (
    <div className={`p-4 sm:p-5 border rounded-xl mb-6 font-['Plus_Jakarta_Sans',sans-serif] ${
      isDark ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
            isDark ? 'border-[#27272a] bg-[#18181b] text-white' : 'border-slate-200 bg-slate-100 text-slate-800'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Voice Persona Model
              <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-full font-medium uppercase ${
                isDark ? 'text-zinc-300 bg-[#18181b] border-[#27272a]' : 'text-slate-700 bg-slate-100 border-slate-200'
              }`}>
                tts.v2
              </span>
            </h3>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <select
            value={voicePersona}
            onChange={(e) => setVoicePersona(e.target.value)}
            className={`w-full sm:w-auto py-2 px-3 rounded-lg text-xs border focus:outline-none transition cursor-pointer font-medium ${
              isDark 
                ? 'bg-[#09090b] text-white border-[#27272a] focus:border-sky-500' 
                : 'bg-white text-slate-900 border-slate-300 focus:border-sky-600 shadow-xs'
            }`}
          >
            <option value="ratan_singh">Ratan Singh (Rajasthani & Marwari Warm Male)</option>
            <option value="aarav_sharma">Aarav Sharma (Warm Natural Male - Hindi)</option>
            <option value="ananya_verma">Ananya Verma (Soft Conversational Female - Hindi)</option>
            <option value="priya_sharma">Priya Sharma (Neural Female - Indian English)</option>
            <option value="rohan_kapoor">Rohan Kapoor (Professional Male - Indian English)</option>
            <option value="gauri_devi">Gauri Devi (Warm Female - Rajasthani/Hindi)</option>
          </select>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePlayDemo}
              disabled={isPlayingDemo}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer border ${
                isPlayingDemo
                  ? 'bg-sky-600 text-white border-sky-500 animate-pulse'
                  : isDark
                    ? 'bg-white text-black border-white hover:bg-zinc-200'
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingDemo ? 'Testing...' : 'Voice Sample'}</span>
            </button>

            <button
              onClick={() => alert("Voice model reseeded successfully.")}
              title="Reseed Voice Model"
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer border ${
                isDark 
                  ? 'bg-[#18181b] hover:bg-[#27272a] text-white border-[#27272a]' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reseed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

