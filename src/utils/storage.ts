import { ExamPackage, ExamAttempt } from '../types/exam';
import { CURATED_EXAMS } from '../data/curatedExams';

const EXAMS_STORAGE_KEY = 'examcraft_saved_exams_v1';
const ATTEMPTS_STORAGE_KEY = 'examcraft_past_attempts_v1';

export function getSavedExams(): ExamPackage[] {
  try {
    const raw = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (!raw) {
      // Seed with curated exams if empty
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(CURATED_EXAMS));
      return CURATED_EXAMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : CURATED_EXAMS;
  } catch (err) {
    console.error('Error loading saved exams:', err);
    return CURATED_EXAMS;
  }
}

export function saveExam(exam: ExamPackage): void {
  try {
    const current = getSavedExams();
    const existingIndex = current.findIndex((e) => e.metadata.id === exam.metadata.id);
    let updated: ExamPackage[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = exam;
    } else {
      updated = [exam, ...current];
    }
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving exam:', err);
  }
}

export function deleteExam(examId: string): ExamPackage[] {
  try {
    const current = getSavedExams();
    const updated = current.filter((e) => e.metadata.id !== examId);
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting exam:', err);
    return [];
  }
}

export function getPastAttempts(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error loading past attempts:', err);
    return [];
  }
}

export function savePastAttempt(attempt: ExamAttempt): void {
  try {
    const current = getPastAttempts();
    const updated = [attempt, ...current].slice(0, 50); // keep last 50
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving attempt:', err);
  }
}
