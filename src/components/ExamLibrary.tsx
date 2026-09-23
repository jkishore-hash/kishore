import React from 'react';
import {
  Library,
  Calendar,
  CheckCircle2,
  Trash2,
  Play,
  BookOpen,
  Layers,
  Sparkles,
  PlusCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { ExamPackage, ExamAttempt } from '../types/exam';

interface ExamLibraryProps {
  exams: ExamPackage[];
  pastAttempts: ExamAttempt[];
  onSelectExam: (exam: ExamPackage, mode: 'exam' | 'practice' | 'flashcards') => void;
  onDeleteExam: (examId: string) => void;
  onNewExam: () => void;
  onRestoreCurated: () => void;
}

export const ExamLibrary: React.FC<ExamLibraryProps> = ({
  exams,
  pastAttempts,
  onSelectExam,
  onDeleteExam,
  onNewExam,
  onRestoreCurated,
}) => {
  const getLatestAttempt = (examId: string) => {
    return pastAttempts.find((a) => a.examId === examId);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Library className="w-6 h-6 text-indigo-400" />
            <span>Exam Library & History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your generated exams, review past assessment scores, or retake tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRestoreCurated}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Curated Sets</span>
          </button>

          <button
            onClick={onNewExam}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Exam</span>
          </button>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-800/40 border border-slate-700/60 space-y-4">
          <Library className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            No Saved Exams Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate your first exam with our AI creator or load our curated starter exams to begin testing immediately.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onNewExam}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Generate Exam
            </button>
            <button
              onClick={onRestoreCurated}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
            >
              Load Sample Exams
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const latestAttempt = getLatestAttempt(exam.metadata.id);

            return (
              <div
                key={exam.metadata.id}
                className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {exam.metadata.subject}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {exam.metadata.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteExam(exam.metadata.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                    {exam.metadata.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    Topic: {exam.metadata.topic}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      {exam.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(exam.metadata.createdAt)}
                    </span>
                  </div>

                  {latestAttempt && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Latest Score:</span>
                      <span
                        className={`font-bold ${
                          latestAttempt.percentage >= 80
                            ? 'text-emerald-400'
                            : latestAttempt.percentage >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {latestAttempt.percentage}% ({latestAttempt.score}/{latestAttempt.totalQuestions})
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2">
                  <button
                    onClick={() => onSelectExam(exam, 'exam')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Timed Test</span>
                  </button>

                  <button
                    onClick={() => onSelectExam(exam, 'practice')}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Self-paced Practice Mode"
                  >
                    <BookOpen className="w-4 h-4 text-sky-400" />
                  </button>

                  <button
                    onClick={() => onSelectExam(exam, 'flashcards')}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Flashcards Mode"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
