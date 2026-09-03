import React, { useState } from 'react';
import { 
  FileCheck2, 
  Copy, 
  HardDrive, 
  Clock, 
  Download, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  FolderArchive,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { ScannedFile, ScanStats, OrganizerConfig, DuplicateGroup } from '../types';
import { formatBytes, formatTime, generateTextReport } from '../utils/fileOrganizer';

interface ResultsDashboardProps {
  files: ScannedFile[];
  stats: ScanStats;
  config: OrganizerConfig;
  duplicateGroups: DuplicateGroup[];
  onReset: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  files,
  stats,
  config,
  duplicateGroups,
  onReset,
}) => {
  const [activeView, setActiveView] = useState<'duplicates' | 'all' | 'report'>('duplicates');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  const textReport = generateTextReport(
    config,
    stats,
    duplicateGroups,
    files.filter((f) => !f.isDuplicate)
  );

  const handleDownloadReport = () => {
    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'تقرير_تنظيم_الملفات.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(textReport);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDuplicates = duplicateGroups.filter((g) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      g.originalFile.name.toLowerCase().includes(term) ||
      g.duplicates.some((d) => d.name.toLowerCase().includes(term))
    );
  });

  const filteredAllFiles = files.filter((f) => {
    if (!searchTerm) return true;
    return f.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Top Banner / Reset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-lg font-bold text-white">
              اكتمل فحص وتنظيم المجلد بنجاح!
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            تم إيداع الملفات الفريدة في مجلد <span className="text-sky-300 font-mono font-bold">{config.newFolderName}</span> مع عزل تام وتجاوز المكررات لتوفير المساحة.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadReport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>تحميل التقرير النصي (.txt)</span>
          </button>

          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <span>فحص مجلد آخر</span>
            <span>←</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scanned */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">إجمالي الملفات</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats.totalFiles}</span>
            <span className="text-xs text-slate-500">ملف</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-mono">
            {formatBytes(stats.totalSize)}
          </span>
        </div>

        {/* Unique files */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 border-r-4 border-r-emerald-500">
          <span className="text-xs font-semibold text-emerald-400 block mb-1">الملفات الفريدة المحفوظة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">{stats.uniqueCount}</span>
            <span className="text-xs text-emerald-500/80">ملف</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-mono">
            {formatBytes(stats.uniqueSize)}
          </span>
        </div>

        {/* Duplicates ignored */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 border-r-4 border-r-amber-500">
          <span className="text-xs font-semibold text-amber-400 block mb-1">مكررات تم تجاهلها</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">{stats.duplicateCount}</span>
            <span className="text-xs text-amber-500/80">نسخة مكررة</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {stats.duplicateCount > 0 ? 'تم توفير مساحتها بالكامل' : 'لا يوجد تكرار'}
          </span>
        </div>

        {/* Space Saved */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 border-r-4 border-r-sky-500">
          <span className="text-xs font-semibold text-sky-400 block mb-1">صافي المساحة الموفرة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-sky-300 font-mono">
              {formatBytes(stats.duplicateSize)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>استغرق: {formatTime(stats.durationMs)}</span>
          </div>
        </div>
      </div>

      {/* Main Inspector & View Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Navigation bar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveView('duplicates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'duplicates'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              المكررات المحلولة ({duplicateGroups.length} مجموعة)
            </button>

            <button
              onClick={() => setActiveView('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'all'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              جميع الملفات ({files.length})
            </button>

            <button
              onClick={() => setActiveView('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'report'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              معاينة التقرير النصي (.txt)
            </button>
          </div>

          {activeView !== 'report' && (
            <div className="relative">
              <input
                type="text"
                placeholder="بحث باسم الملف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pr-8 pl-3 py-2 outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          )}
        </div>

        {/* Content View 1: Duplicates groups */}
        {activeView === 'duplicates' && (
          <div className="p-4 sm:p-6 space-y-4">
            {filteredDuplicates.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">لا توجد أي ملفات مكررة!</p>
                <p className="text-xs text-slate-500">جميع الملفات فريدة تماماً وتم تنظيمها بأمان.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDuplicates.map((group, idx) => (
                  <div
                    key={group.hash || idx}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 font-mono font-bold">
                          مجموعة #{idx + 1}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          بصمة SHA-256: {group.hash.substring(0, 16)}...
                        </span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        وفرت: {formatBytes(group.size * group.duplicates.length)}
                      </span>
                    </div>

                    {/* Original File */}
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        أصل
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-emerald-300 truncate">
                            {group.originalFile.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {formatBytes(group.originalFile.size)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate font-mono mt-0.5">
                          المسار المحفوظ: {config.newFolderName}/{group.originalFile.relativePath}
                        </span>
                      </div>
                    </div>

                    {/* Duplicates list */}
                    <div className="space-y-1.5 mr-4 border-r-2 border-slate-800 pr-3">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        النسخ المكررة المهملة لتوفير المساحة ({group.duplicates.length}):
                      </span>
                      {group.duplicates.map((dup) => (
                        <div
                          key={dup.id}
                          className="flex items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/40 p-2 rounded-lg"
                        >
                          <span className="line-through text-slate-400 truncate">{dup.relativePath}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 shrink-0">
                            تجاهل التكرار
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content View 2: All files */}
        {activeView === 'all' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">اسم الملف والمسار</th>
                  <th className="p-3">الحجم</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">الإجراء المتخذ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAllFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-slate-200">{file.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                        {file.relativePath}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {formatBytes(file.size)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {file.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          نسخة مكررة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          فريد وأصيل
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-400">
                      {file.isDuplicate ? (
                        <span className="text-slate-500">تم تجاهله (توفير مساحة)</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">
                          {config.operationMode === 'move' ? 'تم نقله' : 'تم نسخه'} للمجلد الجديد
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Content View 3: Text Report */}
        {activeView === 'report' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono text-slate-300">تقرير_تنظيم_الملفات.txt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الملف</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
              {textReport}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
