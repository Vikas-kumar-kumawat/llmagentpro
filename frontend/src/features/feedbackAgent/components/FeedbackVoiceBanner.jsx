import React from 'react';
import { Mic, Volume2, RotateCw } from 'lucide-react';

export function FeedbackVoiceBanner({ voicePersona, setVoicePersona, isPlayingDemo, handlePlayDemo }) {
  return (
    <div className="p-4 sm:p-5 bg-[#09090b] border border-[#27272a] rounded-xl mb-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Voice Persona Model
              <span className="text-[10px] font-mono text-white bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded-full font-medium uppercase">
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
            className="w-full sm:w-auto py-2 px-3 rounded-lg text-xs bg-[#000000] text-white border border-[#27272a] focus:border-white focus:outline-none transition cursor-pointer font-medium"
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
                  ? 'bg-[#18181b] text-white border-white animate-pulse'
                  : 'bg-white text-black border-white hover:bg-zinc-200'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingDemo ? 'Testing...' : 'Voice Sample'}</span>
            </button>

            <button
              onClick={() => alert("Voice model reseeded successfully.")}
              title="Reseed Voice Model"
              className="px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer bg-[#000000] hover:bg-[#18181b] text-white border border-[#27272a]"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#a1a1aa]" />
              <span>Reseed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

