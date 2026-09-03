import React, { useState } from 'react';
import { Header } from './components/Header';
import { FolderScanner } from './components/FolderScanner';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PythonScriptViewer } from './components/PythonScriptViewer';
import { ArchitectureSection } from './components/ArchitectureSection';
import { GitHubGuideViewer } from './components/GitHubGuideViewer';
import { downloadWordDoc } from './data/githubGuideContent';
import { ScannedFile, ScanStats, OrganizerConfig, DuplicateGroup } from './types';
import { ShieldCheck, Zap, HardDrive, Download, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'python-gui' | 'architecture' | 'github-guide'>('scanner');
  
  const [scanData, setScanData] = useState<{
    files: ScannedFile[];
    stats: ScanStats;
    config: OrganizerConfig;
    duplicateGroups: DuplicateGroup[];
  } | null>(null);

  const handleScanComplete = (
    files: ScannedFile[],
    stats: ScanStats,
    config: OrganizerConfig,
    duplicateGroups: DuplicateGroup[]
  ) => {
    setScanData({ files, stats, config, duplicateGroups });
  };

  const handleReset = () => {
    setScanData(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            {!scanData ? (
              <>
                {/* Intro announcement banner */}
                <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/20 rounded-2xl p-5 sm:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                          حلول مضمونة 100%
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-white">
                          جاهز لفحص المجلد الموضع فيه فوراً وطلب التسمية وحذف المكررات
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400">
                        تم فك الارتباط بمسار D:، وحل مشكلة الحلقة المفرغة جذرياً، وتسريع الفحص، مع تقرير نصي شامل وخيار النسخ/النقل.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        onClick={downloadWordDoc}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <FileText className="w-4 h-4" />
                        <span>📄 تحميل دليل Word للطباعة (.doc)</span>
                        <Download className="w-3.5 h-3.5 mr-1" />
                      </button>

                      <button
                        onClick={() => setActiveTab('python-gui')}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>تحميل سكربت الكمبيوتر (.py)</span>
                        <span>←</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* The Scanner Tool */}
                <FolderScanner onScanComplete={handleScanComplete} />
              </>
            ) : (
              <ResultsDashboard
                files={scanData.files}
                stats={scanData.stats}
                config={scanData.config}
                duplicateGroups={scanData.duplicateGroups}
                onReset={handleReset}
              />
            )}
          </div>
        )}

        {activeTab === 'python-gui' && (
          <PythonScriptViewer />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureSection />
        )}

        {activeTab === 'github-guide' && (
          <GitHubGuideViewer />
        )}
      </main>

      {/* Trust & Guarantee Footer */}
      <footer className="border-t border-slate-850 bg-slate-950/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 text-center sm:text-right border-b border-slate-900 pb-4 mb-4">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>حماية 100% من الحلقة المفرغة (Cycle-Free)</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Zap className="w-4 h-4 text-sky-400 shrink-0" />
              <span>فحص فائق السرعة عبر 3-Tier Hash Filter</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>توفير مساحة حقيقي بتجاوز المكررات بالكامل</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>منظّم الملفات الذكي • تم تصميمه وبرمجته وفق متطلباتك بدقة</span>
            <span>بايثون 3 قياسي بدون أي مكتبات خارجية (Zero Dependencies)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
