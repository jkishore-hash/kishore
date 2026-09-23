import React from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Layers,
  Printer,
  Library,
  Download,
  Share2,
  PlusCircle,
} from 'lucide-react';
import { ViewMode, ExamPackage } from '../types/exam';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  activeExam: ExamPackage | null;
  onOpenExport: () => void;
  onNewExam: () => void;
  libraryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeExam,
  onOpenExport,
  onNewExam,
  libraryCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('create')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/15">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  ExamCraft
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Exam Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Automated Exam & Quiz Question Generator
              </p>
            </div>
          </div>

          {/* Navigation Modes (active when an exam is loaded) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => onViewChange('create')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                currentView === 'create'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generator</span>
            </button>

            {activeExam && (
              <>
                <button
                  onClick={() => onViewChange('exam')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    currentView === 'exam' || currentView === 'results'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Simulation</span>
                </button>

                <button
                  onClick={() => onViewChange('practice')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    currentView === 'practice'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Practice Mode</span>
                </button>

                <button
                  onClick={() => onViewChange('flashcards')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    currentView === 'flashcards'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flashcards</span>
                </button>

                <button
                  onClick={() => onViewChange('print')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    currentView === 'print'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print & Paper</span>
                </button>
              </>
            )}

            <button
              onClick={() => onViewChange('library')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                currentView === 'library'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Library ({libraryCount})</span>
            </button>
          </nav>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2">
            {activeExam && (
              <button
                onClick={onOpenExport}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Export or Share this exam"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            )}

            <button
              onClick={onNewExam}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Exam</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2.5 border-t border-slate-800/60 no-scrollbar gap-1 text-xs">
          <button
            onClick={() => onViewChange('create')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'create'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Generator
          </button>
          {activeExam && (
            <>
              <button
                onClick={() => onViewChange('exam')}
                className={`px-3 py-1 rounded-md shrink-0 font-medium ${
                  currentView === 'exam' || currentView === 'results'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Test Sim
              </button>
              <button
                onClick={() => onViewChange('practice')}
                className={`px-3 py-1 rounded-md shrink-0 font-medium ${
                  currentView === 'practice'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => onViewChange('flashcards')}
                className={`px-3 py-1 rounded-md shrink-0 font-medium ${
                  currentView === 'flashcards'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Flashcards
              </button>
              <button
                onClick={() => onViewChange('print')}
                className={`px-3 py-1 rounded-md shrink-0 font-medium ${
                  currentView === 'print'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Print
              </button>
            </>
          )}
          <button
            onClick={() => onViewChange('library')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'library'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Library ({libraryCount})
          </button>
        </div>
      </div>
    </header>
  );
};
