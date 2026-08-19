import React from 'react';
import { SectionCard } from '../../components/common/SectionCard';
import { useTheme } from '../../context/ThemeContext';

export function CompetitorMonitoringSection() {
  const { isDark } = useTheme();

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <SectionCard
        icon="📉"
        title="Competitor Price Monitor"
        subtitle="Track competitor fiber plans and pricing dynamically"
        tag="Active v3.1"
        isOpen={true}
        onToggle={() => {}}
      >
        <div className={`p-8 text-center rounded-xl border ${
          isDark ? 'border-[#1e1e24] bg-[#070709] text-zinc-400 shadow-xl' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <h2 className={`text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Competitor Analysis Dashboard</h2>
          <p className="text-sm font-medium">Live competitor pricing comparison algorithms and market telemetry analysis are currently active.</p>
        </div>
      </SectionCard>
    </div>
  );
}
