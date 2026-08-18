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
  Sparkles,
  Tag,
  Gift,
  Megaphone,
  Phone,
  CheckCircle2,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { makeOutboundCall, executeNewOffersAgent } from '../../services/apiService';

const DEFAULT_OFFERS_CAMPAIGNS = [
  {
    id: 201,
    customer_name: 'Vikramaditya Singh',
    phone: '+919876543210',
    offer_title: 'Fiber GigaSpeed 1Gbps Upgrade',
    discount_percent: 50,
    special_price: '₹1,499/mo',
    category: 'Speed Upgrade',
    status: 'interested',
    avatarBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
    avatar: 'VS'
  },
  {
    id: 202,
    customer_name: 'Sneha Kulkarni',
    phone: '+919811223344',
    offer_title: 'Festive Unlimited Fiber + OTT Bundle',
    discount_percent: 30,
    special_price: '₹999/mo',
    category: 'OTT Combo',
    status: 'call_scheduled',
    avatarBg: 'bg-gradient-to-tr from-purple-500 to-indigo-600',
    avatar: 'SK'
  },
  {
    id: 203,
    customer_name: 'Manish Malhotra',
    phone: '+919988112233',
    offer_title: 'Fiber 300Mbps Dual Band Router Free',
    discount_percent: 40,
    special_price: '₹1,199/mo',
    category: 'Hardware Upgrade',
    status: 'new_lead',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
    avatar: 'MM'
  },
  {
    id: 204,
    customer_name: 'Deepika Padukone',
    phone: '+919766554433',
    offer_title: 'Annual Subscription 2 Months Free',
    discount_percent: 25,
    special_price: '₹7,999/yr',
    category: 'Annual Discount',
    status: 'converted',
    avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
    avatar: 'DP'
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

export function NewOffersSection({ onRefreshData }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [campaigns, setCampaigns] = useState(DEFAULT_OFFERS_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('Aug 11 - Aug 17, 2025');
  const [voicePersona, setVoicePersona] = useState('priya_sharma');
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [offerTitle, setOfferTitle] = useState('Fiber 300Mbps Festive Upgrade');
  const [discountPercent, setDiscountPercent] = useState(30);
  const [specialPrice, setSpecialPrice] = useState('₹999/mo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callingState, setCallingState] = useState({ loading: false, msg: '' });

  // Voice Demo
  const handlePlayDemo = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = "Greetings from BFibernet! You have been selected for a special 50 percent discount on our 1Gbps Fiber plan. Press 1 to activate.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingDemo(true);
      utterance.onend = () => setIsPlayingDemo(false);
      utterance.onerror = () => setIsPlayingDemo(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Demo Speech: 'Greetings from BFibernet! Special 50% discount available.'");
    }
  };

  // Trigger Offer Voice Call
  const handleTriggerOfferCall = async (name, phone, offer) => {
    const formatted = formatPhoneNumber(phone);
    setCallingState({ loading: true, msg: `Placing promotional offer call to ${name} (${formatted})...` });
    try {
      const msg = `Hello ${name}, great news from BFibernet! You get exclusive access to ${offer}. Press 1 to claim now!`;
      await makeOutboundCall(name, formatted, msg);
      setCallingState({ loading: false, msg: `✅ Promotional offer call placed to ${name}!` });
      setTimeout(() => setCallingState({ loading: false, msg: '' }), 4000);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setCallingState({ loading: false, msg: `Error placing call.` });
    }
  };

  // Submit New Offers Call Agent
  const handleSubmitOffersAgent = async (e) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      alert('Please fill in Customer Name and Phone Number.');
      return;
    }

    const formatted = formatPhoneNumber(custPhone);
    setIsSubmitting(true);

    try {
      await executeNewOffersAgent(custName.trim(), formatted, offerTitle, discountPercent, specialPrice);

      const newItem = {
        id: Date.now(),
        customer_name: custName.trim(),
        phone: formatted,
        offer_title: offerTitle,
        discount_percent: discountPercent,
        special_price: specialPrice,
        category: 'Festive Offer',
        status: 'interested',
        avatarBg: 'bg-gradient-to-tr from-cyan-600 to-indigo-600',
        avatar: custName.trim().substring(0, 2).toUpperCase()
      };

      setCampaigns(prev => [newItem, ...prev]);
      setShowModal(false);
      setCustName('');
      setCustPhone('');
      setCallingState({ loading: false, msg: `✅ New Offers Call Agent executed for ${custName}!` });
      setTimeout(() => setCallingState({ loading: false, msg: '' }), 4000);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Error triggering New Offers Call Agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = campaigns.filter(item => {
    const matchesSearch = item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.offer_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className={`w-full min-h-screen pb-12 font-sans transition-colors duration-200 ${isDark ? 'bg-transparent text-[#f4f4f5]' : 'bg-[#f8fafc] text-slate-900'
      }`}>
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
            }`}>
            New Offers Call Agent <span className="inline-block">🎁</span>
          </h1>
          <p className={`text-xs md:text-sm font-medium mt-0.5 ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'
            }`}>
            Targeted AI marketing &amp; promotional calls for fiber upgrades and discounts.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="relative">
            <button
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${isDark ? 'bg-[#212121] text-[#ececec] border-[#2f2f2f]' : 'bg-white text-slate-800 border-slate-200/90 shadow-xs'
                }`}
            >
              <Calendar className="w-4 h-4 text-cyan-600" />
              <span>{dateRange}</span>
            </button>
          </div>

          <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow">
              VK
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <p className="font-bold text-slate-900">Vikas Kumar</p>
              <p className="text-[10px] text-slate-500">vikas@example.com</p>
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
              Campaign Calls
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border-cyan-200/80'
              }`}>
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>45</span>
            <span className="text-xs font-semibold text-emerald-600">↑ 32%</span>
          </div>
        </div>

        <div className={`p-4.5 rounded-2xl border transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>
              Offer Conversions
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200/80'
              }`}>
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>18</span>
            <span className="text-xs font-semibold text-emerald-600">40% Conv.</span>
          </div>
        </div>

        <div className={`p-4.5 rounded-2xl border transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>
              Avg Discount
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200/80'
              }`}>
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>35% OFF</span>
            <span className="text-xs font-semibold text-amber-600">Active</span>
          </div>
        </div>

        <div className={`p-4.5 rounded-2xl border transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>
              Campaign Rating
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
              }`}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>4.9 ★</span>
            <span className="text-xs font-semibold text-emerald-600">Top Rated</span>
          </div>
        </div>
      </div>

      {/* Voice Persona Banner */}
      <div className={`p-4 rounded-2xl border mb-6 transition-all ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200/80'
              }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Promotional Marketing Persona</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Active Pitcher
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
              <option value="priya_sharma">Priya Sharma (Neural Marketing - Hindi/Eng)</option>
              <option value="ratan_singh">Ratan Singh (Neural Male - Marwari)</option>
            </select>

            <button
              onClick={handlePlayDemo}
              disabled={isPlayingDemo}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${isDark ? 'bg-[#2a2a2a] text-white border-[#383838]' : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isPlayingDemo ? 'Playing...' : 'Voice Pitch Sample'}</span>
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
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Targeted Customer Offer Campaigns</h2>
            <p className={`text-xs ${isDark ? 'text-[#8e8e8e]' : 'text-slate-500'}`}>Live AI marketing broadcast queue</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search target..."
              className={`py-1.5 pl-3 pr-3 rounded-xl text-xs border ${isDark ? 'bg-[#1c1c1c] text-white border-[#2f2f2f]' : 'bg-slate-50 text-slate-900 border-slate-300'
                }`}
            />

            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Launch Offer Call</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${isDark ? 'border-[#2d2d2d]/60 text-[#8e8e8e] bg-[#1a1a1a]/50' : 'border-slate-200/90 text-slate-500 bg-slate-50/90'
                }`}>
                <th className="py-3 px-4">Customer Target</th>
                <th className="py-3 px-4">Offer Title</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Special Price</th>
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
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.offer_title}</p>
                    <span className="text-[10px] text-indigo-600 font-bold">{item.category}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {item.discount_percent}% OFF
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-xs font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {item.special_price}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleTriggerOfferCall(item.customer_name, item.phone, item.offer_title)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-indigo-600" />
                      <span>Trigger Offer Call</span>
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
              <h3 className="font-extrabold text-base">Launch New Offers Call Agent</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffersAgent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Target Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Vikas Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Offer Campaign Title</label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="e.g. Fiber 300Mbps Festive Upgrade"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discount %</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Special Price</label>
                  <input
                    type="text"
                    value={specialPrice}
                    onChange={(e) => setSpecialPrice(e.target.value)}
                    placeholder="e.g. ₹999/mo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-md hover:from-indigo-500 hover:to-cyan-500 cursor-pointer"
              >
                {isSubmitting ? 'Launching Offer Campaign...' : '🎁 Launch Promotional Offer Agent'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
