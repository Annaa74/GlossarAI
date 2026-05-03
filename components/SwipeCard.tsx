import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Vocabulary } from '../types';
import { getCategoryColor, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../constants/categories';
import { NEO, BRUTAL, BRUTAL_SHADOW_LG } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT_DEFAULT = 440;

interface SwipeCardProps {
  vocab: Vocabulary;
  /** When provided (from a measured deck region), the card fills this exact height. */
  height?: number;
}

const SwipeCardImpl: React.FC<SwipeCardProps> = ({ vocab, height }) => {
  const CARD_HEIGHT = Math.max(280, height ?? CARD_HEIGHT_DEFAULT);
  const categoryColor = getCategoryColor(vocab.category);
  const difficultyColor = DIFFICULTY_COLORS[vocab.difficulty];

  return (
    <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

        <View style={styles.metaRow}>
          <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{vocab.category}</Text>
          </View>
          <View style={[styles.difficultyPill, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>{DIFFICULTY_LABELS[vocab.difficulty]}</Text>
          </View>
        </View>

        <View style={styles.termWrap}>
          <Text style={styles.term} numberOfLines={2} adjustsFontSizeToFit>
            {vocab.term}
          </Text>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DEFINITION</Text>
            <Text style={styles.definition}>{vocab.definition}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EXAMPLE</Text>
            <View style={[styles.exampleBox, { backgroundColor: categoryColor }]}>
              <Text style={styles.example}>{vocab.example}</Text>
            </View>
          </View>

          {vocab.relatedTerms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RELATED</Text>
              <View style={styles.relatedRow}>
                {vocab.relatedTerms.slice(0, 4).map((t) => (
                  <View key={t} style={styles.relatedChip}>
                    <Text style={styles.relatedChipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: NEO.white,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_LG,
    overflow: 'hidden',
  },
  accentBar: {
    height: 10,
    width: '100%',
    borderBottomWidth: BRUTAL.borderThick,
    borderBottomColor: NEO.ink,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  termWrap: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  term: {
    fontSize: 32,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -1,
    lineHeight: 38,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  section: {},
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  definition: {
    fontSize: 14,
    lineHeight: 20,
    color: NEO.ink,
    fontWeight: '500',
    textAlign: 'justify',
  },
  exampleBox: {
    padding: 10,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    borderRadius: BRUTAL.radius,
  },
  example: {
    fontSize: 13,
    lineHeight: 19,
    color: NEO.ink,
    fontWeight: '600',
    textAlign: 'justify',
  },
  relatedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  relatedChip: {
    backgroundColor: NEO.cream,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    borderRadius: BRUTAL.radius,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  relatedChipText: {
    fontSize: 12,
    color: NEO.ink,
    fontWeight: '700',
  },
});

export const SwipeCard = React.memo(
  SwipeCardImpl,
  (prev, next) => prev.vocab.id === next.vocab.id && prev.height === next.height
);

export default SwipeCard;
