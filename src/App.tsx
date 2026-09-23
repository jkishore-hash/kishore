import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExamGeneratorForm } from './components/ExamGeneratorForm';
import { ExamTestMode } from './components/ExamTestMode';
import { ExamResultsView } from './components/ExamResultsView';
import { PracticeMode } from './components/PracticeMode';
import { FlashcardsMode } from './components/FlashcardsMode';
import { PrintWorksheetMode } from './components/PrintWorksheetMode';
import { ExamLibrary } from './components/ExamLibrary';
import { AiTutorModal } from './components/AiTutorModal';
import { ExportModal } from './components/ExportModal';
import { ViewMode, ExamPackage, ExamAttempt, ExamQuestion } from './types/exam';
import { CURATED_EXAMS } from './data/curatedExams';
import {
  getSavedExams,
  saveExam,
  deleteExam,
  getPastAttempts,
  savePastAttempt,
} from './utils/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('create');
  const [activeExam, setActiveExam] = useState<ExamPackage | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [savedExams, setSavedExams] = useState<ExamPackage[]>([]);
  const [pastAttempts, setPastAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [tutorContext, setTutorContext] = useState<{
    question: ExamQuestion;
    selectedOption?: 'A' | 'B' | 'C' | 'D' | null;
  } | null>(null);

  // Load initial exams and past attempts from localStorage
  useEffect(() => {
    const loadedExams = getSavedExams();
    setSavedExams(loadedExams);
    if (loadedExams.length > 0) {
      setActiveExam(loadedExams[0]);
    }
    const loadedAttempts = getPastAttempts();
    setPastAttempts(loadedAttempts);
  }, []);

  const handleExamGenerated = (exam: ExamPackage) => {
    saveExam(exam);
    setSavedExams((prev) => {
      const idx = prev.findIndex((e) => e.metadata.id === exam.metadata.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = exam;
        return next;
      }
      return [exam, ...prev];
    });
    setActiveExam(exam);
    setCurrentAttempt(null);
    setCurrentView('exam');
  };

  const handleFinishExam = (attempt: ExamAttempt) => {
    savePastAttempt(attempt);
    setPastAttempts((prev) => [attempt, ...prev]);
    setCurrentAttempt(attempt);
    setCurrentView('results');
  };

  const handleRetakeFullExam = () => {
    setCurrentAttempt(null);
    setCurrentView('exam');
  };

  const handleRetakeIncorrect = (incorrectQuestions: ExamQuestion[]) => {
    if (!activeExam) return;
    const focusedExam: ExamPackage = {
      metadata: {
        ...activeExam.metadata,
        id: `exam-review-${Date.now()}`,
        title: `${activeExam.metadata.title} (Missed Review)`,
        questionCount: incorrectQuestions.length,
      },
      questions: incorrectQuestions,
    };
    setActiveExam(focusedExam);
    setCurrentAttempt(null);
    setCurrentView('exam');
  };

  const handleDeleteExam = (examId: string) => {
    const updated = deleteExam(examId);
    setSavedExams(updated);
    if (activeExam?.metadata.id === examId) {
      setActiveExam(updated[0] || null);
      setCurrentView('library');
    }
  };

  const handleRestoreCurated = () => {
    CURATED_EXAMS.forEach((exam) => saveExam(exam));
    const all = getSavedExams();
    setSavedExams(all);
    setActiveExam(all[0]);
  };

  const handleOpenTutor = (
    question: ExamQuestion,
    selectedOption?: 'A' | 'B' | 'C' | 'D' | null,
  ) => {
    setTutorContext({ question, selectedOption });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        activeExam={activeExam}
        onOpenExport={() => setIsExportOpen(true)}
        onNewExam={() => setCurrentView('create')}
        libraryCount={savedExams.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'create' && (
          <ExamGeneratorForm
            onExamGenerated={handleExamGenerated}
            isLoading={isLoading}
            error={error}
            onClearError={() => setError(null)}
          />
        )}

        {currentView === 'exam' && activeExam && (
          <ExamTestMode
            exam={activeExam}
            onFinishExam={handleFinishExam}
            onExitToPractice={() => setCurrentView('practice')}
          />
        )}

        {currentView === 'results' && activeExam && currentAttempt && (
          <ExamResultsView
            exam={activeExam}
            attempt={currentAttempt}
            onRetakeExam={handleRetakeFullExam}
            onRetakeIncorrect={handleRetakeIncorrect}
            onSwitchToPractice={() => setCurrentView('practice')}
            onOpenTutor={handleOpenTutor}
            onOpenPrint={() => setCurrentView('print')}
          />
        )}

        {currentView === 'practice' && activeExam && (
          <PracticeMode
            exam={activeExam}
            onOpenTutor={handleOpenTutor}
            onSwitchToExam={() => setCurrentView('exam')}
          />
        )}

        {currentView === 'flashcards' && activeExam && (
          <FlashcardsMode exam={activeExam} />
        )}

        {currentView === 'print' && activeExam && (
          <PrintWorksheetMode
            exam={activeExam}
            onBack={() => setCurrentView('exam')}
          />
        )}

        {currentView === 'library' && (
          <ExamLibrary
            exams={savedExams}
            pastAttempts={pastAttempts}
            onSelectExam={(exam, mode) => {
              setActiveExam(exam);
              setCurrentView(mode);
            }}
            onDeleteExam={handleDeleteExam}
            onNewExam={() => setCurrentView('create')}
            onRestoreCurated={handleRestoreCurated}
          />
        )}
      </main>

      {/* AI Tutor Modal */}
      {tutorContext && (
        <AiTutorModal
          question={tutorContext.question}
          selectedOption={tutorContext.selectedOption}
          isOpen={Boolean(tutorContext)}
          onClose={() => setTutorContext(null)}
        />
      )}

      {/* Export / Share Modal */}
      {activeExam && isExportOpen && (
        <ExportModal
          exam={activeExam}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ExamCraft &bull; Automated Exam & Assessment Construction Platform
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>&bull;</span>
            <span>Multiple Choice & Explanations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
