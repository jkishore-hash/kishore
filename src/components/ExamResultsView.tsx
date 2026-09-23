import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  Printer,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  BarChart3,
  Award,
} from 'lucide-react';
import { ExamPackage, ExamAttempt, ExamQuestion } from '../types/exam';

interface ExamResultsViewProps {
  exam: ExamPackage;
  attempt: ExamAttempt;
  onRetakeExam: () => void;
  onRetakeIncorrect: (incorrectQuestions: ExamQuestion[]) => void;
  onSwitchToPractice: () => void;
  onOpenTutor: (question: ExamQuestion, selectedOption?: 'A' | 'B' | 'C' | 'D' | null) => void;
  onOpenPrint: () => void;
}

export const ExamResultsView: React.FC<ExamResultsViewProps> = ({
  exam,
  attempt,
  onRetakeExam,
  onRetakeIncorrect,
  onSwitchToPractice,
  onOpenTutor,
  onOpenPrint,
}) => {
  const { questions } = exam;
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedExplanation((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 93) return { grade: 'A+', label: 'Outstanding Mastery', color: 'text-emerald-400' };
    if (percentage >= 85) return { grade: 'A', label: 'Excellent Comprehension', color: 'text-emerald-400' };
    if (percentage >= 75) return { grade: 'B', label: 'Good Understanding', color: 'text-sky-400' };
    if (percentage >= 65) return { grade: 'C', label: 'Satisfactory Foundations', color: 'text-amber-400' };
    return { grade: 'Review Needed', label: 'Needs Further Study', color: 'text-rose-400' };
  };

  const { grade, label: gradeLabel, color: gradeColor } = getGrade(attempt.percentage);

  const incorrectQuestions = questions.filter(
    (q) => attempt.answers[q.id] !== q.correctAnswer,
  );
  const correctQuestions = questions.filter(
    (q) => attempt.answers[q.id] === q.correctAnswer,
  );

  const displayedQuestions =
    filter === 'incorrect'
      ? incorrectQuestions
      : filter === 'correct'
      ? correctQuestions
      : questions;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Results Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-700/70">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Exam Complete
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {exam.metadata.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {exam.metadata.subject} • {exam.metadata.topic} • {exam.metadata.difficulty}
            </p>
          </div>

          <div className="text-right sm:text-right flex items-center sm:flex-col gap-4 sm:gap-1">
            <div className="text-4xl sm:text-5xl font-black text-white font-['Plus_Jakarta_Sans']">
              {attempt.percentage}%
            </div>
            <div>
              <span className={`text-sm font-bold ${gradeColor}`}>{grade}</span>
              <p className="text-[11px] text-slate-400">{gradeLabel}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Score</span>
            <div className="text-xl font-bold text-white mt-1">
              {attempt.score} <span className="text-xs text-slate-400">/ {attempt.totalQuestions}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Time Taken</span>
            <div className="text-xl font-bold text-slate-200 mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{formatSeconds(attempt.timeSpentSeconds)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Correct Answers</span>
            <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{correctQuestions.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Needs Review</span>
            <div className="text-xl font-bold text-rose-400 mt-1 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>{incorrectQuestions.length}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <button
            onClick={onRetakeExam}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Full Exam</span>
          </button>

          {incorrectQuestions.length > 0 && (
            <button
              onClick={() => onRetakeIncorrect(incorrectQuestions)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Missed Questions ({incorrectQuestions.length})</span>
            </button>
          )}

          <button
            onClick={onSwitchToPractice}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Practice Mode</span>
          </button>

          <button
            onClick={onOpenPrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Worksheet</span>
          </button>
        </div>
      </div>

      {/* Concept Breakdown Section */}
      {Object.keys(attempt.conceptBreakdown).length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Performance by Concept
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(attempt.conceptBreakdown).map(([concept, data]) => {
              const pct = Math.round((data.correct / data.total) * 100);
              return (
                <div key={concept}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-200">{concept}</span>
                    <span className="text-slate-400">
                      {data.correct} / {data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-sky-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Question Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">
            Question-by-Question Review
          </h3>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'incorrect'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Missed ({incorrectQuestions.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Correct ({correctQuestions.length})
            </button>
          </div>
        </div>

        {displayedQuestions.map((q, idx) => {
          const studentChoice = attempt.answers[q.id];
          const isCorrect = studentChoice === q.correctAnswer;
          const isExpanded = expandedExplanation[q.id] ?? true;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl border transition-all ${
                isCorrect
                  ? 'bg-slate-800/60 border-emerald-500/30'
                  : 'bg-slate-800/60 border-rose-500/30'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Missed
                      </span>
                    )}
                  </span>
                  {q.conceptTag && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      {q.conceptTag}
                    </span>
                  )}
                </div>

                {/* AI Tutor Button */}
                <button
                  onClick={() => onOpenTutor(q, studentChoice)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask AI Tutor</span>
                </button>
              </div>

              {/* Question Stem */}
              <h4 className="text-base font-semibold text-slate-100 mb-4 leading-relaxed">
                {q.question}
              </h4>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {q.options.map((opt) => {
                  const isThisCorrect = opt.label === q.correctAnswer;
                  const isThisSelected = opt.label === studentChoice;

                  let optStyles = 'bg-slate-900/60 border-slate-700/80 text-slate-300';
                  let badgeStyles = 'bg-slate-800 text-slate-400';

                  if (isThisCorrect) {
                    optStyles = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-100';
                    badgeStyles = 'bg-emerald-500 text-slate-900 font-black';
                  } else if (isThisSelected && !isThisCorrect) {
                    optStyles = 'bg-rose-500/15 border-rose-500/60 text-rose-100';
                    badgeStyles = 'bg-rose-500 text-white font-black';
                  }

                  return (
                    <div
                      key={opt.label}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${optStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${badgeStyles}`}>
                          {opt.label}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      <div>
                        {isThisCorrect && (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                          </span>
                        )}
                        {isThisSelected && !isThisCorrect && (
                          <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Your Choice
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Toggleable Rationale */}
              <div className="mt-3 pt-3 border-t border-slate-700/60">
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Explanation & Distractor Analysis
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
                    <div>
                      <span className="font-bold text-emerald-400">Why {q.correctAnswer} is correct: </span>
                      <span>{q.explanation}</span>
                    </div>
                    {q.distractorExplanation && (
                      <div className="pt-2 border-t border-slate-800 text-slate-400">
                        <span className="font-semibold text-slate-300">Why distractors are wrong: </span>
                        <span>{q.distractorExplanation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
