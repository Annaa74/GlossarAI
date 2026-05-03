import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { Vocabulary } from '../types';
import { writeWordOfTheDay, WordOfTheDaySnapshot } from './storage';
import { WordOfTheDayWidget } from './WordOfTheDayWidget';

/**
 * Deterministic daily picker mirroring hooks/useWordOfTheDay so the widget
 * stays in sync with what the in-app card shows.
 */
const dailySeed = (date = new Date()): number =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const pickDailyWord = (pool: Vocabulary[]): Vocabulary | null => {
  if (pool.length === 0) return null;
  return pool[dailySeed() % pool.length];
};

/**
 * Compute today's word from the vocab list, persist it to AsyncStorage so the
 * widget task handler can read it, and ask Android to redraw any placed
 * widgets. No-op on iOS / web for the redraw step (storage write still runs).
 */
export const syncWordOfTheDayWidget = async (vocabularies: Vocabulary[]): Promise<void> => {
  const word = pickDailyWord(vocabularies);
  if (!word) return;

  const snapshot: WordOfTheDaySnapshot = {
    term: word.term,
    definition: word.definition,
    category: word.category,
    publishedAt: new Date().toISOString(),
  };

  await writeWordOfTheDay(snapshot);

  if (Platform.OS !== 'android') return;

  try {
    await requestWidgetUpdate({
      widgetName: 'WordOfTheDay',
      renderWidget: () => <WordOfTheDayWidget snapshot={snapshot} />,
    });
  } catch (e) {
    console.warn('[widget-sync] requestWidgetUpdate failed:', e);
  }
};
