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
  const safeList = Array.isArray(filteredFeedbacks) ? filteredFeedbacks : [];

  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Table Header Controls */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272a] bg-[#000000]">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            Feedback Log Directory
            <span className="text-[10px] font-mono text-white bg-[#18181b] px-2.5 py-0.5 rounded-full border border-[#27272a] font-medium">
              {safeList.length} records
            </span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by customer or phone..."
              className="w-full py-1.5 pl-8 pr-3 rounded-lg text-xs bg-[#000000] text-white border border-[#27272a] focus:border-white placeholder-[#71717a] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {/* Sentiment Filter Dropdown */}
            <div className="relative col-span-1 sm:w-auto">
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="w-full py-1.5 pl-3 pr-7 rounded-lg text-xs bg-[#000000] text-white border border-[#27272a] focus:border-white appearance-none cursor-pointer focus:outline-none transition font-medium"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Refresh Icon Button */}
            <button
              onClick={() => onRefreshData && onRefreshData()}
              title="Refresh Records"
              className="p-2 rounded-lg transition cursor-pointer border border-[#27272a] bg-[#000000] hover:bg-[#18181b] text-white flex items-center justify-center col-span-1 sm:w-auto"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isBatchCalling ? (
              <button
                onClick={handleCancelBatchCall}
                className="flex-1 sm:flex-none justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#18181b] hover:bg-[#27272a] text-white border border-[#27272a] transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Cancel Campaign</span>
              </button>
            ) : (
              <button
                onClick={handleCollectAllFeedbacks}
                className="flex-1 sm:flex-none justify-center px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call All Customers</span>
              </button>
            )}

            <button
              onClick={() => setShowCollectModal(true)}
              className="flex-1 sm:flex-none justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#000000] hover:bg-[#18181b] text-white border border-[#27272a] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View (< md breakpoint) */}
      <div className="block md:hidden divide-y divide-[#27272a]">
        {safeList.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717a]">
            No feedback entries found matching your query.
          </div>
        ) : (
          safeList.map((item) => {
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedFeedback(item)}
                className="p-4 hover:bg-[#18181b] transition cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full border border-[#27272a] bg-[#18181b] text-white text-xs flex items-center justify-center shrink-0 font-medium">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-white">{item.customer_name}</p>
                      <p className="text-[10px] text-[#a1a1aa] font-mono">{item.phone}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border bg-[#18181b] text-white border-[#27272a]">
                    {item.sentiment || 'Neutral'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#000000] border border-[#27272a] text-xs text-white">
                  "{item.feedback_text}"
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#71717a]">
                    {item.created_at}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#000000] hover:bg-[#18181b] text-white border border-[#27272a] flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 text-white fill-current" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerCall(item.customer_name, item.phone, item);
                      }}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFeedback(item.id);
                      }}
                      className="p-1 rounded-md bg-[#000000] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]"
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
            <tr className="border-b border-[#27272a] text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] bg-[#000000]">
              <th className="py-4 px-5">Customer</th>
              <th className="py-4 px-5 min-w-[260px]">Recorded Feedback</th>
              <th className="py-4 px-5">Sentiment</th>
              <th className="py-4 px-5">Timestamp</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a] text-xs font-normal">
            {safeList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-[#71717a]">
                  No feedback entries found matching your query.
                </td>
              </tr>
            ) : (
              safeList.map((item) => {
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className="transition hover:bg-[#18181b] cursor-pointer"
                  >
                    {/* Customer Column */}
                    <td className="py-6 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full border border-[#27272a] bg-[#18181b] text-white text-sm flex items-center justify-center shrink-0 font-semibold shadow-sm">
                          {item.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white transition-colors">{item.customer_name}</p>
                          <p className="text-xs font-mono text-[#a1a1aa] mt-0.5">{item.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Feedback Text Column */}
                    <td className="py-6 px-5">
                      <p className="line-clamp-2 leading-relaxed text-xs sm:text-sm text-white font-normal">
                        "{item.feedback_text}"
                      </p>
                    </td>

                    {/* Sentiment Badge Column */}
                    <td className="py-6 px-5 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium uppercase border bg-[#18181b] text-white border-[#27272a]">
                        {item.sentiment || 'Neutral'}
                      </span>
                    </td>

                    {/* Date Column */}
                    <td className="py-6 px-5 whitespace-nowrap text-xs font-mono text-[#a1a1aa]">
                      {item.created_at}
                    </td>

                    {/* Action Column */}
                    <td className="py-6 px-5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#000000] hover:bg-[#18181b] text-white border border-[#27272a] transition flex items-center gap-1.5 cursor-pointer"
                          title="View Call Details"
                        >
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (setEditingFeedback) setEditingFeedback(item);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#000000] hover:bg-[#18181b] text-white border border-[#27272a] transition flex items-center gap-1.5 cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#a1a1aa]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerCall(item.customer_name, item.phone, item);
                          }}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>

                        {rowCallStatuses[item.id] && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium border bg-[#18181b] text-white border-[#27272a]">
                            {rowCallStatuses[item.id] === 'calling' ? 'Calling...' : rowCallStatuses[item.id] === 'failed' ? 'Failed ❌' : 'Placed ✅'}
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFeedback(item.id);
                          }}
                          className="p-2 rounded-lg bg-[#000000] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a] transition cursor-pointer"
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

