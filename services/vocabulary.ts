import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Vocabulary, VocabCategory, UserProgress, CardStatus } from '../types';

// Collection references
const vocabCollection = collection(db, 'vocabularies');
const progressCollection = (userId: string) => collection(db, 'userProgress', userId, 'cards');

// Fetch all approved vocabularies
export const getAllVocabularies = async (): Promise<Vocabulary[]> => {
  const q = query(vocabCollection, where('approved', '==', true), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Vocabulary[];
};

// Fetch vocabularies by category
export const getVocabulariesByCategory = async (category: VocabCategory): Promise<Vocabulary[]> => {
  const q = query(
    vocabCollection,
    where('approved', '==', true),
    where('category', '==', category),
    orderBy('difficulty', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Vocabulary[];
};

// Fetch single vocabulary by ID
export const getVocabularyById = async (id: string): Promise<Vocabulary | null> => {
  const docRef = doc(db, 'vocabularies', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate() || new Date(),
  } as Vocabulary;
};

// Get user progress for a vocabulary
export const getUserProgress = async (
  userId: string,
  vocabId: string
): Promise<UserProgress | null> => {
  const docRef = doc(db, 'userProgress', userId, 'cards', vocabId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    vocabId,
    userId,
    status: data.status,
    easeFactor: data.easeFactor,
    interval: data.interval,
    nextReviewDate: data.nextReviewDate?.toDate() || new Date(),
    reviewCount: data.reviewCount,
    lastReviewDate: data.lastReviewDate?.toDate() || null,
  };
};

// Get all user progress
export const getAllUserProgress = async (userId: string): Promise<UserProgress[]> => {
  const snapshot = await getDocs(progressCollection(userId));

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      vocabId: doc.id,
      userId,
      status: data.status,
      easeFactor: data.easeFactor,
      interval: data.interval,
      nextReviewDate: data.nextReviewDate?.toDate() || new Date(),
      reviewCount: data.reviewCount,
      lastReviewDate: data.lastReviewDate?.toDate() || null,
    };
  });
};

// Update or create user progress
export const updateUserProgress = async (
  userId: string,
  progress: Omit<UserProgress, 'id' | 'userId'>
): Promise<void> => {
  const docRef = doc(db, 'userProgress', userId, 'cards', progress.vocabId);

  await setDoc(docRef, {
    status: progress.status,
    easeFactor: progress.easeFactor,
    interval: progress.interval,
    nextReviewDate: Timestamp.fromDate(progress.nextReviewDate),
    reviewCount: progress.reviewCount,
    lastReviewDate: progress.lastReviewDate ? Timestamp.fromDate(progress.lastReviewDate) : null,
  });
};

// Get cards due for review
export const getCardsForReview = async (
  userId: string,
  limitCount: number = 20
): Promise<Vocabulary[]> => {
  const now = new Date();
  const progressSnapshot = await getDocs(progressCollection(userId));

  // Get vocab IDs that are due for review
  const dueVocabIds: string[] = [];
  const newVocabIds: string[] = [];

  progressSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const nextReview = data.nextReviewDate?.toDate();

    if (nextReview && nextReview <= now) {
      dueVocabIds.push(doc.id);
    }
  });

  // Get all vocab to find new ones
  const allVocab = await getAllVocabularies();
  const progressIds = new Set(progressSnapshot.docs.map((d) => d.id));

  allVocab.forEach((vocab) => {
    if (!progressIds.has(vocab.id)) {
      newVocabIds.push(vocab.id);
    }
  });

  // Combine due and new cards, prioritize due cards
  const cardIds = [...dueVocabIds, ...newVocabIds].slice(0, limitCount);

  // Fetch the actual vocabulary data
  const cards = allVocab.filter((v) => cardIds.includes(v.id));

  // Sort: due cards first (by next review date), then new cards
  return cards.sort((a, b) => {
    const aIsDue = dueVocabIds.includes(a.id);
    const bIsDue = dueVocabIds.includes(b.id);

    if (aIsDue && !bIsDue) return -1;
    if (!aIsDue && bIsDue) return 1;
    return 0;
  });
};

// Pull the user's favorites list (vocab IDs) from their profile doc.
// Returns [] if the field is unset or the doc doesn't exist yet.
export const getRemoteFavorites = async (userId: string): Promise<string[]> => {
  const docRef = doc(db, 'users', userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.favorites) ? (data.favorites as string[]) : [];
};

// Replace the user's favorites array with the given set of IDs. Uses merge
// so other profile fields are preserved.
export const setRemoteFavorites = async (userId: string, favoriteIds: string[]): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { favorites: favoriteIds }, { merge: true });
};

// Get category statistics
export const getCategoryStats = async (
  userId: string
): Promise<Record<VocabCategory, { total: number; known: number; learning: number }>> => {
  const [allVocab, progress] = await Promise.all([
    getAllVocabularies(),
    getAllUserProgress(userId),
  ]);

  const progressMap = new Map(progress.map((p) => [p.vocabId, p]));

  const stats: Record<VocabCategory, { total: number; known: number; learning: number }> = {
    'AI/ML': { total: 0, known: 0, learning: 0 },
    'Agentic AI': { total: 0, known: 0, learning: 0 },
    Backend: { total: 0, known: 0, learning: 0 },
    Frontend: { total: 0, known: 0, learning: 0 },
    DevOps: { total: 0, known: 0, learning: 0 },
    Cloud: { total: 0, known: 0, learning: 0 },
    Databases: { total: 0, known: 0, learning: 0 },
    Security: { total: 0, known: 0, learning: 0 },
  };

  allVocab.forEach((vocab) => {
    const category = vocab.category;
    stats[category].total++;

    const userProgress = progressMap.get(vocab.id);
    if (userProgress) {
      if (userProgress.status === 'known') {
        stats[category].known++;
      } else if (userProgress.status === 'learning') {
        stats[category].learning++;
      }
    }
  });

  return stats;
};
