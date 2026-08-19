import React from 'react';
import { SectionCard } from '../../components/common/SectionCard';
import { useTheme } from '../../context/ThemeContext';

export function RechargeReminderSection() {
  const { isDark } = useTheme();

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <SectionCard
        icon="⚡"
        title="Recharge Reminder Agent"
        subtitle="Automated payment reminders and balance alerts"
        tag="Active v2.0"
        isOpen={true}
        onToggle={() => {}}
      >
        <div className={`p-8 text-center rounded-xl border ${
          isDark ? 'border-[#1e1e24] bg-[#070709] text-zinc-400 shadow-xl' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <h2 className={`text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Recharge Reminder Dashboard</h2>
          <p className="text-sm font-medium">Automated AI bill payment reminder calls and SMS balance alerts are currently active.</p>
        </div>
      </SectionCard>
    </div>
  );
}
