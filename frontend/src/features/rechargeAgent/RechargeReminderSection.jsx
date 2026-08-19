import React from 'react';
import { SectionCard } from '../../components/common/SectionCard';

export function RechargeReminderSection() {
  return (
    <div className="max-w-4xl mx-auto pt-4">
      <SectionCard
        icon="⚡"
        title="Recharge Reminder Agent"
        subtitle="Automated payment reminders and balance alerts"
        tag="Active"
        isOpen={true}
        onToggle={() => {}}
      >
        <div className="p-8 text-center text-zinc-400">
          <h2 className="text-xl font-semibold text-white mb-2">Recharge Reminder Dashboard</h2>
          <p>This module is currently under construction. AI automated bill reminder features will be available soon.</p>
        </div>
      </SectionCard>
    </div>
  );
}
