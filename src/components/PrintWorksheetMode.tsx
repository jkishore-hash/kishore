import React, { useState } from 'react';
import {
  Printer,
  FileText,
  CheckSquare,
  Settings,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { ExamPackage } from '../types/exam';

interface PrintWorksheetModeProps {
  exam: ExamPackage;
  onBack: () => void;
}

export const PrintWorksheetMode: React.FC<PrintWorksheetModeProps> = ({
  exam,
  onBack,
}) => {
  const { metadata, questions } = exam;
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [pageBreakBeforeKey, setPageBreakBeforeKey] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Controls Bar (Hidden during printing) */}
      <div className="print:hidden p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </button>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAnswerKey}
              onChange={(e) => setIncludeAnswerKey(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Include Answer Key</span>
          </label>

          {includeAnswerKey && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExplanations}
                  onChange={(e) => setIncludeExplanations(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Include Explanations</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageBreakBeforeKey}
                  onChange={(e) => setPageBreakBeforeKey(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Page Break Before Key</span>
              </label>
            </>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Paper Document Container */}
      <div className="p-8 sm:p-12 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Academic Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {metadata.title}
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                Subject: {metadata.subject} &bull; Unit: {metadata.topic} &bull; Difficulty: {metadata.difficulty}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase font-bold text-slate-500">Official Assessment</div>
              <div className="text-sm font-bold text-slate-800">{questions.length} Total Questions</div>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-700 pt-3 border-t border-slate-300">
            <div>
              <span className="font-bold">Student Name:</span>
              <div className="border-b border-dotted border-slate-500 h-5 mt-1" />
            </div>
            <div>
              <span className="font-bold">Date:</span>
              <div className="border-b border-dotted border-slate-500 h-5 mt-1" />
            </div>
            <div>
              <span className="font-bold">Class / Period:</span>
              <div className="border-b border-dotted border-slate-500 h-5 mt-1" />
            </div>
            <div>
              <span className="font-bold">Score:</span>
              <div className="border-b border-dotted border-slate-500 h-5 mt-1">
                <span className="float-right text-slate-400">/ {questions.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-3 rounded-lg bg-slate-100 text-xs text-slate-700 border border-slate-200">
          <span className="font-bold">Instructions: </span>
          Choose the single best answer for each question. Clearly circle or fill in the bubble corresponding to your selected option. There is only one correct answer per question.
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-3 break-inside-avoid">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-sm text-slate-900">
                  {idx + 1}.
                </span>
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {q.question}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 text-xs text-slate-800">
                {q.options.map((opt) => (
                  <div key={opt.label} className="flex items-start gap-2 py-1">
                    <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {opt.label}
                    </span>
                    <span className="pt-0.5">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key Section (Optional) */}
        {includeAnswerKey && (
          <div
            className={`mt-12 pt-8 border-t-2 border-slate-900 ${
              pageBreakBeforeKey ? 'print:break-before-page' : ''
            }`}
          >
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                ANSWER KEY & INSTRUCTOR RATIONALE
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {metadata.title} &bull; Answer Verification & Conceptual Rationales
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs break-inside-avoid space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>
                      Question {idx + 1}: Option [{q.correctAnswer}]
                    </span>
                    {q.conceptTag && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {q.conceptTag}
                      </span>
                    )}
                  </div>

                  {includeExplanations && (
                    <>
                      <p className="text-slate-700">
                        <span className="font-semibold text-emerald-800">Explanation: </span>
                        {q.explanation}
                      </p>
                      {q.distractorExplanation && (
                        <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                          <span className="font-semibold text-slate-700">Distractor Analysis: </span>
                          {q.distractorExplanation}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
