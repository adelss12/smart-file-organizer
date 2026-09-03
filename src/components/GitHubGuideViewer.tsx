import React, { useState } from 'react';
import { Download, Printer, Check, Copy, ExternalLink, GitBranch, Terminal, Sparkles, BookOpen } from 'lucide-react';
import { downloadWordDoc } from '../data/githubGuideContent';

export const GitHubGuideViewer: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    downloadWordDoc();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const commands = [
    { label: '1. تهيئة المستودع المحلي', cmd: 'git init' },
    { label: '2. إضافة كافة الملفات للرفع', cmd: 'git add .' },
    { label: '3. حفظ النسخة الأولى مع تعليق', cmd: 'git commit -m "Initial commit: Smart File Organizer"' },
    { label: '4. تسمية الفرع الرئيسي', cmd: 'git branch -M main' },
    { label: '5. ربط المستودع برابط GitHub (استبدل الرابط برابطك)', cmd: 'git remote add origin https://github.com/اسم_حسابك/smart-file-organizer.git' },
    { label: '6. رفع الملفات إلى GitHub', cmd: 'git push -u origin main' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with prominent Download Actions */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                ملف Word جاهز للطباعة
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                دليل رفع المشروع إلى GitHub للمبتدئين
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              تم إعداد هذا المستند خطوة بخطوة باللغة العربية مع الأوامر والتنبيهات. يمكنك تحميله فوراً بصيغة <span className="text-emerald-400 font-bold font-mono">Word (.doc)</span> أو طباعته أو قراءته أدناه.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'تم التحميل بنجاح! ✓' : 'تحميل ملف Word (.doc)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الدليل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Content Display */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 text-slate-200">
        
        {/* Method 1 */}
        <section className="space-y-4 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            <h3>الطريقة الأولى: التصدير المباشر التلقائي من زر Export (الأسهل والأسرع)</h3>
          </div>
          <p className="text-sm text-slate-400">
            هذه الطريقة لا تتطلب كتابة أي أوامر، وتعتمد على القائمة التي التقطت صورتها في سؤالك:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>في شريط الأدوات العلوي لنافذة Google AI Studio، اضغط على زر <strong>Export</strong> (الذي ظهر في صورتك).</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>اختر الخيار الثاني: <strong className="text-sky-300 font-mono">Push to GitHub</strong> (Sync to a repository).</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
              <span>ستفتح لك نافذة للموافقة على ربط حسابك في GitHub، اضغط <strong>Authorize</strong>.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
              <span>اكتب اسماً للمستودع (مثال: <code className="text-amber-300 font-mono">smart-file-organizer</code>) واضغط <strong>Create & Push</strong>.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
              <span>سيتم رفع كافة الملفات تلقائياً مع الشرح العربي وفتح رابط مستودعك الجديد فوراً!</span>
            </div>
          </div>
        </section>

        {/* Method 2 */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
            <Terminal className="w-5 h-5" />
            <h3>الطريقة الثانية: تنزيل المشروع ورفعه من الكمبيوتر خطوة بخطوة</h3>
          </div>

          <div className="space-y-5 text-sm">
            {/* Step 1 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-100 text-base">1. تنزيل المشروع كملف مضغوط:</h4>
              <p className="text-slate-400">
                من نفس قائمة Export في صورتك، اضغط على الخيار الثالث: <strong className="text-sky-300 font-mono">Download as .zip file</strong>، ثم فك ضغط الملف على جهازك.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-100 text-base">2. إنشاء مستودع جديد على GitHub:</h4>
              <p className="text-slate-400">
                ادخل على <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">github.com</a>، واضغط على علامة <strong>(+)</strong> ثم <strong>New repository</strong>.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-xs leading-relaxed">
                <strong>⚠️ تنبيه هام جداً:</strong> لا تضع إشارة صح أمام (Add README) أو (Add .gitignore)، اتركها فارغة تماماً لأننا جهزناها لك مسبقاً داخل المشروع!
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-100 text-base">3. أوامر الرفع عبر موجه الأوامر (Terminal / Git Bash):</h4>
              <p className="text-slate-400">
                افتح المجلد المستخرج على حاسوبك، وافتح فيه موجه الأوامر ثم انسخ هذه الأوامر بالتسلسل:
              </p>

              <div className="space-y-3 pt-2">
                {commands.map((c, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-300">{c.label}</span>
                      <button
                        onClick={() => copyCommand(c.cmd, idx)}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ الأمر</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-sky-300 font-mono text-xs overflow-x-auto p-2 bg-slate-950 rounded-lg text-left dir-ltr">
                      {c.cmd}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Callout */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            للحصول على هذا الشرح كاملاً مطبوعاً، اضغط على زر التحميل بالأعلى لفتح ملف الوورد وتعديله أو طباعته على ورق A4.
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>تحميل ملف Word (.doc) الآن</span>
          </button>
        </div>

      </div>
    </div>
  );
};
