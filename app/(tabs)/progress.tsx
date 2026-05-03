import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { CategoryCard, ProgressChart, StreakBadge } from '../../components';
import { useThemedColors, NEO, BRUTAL, BRUTAL_SHADOW } from '../../constants/theme';
import { useProgress } from '../../hooks';
import { useUserStore } from '../../stores/userStore';
import { VocabCategory } from '../../types';

export default function ProgressScreen() {
  const { user, isAuthenticated } = useUserStore();
  const c = useThemedColors();
  const { overallStats, categoryProgress, refreshProgress } = useProgress();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProgress();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: VocabCategory) => {
    router.push({
      pathname: '/(tabs)',
      params: { category },
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>SIGN IN TO TRACK YOUR PROGRESS</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.heroBanner}>
          <Text style={styles.heroEyebrow}>YOUR JOURNEY</Text>
          <Text style={styles.heroTitle}>PROGRESS</Text>
          <Text style={styles.heroSubtitle}>
            {overallStats.percentMastered}% MASTERED · {overallStats.totalCards} TERMS
          </Text>
        </View>

        {user && user.streak > 0 && (
          <View style={styles.streakContainer}>
            <StreakBadge streak={user.streak} size="large" />
          </View>
        )}

        <ProgressChart
          categoryProgress={categoryProgress}
          totalCards={overallStats.totalCards}
          knownCards={overallStats.knownCards}
          learningCards={overallStats.learningCards}
        />

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>BY CATEGORY</Text>
          {categoryProgress.map((progress) => (
            <CategoryCard
              key={progress.category}
              progress={progress}
              onPress={handleCategoryPress}
            />
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>STUDY TIPS</Text>
          <View style={styles.tip}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Review cards daily to maintain your streak and improve retention.
            </Text>
          </View>
          <View style={styles.tip}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Focus on categories with lower progress percentages.</Text>
          </View>
          <View style={styles.tip}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Take quizzes to reinforce your learning.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBanner: {
    backgroundColor: NEO.pink,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 22,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 20,
  },
  heroEyebrow: {
    color: NEO.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: NEO.ink,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 4,
  },
  heroSubtitle: {
    color: NEO.ink,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  streakContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  tipsCard: {
    margin: 16,
    padding: 18,
    borderRadius: BRUTAL.radius,
    backgroundColor: NEO.cream,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 8,
    height: 8,
    backgroundColor: NEO.ink,
    marginRight: 10,
    marginTop: 5,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: NEO.ink,
    lineHeight: 20,
    fontWeight: '600',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 14,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
