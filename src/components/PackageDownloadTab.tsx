import { useState } from 'react';
import { FileCode, Copy, Check, Download, Layers, ShieldCheck, Terminal } from 'lucide-react';
import { PACKAGE_FILES } from '../data/packageCode';
import { PackageFile } from '../types';

export default function PackageDownloadTab() {
  const [selectedFile, setSelectedFile] = useState<PackageFile>(PACKAGE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = (file: PackageFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            بسته کامل فایل‌های پروژه (سورس پایتون، ریل‌وی و ورکر)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            این فایل‌ها کلیه باگ‌های تفکیک SNI و Clean IP در PXPanel را رفع کرده و برای دیپلوی در ایران آماده‌اند.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadSingle(selectedFile)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            دانلود فایل جاری ({selectedFile.filename})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File List Navigation */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block px-1">
            لیست فایل‌های پکیج:
          </span>
          <div className="space-y-1.5">
            {PACKAGE_FILES.map((file) => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <FileCode className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-2">
                      <span dir="ltr" className="font-mono">{file.filename}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {file.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Content Preview */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <span dir="ltr" className="text-xs font-mono font-bold text-cyan-300">
                {selectedFile.filename}
              </span>
              <p className="text-[11px] text-slate-400">
                {selectedFile.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'کپی شد' : 'کپی محتوا'}
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-slate-950 p-4 max-h-[500px] overflow-y-auto">
            <pre dir="ltr" className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
