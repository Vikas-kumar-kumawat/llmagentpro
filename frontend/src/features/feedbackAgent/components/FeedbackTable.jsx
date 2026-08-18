import React from 'react';
import {
  Search,
  ChevronDown,
  RotateCw,
  PhoneCall,
  Plus,
  X,
  Play,
  Phone,
  Trash2,
  Edit3
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function FeedbackTable({
  filteredFeedbacks,
  searchQuery,
  setSearchQuery,
  sentimentFilter,
  setSentimentFilter,
  onRefreshData,
  isBatchCalling,
  handleCollectAllFeedbacks,
  handleCancelBatchCall,
  setShowCollectModal,
  setSelectedFeedback,
  handleTriggerCall,
  rowCallStatuses,
  handleDeleteFeedback,
  setEditingFeedback
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const safeList = Array.isArray(filteredFeedbacks) ? filteredFeedbacks : [];

  return (
    <div className={`rounded-2xl border transition-all duration-200 ${
      isDark ? 'bg-[#080808] border-[#1c1c1c] shadow-2xl' : 'bg-white border-slate-100 shadow-sm'
    }`}>
      {/* Table Header Controls */}
      <div className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
        isDark ? 'border-[#1c1c1c]' : 'border-slate-100'
      }`}>
        <div>
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Feedbacks</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Real-time customer sentiment & response logs</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-44 md:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer..."
              className={`w-full py-1.5 pl-8 pr-3 rounded-xl text-xs font-medium border focus:outline-none transition ${
                isDark
                  ? 'bg-[#121212] text-zinc-200 border-[#222222] focus:border-cyan-500 placeholder-zinc-600'
                  : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400 focus:border-cyan-600'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {/* Sentiment Filter Dropdown */}
            <div className="relative col-span-1 sm:w-auto">
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className={`w-full py-1.5 pl-3 pr-8 rounded-xl text-xs font-semibold appearance-none border cursor-pointer focus:outline-none transition ${
                  isDark 
                    ? 'bg-[#121212] text-zinc-200 border-[#222222] focus:border-cyan-500' 
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-cyan-600'
                }`}
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Refresh Icon Button */}
            <button
              onClick={() => onRefreshData && onRefreshData()}
              title="Refresh Feedbacks"
              className={`p-2 rounded-xl transition cursor-pointer border flex items-center justify-center col-span-1 sm:w-auto ${
                isDark 
                  ? 'bg-[#121212] hover:bg-[#1a1a1a] text-cyan-400 border-[#222222]' 
                  : 'bg-slate-50 hover:bg-slate-100 text-cyan-700 border-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Collect All Feedbacks / Cancel Calling Buttons */}
            {isBatchCalling ? (
              <button
                onClick={handleCancelBatchCall}
                className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>🛑 Cancel Campaign</span>
              </button>
            ) : (
              <button
                onClick={handleCollectAllFeedbacks}
                className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call All Customers</span>
              </button>
            )}

            {/* Add Manual Feedback Entry */}
            <button
              onClick={() => setShowCollectModal(true)}
              className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                isDark 
                  ? 'bg-[#181818] hover:bg-[#222] text-zinc-200 border-[#282828]' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile View: Responsive Customer Card List (< md breakpoint) ── */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-[#1a1a1a]">
        {safeList.length === 0 ? (
          <div className={`p-8 text-center text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            No feedback entries found matching your query.
          </div>
        ) : (
          safeList.map((item) => {
            const isPos = item.sentiment === 'positive';
            const isNeg = item.sentiment === 'negative';

            return (
              <div 
                key={item.id}
                onClick={() => setSelectedFeedback(item)}
                className={`p-4 transition-all duration-200 cursor-pointer space-y-3 ${
                  isDark ? 'hover:bg-[#121212]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${item.avatarBg || 'bg-gradient-to-tr from-cyan-600 to-blue-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                      {item.avatar}
                    </div>
                    <div>
                      <p className={`font-bold text-xs ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{item.customer_name}</p>
                      <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{item.phone}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize shrink-0 ${isPos
                      ? isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isNeg
                        ? isDark ? 'bg-rose-500/15 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'
                        : isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {item.sentiment || 'Neutral'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isDark ? 'bg-[#121212] border-[#1e1e1e] text-zinc-300' : 'bg-slate-50 border-slate-200/60 text-slate-700 font-medium'
                }`}>
                  "{item.feedback_text}"
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {item.created_at}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 ${
                        isDark ? 'bg-[#222] text-zinc-200 border-[#333]' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (setEditingFeedback) setEditingFeedback(item);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 ${
                        isDark ? 'bg-[#222] text-zinc-200 border-[#333]' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerCall(item.customer_name, item.phone, item);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFeedback(item.id);
                      }}
                      className={`p-1.5 rounded-xl border ${
                        isDark ? 'bg-[#222] text-zinc-400 border-[#333]' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Desktop View: Full Table View (>= md breakpoint) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'border-[#1c1c1c] text-zinc-400 bg-[#0d0d0d]' : 'border-slate-100 text-slate-400 bg-slate-50/50'
            }`}>
              <th className="py-3.5 px-5">Customer</th>
              <th className="py-3.5 px-5 min-w-[240px]">Feedback</th>
              <th className="py-3.5 px-5">Sentiment</th>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${isDark ? 'divide-[#1c1c1c]' : 'divide-slate-100'}`}>
            {safeList.length === 0 ? (
              <tr>
                <td colSpan={5} className={`py-10 text-center ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                  No feedback entries found matching your query.
                </td>
              </tr>
            ) : (
              safeList.map((item) => {
                const isPos = item.sentiment === 'positive';
                const isNeg = item.sentiment === 'negative';

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className={`transition-all duration-200 cursor-pointer ${isDark ? 'hover:bg-[#252525]' : 'hover:bg-slate-50/70'
                      }`}
                  >
                    {/* Customer Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${item.avatarBg || 'bg-gradient-to-tr from-cyan-600 to-blue-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                          {item.avatar}
                        </div>
                        <div>
                          <p className={`font-bold leading-tight hover:underline ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{item.customer_name}</p>
                          <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{item.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Feedback Text Column */}
                    <td className="py-4 px-5">
                      <p className={`line-clamp-2 leading-relaxed text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700 font-medium'}`}>
                        "{item.feedback_text}"
                      </p>
                      {item.transcript && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-cyan-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>Live Transcript Available</span>
                        </div>
                      )}
                    </td>

                    {/* Sentiment Badge Column */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isPos
                          ? isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isNeg
                            ? isDark ? 'bg-rose-500/15 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'
                            : isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {item.sentiment ? item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1) : 'Neutral'}
                      </span>
                    </td>

                    {/* Date Column */}
                    <td className={`py-4 px-5 whitespace-nowrap text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400 font-medium'}`}>
                      {item.created_at}
                    </td>

                    {/* Action Column */}
                    <td className="py-4 px-5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Detail Button */}
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border flex items-center gap-1 ${isDark
                              ? 'bg-[#262626] hover:bg-[#333] text-zinc-200 border-[#333]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          title="View Details"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>View</span>
                        </button>

                        {/* Edit Customer Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (setEditingFeedback) setEditingFeedback(item);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border flex items-center gap-1 ${isDark
                              ? 'bg-[#262626] hover:bg-[#333] text-zinc-200 border-[#333]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          title="Edit Customer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {/* Call Customer Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerCall(item.customer_name, item.phone, item);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border flex items-center gap-1 ${isDark
                              ? 'bg-[#262626] hover:bg-[#333] text-zinc-200 border-[#333]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          title="Call Customer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </button>

                        {/* Batch Call Status Pill */}
                        {rowCallStatuses[item.id] && (
                          <span className={`px-2 py-0.5 rounded-xl text-[9px] font-bold border ${rowCallStatuses[item.id] === 'calling'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse'
                              : rowCallStatuses[item.id] === 'completed' || rowCallStatuses[item.id] === 'stored'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                            }`}>
                            {rowCallStatuses[item.id] === 'calling' ? 'Calling...' : rowCallStatuses[item.id] === 'failed' ? 'Failed ❌' : 'Placed ✅'}
                          </span>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFeedback(item.id);
                          }}
                          className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer border ${isDark
                              ? 'bg-[#262626] hover:bg-[#333] text-zinc-200 border-[#333] hover:text-rose-400'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:text-rose-600'
                            }`}
                          title="Delete Feedback"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
