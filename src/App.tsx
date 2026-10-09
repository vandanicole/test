import { useState } from 'react';
import Navbar from './components/Navbar';
import ConfigArchitect from './components/ConfigArchitect';
import CleanIpManager from './components/CleanIpManager';
import CloudflareWorkerTab from './components/CloudflareWorkerTab';
import PackageDownloadTab from './components/PackageDownloadTab';
import DiagnosticsTab from './components/DiagnosticsTab';
import RailwayDeployGuide from './components/RailwayDeployGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState('architect');
  const [selectedCleanIp, setSelectedCleanIp] = useState('104.17.209.9');

  const handleSelectCleanIp = (ip: string) => {
    setSelectedCleanIp(ip);
    setActiveTab('architect');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'architect' && (
          <ConfigArchitect initialCleanIp={selectedCleanIp} />
        )}

        {activeTab === 'railway' && (
          <RailwayDeployGuide />
        )}

        {activeTab === 'cleanip' && (
          <CleanIpManager onSelectIp={handleSelectCleanIp} />
        )}

        {activeTab === 'worker' && (
          <CloudflareWorkerTab />
        )}

        {activeTab === 'package' && (
          <PackageDownloadTab />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsTab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>توسعه‌یافته برای دور زدن فیلترینگ و پایداری اتصال در شبکه ملی ایران</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>سازگار با VLESS WS و XHTTP</span>
            <span>•</span>
            <span>پشتیبانی از Railway & Cloudflare</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
