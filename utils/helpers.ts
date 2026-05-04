import { QuizQuestion, Vocabulary } from '../types';

// Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    if (overdueDays === 1) return 'Overdue by 1 day';
    return `Overdue by ${overdueDays} days`;
  }

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 7) return `Due in ${diffDays} days`;
  if (diffDays < 30) return `Due in ${Math.floor(diffDays / 7)} weeks`;
  return `Due in ${Math.floor(diffDays / 30)} months`;
};

// Build a definition→term multiple-choice question with 3 distractor terms
// drawn from the supplied pool (excluding the target vocab).
const buildMultipleChoice = (
  vocab: Vocabulary,
  pool: Vocabulary[],
  index: number
): QuizQuestion => {
  const distractors = pool
    .filter((v) => v.id !== vocab.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((v) => v.term);

  const options = [vocab.term, ...distractors].sort(() => Math.random() - 0.5);

  return {
    id: `q-${index}`,
    vocabId: vocab.id,
    type: 'multiple_choice',
    question: `What term matches this definition?\n\n"${vocab.definition}"`,
    options,
    correctAnswer: vocab.term,
  };
};

// Generate quiz questions from vocabulary. MCQ-only: every question shows a
// definition and asks the user to pick the matching term from 4 options.
export const generateQuizQuestions = (
  vocabularies: Vocabulary[],
  count: number = 10
): QuizQuestion[] => {
  const shuffled = [...vocabularies].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, vocabularies.length));
  return selected.map((vocab, index) => buildMultipleChoice(vocab, shuffled, index));
};

// Shuffle array
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password (min 8 chars, at least 1 number)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /\d/.test(password);
};

// Get greeting based on time of day
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};
