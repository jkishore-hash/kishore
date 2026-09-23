import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ExamQuestion } from '../types/exam';

interface AiTutorModalProps {
  question: ExamQuestion;
  selectedOption?: 'A' | 'B' | 'C' | 'D' | null;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Explain with a real-world analogy',
  'Why is my chosen option incorrect?',
  'Give me a mnemonic or memory trick',
  'Explain like I am 12 years old',
];

export const AiTutorModal: React.FC<AiTutorModalProps> = ({
  question,
  selectedOption,
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAskTutor = async (customPrompt?: string) => {
    const promptToSend = customPrompt || query.trim();
    if (!promptToSend && !customPrompt) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          selectedOption,
          correctAnswer: question.correctAnswer,
          options: question.options,
          explanation: question.explanation,
          studentQuery: promptToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get tutor explanation');
      }

      setResponse(data.tutorExplanation);
    } catch (err: any) {
      console.error('Tutor error:', err);
      // Fallback helpful guidance if offline
      setResponse(
        `### Core Concept Breakdown\n\n**Key Takeaway:** The correct answer is Option ${question.correctAnswer}.\n\n` +
          `**Explanation:** ${question.explanation}\n\n` +
          (question.distractorExplanation
            ? `**Distractor Review:** ${question.distractorExplanation}\n\n`
            : '') +
          `**Helpful Tip:** Always watch out for absolute qualifiers (like "always" or "never") and verify key definitions before choosing.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const correctOptObj = question.options.find((o) => o.label === question.correctAnswer);
  const studentOptObj = selectedOption
    ? question.options.find((o) => o.label === selectedOption)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Concept Tutor</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Interactive Help
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Deep personalized breakdown for Question #{question.questionNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Question Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 text-xs space-y-2">
            <p className="font-semibold text-slate-200 line-clamp-2">
              {question.question}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Correct: [{question.correctAnswer}] {correctOptObj?.text}
              </span>
              {selectedOption && selectedOption !== question.correctAnswer && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  Your Answer: [{selectedOption}] {studentOptObj?.text}
                </span>
              )}
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Quick Inquiries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((promptText) => (
                <button
                  key={promptText}
                  disabled={isLoading}
                  onClick={() => {
                    setQuery(promptText);
                    handleAskTutor(promptText);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 text-slate-300 transition-colors"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Tutor Response Box */}
          {response && (
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-indigo-500/30 text-xs text-slate-200 space-y-3 leading-relaxed animate-fadeIn">
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px] pb-2 border-b border-slate-700/60">
                <Sparkles className="w-4 h-4" />
                <span>Tutor Explanation</span>
              </div>
              <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none">
                {response}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="p-6 text-center space-y-2 bg-slate-800/40 rounded-2xl border border-slate-800 animate-pulse">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-indigo-300 font-medium">
                Tutor is formulating a personalized breakdown...
              </p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
            placeholder="Ask anything about this question (e.g. why is B wrong?)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            disabled={isLoading || !query.trim()}
            onClick={() => handleAskTutor()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
