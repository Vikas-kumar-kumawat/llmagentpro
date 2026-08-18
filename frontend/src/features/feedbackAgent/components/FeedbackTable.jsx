import React from 'react';
import {
  Search,
  ChevronDown,
  RotateCw,
  PhoneCall,
  Plus,
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
  const { isDark } = useTheme();
  const safeList = Array.isArray(filteredFeedbacks) ? filteredFeedbacks : [];

  return (
    <div className={`border rounded-xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] ${
      isDark ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
    }`}>
      {/* Table Header Controls */}
      <div className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b ${
        isDark ? 'border-[#27272a] bg-[#000000]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div>
          <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Feedback Log Directory
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-medium ${
              isDark ? 'text-white bg-[#18181b] border-[#27272a]' : 'text-slate-700 bg-slate-200 border-slate-300'
            }`}>
              {safeList.length} records
            </span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-52">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-[#a1a1aa]' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by customer or phone..."
              className={`w-full py-1.5 pl-8 pr-3 rounded-lg text-xs border focus:outline-none transition ${
                isDark 
                  ? 'bg-[#09090b] text-white border-[#27272a] focus:border-sky-500 placeholder-zinc-500' 
                  : 'bg-white text-slate-900 border-slate-300 focus:border-sky-600 placeholder-slate-400 shadow-xs'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {/* Sentiment Filter Dropdown */}
            <div className="relative col-span-1 sm:w-auto">
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className={`w-full py-1.5 pl-3 pr-7 rounded-lg text-xs border appearance-none cursor-pointer focus:outline-none transition font-medium ${
                  isDark 
                    ? 'bg-[#09090b] text-white border-[#27272a] focus:border-sky-500' 
                    : 'bg-white text-slate-900 border-slate-300 focus:border-sky-600 shadow-xs'
                }`}
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-[#a1a1aa]' : 'text-slate-400'
              }`} />
            </div>

            {/* Refresh Icon Button */}
            <button
              onClick={() => onRefreshData && onRefreshData()}
              title="Refresh Records"
              className={`p-2 rounded-lg transition cursor-pointer border flex items-center justify-center col-span-1 sm:w-auto ${
                isDark 
                  ? 'border-[#27272a] bg-[#09090b] hover:bg-[#18181b] text-white' 
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isBatchCalling ? (
              <button
                onClick={handleCancelBatchCall}
                className={`flex-1 sm:flex-none justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  isDark 
                    ? 'bg-[#18181b] hover:bg-[#27272a] text-white border-[#27272a]' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                }`}
              >
                <span>Cancel Campaign</span>
              </button>
            ) : (
              <button
                onClick={handleCollectAllFeedbacks}
                className={`flex-1 sm:flex-none justify-center px-4 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-2 cursor-pointer ${
                  isDark 
                    ? 'bg-white text-black border-white hover:bg-zinc-200' 
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call All Customers</span>
              </button>
            )}

            <button
              onClick={() => setShowCollectModal(true)}
              className={`flex-1 sm:flex-none justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                isDark 
                  ? 'bg-[#09090b] hover:bg-[#18181b] text-white border-[#27272a]' 
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View (< md breakpoint) */}
      <div className={`block md:hidden divide-y ${isDark ? 'divide-[#27272a]' : 'divide-slate-200'}`}>
        {safeList.length === 0 ? (
          <div className={`p-8 text-center text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
            No feedback entries found matching your query.
          </div>
        ) : (
          safeList.map((item) => {
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedFeedback(item)}
                className={`p-4 transition cursor-pointer space-y-3 ${
                  isDark ? 'hover:bg-[#18181b]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full border text-xs flex items-center justify-center shrink-0 font-medium ${
                      isDark ? 'border-[#27272a] bg-[#18181b] text-white' : 'border-slate-200 bg-slate-100 text-slate-800'
                    }`}>
                      {item.avatar}
                    </div>
                    <div>
                      <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.customer_name}</p>
                      <p className={`text-[10px] font-mono ${isDark ? 'text-[#a1a1aa]' : 'text-slate-500'}`}>{item.phone}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border ${
                    isDark ? 'bg-[#18181b] text-white border-[#27272a]' : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {item.sentiment || 'Neutral'}
                  </span>
                </div>

                <div className={`p-3 rounded-lg border text-xs ${
                  isDark ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  "{item.feedback_text}"
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    {item.created_at}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${
                        isDark ? 'bg-[#09090b] hover:bg-[#18181b] text-white border-[#27272a]' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerCall(item.customer_name, item.phone, item);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${
                        isDark ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFeedback(item.id);
                      }}
                      className={`p-1 rounded-md border ${
                        isDark ? 'bg-[#09090b] hover:bg-[#18181b] text-zinc-400 border-[#27272a]' : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-300'
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

      {/* Desktop View (>= md breakpoint) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'border-[#27272a] text-[#a1a1aa] bg-[#000000]' : 'border-slate-200 text-slate-600 bg-slate-50'
            }`}>
              <th className="py-4 px-5">Customer</th>
              <th className="py-4 px-5 min-w-[260px]">Recorded Feedback</th>
              <th className="py-4 px-5">Sentiment</th>
              <th className="py-4 px-5">Timestamp</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-normal ${
            isDark ? 'divide-[#27272a]' : 'divide-slate-200'
          }`}>
            {safeList.length === 0 ? (
              <tr>
                <td colSpan={5} className={`py-12 text-center text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  No feedback entries found matching your query.
                </td>
              </tr>
            ) : (
              safeList.map((item) => {
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className={`transition cursor-pointer ${
                      isDark ? 'hover:bg-[#18181b]' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Customer Column */}
                    <td className="py-6 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full border text-sm flex items-center justify-center shrink-0 font-semibold shadow-xs ${
                          isDark ? 'border-[#27272a] bg-[#18181b] text-white' : 'border-slate-200 bg-slate-100 text-slate-800'
                        }`}>
                          {item.avatar}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>{item.customer_name}</p>
                          <p className={`text-xs font-mono mt-0.5 ${
                            isDark ? 'text-[#a1a1aa]' : 'text-slate-500'
                          }`}>{item.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Feedback Text Column */}
                    <td className="py-6 px-5">
                      <p className={`line-clamp-2 leading-relaxed text-xs sm:text-sm font-normal ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>
                        "{item.feedback_text}"
                      </p>
                    </td>

                    {/* Sentiment Badge Column */}
                    <td className="py-6 px-5 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase border ${
                        isDark ? 'bg-[#18181b] text-white border-[#27272a]' : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {item.sentiment || 'Neutral'}
                      </span>
                    </td>

                    {/* Date Column */}
                    <td className={`py-6 px-5 whitespace-nowrap text-xs font-mono ${
                      isDark ? 'text-[#a1a1aa]' : 'text-slate-500'
                    }`}>
                      {item.created_at}
                    </td>

                    {/* Action Column */}
                    <td className="py-6 px-5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                            isDark 
                              ? 'bg-[#09090b] hover:bg-[#18181b] text-white border-[#27272a]' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                          }`}
                          title="View Call Details"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (setEditingFeedback) setEditingFeedback(item);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                            isDark 
                              ? 'bg-[#09090b] hover:bg-[#18181b] text-white border-[#27272a]' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                          }`}
                          title="Edit Customer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerCall(item.customer_name, item.phone, item);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                            isDark 
                              ? 'bg-white text-black border-white hover:bg-zinc-200' 
                              : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs'
                          }`}
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>

                        {rowCallStatuses[item.id] && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                            isDark ? 'bg-[#18181b] text-white border-[#27272a]' : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {rowCallStatuses[item.id] === 'calling' ? 'Calling...' : rowCallStatuses[item.id] === 'failed' ? 'Failed ❌' : 'Placed ✅'}
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFeedback(item.id);
                          }}
                          className={`p-2 rounded-lg border transition cursor-pointer ${
                            isDark 
                              ? 'bg-[#09090b] hover:bg-[#18181b] text-zinc-400 hover:text-white border-[#27272a]' 
                              : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-rose-600 border-slate-300 shadow-xs'
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

