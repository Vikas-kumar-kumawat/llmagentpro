import React from 'react';
import { SectionCard } from '../../components/common/SectionCard';

export function CompetitorMonitoringSection() {
  return (
    <div className="max-w-4xl mx-auto pt-4">
      <SectionCard
        icon="📉"
        title="Competitor Price Monitor"
        subtitle="Track competitor fiber plans and pricing dynamically"
        tag="Active"
        isOpen={true}
        onToggle={() => {}}
      >
        <div className="p-8 text-center text-zinc-400">
          <h2 className="text-xl font-semibold text-white mb-2">Competitor Analysis Dashboard</h2>
          <p>This module is currently under construction. Live competitor tracking features will be available soon.</p>
        </div>
      </SectionCard>
    </div>
  );
}
