import React from 'react';
import { SectionCard } from '../../components/common/SectionCard';
import { useTheme } from '../../context/ThemeContext';

export function SalesAgentSection() {
  const { isDark } = useTheme();

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <SectionCard
        icon="🛍️"
        title="Sales AI Agent"
        subtitle="Automated outbound sales lead conversion, fiber plan upsells & promotional calls"
        tag="Sales Copilot v2.4"
        isOpen={true}
        onToggle={() => {}}
      >
        <div className={`p-8 text-center rounded-xl border ${
          isDark ? 'border-[#1e1e24] bg-[#070709] text-zinc-400 shadow-xl' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <h2 className={`text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sales Copilot Dashboard</h2>
          <p className="text-sm font-medium">This module is currently active. Automated AI sales features and lead conversion workflows are available.</p>
        </div>
      </SectionCard>
    </div>
  );
}
