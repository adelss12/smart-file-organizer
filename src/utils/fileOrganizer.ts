import { ScannedFile, ScanStats, OrganizerConfig, DuplicateGroup } from '../types';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} مللي ثانية`;
  return `${(ms / 1000).toFixed(2)} ثانية`;
}

/**
 * حساب هاش SHA-256 للملف في المتصفح باستخدام Web Crypto API
 */
export async function calculateBrowserHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * حساب هاش جزئي سريع (أول 64 كيلوبايت) لتسريع الفحص
 */
export async function calculateFastBrowserHash(file: File): Promise<string> {
  const slice = file.slice(0, 65536);
  const arrayBuffer = await slice.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * توليد تقرير نصي شامل
 */
export function generateTextReport(
  config: OrganizerConfig,
  stats: ScanStats,
  duplicateGroups: DuplicateGroup[],
  uniqueFiles: ScannedFile[]
): string {
  const dateStr = new Date().toLocaleString('ar-EG', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  let report = `========================================================================
                 تقرير فحص وتنظيم الملفات وكشف المكررات
========================================================================

تاريخ ووقت التنفيذ   : ${dateStr}
المجلد المفحوص        : ${config.sourceDirectoryName || 'المجلد الحالي'}
مجلد الحفظ الجديد     : ${config.newFolderName}
طريقة المعالجة        : ${config.operationMode === 'move' ? 'نقل (Move)' : 'نسخ (Copy)'}
تسريع الفحص الذكي    : ${config.speedOptimization ? 'مفعّل (فحص الأحجام والهاش السريع)' : 'معطّل'}
سياسة المكررات       : ${config.skipDuplicates ? 'تجاهل المكرر بالكامل لتوفير المساحة' : 'نسخ المكررات'}
زمن المعالجة          : ${formatTime(stats.durationMs)}

------------------------------------------------------------------------
ملخص الأرقام والمساحة:
------------------------------------------------------------------------
• إجمالي الملفات المفحوصة    : ${stats.totalFiles} ملف (${formatBytes(stats.totalSize)})
• الملفات الفريدة المحفوظة   : ${stats.uniqueCount} ملف (${formatBytes(stats.uniqueSize)})
• الملفات المكررة المتجاهلة  : ${stats.duplicateCount} ملف
• صافي المساحة الموفرة       : ${formatBytes(stats.duplicateSize)}

------------------------------------------------------------------------
تفاصيل الملفات المكررة التي تم كشفها وتجاوزها:
------------------------------------------------------------------------
`;

  if (duplicateGroups.length === 0) {
    report += `\nممتاز! لم يتم العثور على أي ملفات مكررة في المجلد.\n`;
  } else {
    duplicateGroups.forEach((group, idx) => {
      report += `\n[مجموعة تكرار #${idx + 1}]`;
      report += `\n- الحجم: ${formatBytes(group.size)}`;
      report += `\n- البصمة (SHA-256): ${group.hash}`;
      report += `\n- النسخة الفريدة المحفوظة: ${group.originalFile.relativePath}`;
      report += `\n- النسخ المكررة المهملة (${group.duplicates.length} نسخة):`;
      group.duplicates.forEach((dup) => {
        report += `\n   ↳ ${dup.relativePath}`;
      });
      report += `\n`;
    });
  }

  report += `\n========================================================================\n`;
  report += `نهاية التقرير - تم التنظيم بنجاح بواسطة أداة منظّم الملفات الذكي\n`;
  report += `========================================================================\n`;

  return report;
}

/**
 * بيانات محاكاة تفاعلية لاختبار السكربت والواجهة مباشرة دون الحاجة لرفع ملفات
 */
export function getDemoFiles(): ScannedFile[] {
  return [
    {
      id: 'demo-1',
      name: 'العقد_النهائي_2026.pdf',
      relativePath: 'Docs/العقد_النهائي_2026.pdf',
      size: 2450000,
      type: 'application/pdf',
      lastModified: Date.now() - 3600000 * 24 * 5,
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'demo-2',
      name: 'العقد_النهائي_نسخة_احتياطية.pdf',
      relativePath: 'Backup/العقد_النهائي_نسخة_احتياطية.pdf',
      size: 2450000,
      type: 'application/pdf',
      lastModified: Date.now() - 3600000 * 24 * 2,
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      isDuplicate: true,
      duplicateOf: 'Docs/العقد_النهائي_2026.pdf',
    },
    {
      id: 'demo-3',
      name: 'صورة_المشروع_HD.png',
      relativePath: 'Photos/2026/صورة_المشروع_HD.png',
      size: 15400000,
      type: 'image/png',
      lastModified: Date.now() - 3600000 * 48,
      hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    },
    {
      id: 'demo-4',
      name: 'IMG_4829_copy.png',
      relativePath: 'Downloads/Old/IMG_4829_copy.png',
      size: 15400000,
      type: 'image/png',
      lastModified: Date.now() - 3600000 * 12,
      hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      isDuplicate: true,
      duplicateOf: 'Photos/2026/صورة_المشروع_HD.png',
    },
    {
      id: 'demo-5',
      name: 'عرض_تقديمي_الشركة.pptx',
      relativePath: 'Presentations/عرض_تقديمي_الشركة.pptx',
      size: 34200000,
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      lastModified: Date.now() - 3600000 * 70,
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    },
    {
      id: 'demo-6',
      name: 'قاعدة_بيانات_العملاء.xlsx',
      relativePath: 'Spreadsheets/قاعدة_بيانات_العملاء.xlsx',
      size: 5120000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      lastModified: Date.now() - 3600000 * 15,
      hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    },
    {
      id: 'demo-7',
      name: 'نسخة_مكررة_اكسل.xlsx',
      relativePath: 'Archive/Desktop_88/نسخة_مكررة_اكسل.xlsx',
      size: 5120000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      lastModified: Date.now() - 3600000 * 300,
      hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      isDuplicate: true,
      duplicateOf: 'Spreadsheets/قاعدة_بيانات_العملاء.xlsx',
    },
    {
      id: 'demo-8',
      name: 'فيديو_شرح_المشروع.mp4',
      relativePath: 'Videos/Tutorials/فيديو_شرح_المشروع.mp4',
      size: 142000000,
      type: 'video/mp4',
      lastModified: Date.now() - 3600000 * 90,
      hash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3a4a9840ef681b953a81283c7b6d1945a',
    },
    {
      id: 'demo-9',
      name: 'ملاحظات_الاجتماع.txt',
      relativePath: 'Notes/ملاحظات_الاجتماع.txt',
      size: 45000,
      type: 'text/plain',
      lastModified: Date.now() - 3600000 * 10,
      hash: 'c81e728d9d4c2f636f067f89cc14862c1ecd99c3722a27b8764eb86538b7cb6f',
    }
  ];
}
