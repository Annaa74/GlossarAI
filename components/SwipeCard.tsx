import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Text, Chip, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Vocabulary } from '../types';
import { getCategoryColor, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 450;

interface SwipeCardProps {
  vocab: Vocabulary;
  onFlip?: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ vocab, onFlip }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;

    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const categoryColor = getCategoryColor(vocab.category);

  return (
    <TouchableWithoutFeedback onPress={handleFlip}>
      <View style={styles.container}>
        {/* Front of card */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <Surface style={styles.surface} elevation={4}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>{vocab.category}</Text>
            </View>

            <View style={styles.frontContent}>
              <Text style={styles.term}>{vocab.term}</Text>

              <View style={styles.tapHint}>
                <MaterialCommunityIcons name="gesture-tap" size={24} color="#9CA3AF" />
                <Text style={styles.tapHintText}>Tap to reveal definition</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Chip
                mode="flat"
                style={[
                  styles.difficultyChip,
                  { backgroundColor: DIFFICULTY_COLORS[vocab.difficulty] + '20' },
                ]}
                textStyle={{ color: DIFFICULTY_COLORS[vocab.difficulty], fontSize: 12 }}
              >
                {DIFFICULTY_LABELS[vocab.difficulty]}
              </Chip>
            </View>
          </Surface>
        </Animated.View>

        {/* Back of card */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Surface style={styles.surface} elevation={4}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>{vocab.category}</Text>
            </View>

            <View style={styles.backContent}>
              <Text style={styles.termSmall}>{vocab.term}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Definition</Text>
                <Text style={styles.definition}>{vocab.definition}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Example</Text>
                <Text style={styles.example}>"{vocab.example}"</Text>
              </View>

              {vocab.relatedTerms.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Related Terms</Text>
                  <View style={styles.relatedTerms}>
                    {vocab.relatedTerms.slice(0, 4).map((term, index) => (
                      <Chip key={index} mode="outlined" style={styles.relatedChip} compact>
                        {term}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.tapBackHint}>Tap to flip back</Text>
            </View>
          </Surface>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {},
  surface: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignSelf: 'center',
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  frontContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  term: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 24,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  tapHintText: {
    marginLeft: 8,
    color: '#9CA3AF',
    fontSize: 14,
  },
  backContent: {
    flex: 1,
    padding: 20,
    paddingTop: 16,
  },
  termSmall: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  definition: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  example: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  relatedTerms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  difficultyChip: {
    alignSelf: 'center',
  },
  tapBackHint: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

export default SwipeCard;
