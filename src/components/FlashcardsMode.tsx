import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Check,
  X,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
} from 'lucide-react';
import { ExamPackage, ExamQuestion } from '../types/exam';

interface FlashcardsModeProps {
  exam: ExamPackage;
}

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({ exam }) => {
  const [cards, setCards] = useState<ExamQuestion[]>(exam.questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    setMasteredIds((prev) => new Set(prev).add(currentCard.id));
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    goToNextCard();
  };

  const handleMarkReview = () => {
    if (!currentCard) return;
    setReviewIds((prev) => new Set(prev).add(currentCard.id));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    goToNextCard();
  };

  const goToNextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const correctOption = currentCard?.options.find((o) => o.label === currentCard.correctAnswer);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Active Recall Flashcards
          </span>
          <h2 className="text-base font-bold text-white mt-1">
            {exam.metadata.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>
          Card <span className="font-bold text-white">{currentIndex + 1}</span> of{' '}
          <span className="font-bold text-white">{cards.length}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-emerald-400 font-semibold">
            Mastered: {masteredIds.size}
          </span>
          <span className="text-amber-400 font-semibold">
            To Review: {reviewIds.size}
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[380px] cursor-pointer perspective-[1000px] select-none"
      >
        <div
          className={`relative w-full min-h-[380px] rounded-3xl transition-transform duration-500 transform-style-3d p-8 flex flex-col justify-between shadow-2xl border ${
            isFlipped
              ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500/50 rotate-y-180'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          {!isFlipped ? (
            /* Card Front */
            <div className="flex flex-col justify-between h-full space-y-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-400 uppercase tracking-wider">
                  Question #{currentCard.questionNumber}
                </span>
                {currentCard.conceptTag && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                    {currentCard.conceptTag}
                  </span>
                )}
              </div>

              <div className="my-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  {currentCard.question}
                </h3>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 opacity-75">
                  {currentCard.options.map((opt) => (
                    <div key={opt.label} className="p-2 rounded bg-slate-900/60 border border-slate-700/60">
                      <span className="font-bold text-slate-400 mr-2">{opt.label}:</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-4 border-t border-slate-700/50">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Click card or tap anywhere to reveal answer & rationale</span>
              </div>
            </div>
          ) : (
            /* Card Back */
            <div className="flex flex-col justify-between h-full space-y-6 transform rotate-y-180">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider">
                  Correct Answer
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Option {currentCard.correctAnswer}
                </span>
              </div>

              <div className="my-auto space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-100">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                    Key Answer
                  </span>
                  <p className="text-base font-bold">
                    {correctOption?.text || currentCard.correctAnswer}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-400 block">
                    Core Explanation
                  </span>
                  <p className="leading-relaxed">{currentCard.explanation}</p>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-4 border-t border-slate-800">
                <span>Click again to flip back to question</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mastery Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          disabled={currentIndex === 0}
          onClick={goToPrevCard}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex gap-3">
          <button
            onClick={handleMarkReview}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 text-amber-400" />
            <span>Still Learning</span>
          </button>

          <button
            onClick={handleMarkMastered}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Mastered</span>
          </button>
        </div>

        <button
          disabled={currentIndex === cards.length - 1}
          onClick={goToNextCard}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
