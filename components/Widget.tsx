import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Gradient } from './Gradient';
import { useWordOfTheDay } from '../hooks/useWordOfTheDay';
import { useUserStore } from '../stores/userStore';
import { useVocabStore } from '../stores/vocabStore';
import { useSettingsStore } from '../stores/settingsStore';
import { WidgetConfig, WidgetSize, WIDGET_CATALOG } from '../stores/widgetStore';
import { CATEGORIES, getCategoryInfo } from '../constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WidgetProps {
  config: WidgetConfig;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const sizeToDimensions = (size: WidgetSize) => {
  const padding = 32; // outer page padding
  const gap = 12;
  const halfWidth = (SCREEN_WIDTH - padding - gap) / 2;
  const fullWidth = SCREEN_WIDTH - padding;

  switch (size) {
    case 'small':
      return { width: halfWidth, height: 140 };
    case 'medium':
      return { width: fullWidth, height: 140 };
    case 'large':
      return { width: fullWidth, height: 220 };
  }
};

export const Widget: React.FC<WidgetProps> = ({ config, onPress, style }) => {
  const meta = WIDGET_CATALOG.find((w) => w.type === config.type);
  if (!meta) return null;

  const dims = sizeToDimensions(config.size);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[{ width: dims.width, height: dims.height }, style]}
    >
      <Gradient
        colors={meta.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        borderRadius={24}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.shine} pointerEvents="none" />
      <View style={styles.body}>
        <WidgetContent config={config} size={config.size} icon={meta.icon} />
      </View>
    </TouchableOpacity>
  );
};

const WidgetContent: React.FC<{ config: WidgetConfig; size: WidgetSize; icon: string }> = ({
  config,
  size,
  icon,
}) => {
  switch (config.type) {
    case 'word-of-the-day':
      return <WordOfTheDayContent size={size} icon={icon} />;
    case 'streak':
      return <StreakContent size={size} icon={icon} />;
    case 'daily-goal':
      return <DailyGoalContent size={size} icon={icon} />;
    case 'due-cards':
      return <DueCardsContent size={size} icon={icon} />;
    case 'category-spotlight':
      return <CategorySpotlightContent size={size} icon={icon} />;
    case 'quick-quiz':
      return <QuickQuizContent size={size} icon={icon} />;
    default:
      return null;
  }
};

const Header: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <View style={styles.header}>
    <View style={styles.iconBubble}>
      <MaterialCommunityIcons name={icon as any} size={16} color="#FFFFFF" />
    </View>
    <Text style={styles.headerLabel}>{label}</Text>
  </View>
);

const WordOfTheDayContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  const word = useWordOfTheDay();
  const isLarge = size === 'large';

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="WORD OF THE DAY" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.wotdTerm} numberOfLines={1} adjustsFontSizeToFit>
          {word?.term ?? 'No words yet'}
        </Text>
        {isLarge && word && (
          <Text style={styles.wotdDef} numberOfLines={3}>
            {word.definition}
          </Text>
        )}
        {!isLarge && word && (
          <Text style={styles.wotdCategory}>{word.category}</Text>
        )}
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.footerHint}>Tap to learn →</Text>
      </View>
    </View>
  );
};

const StreakContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  const { user } = useUserStore();
  const streak = user?.streak ?? 0;

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="STREAK" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.bigNumber}>{streak}</Text>
        <Text style={styles.bigNumberLabel}>
          {streak === 1 ? 'day in a row' : 'days in a row'}
        </Text>
      </View>
    </View>
  );
};

const DailyGoalContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  const { settings } = useSettingsStore();
  const goal = settings.dailyGoal;
  const reviewed = 0; // TODO: wire up real daily reviews
  const pct = Math.min(100, Math.round((reviewed / Math.max(1, goal)) * 100));

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="DAILY GOAL" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.goalText}>
          {reviewed}<Text style={styles.goalTextDim}>/{goal}</Text>
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  );
};

const DueCardsContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  const { currentCards } = useVocabStore();
  const due = currentCards.length;

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="DUE TODAY" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.bigNumber}>{due}</Text>
        <Text style={styles.bigNumberLabel}>
          {due === 1 ? 'card to review' : 'cards to review'}
        </Text>
      </View>
    </View>
  );
};

const CategorySpotlightContent: React.FC<{ size: WidgetSize; icon: string }> = ({
  size,
  icon,
}) => {
  const { vocabularies } = useVocabStore();
  const today = new Date();
  const idx = (today.getDate() + today.getMonth()) % CATEGORIES.length;
  const cat = CATEGORIES[idx];
  const count = vocabularies.filter((v) => v.category === cat.id).length;

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="CATEGORY SPOTLIGHT" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.spotlightTitle}>{cat.name}</Text>
        <Text style={styles.spotlightSubtitle}>{count} terms to explore</Text>
      </View>
      <Text style={styles.footerHint}>Open category →</Text>
    </View>
  );
};

const QuickQuizContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="QUICK QUIZ" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.quizTitle}>Test yourself</Text>
        <Text style={styles.quizSubtitle}>5 questions</Text>
      </View>
      <Text style={styles.footerHint}>Start →</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  contentColumn: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    opacity: 0.9,
  },
  wotdTerm: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  wotdDef: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  wotdCategory: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerHint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  bigNumber: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  bigNumberLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: -2,
  },
  goalText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  goalTextDim: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 22,
    fontWeight: '600',
  },
  progressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  spotlightTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  spotlightSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  quizTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  quizSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
});

export const navigateForWidget = (type: WidgetConfig['type']) => {
  switch (type) {
    case 'word-of-the-day':
    case 'due-cards':
    case 'category-spotlight':
      router.push('/(tabs)');
      break;
    case 'streak':
    case 'daily-goal':
      router.push('/(tabs)/progress');
      break;
    case 'quick-quiz':
      router.push('/(tabs)/quiz');
      break;
  }
};

export default Widget;
