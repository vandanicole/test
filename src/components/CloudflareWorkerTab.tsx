import { useState } from 'react';
import { Sparkles, Copy, Check, ExternalLink, HelpCircle, Server, Terminal } from 'lucide-react';

export default function CloudflareWorkerTab() {
  const [railwayDomain, setRailwayDomain] = useState('pxpanel-production.up.railway.app');
  const [copiedCode, setCopiedCode] = useState(false);

  const cleanBackend = railwayDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

  const workerCode = `/**
 * Cloudflare Worker Reverse Proxy for PXPanel
 * هماهنگ با پروتکل‌های VLESS-WS و XHTTP
 * بدون نیاز به خرید دامنه - قابل اجرا روی زیردامنه رایگان *.workers.dev
 */

const BACKEND_DOMAIN = "${cleanBackend || 'your-app-name.up.railway.app'}";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get("Upgrade");

    // آدرس‌دهی به سرور اصلی Railway با پروتکل امن HTTPS
    const targetUrl = new URL(request.url);
    targetUrl.hostname = BACKEND_DOMAIN;
    targetUrl.protocol = "https:";

    // تنظیم هدرهای شبکه و انتقال هویت کلاینت
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", BACKEND_DOMAIN);
    newHeaders.set("X-Forwarded-Host", url.hostname);
    newHeaders.set("X-Real-IP", request.headers.get("CF-Connecting-IP") || "127.0.0.1");

    // پشتیبانی اختصاصی از وب‌سوکت (VLESS WebSocket)
    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      return fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.body,
      });
    }

    // هدایت درخواست‌های عمومی و XHTTP
    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
        redirect: "follow",
      });

      return response;
    } catch (err) {
      return new Response("PXPanel Gateway Error: " + err.message, {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  },
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(workerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            ورکر کلودفلر؛ حل فیلترینگ دامنه‌های Railway بدون هزینه
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          دامنه‌های <code className="text-pink-400 bg-pink-950/40 px-1.5 py-0.5 rounded border border-pink-900/40">*.up.railway.app</code> در ایران مسدود هستند. با این روش، شما بدون نیاز به خرید دامنه، یک اسکریپت رایگان روی کلودفلر نصب می‌کنید که نقش تونل واسط را بازی می‌کند و فیلترینگ را دور می‌زند.
        </p>

        {/* Input railway domain */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            آدرس پروژه Railway شما:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={railwayDomain}
                onChange={(e) => setRailwayDomain(e.target.value)}
                placeholder="my-px.up.railway.app"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs sm:text-sm"
              />
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all shrink-0 active:scale-95"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'کد کپی شد!' : 'کپی اسکریپت ورکر'}
            </button>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            cloudflare_worker.js
          </span>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
            آماده دیپلوی در Cloudflare
          </span>
        </div>
        <pre dir="ltr" className="p-4 sm:p-5 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto leading-relaxed">
          {workerCode}
        </pre>
      </div>

      {/* Steps Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          آموزش گام‌به‌گام فعال‌سازی در Cloudflare (کمتر از ۲ دقیقه):
        </h3>
        <ol className="list-decimal list-inside space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed pr-1">
          <li>وارد سایت <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-mono">dash.cloudflare.com</a> شوید.</li>
          <li>از منوی کناری به بخش <strong className="text-white">Workers & Pages</strong> رفته و روی <strong className="text-white">Create application</strong> کلیک کنید.</li>
          <li>یک نام دلخواه انتخاب کرده و <strong className="text-white">Deploy</strong> را بزنید.</li>
          <li>روی <strong className="text-white">Edit code</strong> کلیک کرده، کدهای قبلی را حذف و کد بالا را پیست کنید.</li>
          <li>روی دکمه آبی رنگ <strong className="text-white">Save and Deploy</strong> کلیک کنید.</li>
          <li>
            تبریک! لینک ورکر شما (مثلاً <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">px.yourname.workers.dev</code>) ساخته شد. این آدرس را در تب <strong>کانفیگ‌ساز</strong> به عنوان <strong className="text-white">SNI</strong> قرار دهید.
          </li>
        </ol>
      </div>
    </div>
  );
}
