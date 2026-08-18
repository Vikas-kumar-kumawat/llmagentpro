import React, { useState } from 'react';
import { 
  Search, 
  RotateCw, 
  Zap, 
  ShieldAlert,
  Phone
} from 'lucide-react';
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
  const [competitors] = useState(DEFAULT_COMPETITORS);
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
    <div className="w-full min-h-screen pb-12 font-['Plus_Jakarta_Sans',sans-serif] bg-[#000000] text-white select-none space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              Competitor Price Monitor <span className="text-[#a1a1aa] font-normal">Agent</span>
            </h1>
            <span className="text-[11px] font-mono text-white bg-[#18181b] border border-[#27272a] px-2.5 py-0.5 rounded-full font-medium">
              agent.competitor
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">
            Autonomous market intelligence engine tracking rival ISP broadband plans, pricing, & auto-generating counter offer call campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-black ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Live ISPs...' : 'Scan Competitor Prices'}</span>
          </button>
        </div>
      </div>

      {/* Action Toast */}
      {callingState.msg && (
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] text-white text-xs font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-white animate-pulse" />
          <span>{callingState.msg}</span>
        </div>
      )}

      {/* Scan Result Agent Intelligence Box */}
      {scanResult && (
        <div className="p-4 rounded-xl border border-[#27272a] bg-[#09090b] text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs uppercase tracking-wider flex items-center gap-2 text-white">
              <ShieldAlert className="w-4 h-4 text-white" />
              AI Market Intelligence Report
            </span>
            <span className="text-[10px] font-mono text-[#a1a1aa]">LangGraph Scraper Engine</span>
          </div>
          <p className="text-xs leading-relaxed text-[#a1a1aa]">{scanResult.recommendation}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium block mb-2">Monitored ISPs</span>
          <span className="text-xl font-bold font-mono text-white">4 Providers</span>
          <span className="text-[10px] text-[#a1a1aa] font-mono block mt-1">Live tracking active</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium block mb-2">Market Avg Price</span>
          <span className="text-xl font-bold font-mono text-white">₹762 <span className="text-xs text-[#a1a1aa] font-normal">/mo</span></span>
          <span className="text-[10px] text-[#a1a1aa] font-mono block mt-1">across 100-300Mbps</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium block mb-2">Price Undercuts</span>
          <span className="text-xl font-bold font-mono text-white">1 Active</span>
          <span className="text-[10px] text-[#a1a1aa] font-mono block mt-1">Jio ₹699 100Mbps plan</span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[#27272a] bg-[#09090b] hover:border-white hover:bg-[#18181b] transition-all">
          <span className="text-xs uppercase tracking-wider text-[#a1a1aa] font-medium block mb-2">BFibernet Advantage</span>
          <span className="text-xl font-bold font-mono text-white">75% Wins</span>
          <span className="text-[10px] text-[#a1a1aa] font-mono block mt-1">3 of 4 ISP plans beaten</span>
        </div>
      </div>

      {/* Main Competitor Price Monitoring Table */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden pt-2">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272a] bg-[#000000]">
          <div>
            <h2 className="text-sm font-semibold text-white">Rival ISP Plans & Price Benchmarks</h2>
            <p className="text-xs text-[#a1a1aa] mt-0.5">Scraped broadband plans vs BFibernet pricing</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter ISP or speed..."
              className="w-full sm:w-48 py-1.5 pl-8 pr-3 rounded-lg text-xs bg-[#000000] text-white border border-[#27272a] focus:border-white focus:outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] bg-[#000000]">
                <th className="py-3 px-4">Competitor ISP</th>
                <th className="py-3 px-4">Target Plan</th>
                <th className="py-3 px-4">Rival Price</th>
                <th className="py-3 px-4">BFibernet Rate</th>
                <th className="py-3 px-4">Price Delta</th>
                <th className="py-3 px-4 text-right">Counter Strategy Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] text-xs">
              {filteredCompetitors.map((item) => (
                <tr key={item.id} className="transition hover:bg-[#18181b] cursor-pointer">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.logo}</span>
                      <span className="font-semibold text-white">{item.provider}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-medium text-white">{item.planName}</p>
                      <p className="text-[10px] text-[#a1a1aa] font-mono">{item.ottBundles}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold font-mono text-white">
                    ₹{item.price}<span className="text-[10px] text-[#a1a1aa] font-normal">/mo</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold font-mono text-white">
                    ₹{item.bfibernetPrice}<span className="text-[10px] text-[#a1a1aa] font-normal">/mo</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase border bg-[#18181b] text-white border-[#27272a]">
                      {item.difference}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleTriggerCounterCall(item.provider)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white text-black border border-white hover:bg-zinc-200 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-black" />
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

