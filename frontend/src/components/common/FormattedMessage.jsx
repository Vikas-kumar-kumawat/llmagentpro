import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, CheckCircle2, Info } from 'lucide-react';

export function FormattedMessage({ content, isAgent = true, sources = [] }) {
  if (!content) return null;

  return (
    <div className="space-y-3">
      <div className={`prose prose-invert max-w-none text-sm sm:text-base leading-relaxed ${isAgent ? 'text-zinc-100' : 'text-zinc-900'}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-base sm:text-lg font-bold text-white mb-2 pt-1 border-b border-zinc-800 pb-1.5 flex items-center gap-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm sm:text-base font-bold text-white mb-2 pt-1 flex items-center gap-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5 mt-3 flex items-center gap-1.5">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-2.5 last:mb-0 leading-relaxed font-normal text-xs sm:text-sm text-zinc-200">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-2.5 space-y-1.5 pl-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2.5 space-y-1.5 pl-4 list-decimal text-xs sm:text-sm text-zinc-200">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-xs sm:text-sm text-zinc-200 flex items-start gap-2 leading-snug">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white bg-zinc-800/40 px-1 py-0.5 rounded border border-zinc-700/30">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-zinc-300">
                {children}
              </em>
            ),
            hr: () => (
              <hr className="my-3 border-t border-zinc-800/80" />
            ),
            code: ({ inline, children }) => (
              <code className="px-1.5 py-0.5 text-[11px] sm:text-xs font-mono bg-zinc-950 text-emerald-400 rounded border border-zinc-800">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-zinc-500 pl-3 my-2 text-zinc-400 italic text-xs sm:text-sm bg-zinc-900/40 py-1 rounded-r">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-zinc-800 bg-[#09090b]">
                <table className="w-full text-left text-xs border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[#18181b] border-b border-zinc-800 text-white font-semibold">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-zinc-900/50 transition-colors">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 font-semibold text-zinc-200 uppercase tracking-wider text-[10px] sm:text-xs">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-xs text-zinc-300">
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
        <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Grounded Source:
          </span>
          {sources.map((src, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[10px] font-mono bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-800"
            >
              <FileText className="w-2.5 h-2.5 text-zinc-400" />
              {src}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
