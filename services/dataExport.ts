import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAllUserProgress } from './vocabulary';

export interface ExportedUserData {
  exportedAt: string;
  schemaVersion: 1;
  profile: Record<string, unknown> | null;
  favorites: string[];
  progress: Record<string, unknown>[];
}

/**
 * Collect everything we have about a user into a single JSON-serializable
 * object — for self-service data export (App Store / GDPR requirement).
 *
 * Pulls from:
 *   - users/{uid}                  → profile fields + favorites array
 *   - userProgress/{uid}/cards     → SRS state per card
 *
 * Returns null fields rather than throwing when data is missing, so the
 * export still succeeds for partial profiles.
 */
export const exportUserDataJson = async (userId: string): Promise<string> => {
  if (userId.startsWith('guest-')) {
    // Guests have no Firestore footprint — fall back to whatever's in the
    // local store. Caller can still share that.
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        schemaVersion: 1,
        profile: null,
        favorites: [],
        progress: [],
        note: 'Guest mode — no cloud data. See app local storage for state.',
      },
      null,
      2
    );
  }

  const profileSnap = await getDoc(doc(db, 'users', userId));
  const profileData = profileSnap.exists() ? profileSnap.data() : null;

  const favorites = Array.isArray(profileData?.favorites)
    ? (profileData?.favorites as string[])
    : [];

  // Strip favorites out of the profile blob so we don't double-emit them.
  const profile = profileData
    ? Object.fromEntries(Object.entries(profileData).filter(([k]) => k !== 'favorites'))
    : null;

  const progressEntries = await getAllUserProgress(userId);

  const exported: ExportedUserData = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    profile,
    favorites,
    progress: progressEntries.map((p) => ({
      vocabId: p.vocabId,
      status: p.status,
      easeFactor: p.easeFactor,
      interval: p.interval,
      reviewCount: p.reviewCount,
      nextReviewDate: p.nextReviewDate?.toISOString?.() ?? null,
      lastReviewDate: p.lastReviewDate?.toISOString?.() ?? null,
    })),
  };

  return JSON.stringify(exported, null, 2);
};
