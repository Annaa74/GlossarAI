// Vocabulary Types
export interface Vocabulary {
  id: string;
  term: string;
  definition: string;
  example: string;
  category: VocabCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  relatedTerms: string[];
  createdAt: Date;
  source: 'AI-generated' | 'manual' | 'community';
  approved: boolean;
}

export type VocabCategory =
  | 'AI/ML'
  | 'Agentic AI'
  | 'Backend'
  | 'Frontend'
  | 'DevOps'
  | 'Cloud'
  | 'Databases'
  | 'Security';

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  streak: number;
  lastStudyDate: Date | null;
  notificationSettings: NotificationSettings;
  createdAt: Date;
  // Mirrored from FirebaseUser.emailVerified at sign-in / reload time.
  // Always true for guest users (we don't have a real email to verify) and
  // for federated providers like Google.
  emailVerified: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // HH:mm format
  frequency: 'daily' | 'weekdays' | 'custom';
}

// User Progress Types
export type CardStatus = 'new' | 'learning' | 'known';

export interface UserProgress {
  id: string;
  vocabId: string;
  userId: string;
  status: CardStatus;
  easeFactor: number; // SM-2 ease factor (default 2.5)
  interval: number; // days until next review
  nextReviewDate: Date;
  reviewCount: number;
  lastReviewDate: Date | null;
}

// Pending Vocabulary (AI-generated, awaiting approval)
export interface PendingVocab {
  id: string;
  term: string;
  definition: string;
  example: string;
  category: VocabCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  relatedTerms: string[];
  generatedBy: 'AI' | 'community';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  vocabId: string;
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  timeSpent: number; // milliseconds
}

// Category Progress
export interface CategoryProgress {
  category: VocabCategory;
  total: number;
  known: number;
  learning: number;
  new: number;
  percentMastered: number;
}

// Swipe Actions
export type SwipeDirection = 'left' | 'right' | 'up';

export interface SwipeAction {
  direction: SwipeDirection;
  vocabId: string;
  timestamp: Date;
}

// App Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  dailyGoal: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'auth/login': undefined;
  'auth/signup': undefined;
  'vocab/[id]': { id: string };
};
