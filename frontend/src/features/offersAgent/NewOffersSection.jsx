import React from 'react';
import { SectionCard } from '../../components/common/SectionCard';

export function NewOffersSection() {
  return (
    <div className="max-w-4xl mx-auto pt-4">
      <SectionCard
        icon="🎁"
        title="New Offers Agent"
        subtitle="Automated promotional outbound calls and offers"
        tag="Beta"
        isOpen={true}
        onToggle={() => {}}
      >
        <div className="p-8 text-center text-zinc-400">
          <h2 className="text-xl font-semibold text-white mb-2">New Offers Campaign Manager</h2>
          <p>This module is currently under construction. AI automated promotion campaigns will be available soon.</p>
        </div>
      </SectionCard>
    </div>
  );
}
