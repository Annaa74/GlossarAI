import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { CategoryCard, ProgressChart, StreakBadge, Gradient } from '../../components';
import { useProgress } from '../../hooks';
import { useUserStore } from '../../stores/userStore';
import { VocabCategory } from '../../types';

export default function ProgressScreen() {
  const { user, isAuthenticated } = useUserStore();
  const {
    overallStats,
    categoryProgress,
    refreshProgress,
  } = useProgress();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProgress();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: VocabCategory) => {
    // Navigate to category detail or filter home screen
    router.push({
      pathname: '/(tabs)',
      params: { category },
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>Sign in to track your progress</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero header */}
        <Gradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
          borderRadius={24}
        >
          <Text style={styles.heroEyebrow}>YOUR JOURNEY</Text>
          <Text style={styles.heroTitle}>Progress</Text>
          <Text style={styles.heroSubtitle}>
            {overallStats.percentMastered}% mastered · {overallStats.totalCards} terms total
          </Text>
        </Gradient>

        {/* Streak Card */}
        {user && user.streak > 0 && (
          <View style={styles.streakContainer}>
            <StreakBadge streak={user.streak} size="large" />
          </View>
        )}

        {/* Progress Charts */}
        <ProgressChart
          categoryProgress={categoryProgress}
          totalCards={overallStats.totalCards}
          knownCards={overallStats.knownCards}
          learningCards={overallStats.learningCards}
        />

        {/* Category Progress Cards */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Progress by Category</Text>
          {categoryProgress.map((progress) => (
            <CategoryCard
              key={progress.category}
              progress={progress}
              onPress={handleCategoryPress}
            />
          ))}
        </View>

        {/* Study Tips */}
        <Surface style={styles.tipsCard} elevation={2}>
          <Text style={styles.tipsTitle}>Study Tips</Text>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Review cards daily to maintain your streak and improve retention
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Focus on categories with lower progress percentages
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Take quizzes to reinforce your learning
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 24,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    marginTop: 6,
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  tipsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    color: '#6366F1',
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
