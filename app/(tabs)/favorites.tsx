import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVocabStore } from '../../stores/vocabStore';
import {
  useThemedColors,
  NEO,
  BRUTAL,
  BRUTAL_SHADOW,
  BRUTAL_SHADOW_SM,
} from '../../constants/theme';
import { getCategoryColor } from '../../constants/categories';
import { Vocabulary } from '../../types';

export default function FavoritesScreen() {
  const c = useThemedColors();
  const vocabularies = useVocabStore((s) => s.vocabularies);
  const favorites = useVocabStore((s) => s.favorites);
  const toggleFavorite = useVocabStore((s) => s.toggleFavorite);

  // Stable list — recomputed only when the favorite set or vocab list changes.
  const favoriteCards = useMemo(() => {
    if (favorites.size === 0) return [] as Vocabulary[];
    const lookup = new Map(vocabularies.map((v) => [v.id, v]));
    const result: Vocabulary[] = [];
    favorites.forEach((id) => {
      const v = lookup.get(id);
      if (v) result.push(v);
    });
    return result;
  }, [favorites, vocabularies]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.bg }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>FAVORITES</Text>
            <Text style={styles.subtitle}>
              {favoriteCards.length === 0
                ? 'NOTHING SAVED YET'
                : `${favoriteCards.length} ${favoriteCards.length === 1 ? 'CARD' : 'CARDS'} SAVED`}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="heart" size={26} color={NEO.ink} />
          </View>
        </View>

        {favoriteCards.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="heart-outline" size={48} color={NEO.ink} />
            </View>
            <Text style={styles.emptyTitle}>NO FAVORITES YET</Text>
            <Text style={styles.emptyBody}>
              Swipe up on a card to favorite it. Saved cards live here so you can review them
              anytime.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(tabs)')}
              buttonColor={NEO.yellow}
              textColor={NEO.ink}
              style={styles.emptyBtn}
              labelStyle={styles.emptyBtnLabel}
              icon="cards-outline"
            >
              GO TO DECK
            </Button>
          </View>
        ) : (
          <View style={styles.list}>
            {favoriteCards.map((vocab) => (
              <FavoriteRow key={vocab.id} vocab={vocab} onUnfavorite={toggleFavorite} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const FavoriteRow: React.FC<{
  vocab: Vocabulary;
  onUnfavorite: (id: string) => void;
}> = ({ vocab, onUnfavorite }) => {
  const categoryColor = getCategoryColor(vocab.category);
  return (
    <View style={styles.row}>
      <View style={[styles.accent, { backgroundColor: categoryColor }]} />
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{vocab.category}</Text>
          </View>
          <Pressable
            onPress={() => onUnfavorite(vocab.id)}
            hitSlop={10}
            style={({ pressed }) => [styles.heartBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialCommunityIcons name="heart" size={20} color={NEO.pink} />
          </Pressable>
        </View>
        <Text style={styles.term} numberOfLines={2}>
          {vocab.term}
        </Text>
        <Text style={styles.definition} numberOfLines={3}>
          {vocab.definition}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    color: NEO.ink,
    marginTop: 4,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    backgroundColor: NEO.pink,
    boxShadow: BRUTAL_SHADOW_SM,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    backgroundColor: NEO.cream,
    boxShadow: BRUTAL_SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.6,
  },
  emptyBody: {
    fontSize: 13,
    color: NEO.ink,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    fontWeight: '600',
  },
  emptyBtn: {
    marginTop: 22,
    alignSelf: 'stretch',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
  },
  emptyBtnLabel: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: NEO.white,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    overflow: 'hidden',
  },
  accent: {
    width: 8,
    borderRightWidth: BRUTAL.border,
    borderRightColor: NEO.ink,
  },
  rowBody: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heartBtn: {
    padding: 4,
  },
  term: {
    fontSize: 22,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.6,
    textTransform: 'uppercase',
  },
  definition: {
    fontSize: 13,
    color: NEO.ink,
    lineHeight: 18,
    fontWeight: '500',
  },
});
