import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { ExamPackage, ExamQuestion } from '../types/exam';

interface PracticeModeProps {
  exam: ExamPackage;
  onOpenTutor: (question: ExamQuestion, selectedOption?: 'A' | 'B' | 'C' | 'D' | null) => void;
  onSwitchToExam: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  exam,
  onOpenTutor,
  onSwitchToExam,
}) => {
  const { metadata, questions } = exam;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const currentQ = questions[currentIndex];
  const userChoice = selectedAnswers[currentQ.id];
  const isAnswered = Boolean(userChoice);
  const isCorrect = userChoice === currentQ.correctAnswer;

  const handleSelectOption = (label: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return; // Prevent changing after revealing feedback
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: label,
    }));
  };

  const handleResetQuestion = () => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: null,
    }));
  };

  const answeredQuestions = Object.entries(selectedAnswers).filter(([_, ans]) => ans !== null);
  const correctCount = answeredQuestions.filter(([qId, ans]) => {
    const q = questions.find((item) => item.id === qId);
    return q && q.correctAnswer === ans;
  }).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Practice Mode
            </span>
            <span className="text-xs text-slate-400">{metadata.subject}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {metadata.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            Progress: <span className="font-bold text-emerald-400">{correctCount}</span> /{' '}
            <span>{answeredQuestions.length}</span> correct ({questions.length} total)
          </div>

          <button
            onClick={onSwitchToExam}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
          >
            Take Timed Test
          </button>
        </div>
      </div>

      {/* Main Practice Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/70 border border-slate-700/80 shadow-2xl backdrop-blur-sm">
        {/* Question Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {currentQ.conceptTag && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-700">
                {currentQ.conceptTag}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentQ.hint && (
              <button
                onClick={() => setShowHint((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  showHint[currentQ.id]
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint[currentQ.id] ? 'Hide Hint' : 'Need a Hint?'}</span>
              </button>
            )}

            {isAnswered && (
              <button
                onClick={handleResetQuestion}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                title="Try this question again"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>

        {/* Hint Box (if toggled) */}
        {showHint[currentQ.id] && currentQ.hint && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Pedagogical Clue: </span>
              <span>{currentQ.hint}</span>
            </div>
          </div>
        )}

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option) => {
            const isSelected = userChoice === option.label;
            const isCorrectOption = option.label === currentQ.correctAnswer;

            let buttonStyles = 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/80 hover:border-slate-600 text-slate-200';
            let labelStyles = 'bg-slate-800 text-slate-400';

            if (isAnswered) {
              if (isCorrectOption) {
                buttonStyles = 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500 text-emerald-100';
                labelStyles = 'bg-emerald-500 text-slate-950 font-black';
              } else if (isSelected && !isCorrectOption) {
                buttonStyles = 'bg-rose-500/20 border-rose-500 ring-1 ring-rose-500 text-rose-100';
                labelStyles = 'bg-rose-500 text-white font-black';
              } else {
                buttonStyles = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={option.label}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.label)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${buttonStyles} ${
                  !isAnswered ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${labelStyles}`}>
                  {option.label}
                </span>
                <span className="text-sm font-medium leading-relaxed pt-0.5 flex-1">
                  {option.text}
                </span>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback & Detailed Explanation Drawer */}
        {isAnswered && (
          <div className="mt-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Correct! Great work.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-400 text-sm font-bold">
                    <XCircle className="w-5 h-5" />
                    <span>Not quite right. The correct answer is Option {currentQ.correctAnswer}.</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onOpenTutor(currentQ, userChoice)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI Tutor</span>
              </button>
            </div>

            {/* Step-by-Step Rationale */}
            <div className="text-xs text-slate-300 space-y-2">
              <p className="leading-relaxed">
                <span className="font-bold text-emerald-400">Detailed Rationale: </span>
                {currentQ.explanation}
              </p>
              {currentQ.distractorExplanation && (
                <p className="text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
                  <span className="font-semibold text-slate-300">Distractor Analysis: </span>
                  {currentQ.distractorExplanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs no-scrollbar py-1">
            {questions.map((q, idx) => {
              const ans = selectedAnswers[q.id];
              const qCorrect = ans === q.correctAnswer;
              const isCurrent = idx === currentIndex;

              let dotStyle = 'bg-slate-900 border-slate-700 text-slate-400';
              if (ans) {
                dotStyle = qCorrect ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-rose-500 text-white font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all shrink-0 ${dotStyle} ${
                    isCurrent ? 'ring-2 ring-sky-400' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
