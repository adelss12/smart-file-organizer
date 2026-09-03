import React, { useState, useRef } from 'react';
import { 
  FolderOpen, 
  FolderPlus, 
  Play, 
  Zap, 
  Copy, 
  ArrowRightLeft, 
  HardDrive, 
  Sparkles, 
  FileCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ScannedFile, ScanStats, OrganizerConfig, DuplicateGroup } from '../types';
import { 
  calculateBrowserHash, 
  calculateFastBrowserHash, 
  formatBytes, 
  getDemoFiles 
} from '../utils/fileOrganizer';

interface FolderScannerProps {
  onScanComplete: (
    files: ScannedFile[],
    stats: ScanStats,
    config: OrganizerConfig,
    groups: DuplicateGroup[]
  ) => void;
}

export const FolderScanner: React.FC<FolderScannerProps> = ({ onScanComplete }) => {
  const [config, setConfig] = useState<OrganizerConfig>({
    sourceDirectoryName: '',
    newFolderName: 'CleanFiles',
    operationMode: 'copy',
    speedOptimization: true,
    generateReport: true,
    skipDuplicates: true,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectLocalFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setSelectedFolderFiles(fileList);
      
      // استخراج اسم المجلد الرئيسي
      const firstFile = fileList[0];
      const firstRelativePath = (firstFile as File & { webkitRelativePath?: string }).webkitRelativePath || '';
      const rootDir = firstRelativePath.split('/')[0] || 'المجلد_المحدد';
      setConfig((prev) => ({ ...prev, sourceDirectoryName: rootDir }));
      setStatusMessage(`تم اختيار ${fileList.length} ملف من المجلد "${rootDir}"`);
    }
  };

  const processFiles = async (filesToProcess: { file?: File; mock?: ScannedFile }[], folderName: string) => {
    setIsScanning(true);
    setProgress(0);
    setStatusMessage('1/3 استكشاف شجرة المجلدات وفحص الأحجام...');
    const startTime = performance.now();

    const totalCount = filesToProcess.length;
    let processedFiles: ScannedFile[] = [];

    // مرحلة 1: جمع البيانات ومطابقة الأحجام
    for (let i = 0; i < totalCount; i++) {
      const item = filesToProcess[i];
      if (item.file) {
        processedFiles.push({
          id: `file-${i}-${Date.now()}`,
          name: item.file.name,
          relativePath: item.file.webkitRelativePath || item.file.name,
          size: item.file.size,
          type: item.file.type || 'unknown',
          lastModified: item.file.lastModified,
          fileHandle: item.file,
        });
      } else if (item.mock) {
        processedFiles.push({ ...item.mock });
      }
    }

    const totalBytes = processedFiles.reduce((acc, f) => acc + f.size, 0);

    // مرحلة 2: تسريع الفحص ثلاثي المراحل (الحجم -> الهاش)
    setStatusMessage('2/3 حساب البصمات الرقمية وتحديد المكررات...');
    
    // تجميع حسب الحجم
    const sizeMap: { [size: number]: ScannedFile[] } = {};
    processedFiles.forEach((f) => {
      if (!sizeMap[f.size]) sizeMap[f.size] = [];
      sizeMap[f.size].push(f);
    });

    const registeredHashes: { [hash: string]: ScannedFile } = {};
    const duplicateGroupsMap: { [hash: string]: DuplicateGroup } = {};
    let uniqueCount = 0;
    let duplicateCount = 0;
    let duplicateBytes = 0;

    let processedCounter = 0;

    for (const sizeStr of Object.keys(sizeMap)) {
      const size = Number(sizeStr);
      const group = sizeMap[size];

      // إذا كان الحجم فريداً وتم تفعيل تسريع الفحص
      if (config.speedOptimization && group.length === 1) {
        processedCounter++;
        setProgress(Math.round((processedCounter / totalCount) * 100));
        uniqueCount++;
        continue;
      }

      // إذا تشابهت الأحجام، نحسب الهاش الفعلي
      for (const f of group) {
        processedCounter++;
        setProgress(Math.round((processedCounter / totalCount) * 100));
        setStatusMessage(`جاري فحص: ${f.name} (${processedCounter}/${totalCount})`);

        let computedHash = f.hash;
        if (!computedHash && f.fileHandle) {
          try {
            // حساب الهاش الجزئي ثم الكامل
            computedHash = await calculateBrowserHash(f.fileHandle);
            f.hash = computedHash;
          } catch (err) {
            console.error('Error hashing file', err);
          }
        }

        if (!computedHash) {
          computedHash = `hash-fallback-${f.name}-${f.size}`;
          f.hash = computedHash;
        }

        if (!registeredHashes[computedHash]) {
          registeredHashes[computedHash] = f;
          uniqueCount++;
        } else {
          // ملف مكرر
          f.isDuplicate = true;
          f.duplicateOf = registeredHashes[computedHash].relativePath;
          duplicateCount++;
          duplicateBytes += f.size;

          if (!duplicateGroupsMap[computedHash]) {
            duplicateGroupsMap[computedHash] = {
              hash: computedHash,
              size: f.size,
              originalFile: registeredHashes[computedHash],
              duplicates: [],
            };
          }
          duplicateGroupsMap[computedHash].duplicates.push(f);
        }

        // إتاحة وقت للمتصفح لتحديث الواجهة بسلاسة
        if (processedCounter % 15 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      }
    }

    setStatusMessage('3/3 إتمام التنظيم وإعداد التقرير التوثيقي...');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const durationMs = Math.round(performance.now() - startTime);

    const stats: ScanStats = {
      totalFiles: totalCount,
      totalSize: totalBytes,
      uniqueCount: uniqueCount,
      uniqueSize: totalBytes - duplicateBytes,
      duplicateCount: duplicateCount,
      duplicateSize: duplicateBytes,
      scannedCount: processedCounter,
      durationMs: durationMs,
      status: 'completed',
    };

    setIsScanning(false);
    setProgress(100);
    onScanComplete(
      processedFiles,
      stats,
      { ...config, sourceDirectoryName: folderName },
      Object.values(duplicateGroupsMap)
    );
  };

  const handleStartRealScan = () => {
    if (selectedFolderFiles.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }
    const items = selectedFolderFiles.map((f) => ({ file: f }));
    processFiles(items, config.sourceDirectoryName || 'المجلد_المحدد');
  };

  const handleLoadDemoData = () => {
    const demos = getDemoFiles();
    setConfig((prev) => ({ ...prev, sourceDirectoryName: 'مجلد_المشروع_المشترك' }));
    const items = demos.map((m) => ({ mock: m }));
    processFiles(items, 'مجلد_المشروع_المشترك');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden file input for native directory choosing */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelectLocalFolder}
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        multiple
        className="hidden"
      />

      {/* Main Settings Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-sky-400" />
              <span>إعدادات الفحص والتنظيم</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              حدد المجلد المراد فحصه مباشرة أو جرب المحاكاة لاختبار الخوارزميات
            </p>
          </div>

          <button
            id="demo-test-btn"
            onClick={handleLoadDemoData}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>تجربة محاكاة فورية (ملفات تجريبية)</span>
          </button>
        </div>

        {/* Inputs Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Source Folder Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              المجلد المراد فحصه وتنظيمه:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.sourceDirectoryName ? config.sourceDirectoryName : 'المجلد الحالي (تلقائي)'}
                readOnly
                placeholder="اضغط لاختيار مجلد من جهازك"
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 outline-none font-mono"
              />
              <button
                id="browse-folder-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all shrink-0 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-sky-400" />
                <span>استعراض...</span>
              </button>
            </div>
            {selectedFolderFiles.length > 0 && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>تم تجهيز {selectedFolderFiles.length} ملف للفحص</span>
              </p>
            )}
          </div>

          {/* New Folder Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              اسم المجلد الجديد المجمع (مكان حفظ الملفات الفريدة):
            </label>
            <div className="relative">
              <input
                id="new-folder-input"
                type="text"
                value={config.newFolderName}
                onChange={(e) => setConfig({ ...config, newFolderName: e.target.value })}
                disabled={isScanning}
                placeholder="CleanFiles"
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 text-slate-200 text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all font-mono"
              />
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 pointer-events-none">📁</span>
            </div>
            <p className="text-[11px] text-slate-400">
              سيتم إنشاؤه داخل المجلد بدون الدخول في أي حلقة مفرغة بفضل ميزة العزل الذاتي.
            </p>
          </div>
        </div>

        {/* Operation Mode Selection: Copy vs Move */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-300">
            طريقة معالجة الملفات (اختر ما يناسبك):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Mode: Copy */}
            <div
              onClick={() => !isScanning && setConfig({ ...config, operationMode: 'copy' })}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                config.operationMode === 'copy'
                  ? 'bg-sky-950/40 border-sky-500/60 ring-1 ring-sky-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 mt-0.5">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">نسخ (Copy)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    الوضع الآمن
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ينسخ الملفات الفريدة فقط للمجلد الجديد، ويترك ملفاتك الأصلية دون مساس.
                </p>
              </div>
            </div>

            {/* Mode: Move */}
            <div
              onClick={() => !isScanning && setConfig({ ...config, operationMode: 'move' })}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                config.operationMode === 'move'
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">نقل (Move)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    توفير مساحة فورية
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ينقل الفريد للمجلد الجديد ويحذف المكرر لتفريغ القرص فوراً.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Toggles & Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-800">
          
          {/* Speed Optimization Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-slate-200">تسريع الفحص الذكي</span>
                <p className="text-[11px] text-slate-400">مقارنة الحجم والهاش السريع أولاً</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.speedOptimization}
              onChange={(e) => setConfig({ ...config, speedOptimization: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Skip duplicates toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-200">تجاهل المكرر لتوفير المساحة</span>
                <p className="text-[11px] text-slate-400">الاحتفاظ بنسخة واحدة وتجاوز الباقي</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.skipDuplicates}
              onChange={(e) => setConfig({ ...config, skipDuplicates: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
            />
          </div>

        </div>

        {/* Action Button & Progress */}
        <div className="space-y-3 pt-2">
          <button
            id="start-scan-btn"
            onClick={handleStartRealScan}
            disabled={isScanning}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white shadow-xl transition-all cursor-pointer ${
              isScanning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-sky-500/25'
            }`}
          >
            {isScanning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>جاري المعالجة والفحص السريع ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>بدء الفحص وتنظيم المجلد الآن</span>
              </>
            )}
          </button>

          {isScanning && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-sky-400">{statusMessage}</span>
                <span className="font-mono font-bold text-white">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
