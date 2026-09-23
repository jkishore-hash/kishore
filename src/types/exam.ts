export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  distractorExplanation?: string;
  hint?: string;
  conceptTag?: string;
  difficulty?: DifficultyLevel;
}

export interface ExamMetadata {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  createdAt: string;
  targetAudience?: string;
  customFocus?: string;
}

export interface ExamPackage {
  metadata: ExamMetadata;
  questions: ExamQuestion[];
}

export interface ExamGenerationRequest {
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  number: number;
  targetAudience?: string;
  customFocus?: string;
  language?: string;
}

export interface QuestionExplanationRequest {
  question: string;
  selectedOption?: 'A' | 'B' | 'C' | 'D' | null;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  options: QuestionOption[];
  explanation: string;
  studentQuery: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
  flagged: Record<string, boolean>;
  startedAt: number;
  completedAt?: number;
  timeSpentSeconds: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  conceptBreakdown: Record<string, { total: number; correct: number }>;
}

export type ViewMode = 'create' | 'exam' | 'practice' | 'flashcards' | 'results' | 'print' | 'library';
