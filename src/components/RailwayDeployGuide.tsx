import { useState } from 'react';
import { 
  Server, HardDrive, Key, Globe, Terminal, 
  ExternalLink, CheckCircle2, ChevronRight, Copy, Check, AlertTriangle 
} from 'lucide-react';

export default function RailwayDeployGuide() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const steps = [
    {
      step: '۱',
      title: 'فورک یا ساخت ریپازیتوری در گیت‌هاب',
      desc: 'وارد گیت‌هاب شوید و ریپازیتوری PXPanel را Fork کنید، یا یک ریپازیتوری جدید ساخته و فایل‌های اصلاح‌شده پکیج (main.py, requirements.txt, railway.json) را در آن قرار دهید.',
      badge: 'GitHub',
      link: 'https://github.com/iran-px-panel/pxpanel',
      linkText: 'صفحه ریپازیتوری اصلی',
    },
    {
      step: '۲',
      title: 'اتصال ریپازیتوری به Railway',
      desc: 'در سایت Railway لاگین کنید، دکمه «New Project» را بزنید، گزینه «Deploy from GitHub repo» را انتخاب کرده و مخزن فورک‌شده را انتخاب کنید.',
      badge: 'Railway Dashboard',
      link: 'https://railway.app/new',
      linkText: 'ورود به Railway',
    },
    {
      step: '۳',
      title: 'اتصال دیسک دائمی (Volume) برای ذخیره نشدن اطلاعات',
      desc: 'به تب Settings سرویس بروید، بخش Volumes را پیدا کنید و دکمه «+ Add Volume» را بزنید. مسیر را دقیقاً برابر با /data بگذارید تا با ری‌استارت سرور، کانفیگ‌ها پاک نشوند.',
      badge: 'مهم برای پایداری داده',
    },
    {
      step: '۴',
      title: 'تنظیم متغیرهای محیطی (Environment Variables)',
      desc: 'به تب Variables در پروژه خود در ریل‌وی بروید و متغیرهای لازم را مطابق جدول زیر اضافه کنید.',
      badge: 'تنظیمات امنیتی',
    },
    {
      step: '۵',
      title: 'فعال‌سازی دامنه اینترنتی (Generate Domain)',
      desc: 'در تب Settings بخش Networking روی دکمه «Generate Domain» کلیک کنید تا آدرس اینترنتی شما (مثل xxx.up.railway.app) صادر شود.',
      badge: 'آدرس نهایی',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          آموزش گام‌به‌گام دیپلوی PXPanel روی سرویس ابری Railway
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          سرویس Railway به شما امکان می‌دهد این پروژه پایتونی را بدون نیاز به سرور لینوکس و به صورت کاملاً ابری در کمتر از ۵ دقیقه اجرا کنید.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div
            key={s.step}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-cyan-500/20">
                {s.step}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">{s.title}</h3>
                  <span className="text-[11px] bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>

            {s.link && (
              <a
                href={s.link}
                target="_blank"
                rel="noreferrer"
                className="self-start md:self-center shrink-0 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>{s.linkText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Variables Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          متغیرهای محیطی ضروری (Variables) در Railway
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">نام متغیر (Variable)</th>
                <th className="p-3">مقدار پیشنهادی</th>
                <th className="p-3">کاربرد</th>
                <th className="p-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="p-3 font-bold text-cyan-300">ADMIN_PASSWORD</td>
                <td className="p-3 text-slate-200">pxpanel2026</td>
                <td className="p-3 font-sans text-slate-400">رمز عبور ورود به داشبورد ادمین</td>
                <td className="p-3">
                  <button
                    onClick={() => copyText('v1', 'ADMIN_PASSWORD')}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'v1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-cyan-300">DATA_DIR</td>
                <td className="p-3 text-slate-200">/data</td>
                <td className="p-3 font-sans text-slate-400">مسیر ذخیره پایدار دیتابیس و اکانت‌ها</td>
                <td className="p-3">
                  <button
                    onClick={() => copyText('v2', 'DATA_DIR')}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'v2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-cyan-300">TELEGRAM_BOT_TOKEN</td>
                <td className="p-3 text-slate-200">(اختیاری) توکن ربات</td>
                <td className="p-3 font-sans text-slate-400">برای فعال‌سازی ربات تلگرام پی‌ایکس</td>
                <td className="p-3">
                  <button
                    onClick={() => copyText('v3', 'TELEGRAM_BOT_TOKEN')}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'v3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-cyan-300">TELEGRAM_ADMIN_IDS</td>
                <td className="p-3 text-slate-200">(اختیاری) آیدی عددی شما</td>
                <td className="p-3 font-sans text-slate-400">شناسه تلگرام ادمین‌های ربات</td>
                <td className="p-3">
                  <button
                    onClick={() => copyText('v4', 'TELEGRAM_ADMIN_IDS')}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'v4' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Tip for Iran */}
      <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <h4 className="font-bold text-amber-300">نکته حیاتی برای دسترسی به داشبورد در داخل ایران:</h4>
          <p className="text-slate-300 leading-relaxed">
            پس از ساخت دامنه در ریل‌وی، آدرس آن به شکل <code className="text-cyan-300 font-mono">https://xxx.up.railway.app/dashboard</code> خواهد بود. از آنجا که این دامنه در ایران فیلتر است، برای ورود اولیه به پنل باید یک‌بار فیلترشکن خود را روشن کنید یا از <strong>ورکر کلودفلر (تب سوم)</strong> برای باز کردن داشبورد بدون فیلتر استفاده نمایید.
          </p>
        </div>
      </div>
    </div>
  );
}
