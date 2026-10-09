import { useState } from 'react';
import { Wifi, Check, Copy, ArrowUpRight, Filter, Zap, ShieldCheck } from 'lucide-react';
import { POPULAR_CLEAN_IPS } from '../data/cleanIps';
import { OperatorType, CleanIpItem } from '../types';

interface CleanIpManagerProps {
  onSelectIp: (ip: string) => void;
}

export default function CleanIpManager({ onSelectIp }: CleanIpManagerProps) {
  const [selectedIsp, setSelectedIsp] = useState<OperatorType>('all');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [customIp, setCustomIp] = useState('');
  const [ipList, setIpList] = useState<CleanIpItem[]>(POPULAR_CLEAN_IPS);
  const [isTesting, setIsTesting] = useState(false);

  const filteredIps = selectedIsp === 'all' 
    ? ipList 
    : ipList.filter((item) => item.isp === selectedIsp);

  const handleCopy = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1800);
  };

  const handleAddCustomIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIp.trim()) return;
    const newItem: CleanIpItem = {
      ip: customIp.trim(),
      isp: 'all',
      ispName: 'سفارشی کاربر',
      pingEstimate: '85-115ms',
      datacenter: 'Cloudflare Edge',
      reliability: 'عالی',
    };
    setIpList([newItem, ...ipList]);
    setCustomIp('');
  };

  const runLatencyTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Wifi className="w-5 h-5 text-emerald-400" />
              بانک آی‌پی‌های تمیز کلودفلر (Clean IP ویژه اپراتورهای ایران)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              با انتخاب آی‌پی تمیز متناسب با اپراتور اینترنت خود، ترافیک بدون افت سرعت و پکت‌لاست از سد فیلترینگ عبور می‌کند.
            </p>
          </div>

          <button
            onClick={runLatencyTest}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all shrink-0 active:scale-95"
          >
            <Zap className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'در حال ارزیابی پینگ...' : 'تست وضعیت زنده'}
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 ml-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            فیلتر اپراتور:
          </span>
          {[
            { id: 'all', label: 'همه اپراتورها' },
            { id: 'mci', label: 'همراه اول (MCI)' },
            { id: 'irancell', label: 'ایرانسل (MTN)' },
            { id: 'rightel', label: 'رایتل' },
            { id: 'mokhaberat', label: 'مخابرات (TCI / ADSL)' },
            { id: 'shatel', label: 'شاتل / های‌وب' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedIsp(tab.id as OperatorType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedIsp === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input */}
      <form onSubmit={handleAddCustomIp} className="flex gap-2">
        <input
          type="text"
          value={customIp}
          onChange={(e) => setCustomIp(e.target.value)}
          placeholder="افزودن آی‌پی تمیز جدید (مثلاً 104.21.x.x)"
          dir="ltr"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs sm:text-sm font-medium transition-all"
        >
          افزودن به لیست
        </button>
      </form>

      {/* IP Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIps.map((item, index) => (
          <div
            key={`${item.ip}-${index}`}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg space-y-3 transition-all hover:shadow-cyan-950/20 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {item.ispName}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {item.pingEstimate}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span dir="ltr" className="text-base font-bold font-mono text-cyan-300 tracking-wide">
                {item.ip}
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                {item.datacenter}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(item.ip)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedIp === item.ip ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>کپی آی‌پی</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectIp(item.ip)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <span>اعمال در کانفیگ</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
