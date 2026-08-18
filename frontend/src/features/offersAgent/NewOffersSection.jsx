import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Zap,
  Gift,
  Megaphone,
  Phone,
  CheckCircle,
  X
} from 'lucide-react';
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
  const [campaigns, setCampaigns] = useState(DEFAULT_OFFERS_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter] = useState('all');
  const [dateRange] = useState('Aug 11 - Aug 17, 2025');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [offerTitle, setOfferTitle] = useState('Fiber 300Mbps Festive Upgrade');
  const [discountPercent, setDiscountPercent] = useState(30);
  const [specialPrice, setSpecialPrice] = useState('₹999/mo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callingState, setCallingState] = useState({ loading: false, msg: '' });

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
    <div className="w-full min-h-screen pb-12 font-['Plus_Jakarta_Sans',sans-serif] bg-[#000000] text-white select-none space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              New Offers Call <span className="text-[#a1a1aa] font-normal">Agent</span>
            </h1>
            <span className="text-[11px] font-mono text-white bg-[#18181b] border border-[#27272a] px-2.5 py-0.5 rounded-full font-medium">
              agent.offers
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
            Targeted AI voice marketing & promotional calls for fiber plan upgrades and special pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-[#27272a] bg-[#09090b] text-white">
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span>{dateRange}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Campaign Calls
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">45</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">↑ 32%</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Conversions
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">18</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">40.0%</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Avg. Upsell Value
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">₹400/mo</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">+18%</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium">
              Top Offer
            </span>
            <div className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] text-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">GigaUpgrade</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-white border border-[#27272a]">Hot</span>
          </div>
        </div>
      </div>

      {callingState.msg && (
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] text-white text-xs font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-white animate-pulse" />
          <span>{callingState.msg}</span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden pt-2">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272a] bg-[#000000]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Targeted Customer Offer Campaigns</h2>
            <span className="text-[10px] font-mono text-[#a1a1aa] bg-[#18181b] px-2.5 py-0.5 rounded-full border border-[#27272a]">
              {filtered.length} targets
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search target..."
                className="w-full sm:w-48 py-1.5 pl-8 pr-3 rounded-lg text-xs bg-[#000000] text-white border border-[#27272a] focus:border-white focus:outline-none transition"
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Launch Offer Call</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] bg-[#000000]">
                <th className="py-3 px-4">Customer Target</th>
                <th className="py-3 px-4">Offer Title</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Special Price</th>
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
                    <p className="font-medium text-white">{item.offer_title}</p>
                    <span className="text-[10px] font-mono text-[#a1a1aa]">{item.category}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border bg-[#18181b] text-white border-[#27272a]">
                      {item.discount_percent}% OFF
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono font-bold text-white">
                    {item.special_price}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleTriggerOfferCall(item.customer_name, item.phone, item.offer_title)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl p-5 border border-[#27272a] bg-[#09090b] text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
              <h3 className="font-semibold text-sm text-white">Launch New Offers Call Agent</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] border border-[#27272a]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffersAgent} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Customer Target Name *</label>
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
                <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Offer Campaign Title</label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="e.g. Fiber 300Mbps Festive Upgrade"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-[#a1a1aa]">Discount %</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-1">Special Price</label>
                  <input
                    type="text"
                    value={specialPrice}
                    onChange={(e) => setSpecialPrice(e.target.value)}
                    placeholder="e.g. ₹999/mo"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#27272a] bg-[#000000] text-white text-xs focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs transition cursor-pointer hover:bg-zinc-200 border border-white"
              >
                {isSubmitting ? 'Launching Offer Campaign...' : 'Launch Promotional Offer Agent'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

