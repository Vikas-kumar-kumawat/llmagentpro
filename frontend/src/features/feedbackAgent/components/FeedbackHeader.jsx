import React from 'react';

export function FeedbackHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#27272a] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-white">
            Feedback <span className="text-[#a1a1aa] font-normal">Agent</span>
          </h1>
        </div>
      </div>
    </div>
  );
}


