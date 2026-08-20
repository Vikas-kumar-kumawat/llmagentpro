import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, CheckCircle2, Copy, Check, ChevronRight, Sparkles, Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function FormattedMessage({ content, isAgent = true, sources = [], retrievedChunks = [], onOpenSources }) {
  const { isDark } = useTheme();
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  if (!content) return null;

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  return (
    <div className="space-y-3 font-sans">
      <div className={`prose max-w-none text-xs sm:text-sm leading-relaxed ${isDark ? 'prose-invert text-zinc-200' : 'text-slate-800'
        }`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className={`text-base sm:text-lg font-extrabold mb-2 mt-4 pb-1 border-b flex items-center gap-2 ${
                isDark ? 'text-white border-[#1e1e24]' : 'text-slate-900 border-slate-200'
              }`}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className={`text-sm sm:text-base font-extrabold mb-2 mt-4 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className={`text-xs sm:text-sm font-bold mb-1.5 mt-3 flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className={`mb-2.5 last:mb-0 leading-relaxed font-normal ${
                isDark ? 'text-zinc-300' : 'text-slate-700'
              }`}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-2.5 space-y-1.5 pl-2 list-none">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className={`my-2.5 space-y-2 pl-4 list-decimal font-semibold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2 leading-relaxed font-normal">
                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                  isDark ? 'bg-white' : 'bg-slate-900'
                }`} />
                <div className={`flex-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{children}</div>
              </li>
            ),
            strong: ({ children }) => (
              <strong className={`font-bold ${
                isDark ? 'text-white font-extrabold' : 'text-slate-900 font-extrabold'
              }`}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className={`italic ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                {children}
              </em>
            ),
            hr: () => (
              <hr className={`my-3.5 border-t ${isDark ? 'border-[#1e1e24]' : 'border-slate-200'}`} />
            ),
            code: ({ inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const codeIdx = Math.random();

              if (!inline && (match || codeString.includes('\n'))) {
                const lang = match ? match[1] : 'code';
                return (
                  <div className={`my-3.5 rounded-xl border overflow-hidden shadow-xl ${
                    isDark ? 'border-[#1e1e24] bg-[#0c0c0f]' : 'border-slate-300 bg-slate-900 text-slate-100'
                  }`}>
                    {/* Header bar */}
                    <div className={`px-3.5 py-2 flex items-center justify-between text-[11px] font-mono border-b ${
                      isDark ? 'bg-[#050507] border-[#1e1e24] text-zinc-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                        <span className="ml-2 uppercase font-bold tracking-wider text-[10px] text-white">{lang}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(codeString, codeIdx)}
                        className="flex items-center gap-1 hover:text-white transition cursor-pointer text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700"
                      >
                        {copiedCodeIdx === codeIdx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    {/* Code body */}
                    <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-zinc-200 bg-[#0c0c0f]">
                      <code>{codeString}</code>
                    </pre>
                  </div>
                );
              }

              return (
                <code className={`px-1.5 py-0.5 text-[11px] sm:text-xs font-mono rounded border ${
                  isDark 
                    ? 'bg-[#18181c] text-zinc-200 border-[#282832] font-semibold' 
                    : 'bg-slate-100 text-slate-900 border-slate-200 font-semibold'
                }`}>
                  {children}
                </code>
              );
            },
            img: ({ src, alt }) => {
              return (
                <div className={`my-3.5 rounded-2xl overflow-hidden border shadow-lg group transition-all duration-300 ${isDark ? 'border-zinc-800 bg-[#0c0c0e]' : 'border-slate-200 bg-white'
                  }`}>
                  <div className="relative overflow-hidden max-h-72 bg-zinc-950/40 flex items-center justify-center">
                    <img
                      src={src}
                      alt={alt || 'BCT Fibernet'}
                      className="w-full max-h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="text-[11px] font-bold text-white tracking-wide flex items-center gap-1.5 backdrop-blur-md bg-black/50 px-2.5 py-1 rounded-lg border border-white/20 shadow-md">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> {alt || 'BCT Fibernet Official Documentation Asset'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className={`border-l-2 border-emerald-500 pl-3.5 my-2.5 italic text-xs sm:text-sm py-1 rounded-r ${isDark ? 'text-zinc-300 bg-[#0c0c0e]' : 'text-slate-700 bg-emerald-50/50'
                }`}>
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className={`overflow-x-auto my-3 rounded-lg border shadow-xs ${isDark ? 'border-zinc-800 bg-[#0c0c0e]' : 'border-slate-200 bg-white'
                }`}>
                <table className="w-full text-left text-xs border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className={`border-b font-bold ${isDark ? 'bg-[#141418] border-zinc-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className={`divide-y ${isDark ? 'divide-zinc-800/60 text-zinc-300' : 'divide-slate-100 text-slate-700'
                }`}>
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className={`transition-colors ${isDark ? 'hover:bg-zinc-900/60' : 'hover:bg-slate-50'
                }`}>
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className={`px-3.5 py-2.5 font-bold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? 'text-zinc-200' : 'text-slate-800'
                }`}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className={`px-3.5 py-2.5 text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer my-1.5 no-underline shadow-xs ${
                  isDark
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-700/80 hover:text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{children}</span>
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>


      {/* Grounded Documentation Source Badges */}
      {sources && sources.length > 0 && (
        <div className={`pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 ${isDark ? 'border-zinc-800/80' : 'border-slate-200'
          }`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Grounded Sources:
            </span>
            {sources.map((src, idx) => (
              <button
                key={idx}
                onClick={() => onOpenSources && onOpenSources(src)}
                className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition cursor-pointer active:scale-95 ${isDark
                    ? 'bg-[#141418] hover:bg-[#1c1c22] text-zinc-300 border-zinc-800 hover:border-[#22c55e]/50'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-[#22c55e]'
                  }`}
              >
                <FileText className="w-2.5 h-2.5 text-emerald-500" />
                {src}
              </button>
            ))}
          </div>

          {onOpenSources && (
            <button
              onClick={() => onOpenSources(null)}
              className="text-[10px] font-semibold flex items-center gap-0.5 hover:underline cursor-pointer text-emerald-500"
            >
              Inspect Citations <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

