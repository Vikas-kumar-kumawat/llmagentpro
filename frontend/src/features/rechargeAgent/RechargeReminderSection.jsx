import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Search,
  RotateCw,
  Plus,
  PhoneCall,
  Mic,
  Volume2,
  Zap,
  Sun,
  Moon,
  Lock,
  Play,
  Phone,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
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
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
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
    avatarBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
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
    avatarBg: 'bg-gradient-to-tr from-purple-500 to-indigo-600',
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
    avatarBg: 'bg-gradient-to-tr from-rose-500 to-red-600',
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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [records, setRecords] = useState(DEFAULT_RECHARGE_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState('Aug 11 - Aug 17, 2025');
  const [voicePersona, setVoicePersona] = useState('ratan_singh');
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Modal State for New Reminder
  const [showModal, setShowModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Fiber 100Mbps Ultra (₹799)');
  const [expiryText, setExpiryText] = useState('Today');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callingState, setCallingState] = useState({ loading: false, msg: '' });

  // Play Demo Audio
  const handlePlayDemo = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = "Namaste! This is BFibernet Recharge Reminder Agent. Your broadband plan expires today. Press 1 for quick recharge.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingDemo(true);
      utterance.onend = () => setIsPlayingDemo(false);
      utterance.onerror = () => setIsPlayingDemo(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Demo Speech: 'Namaste! Your broadband plan expires today.'");
    }
  };

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

      const res = await executeRechargeReminderAgent(custName.trim(), formatted, planName, expiryText, amount);

      const newItem = {
        id: Date.now(),
        customer_name: custName.trim(),
        phone: formatted,
        plan_name: planName,
        expiry_date: expiryText,
        amount: amount,
        status: 'expiring_today',
        last_reminder: 'Just now',
        avatarBg: 'bg-gradient-to-tr from-cyan-600 to-indigo-600',
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
    <div className={`w-full min-h-screen pb-12 font-sans transition-colors duration-200 ${isDark ? 'bg-transparent text-[#f4f4f5]' : 'bg-[#f8fafc] text-slate-900'
      }`}>
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
            }`}>
            Recharge Reminder Agent <span className="inline-block">⚡</span>
          </h1>
          <p className={`text-xs md:text-sm font-medium mt-0.5 ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'
            }`}>
            Automated voice &amp; SMS alerts for plan expirations &amp; instant renewals.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${isDark
                  ? 'bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border-[#2f2f2f]'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-xs'
                }`}
            >
              <Calendar className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border transition ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow">
              VK
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <p className={`font-bold ${isDark ? 'text-[#ececec]' : 'text-slate-900'}`}>Vikas Kumar</p>
              <p className={`text-[10px] ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>vikas@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4.5 rounded-2xl border transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>
              Reminders Sent
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border-cyan-200/80'
              }`}>
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>28</span>
            <span className="text-xs font-semibold text-emerald-600">↑ 24%</span>
          </div>
        </div>

        <div className={`p-4.5 rounded-2xl border transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>
              Expiring Today
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200/80'
              }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>6</span>
            <span className="text-xs font-semibold text-amber-600">Urgent</span>
          </div>
        </div>

        <div className={`p-4.5 rounded-2xl border transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>
              Renewal Rate
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
              }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>92.4%</span>
            <span className="text-xs font-semibold text-emerald-600">High</span>
          </div>
        </div>

        <div className={`p-4.5 rounded-2xl border transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>
              Revenue Retained
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200/80'
              }`}>
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹42,500</span>
            <span className="text-xs font-semibold text-purple-600">This Month</span>
          </div>
        </div>
      </div>

      {/* Voice Persona Banner */}
      <div className={`p-4 rounded-2xl border mb-6 transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border-cyan-200/80'
              }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recharge Voice Persona</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                Active
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={voicePersona}
              onChange={(e) => setVoicePersona(e.target.value)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border ${isDark ? 'bg-[#1c1c1c] text-white border-[#2f2f2f]' : 'bg-slate-50 text-slate-900 border-slate-300'
                }`}
            >
              <option value="ratan_singh">Ratan Singh (Rajasthani/Hindi)</option>
              <option value="priya_sharma">Priya Sharma (Hindi)</option>
            </select>

            <button
              onClick={handlePlayDemo}
              disabled={isPlayingDemo}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${isDark ? 'bg-[#2a2a2a] text-white border-[#383838]' : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>{isPlayingDemo ? 'Playing...' : 'Voice Sample'}</span>
            </button>
          </div>
        </div>
      </div>

      {callingState.msg && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span>{callingState.msg}</span>
        </div>
      )}

      {/* Table Container */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
        <div className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isDark ? 'border-[#2d2d2d]/60' : 'border-slate-200/90'
          }`}>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Expiring Customer Subscriptions</h2>
            <p className={`text-xs ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>Automated recharge reminder queue</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriber..."
              className={`py-1.5 pl-3 pr-3 rounded-xl text-xs border ${isDark ? 'bg-[#1c1c1c] text-white border-[#2f2f2f]' : 'bg-slate-50 text-slate-900 border-slate-300'
                }`}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold border ${isDark ? 'bg-[#1c1c1c] text-white border-[#2f2f2f]' : 'bg-slate-50 text-slate-900 border-slate-300'
                }`}
            >
              <option value="all">All Statuses</option>
              <option value="expiring_today">Expiring Today</option>
              <option value="in_2_days">In 2 Days</option>
              <option value="expired">Expired</option>
            </select>

            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Send Reminder</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${isDark ? 'border-[#2d2d2d]/60 text-[#8e8e8e] bg-[#1a1a1a]/50' : 'border-slate-200/90 text-slate-500 bg-slate-50/90'
                }`}>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-[#2d2d2d]/40' : 'divide-slate-200/80'}`}>
              {filtered.map((item) => (
                <tr key={item.id} className={isDark ? 'hover:bg-[#262626]/80' : 'hover:bg-slate-50/80'}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${item.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                        {item.avatar}
                      </div>
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.customer_name}</p>
                        <p className={`text-[10px] font-mono ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>{item.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.plan_name}</p>
                    <p className="text-[10px] text-cyan-600 font-bold">{item.amount}</p>
                  </td>
                  <td className={`py-3.5 px-4 text-xs ${isDark ? 'text-[#8e8e8e]' : 'text-slate-600 font-medium'}`}>
                    {item.expiry_date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.status === 'expiring_today'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : item.status === 'expired'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                      {item.status === 'expiring_today' ? 'Expiring Today' : item.status === 'expired' ? 'Expired' : 'Upcoming'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleTriggerReminderCall(item.customer_name, item.phone, item.plan_name)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-cyan-600" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4 ${isDark ? 'bg-[#212121] border-[#2b2b2b] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <div className="flex justify-between items-center border-b pb-3 border-slate-200">
              <h3 className="font-extrabold text-base">Trigger Recharge Reminder Agent</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReminderAgent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Vikas Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Customer Phone (+91) *</label>
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Select Broadband Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-cyan-600"
                >
                  <option value="Fiber 100Mbps Ultra (₹799)">Fiber 100Mbps Ultra (₹799/mo)</option>
                  <option value="Fiber 300Mbps Gaming (₹1299)">Fiber 300Mbps Gaming (₹1299/mo)</option>
                  <option value="Fiber GigaSpeed 1Gbps (₹2499)">Fiber GigaSpeed 1Gbps (₹2499/mo)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Expiry Status</label>
                <input
                  type="text"
                  value={expiryText}
                  onChange={(e) => setExpiryText(e.target.value)}
                  placeholder="e.g. Today / Aug 20, 2025"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-500 hover:to-blue-500 cursor-pointer"
              >
                {isSubmitting ? 'Dispatching Agent...' : '⚡ Dispatch Recharge Reminder Agent'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
