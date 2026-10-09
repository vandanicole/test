import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Copy, Check, QrCode, RefreshCw, Globe, Server, 
  Wifi, Sliders, ExternalLink, ArrowRight, Info
} from 'lucide-react';
import { ConfigOptions, ProtocolType } from '../types';
import { generateVlessLink, generateSubscription } from '../utils/vlessGenerator';

interface ConfigArchitectProps {
  initialCleanIp?: string;
}

export default function ConfigArchitect({ initialCleanIp = '' }: ConfigArchitectProps) {
  const [options, setOptions] = useState<ConfigOptions>({
    uuid: 'a89c3ef1-285b-4221-a53d-8869c943fbe2',
    railwayDomain: 'pxpanel-production.up.railway.app',
    sni: 'cf-tunnel.yourdomain.com',
    hostHeader: 'pxpanel-production.up.railway.app',
    cleanIp: initialCleanIp || '104.17.209.9',
    port: 443,
    protocol: 'vless-ws',
    path: '',
    fingerprint: 'chrome',
    alpn: 'http/1.1',
    remark: 'PX-Iran-Bypass',
    allowInsecure: false,
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSub, setCopiedSub] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update cleanIp if passed from parent
  useEffect(() => {
    if (initialCleanIp) {
      setOptions((prev) => ({ ...prev, cleanIp: initialCleanIp }));
    }
  }, [initialCleanIp]);

  const activeLink = generateVlessLink(options);
  const sampleCleanIps = [options.cleanIp, '104.16.132.229', '162.159.192.1'].filter(Boolean);
  const subscriptionBase64 = generateSubscription(options, sampleCleanIps);

  // Generate QR code when link changes
  useEffect(() => {
    if (activeLink) {
      QRCode.toDataURL(activeLink, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#f8fafc',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [activeLink]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySub = () => {
    navigator.clipboard.writeText(subscriptionBase64);
    setCopiedSub(true);
    setTimeout(() => setCopiedSub(false), 2000);
  };

  const generateRandomUuid = () => {
    const newUuid = crypto.randomUUID();
    setOptions((prev) => ({ ...prev, uuid: newUuid }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Alert */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-800/40 rounded-2xl p-4 sm:p-5 text-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-300">چگونه این کانفیگ فیلترینگ را دور می‌زند؟</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              در تنظیمات زیر، <strong className="text-cyan-300">آدرس اتصال (Address)</strong> روی آی‌پی تمیز کلودفلر قرار دارد که پورت ۴۴۳ آن در ایران باز است، اما <strong className="text-cyan-300">SNI</strong> روی دامنه‌ای سالم (ورکر یا دامنه CDN شخصی) تنظیم می‌شود. بدین ترتیب سیستم فیلترینگ DPI قادر به شناسایی یا بلاک کردن دامنه ریل‌وی شما نیست!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              تنظیمات تخصصی SNI و پروتکل
            </h2>
            <button
              onClick={generateRandomUuid}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
              title="تولید شناسه جدید"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              UUID تصادفی
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Protocol */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                نوع پروتکل و ترابرد:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'vless-ws', label: 'VLESS (WS)' },
                  { id: 'xhttp-packet-up', label: 'XHTTP (packet)' },
                  { id: 'xhttp-stream-up', label: 'XHTTP (stream)' },
                  { id: 'vmess-ws', label: 'VMess (WS)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOptions((p) => ({ ...p, protocol: item.id as ProtocolType }))}
                    className={`px-3 py-2 rounded-xl text-center font-medium transition-all ${
                      options.protocol === item.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Railway Domain & SNI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  دامنه پروژه در Railway:
                </label>
                <input
                  type="text"
                  value={options.railwayDomain}
                  onChange={(e) => setOptions((p) => ({ ...p, railwayDomain: e.target.value }))}
                  placeholder="مثال: my-px.up.railway.app"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  دامنه SNI (ورکر یا دامین شخصی):
                </label>
                <input
                  type="text"
                  value={options.sni}
                  onChange={(e) => setOptions((p) => ({ ...p, sni: e.target.value }))}
                  placeholder="مثال: px.myworker.workers.dev"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Clean IP & Host Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-amber-400" />
                  آی‌پی تمیز کلودفلر (Clean IP):
                </label>
                <input
                  type="text"
                  value={options.cleanIp}
                  onChange={(e) => setOptions((p) => ({ ...p, cleanIp: e.target.value }))}
                  placeholder="مثال: 104.17.209.9"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  می‌توانید از تب «آی‌پی‌های تمیز ایران» انتخاب کنید.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  هدر میزبان (Host Header):
                </label>
                <input
                  type="text"
                  value={options.hostHeader}
                  onChange={(e) => setOptions((p) => ({ ...p, hostHeader: e.target.value }))}
                  placeholder="معمولاً همان دامنه ریل‌وی یا ورکر"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* UUID & Remark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">شناسه کاربر (UUID):</label>
                <input
                  type="text"
                  value={options.uuid}
                  onChange={(e) => setOptions((p) => ({ ...p, uuid: e.target.value }))}
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">نام نمایشی (Remark):</label>
                <input
                  type="text"
                  value={options.remark}
                  onChange={(e) => setOptions((p) => ({ ...p, remark: e.target.value }))}
                  placeholder="PX-Iran-Bypass"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Fingerprint & ALPN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Fingerprint (uTLS):</label>
                <select
                  value={options.fingerprint}
                  onChange={(e) => setOptions((p) => ({ ...p, fingerprint: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="chrome">Chrome (پیشنهادی)</option>
                  <option value="safari">Safari / iOS</option>
                  <option value="firefox">Firefox</option>
                  <option value="edge">Edge</option>
                  <option value="random">Randomized</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">ALPN:</label>
                <select
                  value={options.alpn}
                  onChange={(e) => setOptions((p) => ({ ...p, alpn: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="http/1.1">http/1.1 (برای WS)</option>
                  <option value="h2,http/1.1">h2,http/1.1 (برای XHTTP)</option>
                  <option value="h3">h3 (برای Hysteria/TUIC)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">پورت اتصال:</label>
                <input
                  type="number"
                  value={options.port}
                  onChange={(e) => setOptions((p) => ({ ...p, port: Number(e.target.value) || 443 }))}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Config Card & QR Code */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Output Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                لینک تولید شده نهایی
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                آماده اتصال در ایران
              </span>
            </div>

            <div className="relative">
              <div 
                dir="ltr" 
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 break-all max-h-36 overflow-y-auto leading-relaxed select-all"
              >
                {activeLink}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'کپی شد!' : 'کپی لینک کانفیگ'}
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                {showQr ? 'بستن بارکد' : 'مشاهده QR Code'}
              </button>
            </div>

            {/* QR Code Display */}
            {showQr && qrDataUrl && (
              <div className="pt-4 border-t border-slate-800 flex flex-col items-center animate-fadeIn">
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                  <img src={qrDataUrl} alt="VLESS QR Code" className="w-56 h-56 rounded-lg" />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  اسکن مستقیم در v2rayNG، MahsaNG، NekoBox و Streisand
                </p>
              </div>
            )}
          </div>

          {/* Subscription Link Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                لینک سابسکریپشن ترکیبی (Clean IP Rotation)
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              شامل ۳ آی‌پی تمیز همراه اول، ایرانسل و مخابرات برای جابه‌جایی خودکار در صورت کندی شبکه.
            </p>

            <button
              onClick={handleCopySub}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              {copiedSub ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSub ? 'کد ساب کپی شد!' : 'کپی خروجی سابسکریپشن (Base64)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
