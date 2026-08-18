import React, { useState } from 'react';
import { 
  TrendingDown, 
  Search, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  Zap, 
  Tag, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  ShieldAlert,
  Play
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { makeOutboundCall } from '../../services/apiService';

const DEFAULT_COMPETITORS = [
  {
    id: 1,
    provider: 'Airtel Xstream Fiber',
    logo: '🔴',
    planName: 'Entertainment 200Mbps',
    speed: '200 Mbps',
    price: 999,
    bfibernetPrice: 799,
    difference: '+₹200 (BFibernet is 20% Cheaper)',
    status: 'BFibernet Winning 🎉',
    statusType: 'winning',
    ottBundles: 'Disney+ Hotstar, Xstream Play',
    lastUpdated: '10 mins ago'
  },
  {
    id: 2,
    provider: 'JioFiber Unlimited',
    logo: '🔵',
    planName: 'Jio OTT Super 100Mbps',
    speed: '100 Mbps',
    price: 699,
    bfibernetPrice: 749,
    difference: '-₹50 (Jio is ₹50 Cheaper)',
    status: 'Undercut Alert ⚠️',
    statusType: 'alert',
    ottBundles: 'Netflix, Prime, JioCinema Premium',
    lastUpdated: '15 mins ago'
  },
  {
    id: 3,
    provider: 'ACT Fibernet',
    logo: '🟢',
    planName: 'ACT Blaze 150Mbps',
    speed: '150 Mbps',
    price: 849,
    bfibernetPrice: 799,
    difference: '+₹50 (BFibernet is ₹50 Cheaper)',
    status: 'Competitive ✅',
    statusType: 'winning',
    ottBundles: 'Zee5, SonyLIV',
    lastUpdated: '1 hour ago'
  },
  {
    id: 4,
    provider: 'Tata Play Fiber',
    logo: '🟣',
    planName: 'Tata Ultra 300Mbps',
    speed: '300 Mbps',
    price: 1499,
    bfibernetPrice: 1199,
    difference: '+₹300 (BFibernet is 25% Cheaper)',
    status: 'BFibernet Winning 🎉',
    statusType: 'winning',
    ottBundles: 'Binge Combo + Apple TV+',
    lastUpdated: '2 hours ago'
  }
];

export function CompetitorMonitoringSection({ onRefreshData }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [competitors, setCompetitors] = useState(DEFAULT_COMPETITORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [callingState, setCallingState] = useState({ loading: false, msg: '' });

  const handleRunScan = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        scannedProviders: 4,
        priceChangesDetected: 1,
        recommendation: "JioFiber recently dropped 100Mbps plan to ₹699. Recommended Action: Trigger AI Voice Agent Call Campaign offering 100Mbps at ₹649 for 3 months."
      });
    }, 1800);
  };

  const handleTriggerCounterCall = async (providerName) => {
    setCallingState({ loading: true, msg: `Triggering AI Outbound Counter-Offer Call for ${providerName} users...` });
    try {
      const res = await makeOutboundCall(
        "Broadband User", 
        "+919057262630", 
        `Exclusive BFibernet Counter-Offer: Switch from ${providerName} and get 100Mbps Fiber at just ₹649/month with free Installation.`
      );

      if (onRefreshData) onRefreshData();
      setCallingState({ 
        loading: false, 
        msg: res.success ? `Counter-Offer Call placed to win back ${providerName} customers!` : `Call Failed: ${res.message || 'Twilio Error'}`
      });
    } catch (_err) {
      setCallingState({ loading: false, msg: `Error initiating call.` });
    }
  };

  const filteredCompetitors = competitors.filter(c => 
    c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full min-h-screen pb-12 font-sans transition-colors duration-200 ${
      isDark ? 'bg-transparent text-[#f4f4f5]' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Competitor Price Monitoring Agent <span className="inline-block">🏷️</span>
          </h1>
          <p className={`text-xs md:text-sm font-medium mt-0.5 ${
            isDark ? 'text-zinc-400' : 'text-slate-500'
          }`}>
            Autonomous market intelligence engine tracking rival ISP broadband plans, pricing, & auto-generating counter offer call campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Live ISPs...' : 'Scan Competitor Prices'}</span>
          </button>
        </div>
      </div>

      {/* Action Toast */}
      {callingState.msg && (
        <div className="mb-6 p-3.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
          <span>{callingState.msg}</span>
        </div>
      )}

      {/* Scan Result Agent Intelligence Box */}
      {scanResult && (
        <div className={`mb-6 p-4 rounded-2xl border ${
          isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
        } animate-fadeIn`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              AI Market Intelligence Report
            </span>
            <span className="text-[10px] font-mono opacity-80">LangGraph Scraper Engine</span>
          </div>
          <p className="text-xs leading-relaxed font-medium">{scanResult.recommendation}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-100 shadow-sm'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Monitored ISPs</span>
          <span className="text-3xl font-extrabold tracking-tight">4 Providers</span>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Live tracking active</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-100 shadow-sm'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Market Avg Price</span>
          <span className="text-3xl font-extrabold tracking-tight">₹762 <span className="text-xs font-normal text-slate-400">/mo</span></span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">across 100-300Mbps</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-100 shadow-sm'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Price Undercuts</span>
          <span className="text-3xl font-extrabold text-amber-500 tracking-tight">1 Active</span>
          <span className="text-[10px] text-amber-500 font-semibold block mt-1">Jio ₹699 100Mbps plan</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-100 shadow-sm'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">BFibernet Advantage</span>
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">75% Wins</span>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">3 of 4 ISP plans beaten</span>
        </div>
      </div>

      {/* Main Competitor Price Monitoring Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#212121] border-[#2b2b2b]' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#2d2d2d]">
          <div>
            <h2 className="text-base font-bold">Rival ISP Plans & Price Benchmarks</h2>
            <p className="text-xs text-slate-400 mt-0.5">Scraped broadband plans vs BFibernet pricing</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter ISP or speed..."
              className={`py-1.5 pl-8 pr-3 rounded-xl text-xs font-medium border focus:outline-none transition w-48 md:w-60 ${
                isDark
                  ? 'bg-[#181818] text-[#ececec] border-[#2d2d2d] focus:border-orange-500 placeholder-zinc-600'
                  : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400 focus:border-orange-600'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'border-[#2d2d2d] text-zinc-400 bg-[#1a1a1a]' : 'border-slate-100 text-slate-400 bg-slate-50'
              }`}>
                <th className="py-3.5 px-5">Competitor ISP</th>
                <th className="py-3.5 px-5">Target Plan</th>
                <th className="py-3.5 px-5">Rival Price</th>
                <th className="py-3.5 px-5">BFibernet Rate</th>
                <th className="py-3.5 px-5">Price Delta</th>
                <th className="py-3.5 px-5 text-right">Counter Strategy Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-[#2d2d2d]/50' : 'divide-slate-100'}`}>
              {filteredCompetitors.map((item) => (
                <tr key={item.id} className={isDark ? 'hover:bg-[#262626]' : 'hover:bg-slate-50/80'}>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.logo}</span>
                      <span className="font-bold">{item.provider}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div>
                      <p className="font-semibold">{item.planName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.ottBundles}</p>
                    </div>
                  </td>

                  <td className="py-4 px-5 font-bold font-mono text-slate-300">
                    ₹{item.price}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                  </td>

                  <td className="py-4 px-5 font-bold font-mono text-cyan-400">
                    ₹{item.bfibernetPrice}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                  </td>

                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.statusType === 'winning'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse'
                    }`}>
                      {item.difference}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleTriggerCounterCall(item.provider)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-sm transition flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Launch Counter Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
