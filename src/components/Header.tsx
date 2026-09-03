import React from 'react';
import { Sparkles, Terminal, ShieldCheck, FolderTree, FileCode2, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scanner' | 'python-gui' | 'architecture' | 'github-guide';
  setActiveTab: (tab: 'scanner' | 'python-gui' | 'architecture' | 'github-guide') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  منظّم الملفات وكاشف المكررات
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                  v2.0 المحدث
                </span>
              </div>
              <p className="text-xs text-slate-400">
                حل مضمون للحلقة المفرغة • مسارات مرنة • تسريع الفحص • واجهة رسومية وسكربت بايثون جاهز
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            <button
              id="tab-scanner-btn"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>فحص وتنظيم بالمتصفح</span>
            </button>

            <button
              id="tab-python-btn"
              onClick={() => setActiveTab('python-gui')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'python-gui'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>سكربت Python للكمبيوتر (GUI)</span>
            </button>

            <button
              id="tab-arch-btn"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>الحلول التقنية المضمونة</span>
            </button>

            <button
              id="tab-github-guide-btn"
              onClick={() => setActiveTab('github-guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'github-guide'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>دليل GitHub والوورد 📄</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
