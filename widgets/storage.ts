import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Shared keys used by the app to publish data and by the home-screen widgets
 * to read it. The widget task handler runs in a separate process via
 * react-native-android-widget but accesses the same AsyncStorage.
 */
export const WIDGET_STORAGE_KEYS = {
  wordOfTheDay: 'widget:word-of-the-day',
} as const;

export interface WordOfTheDaySnapshot {
  term: string;
  definition: string;
  category: string;
  /** ISO date string of when this snapshot was published. */
  publishedAt: string;
}

export const writeWordOfTheDay = async (snapshot: WordOfTheDaySnapshot): Promise<void> => {
  try {
    await AsyncStorage.setItem(WIDGET_STORAGE_KEYS.wordOfTheDay, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('[widget-storage] failed to write WotD snapshot:', e);
  }
};

export const readWordOfTheDay = async (): Promise<WordOfTheDaySnapshot | null> => {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEYS.wordOfTheDay);
    if (!raw) return null;
    return JSON.parse(raw) as WordOfTheDaySnapshot;
  } catch (e) {
    console.warn('[widget-storage] failed to read WotD snapshot:', e);
    return null;
  }
};
