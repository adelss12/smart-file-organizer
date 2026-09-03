import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode2, 
  Terminal, 
  Info, 
  ExternalLink,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { PYTHON_GUI_SCRIPT, PYTHON_CLI_SCRIPT } from '../data/pythonTemplates';

export const PythonScriptViewer: React.FC = () => {
  const [activeScript, setActiveScript] = useState<'gui' | 'cli'>('gui');
  const [copied, setCopied] = useState(false);

  const currentCode = activeScript === 'gui' ? PYTHON_GUI_SCRIPT : PYTHON_CLI_SCRIPT;
  const fileName = activeScript === 'gui' ? 'organizer_gui.py' : 'organizer_cli.py';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Header card with action buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl font-bold text-white">
              كود بايثون الجاهز للتحميل والتشغيل على جهازك
            </h2>
          </div>
          <p className="text-slate-400 text-sm">
            كود نظيف متكامل جاهز ومكتوب خصيصاً بدون الحاجة لتثبيت أي مكتبة إضافية (<code className="text-sky-300 font-mono">pip</code>)!
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">تم النسخ بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>نسخ الكود</span>
              </>
            )}
          </button>

          <button
            id="download-code-btn"
            onClick={handleDownload}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تحميل ملف ({fileName})</span>
          </button>
        </div>
      </div>

      {/* Script Selector Tabs & Instructions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveScript('gui')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeScript === 'gui'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>نسخة الواجهة الرسومية (Tkinter GUI)</span>
          </button>

          <button
            onClick={() => setActiveScript('cli')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeScript === 'cli'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>نسخة سطر الأوامر (CLI)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <Laptop className="w-4 h-4 text-sky-400" />
          متوافق بالكامل مع أنظمة Windows و Mac و Linux
        </span>
      </div>

      {/* How to run card */}
      <div className="bg-sky-950/20 border border-sky-500/20 rounded-xl p-4 text-xs sm:text-sm text-sky-200 space-y-2">
        <div className="font-bold flex items-center gap-2 text-sky-300">
          <Info className="w-4 h-4" />
          طريقة التشغيل على جهاز الكمبيوتر الخاص بك:
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-300 mr-2">
          <li>حمّل الملف أعلاه بالضغط على زر <strong>تحميل ملف ({fileName})</strong>.</li>
          <li>ضعه في أي مجلد تريده على جهازك.</li>
          <li>
            انقر عليه مرتين لفتحه مباشرة، أو افتح موجه الأوامر (CMD/Terminal) واكتب:
            <code className="mx-2 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 font-mono" dir="ltr">
              python {fileName}
            </code>
          </li>
          <li>ستفتح لك الواجهة الرسومية فوراً، اختر المجلد أو اتركه للمجلد الحالي، واضغط "بدء الفحص والتنظيم".</li>
        </ol>
      </div>

      {/* Code Display Frame */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="font-mono text-slate-300 mr-2">{fileName}</span>
          </div>
          <span className="text-slate-500 font-mono">Python 3.8+ (Zero Dependencies)</span>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto max-h-[550px] overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-300" dir="ltr">
          <pre>
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
