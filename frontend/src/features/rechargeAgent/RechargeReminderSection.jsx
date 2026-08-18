import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Search,
  Plus,
  Zap,
  Phone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { makeOutboundCall, executeRechargeReminderAgent } from '../../services/apiService';

const DEFAULT_RECHARGE_RECORDS = [
  {
    id: 101,
    customer_name: 'Rahul Sharma',
    phone: '+919876543210',
    plan_name: 'Fiber 100Mbps Ultra',
    expiry_date: 'Today (Aug 18, 2025)',
    amount: '₹799/mo',
    status: 'expiring_today',
    last_reminder: '2 hours ago',
    avatar: 'RS'
  },
  {
    id: 102,
    customer_name: 'Ananya Verma',
    phone: '+919812345678',
    plan_name: 'Fiber 300Mbps Gaming Pack',
    expiry_date: 'Tomorrow (Aug 19, 2025)',
    amount: '₹1,299/mo',
    status: 'in_2_days',
    last_reminder: 'Yesterday',
    avatar: 'AV'
  },
  {
    id: 103,
    customer_name: 'Priya Mehta',
    phone: '+919988776655',
    plan_name: 'Fiber 50Mbps Home Basic',
    expiry_date: 'Aug 21, 2025',
    amount: '₹499/mo',
    status: 'upcoming',
    last_reminder: 'Not Sent',
    avatar: 'PM'
  },
  {
    id: 104,
    customer_name: 'Amitabh Sen',
    phone: '+919765432109',
    plan_name: 'Fiber GigaSpeed 1Gbps',
    expiry_date: 'Expired (Aug 16, 2025)',
    amount: '₹2,499/mo',
    status: 'expired',
    last_reminder: '3 days ago',
    avatar: 'AS'
  }
];

function formatPhoneNumber(val) {
  const raw = val.trim();
  if (!raw) return '';
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return raw;
  if (cleaned.startsWith('+')) return cleaned;
  const noZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+91${noZero}`;
}

export function RechargeReminderSection({ onRefreshData }) {
  const [records, setRecords] = useState(DEFAULT_RECHARGE_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange] = useState('Aug 11 - Aug 17, 2025');

  // Modal State for New Reminder
  const [showModal, setShowModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Fiber 100Mbps Ultra (₹799)');
  const [expiryText, setExpiryText] = useState('Today');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callingState, setCallingState] = useState({ loading: false, msg: '' });

  // Trigger Voice Call Reminder
  const handleTriggerReminderCall = async (name, phone, plan) => {
    const formatted = formatPhoneNumber(phone);
    setCallingState({ loading: true, msg: `Calling ${name} (${formatted}) for plan recharge...` });
    try {
      const msg = `Hello ${name}, your BFibernet plan ${plan} is expiring. Press 1 to recharge now!`;
      await makeOutboundCall(name, formatted, msg);
      setCallingState({ loading: false, msg: `✅ Voice reminder call placed to ${name}!` });
      setTimeout(() => setCallingState({ loading: false, msg: '' }), 4000);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setCallingState({ loading: false, msg: `Error placing call.` });
    }
  };

  // Submit New Recharge Reminder Agent
  const handleSubmitReminderAgent = async (e) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      alert('Please provide Customer Name and Phone Number.');
      return;
    }

    const formatted = formatPhoneNumber(custPhone);
    setIsSubmitting(true);

    try {
      const parts = selectedPlan.split(' ');
      const planName = parts.slice(0, -1).join(' ');
      const amount = parts[parts.length - 1].replace(/[()]/g, '');

      await executeRechargeReminderAgent(custName.trim(), formatted, planName, expiryText, amount);

      const newItem = {
        id: Date.now(),
        customer_name: custName.trim(),
        phone: formatted,
        plan_name: planName,
        expiry_date: expiryText,
        amount: amount,
        status: 'expiring_today',
        last_reminder: 'Just now',
        avatar: custName.trim().substring(0, 2).toUpperCase()
      };

      setRecords(prev => [newItem, ...prev]);
      setShowModal(false);
      setCustName('');
      setCustPhone('');
      setCallingState({ loading: false, msg: `✅ Recharge Reminder Agent executed for ${custName}!` });
      setTimeout(() => setCallingState({ loading: false, msg: '' }), 4000);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Error triggering Recharge Reminder Agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered records
  const filtered = records.filter(item => {
    const matchesSearch = item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.plan_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen pb-12 font-['Plus_Jakarta_Sans',sans-serif] bg-[#000000] text-white select-none space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              Recharge Reminder <span className="text-[#a1a1aa] font-normal">Agent</span>
            </h1>
            <span className="text-[11px] font-mono text-white bg-[#18181b] border border-[#27272a] px-2.5 py-0.5 rounded-full font-medium">
              agent.recharge
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
            Automated voice & SMS alerts for plan expirations, retention & instant renewal calls.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition cursor-pointer border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] text-white"
          >
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Reminders Sent
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">28</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">↑ 24%</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Successful Renewals
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">19</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">67.8%</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Expiring Today
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">5</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">Urgent</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Revenue Saved
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">₹24,500</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">+15%</span>
          </div>
        </div>
      </div>

      {callingState.msg && (
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] text-white text-xs font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-white animate-pulse" />
          <span>{callingState.msg}</span>
        </div>
      )}

      {/* Main Table Directory Container */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden pt-2">
        {/* Table Header Bar */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272a] bg-[#000000]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Subscribers & Renewals</h2>
            <span className="text-[10px] font-mono text-[#a1a1aa] bg-[#18181b] px-2.5 py-0.5 rounded-full border border-[#27272a]">
              {filtered.length} subscribers
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscriber..."
                className="w-full sm:w-48 py-1.5 pl-8 pr-3 rounded-lg text-xs bg-[#000000] text-white border border-[#27272a] focus:border-white focus:outline-none transition"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg text-xs bg-[#000000] text-white border border-[#27272a] focus:border-white focus:outline-none transition"
            >
              <option value="all">All Statuses</option>
              <option value="expiring_today">Expiring Today</option>
              <option value="in_2_days">In 2 Days</option>
              <option value="expired">Expired</option>
            </select>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Send Reminder</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] bg-[#000000]">
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-[#18181b] cursor-pointer">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border border-[#27272a] bg-[#18181b] text-white text-xs flex items-center justify-center shrink-0 font-medium">
                        {item.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.customer_name}</p>
                        <p className="text-[10px] font-mono text-[#a1a1aa]">{item.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-white">{item.plan_name}</p>
                    <p className="text-[10px] font-mono text-[#a1a1aa]">{item.amount}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-[#a1a1aa]">
                    {item.expiry_date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border bg-[#18181b] text-white border-[#27272a]">
                      {item.status === 'expiring_today' ? 'Expiring Today' : item.status === 'expired' ? 'Expired' : 'Upcoming'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleTriggerReminderCall(item.customer_name, item.phone, item.plan_name)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Reminder Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl p-5 border border-[#27272a] bg-[#09090b] text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
              <h3 className="font-semibold text-sm text-white">Trigger Recharge Reminder Agent</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] border border-[#27272a]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReminderAgent} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-[#a1a1aa]">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Vikas Kumar"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Customer Phone (+91) *</label>
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Select Broadband Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
                >
                  <option value="Fiber 100Mbps Ultra (₹799)">Fiber 100Mbps Ultra (₹799/mo)</option>
                  <option value="Fiber 300Mbps Gaming (₹1299)">Fiber 300Mbps Gaming (₹1299/mo)</option>
                  <option value="Fiber GigaSpeed 1Gbps (₹2499)">Fiber GigaSpeed 1Gbps (₹2499/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Expiry Status</label>
                <input
                  type="text"
                  value={expiryText}
                  onChange={(e) => setExpiryText(e.target.value)}
                  placeholder="e.g. Today / Aug 20, 2025"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs transition cursor-pointer hover:bg-zinc-200 border border-white"
              >
                {isSubmitting ? 'Dispatching Agent...' : 'Dispatch Recharge Reminder Agent'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

