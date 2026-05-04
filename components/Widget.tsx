import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useWordOfTheDay } from '../hooks/useWordOfTheDay';
import { useUserStore } from '../stores/userStore';
import { useVocabStore } from '../stores/vocabStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useGrowthStore } from '../stores/growthStore';
import { WidgetConfig, WidgetSize, WIDGET_CATALOG } from '../stores/widgetStore';
import { CATEGORIES } from '../constants/categories';
import { NEO, BRUTAL, BRUTAL_SHADOW } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WidgetProps {
  config: WidgetConfig;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const sizeToDimensions = (size: WidgetSize) => {
  const padding = 32;
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

const WidgetImpl: React.FC<WidgetProps> = ({ config, onPress, style }) => {
  const meta = WIDGET_CATALOG.find((w) => w.type === config.type);
  if (!meta) return null;

  const dims = sizeToDimensions(config.size);
  const bg = meta.accent[0];

  if (config.type === 'discover') {
    return (
      <View style={[{ width: dims.width, height: dims.height }, style]}>
        <DiscoverWidget config={config} icon={meta.icon} bg={bg} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[{ width: dims.width, height: dims.height }, style]}
    >
      <View style={[styles.shell, { backgroundColor: bg }]}>
        <View style={styles.body}>
          <WidgetContent config={config} size={config.size} icon={meta.icon} />
        </View>
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
      <MaterialCommunityIcons name={icon as any} size={14} color={NEO.ink} />
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
          {word?.term ?? 'NO WORDS YET'}
        </Text>
        {isLarge && word && (
          <Text style={styles.wotdDef} numberOfLines={3}>
            {word.definition}
          </Text>
        )}
        {!isLarge && word && <Text style={styles.wotdCategory}>{word.category}</Text>}
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.footerHint}>TAP TO LEARN →</Text>
      </View>
    </View>
  );
};

const StreakContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  const streak = useUserStore((s) => s.user?.streak ?? 0);

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="STREAK" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.bigNumber}>{streak}</Text>
        <Text style={styles.bigNumberLabel}>{streak === 1 ? 'DAY' : 'DAYS'}</Text>
      </View>
    </View>
  );
};

const DailyGoalContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  const { settings } = useSettingsStore();
  const goal = settings.dailyGoal;
  const reviewed = 0;
  const pct = Math.min(100, Math.round((reviewed / Math.max(1, goal)) * 100));

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="DAILY GOAL" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.goalText}>
          {reviewed}
          <Text style={styles.goalTextDim}>/{goal}</Text>
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  );
};

const DueCardsContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  // Selector returns a primitive — only re-renders when the number changes,
  // not on every swipe-related mutation of currentCards.
  const due = useVocabStore((s) => s.currentCards.length);

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="DUE TODAY" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.bigNumber}>{due}</Text>
        <Text style={styles.bigNumberLabel}>{due === 1 ? 'CARD' : 'CARDS'}</Text>
      </View>
    </View>
  );
};

const CategorySpotlightContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  const vocabularies = useVocabStore((s) => s.vocabularies);
  const today = new Date();
  const idx = (today.getDate() + today.getMonth()) % CATEGORIES.length;
  const cat = CATEGORIES[idx];
  const count = useMemo(
    () => vocabularies.filter((v) => v.category === cat.id).length,
    [vocabularies, cat.id]
  );

  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="SPOTLIGHT" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.spotlightTitle}>{cat.name}</Text>
        <Text style={styles.spotlightSubtitle}>{count} TERMS</Text>
      </View>
      <Text style={styles.footerHint}>OPEN →</Text>
    </View>
  );
};

const QuickQuizContent: React.FC<{ size: WidgetSize; icon: string }> = ({ size, icon }) => {
  return (
    <View style={styles.contentColumn}>
      <Header icon={icon} label="QUICK QUIZ" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.quizTitle}>TEST YOURSELF</Text>
        <Text style={styles.quizSubtitle}>5 QUESTIONS</Text>
      </View>
      <Text style={styles.footerHint}>START →</Text>
    </View>
  );
};

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const DiscoverWidget: React.FC<{
  config: WidgetConfig;
  icon: string;
  bg: string;
}> = ({ config, icon, bg }) => {
  const vocabularies = useVocabStore((s) => s.vocabularies);
  const recentlyAdded = useGrowthStore((s) => s.recentlyAdded);
  const [seed, setSeed] = useState(0);

  const recentIds = useMemo(() => {
    const cutoff = Date.now() - RECENT_WINDOW_MS;
    return new Set(recentlyAdded.filter((r) => r.addedAt >= cutoff).map((r) => r.id));
  }, [recentlyAdded]);

  const pick = useMemo(() => {
    if (vocabularies.length === 0) return null;
    const recent = vocabularies.filter((v) => recentIds.has(v.id));
    const pool = recent.length > 0 && Math.random() < 0.6 ? recent : vocabularies;
    return pool[Math.floor(Math.random() * pool.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, vocabularies, recentIds]);

  const shuffle = useCallback(() => setSeed((s) => s + 1), []);
  const isNew = pick ? recentIds.has(pick.id) : false;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={shuffle} style={StyleSheet.absoluteFill}>
      <View style={[styles.shell, { backgroundColor: bg }]}>
        <View style={styles.body}>
          <View style={styles.discoverHeader}>
            <Header icon={icon} label="DISCOVER" />
            {isNew && (
              <View style={styles.newPill}>
                <Text style={styles.newPillText}>NEW</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={styles.discoverTerm} numberOfLines={1} adjustsFontSizeToFit>
              {pick?.term ?? 'LOAD LIBRARY'}
            </Text>
            {pick && <Text style={styles.discoverCategory}>{pick.category}</Text>}
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerHint}>TAP TO SHUFFLE</Text>
            <MaterialCommunityIcons name="shuffle-variant" size={14} color={NEO.ink} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  contentColumn: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBubble: {
    width: 24,
    height: 24,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    backgroundColor: NEO.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLabel: {
    color: NEO.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  wotdTerm: {
    color: NEO.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    textTransform: 'uppercase',
  },
  wotdDef: {
    color: NEO.ink,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: '600',
  },
  wotdCategory: {
    color: NEO.ink,
    fontSize: 11,
    fontWeight: '900',
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
    color: NEO.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  bigNumber: {
    color: NEO.ink,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  bigNumberLabel: {
    color: NEO.ink,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: -4,
  },
  goalText: {
    color: NEO.ink,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  goalTextDim: {
    color: NEO.ink,
    fontSize: 22,
    fontWeight: '700',
    opacity: 0.6,
  },
  progressTrack: {
    marginTop: 8,
    height: 12,
    borderRadius: BRUTAL.radius,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NEO.ink,
  },
  spotlightTitle: {
    color: NEO.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  spotlightSubtitle: {
    color: NEO.ink,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  quizTitle: {
    color: NEO.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  quizSubtitle: {
    color: NEO.ink,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  discoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newPill: {
    backgroundColor: NEO.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BRUTAL.radius,
  },
  newPillText: {
    color: NEO.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  discoverTerm: {
    color: NEO.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    textTransform: 'uppercase',
  },
  discoverCategory: {
    color: NEO.ink,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
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

export const Widget = React.memo(WidgetImpl);

export default Widget;
