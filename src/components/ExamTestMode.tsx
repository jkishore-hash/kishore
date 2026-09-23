import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Pause,
  Play,
} from 'lucide-react';
import { ExamPackage, ExamAttempt } from '../types/exam';

interface ExamTestModeProps {
  exam: ExamPackage;
  onFinishExam: (attempt: ExamAttempt) => void;
  onExitToPractice: () => void;
}

export const ExamTestMode: React.FC<ExamTestModeProps> = ({
  exam,
  onFinishExam,
  onExitToPractice,
}) => {
  const { metadata, questions } = exam;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Timer: 90 seconds per question
  const initialSeconds = questions.length * 90;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (isTimerPaused || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, secondsRemaining]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(currentQ.id, key as 'A' | 'B' | 'C' | 'D');
      } else if (e.key === 'ArrowRight' || e.key === 'j') {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
      } else if (key === 'F') {
        toggleFlag(currentQ.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (questionId: string, label: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === label ? null : label,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSubmitExam = () => {
    let score = 0;
    const conceptBreakdown: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      const tag = q.conceptTag || 'General';
      if (!conceptBreakdown[tag]) {
        conceptBreakdown[tag] = { total: 0, correct: 0 };
      }
      conceptBreakdown[tag].total += 1;

      const studentAns = answers[q.id];
      if (studentAns === q.correctAnswer) {
        score += 1;
        conceptBreakdown[tag].correct += 1;
      }
    });

    const percentage = Math.round((score / questions.length) * 100);

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId: metadata.id,
      examTitle: metadata.title,
      subject: metadata.subject,
      topic: metadata.topic,
      difficulty: metadata.difficulty,
      answers,
      flagged,
      startedAt: Date.now() - timeSpentSeconds * 1000,
      completedAt: Date.now(),
      timeSpentSeconds,
      score,
      totalQuestions: questions.length,
      percentage,
      conceptBreakdown,
    };

    onFinishExam(attempt);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Exam Header Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {metadata.subject}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {metadata.difficulty}
            </span>
            <span className="text-xs text-slate-400">
              {questions.length} Questions
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {metadata.title}
          </h2>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-mono text-sm font-bold ${
              secondsRemaining < 60
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{formatTime(secondsRemaining)}</span>
            <button
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
              className="ml-1 text-slate-400 hover:text-white"
            >
              {isTimerPaused ? (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Card (Columns 1-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/70 border border-slate-700/80 shadow-xl backdrop-blur-sm">
            {/* Question Meta Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                  {currentIndex + 1}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {currentQuestion.conceptTag && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-700">
                    {currentQuestion.conceptTag}
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  flagged[currentQuestion.id]
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <Flag
                  className={`w-3.5 h-3.5 ${
                    flagged[currentQuestion.id]
                      ? 'fill-amber-400 text-amber-400'
                      : ''
                  }`}
                />
                <span>
                  {flagged[currentQuestion.id] ? 'Flagged' : 'Flag for review'}
                </span>
                <kbd className="hidden sm:inline-block ml-1 text-[10px] font-mono text-slate-500">
                  [F]
                </kbd>
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-100 leading-relaxed font-['Plus_Jakarta_Sans']">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelectOption(currentQuestion.id, option.label)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/80 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="text-sm font-medium leading-relaxed pt-0.5 flex-1">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-slate-500 hidden sm:block">
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-300">A</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-300">B</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-300">C</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-300">D</kbd> to select
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Submit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Grid Sidebar (Column 4) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Question Navigator
            </h4>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 pb-3 border-b border-slate-700/60 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500" />
                <span>Flagged ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded ring-2 ring-sky-400" />
                <span>Current</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = Boolean(flagged[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 z-10'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Action in Navigator */}
            <div className="mt-6 pt-4 border-t border-slate-700/60">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Finish & Grade Exam</span>
              </button>

              <button
                onClick={onExitToPractice}
                className="w-full mt-2 py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Switch to Practice Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Ready to Submit Exam?
                </h3>
                <p className="text-xs text-slate-400">
                  Please review your progress before grading.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>Unanswered:</span>
                  <span>{unansweredCount} remaining</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Flagged for Review:</span>
                  <span>{flaggedCount}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                You still have {unansweredCount} unanswered questions. Unanswered questions will be scored as incorrect.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Back to Exam
              </button>
              <button
                onClick={handleSubmitExam}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                Submit & Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
