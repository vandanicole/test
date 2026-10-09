import { Shield, Sparkles, Terminal, Activity, FileCode } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: 'architect', label: 'کانفیگ‌ساز و SNI', icon: Shield },
    { id: 'railway', label: 'آموزش دیپلوی Railway', icon: Server },
    { id: 'cleanip', label: 'آی‌پی‌های تمیز ایران', icon: Activity },
    { id: 'worker', label: 'ورکر کلودفلر (رایگان)', icon: Sparkles },
    { id: 'package', label: 'پکیج کدها و فایل‌ها', icon: FileCode },
    { id: 'diagnostics', label: 'تحلیل فیلترینگ', icon: Terminal },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
              PX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">PXPanel Hub</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  نسخه ایران v13.9.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                معماری SNI سفارشی، آی‌پی تمیز و ریورس پروکسی ضد فیلتر
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
