import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function FormattedMessage({ content, isAgent = true, sources = [] }) {
  const { isDark } = useTheme();

  if (!content) return null;

  return (
    <div className="space-y-3">
      <div className={`prose max-w-none text-sm sm:text-base leading-relaxed ${
        isDark ? 'prose-invert text-zinc-100' : 'text-slate-800'
      }`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className={`text-base sm:text-lg font-bold mb-2 pt-1 border-b pb-1.5 flex items-center gap-2 ${
                isDark ? 'text-white border-zinc-800' : 'text-slate-900 border-slate-200'
              }`}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className={`text-sm sm:text-base font-bold mb-2 pt-1 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className={`text-xs sm:text-sm font-semibold mb-1.5 mt-3 flex items-center gap-1.5 ${
                isDark ? 'text-zinc-200' : 'text-slate-800'
              }`}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className={`mb-2.5 last:mb-0 leading-relaxed font-normal text-xs sm:text-sm ${
                isDark ? 'text-zinc-200' : 'text-slate-700'
              }`}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-2.5 space-y-1.5 pl-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className={`my-2.5 space-y-1.5 pl-4 list-decimal text-xs sm:text-sm ${
                isDark ? 'text-zinc-200' : 'text-slate-700'
              }`}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className={`text-xs sm:text-sm flex items-start gap-2 leading-snug ${
                isDark ? 'text-zinc-200' : 'text-slate-700'
              }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  isDark ? 'bg-zinc-400' : 'bg-slate-400'
                }`} />
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children }) => (
              <strong className={`font-semibold px-1 py-0.5 rounded border ${
                isDark 
                  ? 'text-white bg-zinc-800/60 border-zinc-700/50' 
                  : 'text-slate-900 bg-slate-100 border-slate-200'
              }`}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className={`italic ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                {children}
              </em>
            ),
            hr: () => (
              <hr className={`my-3 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`} />
            ),
            code: ({ children }) => (
              <code className={`px-1.5 py-0.5 text-[11px] sm:text-xs font-mono rounded border ${
                isDark 
                  ? 'bg-zinc-900 text-emerald-400 border-zinc-800' 
                  : 'bg-slate-100 text-emerald-700 border-slate-200'
              }`}>
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className={`border-l-2 pl-3 my-2 italic text-xs sm:text-sm py-1 rounded-r ${
                isDark 
                  ? 'border-zinc-500 text-zinc-400 bg-zinc-900/40' 
                  : 'border-slate-400 text-slate-600 bg-slate-50'
              }`}>
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className={`overflow-x-auto my-3 rounded-lg border ${
                isDark ? 'border-zinc-800 bg-[#09090b]' : 'border-slate-200 bg-white'
              }`}>
                <table className="w-full text-left text-xs border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className={`border-b font-semibold ${
                isDark ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
              }`}>
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className={`divide-y ${
                isDark ? 'divide-zinc-800/50 text-zinc-300' : 'divide-slate-100 text-slate-700'
              }`}>
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className={`transition-colors ${
                isDark ? 'hover:bg-zinc-900/50' : 'hover:bg-slate-50'
              }`}>
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className={`px-3 py-2 font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${
                isDark ? 'text-zinc-200' : 'text-slate-700'
              }`}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className={`px-3 py-2 text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Verified Documentation Source Pill Badges */}
      {sources && sources.length > 0 && (
        <div className={`pt-2 border-t flex flex-wrap items-center gap-1.5 ${
          isDark ? 'border-zinc-800/60' : 'border-slate-200'
        }`}>
          <span className={`text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 ${
            isDark ? 'text-zinc-500' : 'text-slate-500'
          }`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Grounded Source:
          </span>
          {sources.map((src, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-zinc-900 text-zinc-300 border-zinc-800' 
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <FileText className="w-2.5 h-2.5 text-slate-400" />
              {src}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
