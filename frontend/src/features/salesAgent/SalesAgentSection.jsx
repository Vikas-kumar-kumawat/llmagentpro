import React from 'react';
import { SectionCard } from '../../components/common/SectionCard';

export function SalesAgentSection() {
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
        <div className="p-8 text-center text-zinc-400">
          <h2 className="text-xl font-semibold text-white mb-2">Sales Copilot Dashboard</h2>
          <p>This module is currently under construction. Automated AI sales features will be available soon.</p>
        </div>
      </SectionCard>
    </div>
  );
}
