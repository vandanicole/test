import { ShieldAlert, CheckCircle2, XCircle, ArrowLeft, Cpu, Globe, Lock, ShieldCheck } from 'lucide-react';

export default function DiagnosticsTab() {
  return (
    <div className="space-y-6">
      {/* Visual Diagnostic Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            تحلیل فنی و مقایسه جریان ترافیک قبل و بعد از اعمال SNI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            بررسی دلایل مسدودسازی در لایه TLS Handshake و راهکار عبور از سیستم فیلترینگ DPI.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Blocked Flow */}
          <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>جریان ترافیک مسدود شده (حالت پیش‌فرض ریپازیتوری)</span>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-red-900/30 text-slate-300">
              <div className="flex items-center justify-between text-red-300">
                <span>1. کلاینت (v2rayNG)</span>
                <span>درخواست اتصال به Railway</span>
              </div>
              <div className="text-slate-500 text-[11px] py-1 border-y border-slate-800">
                TLS ClientHello (SNI: *.up.railway.app)
              </div>
              <div className="text-amber-400 font-medium">
                2. فایروال ایران (DPI) ➜ شناسایی نام دامنه در هدر SNI
              </div>
              <div className="text-red-400 font-bold">
                3. نتیجه: ریست اتصال (TCP RST) یا Timeout بلافاصله!
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              سیستم فیلترینگ کلمات کلیدی موجود در SNI را پیش از رمزنگاری بررسی کرده و اجازه برقراری ارتباط با دامنه‌های ریل‌وی را نمی‌دهد.
            </p>
          </div>

          {/* Fixed Flow */}
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>جریان ترافیک موفق (با تفکیک SNI و Clean IP)</span>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-emerald-900/30 text-slate-300">
              <div className="flex items-center justify-between text-emerald-300">
                <span>1. کلاینت (v2rayNG)</span>
                <span>اتصال به آی‌پی تمیز کلودفلر</span>
              </div>
              <div className="text-slate-500 text-[11px] py-1 border-y border-slate-800">
                TLS ClientHello (SNI: دامنه ورکر یا دامین سالم)
              </div>
              <div className="text-emerald-400 font-medium">
                2. عبور امن از فایروال ➜ چون SNI و آی‌پی معتبر و آزاد هستند
              </div>
              <div className="text-cyan-300 font-bold">
                3. لایه کلودفلر ➜ هدایت ترافیک به Railway و برقراری اینترنت!
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              با تنظیم SNI روی دامنه ورکر یا دامنه CDN شخصی، فایروال متوجه مقصد واقعی سرور نشده و داده‌ها بدون قطعی منتقل می‌شوند.
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          چک‌لیست رفع خطاهای متداول اتصال در ایران
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-slate-200">خطای handshake failed / timeout</div>
            <p className="text-xs text-slate-400">
              آی‌پی تمیز در اپراتور شما مسدود شده است. از تب «آی‌پی‌های تمیز ایران» یک آی‌پی دیگر مربوط به اپراتور خود انتخاب کنید.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-slate-200">خطای 502 Bad Gateway در ورکر</div>
            <p className="text-xs text-slate-400">
              آدرس سرور Railway در متغیر <code className="text-cyan-300 font-mono">BACKEND_DOMAIN</code> ورکر اشتباه وارد شده یا سرور ریل‌وی خوابیده (Sleep) است.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-slate-200">کندی شدید سرعت و پکت‌لاست</div>
            <p className="text-xs text-slate-400">
              پروتکل را از VLESS-WS به <strong className="text-cyan-300">XHTTP (mode: packet-up یا stream-up)</strong> تغییر دهید تا سربار وب‌سوکت حذف شود.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-slate-200">خطای certificate error / invalid SNI</div>
            <p className="text-xs text-slate-400">
              مطمئن شوید که فیلد SNI حاوی آی‌پی عددی نیست و حتماً نام دامنه (مثل workers.dev یا دامنه خودتان) است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
