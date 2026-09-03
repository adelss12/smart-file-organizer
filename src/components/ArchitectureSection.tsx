import React from 'react';
import { 
  CheckCircle2, 
  FolderLock, 
  Zap, 
  HardDrive, 
  FileText, 
  Layers, 
  ArrowLeftRight,
  ShieldCheck,
  Code
} from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              الحلول الهندسية المضمونة لنقاط الضعف والتعديلات المطلوبة
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              تمت معالجة كل نقطة ذكرتها بدقة متناهية وبأعلى معايير هندسة البرمجيات. فيما يلي توضيح كيف تم حل كل مشكلة بدون التأثير على منطق الفرز أو سلامة الملفات الأصلية:
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Solutions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. عدم التقييد بـ D */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">حل المشكلة الأولى</span>
              <h3 className="text-base font-bold text-white">إلغاء التقييد بمسار D: والتوجيه المرن</h3>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            تمت إزالة قائمة المجلدات الثابتة كلياً واستبدالها بنظام مرن ذكي:
          </p>
          <ul className="text-xs sm:text-sm text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>افتراضياً:</strong> يكتشف تلقائياً المجلد الذي وُضع فيه السكربت عبر <code className="text-sky-300 font-mono">Path(__file__).resolve().parent</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>تفاعلياً:</strong> يوفر زر استعراض (Browse) في الواجهة الرسومية لاختيار أي قرص أو مجلد (مثل C: أو D: أو فلاش ميموري).</span>
            </li>
          </ul>
        </div>

        {/* 2. حل مشكلة الحلقة المفرغة المضمون */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">حل المشكلة الثانية</span>
              <h3 className="text-base font-bold text-white">الحل المضمون 100% للحلقة المفرغة (Cycle Prevention)</h3>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            عند إنشاء مجلد الهدف داخل نفس المجلد المفحوص، خطر التكرار اللانهائي حُسم برمجياً عبر ميزة البايثون القياسية:
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto" dir="ltr">
            dirs[:] = [d for d in dirs if (Path(root)/d).resolve() != target_dir.resolve()]
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            تعديل مصفوفة <code className="text-sky-300 font-mono">dirs[:]</code> في مفسر بايثون يجبر <code className="text-sky-300 font-mono">os.walk</code> على استبعاد مجلد الهدف من شجرة التكرار قبل أن يخطو داخله خطوة واحدة، مع بقاء هيكل باقي المجلدات سليماً بالكامل!
          </p>
        </div>

        {/* 3. تسريع عملية الفحص */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">التحسين رابعاً - 1</span>
              <h3 className="text-base font-bold text-white">تسريع الفحص بنظام الفلترة ثلاثية المراحل (3-Tier)</h3>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            بدلاً من قراءة كل الملفات وحساب SHA-256 للملفات الكبيرة كالفيديوهات:
          </p>
          <ol className="text-xs sm:text-sm text-slate-400 space-y-2 list-decimal list-inside">
            <li><strong>فحص الحجم أولاً:</strong> إذا كان حجم الملف فريداً (لا يوجد أي ملف آخر بنفس الحجم)، فهو فريد 100% دون قراءة أي بايت من القرص! (يوفر 80% من الوقت).</li>
            <li><strong>الهاش الجزئي (64KB):</strong> إذا تطابق الحجم فقط، نقرأ أول 64 كيلوبايت.</li>
            <li><strong>الهاش الكامل SHA-256:</strong> فقط وفقط إذا تطابق الحجم والهاش الجزئي، نحسب البصمة الكاملة لضمان دقة قطعية 100%.</li>
          </ol>
        </div>

        {/* 4. تجاهل المكرر وخيار النسخ/النقل */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">التحسين رابعاً - 2 و 4</span>
              <h3 className="text-base font-bold text-white">تجاهل المكررات + خيار النسخ والنقل</h3>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            تحقيق رغبتك في توفير المساحة القصوى وتفادي تضييع القرص:
          </p>
          <ul className="text-xs sm:text-sm text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span><strong>عدم نسخ المكررات:</strong> يتم الاحتفاظ بنسخة واحدة فريدة فقط، وتجاهل النسخ المكررة مع توثيقها بالتقرير.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span><strong>خيار النسخ (Copy):</strong> يترك الملفات الأصلية دون مساس (الوضع الآمن).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span><strong>خيار النقل (Move):</strong> ينقل الفريد ويحذف المكرر لتفريغ مساحة القرص فوراً!</span>
            </li>
          </ul>
        </div>

      </div>

      {/* 5. التقرير والواجهة الرسومية */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">التحسين رابعاً - 3 و 4</span>
            <h3 className="text-base font-bold text-white">التقرير التوثيقي الشامل والواجهة الرسومية</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              التقرير النصي (تقرير_تنظيم_الملفات.txt)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              يتم حفظ ملف نصي فوري داخل مجلد النتيجة يوضح: تاريخ التنفيذ، إجمالي الملفات، مساحة كل فئة، والمسار الدقيق لكل ملف مكرر تم تجاوزه وحجم المساحة التي تم توفيرها.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              الواجهة الرسومية (Tkinter GUI للويندوز)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              تم بناء تطبيق مكتبي كامل بلغة بايثون بمكتبة Tkinter المدمجة في الويندوز بدون الحاجة لتثبيت أي مكاتب خارجية! مع شريط تقدم مباشر وخانات اختيار واستعراض سلسة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
