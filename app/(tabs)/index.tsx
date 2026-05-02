import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { router } from 'expo-router';
import {
  SwipeCard,
  StreakBadge,
  WidgetCarousel,
  Gradient,
} from '../../components';
import { useVocabulary, useSpacedRepetition } from '../../hooks';
import { useUserStore } from '../../stores/userStore';
import { Vocabulary } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { getGreeting } from '../../utils/helpers';
import { seedVocabulary } from '../../data/seedData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const swiperRef = useRef<Swiper<Vocabulary>>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);

  const { user, isAuthenticated } = useUserStore();
  const {
    vocabularies,
    currentCards,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    refreshCards,
  } = useVocabulary();
  const { handleSwipe } = useSpacedRepetition();

  const filteredCards =
    selectedCategory === 'all'
      ? currentCards
      : currentCards.filter((c) => c.category === selectedCategory);

  const onSwipedLeft = useCallback(
    (index: number) => {
      const card = filteredCards[index];
      if (card) handleSwipe(card.id, 'left');
    },
    [filteredCards, handleSwipe]
  );

  const onSwipedRight = useCallback(
    (index: number) => {
      const card = filteredCards[index];
      if (card) handleSwipe(card.id, 'right');
    },
    [filteredCards, handleSwipe]
  );

  const onSwipedTop = useCallback(
    (index: number) => {
      const card = filteredCards[index];
      if (card) handleSwipe(card.id, 'up');
    },
    [filteredCards, handleSwipe]
  );

  const onSwiped = useCallback((index: number) => {
    setCardIndex(index + 1);
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // seedVocabulary writes directly into the local store, so we don't
      // need to follow up with fetchVocabularies/refreshCards (those would
      // overwrite our just-seeded state with an empty Firestore result if
      // Firebase isn't configured).
      await seedVocabulary();
    } catch (error) {
      console.error('Failed to seed data:', error);
    }
    setIsSeeding(false);
  };

  const enterGuestMode = () => {
    useUserStore.setState({
      user: {
        id: 'guest-local',
        email: 'guest@glosserai.local',
        displayName: 'Guest',
        streak: 0,
        lastStudyDate: null,
        notificationSettings: {
          enabled: false,
          reminderTime: '09:00',
          frequency: 'daily',
        },
        createdAt: new Date(),
      },
      isAuthenticated: true,
    });
  };

  // Unauthenticated landing
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPromptWrap}>
          <Gradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            borderRadius={32}
            style={styles.heroHero}
          >
            <View style={styles.heroInner}>
              <View style={styles.heroIconWrap}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={44}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.heroTitle}>GlosserAI</Text>
              <Text style={styles.heroSubtitle}>
                Master technical vocabulary with smart, swipeable flashcards.
              </Text>
            </View>
          </Gradient>

          <Button
            mode="contained"
            onPress={() => router.push('/auth/login')}
            style={styles.authButton}
            contentStyle={styles.authButtonContent}
          >
            Sign in
          </Button>
          <Button
            mode="contained-tonal"
            onPress={enterGuestMode}
            style={styles.guestButton}
            contentStyle={styles.authButtonContent}
            icon="account-arrow-right"
          >
            Continue as guest
          </Button>
          <Button mode="text" onPress={() => router.push('/auth/signup')}>
            Create an account
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your cards…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Gradient
            colors={['#EEF2FF', '#FDF2F8']}
            borderRadius={32}
            style={styles.emptyArt}
          >
            <MaterialCommunityIcons name={'sparkles' as any} size={64} color="#6366F1" />
          </Gradient>
          <Text style={styles.emptyTitle}>Let's load your library</Text>
          <Text style={styles.emptySubtitle}>
            Tap below to populate the deck with hand-curated vocabulary across AI,
            backend, frontend, and more.
          </Text>
          <Button
            mode="contained"
            onPress={handleSeedData}
            loading={isSeeding}
            disabled={isSeeding}
            style={styles.seedButton}
            contentStyle={{ paddingVertical: 6 }}
          >
            {isSeeding ? 'Loading…' : 'Load Vocabulary'}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const allDone = filteredCards.length === 0 || cardIndex >= filteredCards.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {getGreeting()}
            {user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </Text>
          <Text style={styles.subGreeting}>
            {allDone
              ? "You're all caught up — nice work."
              : `${filteredCards.length - cardIndex} cards waiting for you`}
          </Text>
        </View>
        {user && <StreakBadge streak={user.streak} size="small" />}
      </View>

      {/* Widget carousel */}
      <View style={styles.widgetSection}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>FOR YOU</Text>
          <Pressable onPress={() => router.push('/(tabs)/widgets')} hitSlop={8}>
            <Text style={styles.sectionAction}>Customize</Text>
          </Pressable>
        </View>
        <WidgetCarousel />
      </View>

      {/* Category strip */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>BROWSE</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryStrip}
      >
        <CategoryPill
          label="All"
          color="#6366F1"
          selected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
        />
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.id}
            label={cat.name}
            icon={cat.icon}
            color={cat.color}
            selected={selectedCategory === cat.id}
            onPress={() => setSelectedCategory(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Deck */}
      <View style={styles.deckRegion}>
        {allDone ? (
          <View style={styles.completedContainer}>
            <Gradient
              colors={['#D1FAE5', '#A7F3D0']}
              borderRadius={32}
              style={styles.emptyArtSmall}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={56}
                color="#065F46"
              />
            </Gradient>
            <Text style={styles.completedTitle}>All caught up!</Text>
            <Text style={styles.completedSubtitle}>
              Come back later or refresh to see more cards.
            </Text>
            <Button
              mode="outlined"
              onPress={refreshCards}
              style={styles.refreshButton}
            >
              Refresh deck
            </Button>
          </View>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={filteredCards}
            cardIndex={cardIndex}
            renderCard={(card) => (card ? <SwipeCard vocab={card} /> : null)}
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwipedTop={onSwipedTop}
            onSwiped={onSwiped}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={14}
            cardVerticalMargin={10}
            cardHorizontalMargin={16}
            animateCardOpacity
            animateOverlayLabelsOpacity
            overlayLabels={{
              left: {
                title: 'LEARNING',
                style: {
                  label: styles.overlayLabelLeft,
                  wrapper: styles.overlayWrapperLeft,
                },
              },
              right: {
                title: 'KNOWN',
                style: {
                  label: styles.overlayLabelRight,
                  wrapper: styles.overlayWrapperRight,
                },
              },
              top: {
                title: 'FAVORITE',
                style: {
                  label: styles.overlayLabelTop,
                  wrapper: styles.overlayWrapperTop,
                },
              },
            }}
          />
        )}
      </View>

      {!allDone && (
        <View style={styles.actionRow}>
          <ActionPill
            icon="close"
            color="#F59E0B"
            label="Learning"
            onPress={() => swiperRef.current?.swipeLeft()}
          />
          <ActionPill
            icon="heart"
            color="#EC4899"
            label="Favorite"
            onPress={() => swiperRef.current?.swipeTop()}
            prominent
          />
          <ActionPill
            icon="check"
            color="#10B981"
            label="Known"
            onPress={() => swiperRef.current?.swipeRight()}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const CategoryPill: React.FC<{
  label: string;
  icon?: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, icon, color, selected, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
    <View
      style={[
        styles.categoryPill,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={14}
          color={selected ? '#FFFFFF' : color}
        />
      )}
      <Text
        style={[
          styles.categoryPillText,
          { color: selected ? '#FFFFFF' : '#111827' },
        ]}
      >
        {label}
      </Text>
    </View>
  </Pressable>
);

const ActionPill: React.FC<{
  icon: string;
  color: string;
  label: string;
  onPress: () => void;
  prominent?: boolean;
}> = ({ icon, color, label, onPress, prominent }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      opacity: pressed ? 0.7 : 1,
      flex: prominent ? 0 : 1,
    })}
  >
    <View
      style={[
        styles.actionPill,
        prominent
          ? { backgroundColor: color, paddingHorizontal: 18 }
          : { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: color + '55' },
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={prominent ? 22 : 18}
        color={prominent ? '#FFFFFF' : color}
      />
      {!prominent && <Text style={[styles.actionPillText, { color }]}>{label}</Text>}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 12,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subGreeting: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  widgetSection: { marginBottom: 4 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1.4,
  },
  sectionHint: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  sectionAction: { fontSize: 12, color: '#6366F1', fontWeight: '700' },

  // Category strip
  categoryStrip: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: { fontSize: 13, fontWeight: '600' },

  // Deck region
  deckRegion: {
    flex: 1,
    minHeight: 320,
  },

  // Overlay labels
  overlayLabelLeft: {
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 24,
    marginRight: 24,
  },
  overlayLabelRight: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 24,
    marginLeft: 24,
  },
  overlayLabelTop: {
    backgroundColor: 'rgba(236, 72, 153, 0.95)',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlayWrapperTop: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 10,
    alignItems: 'center',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 14,
  },
  actionPillText: { fontSize: 14, fontWeight: '700' },

  // Auth prompt
  authPromptWrap: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heroHero: { height: 320, marginBottom: 24 },
  heroInner: { flex: 1, padding: 28, justifyContent: 'flex-end' },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 6,
    lineHeight: 22,
  },
  authButton: { borderRadius: 14, backgroundColor: '#111827' },
  guestButton: { borderRadius: 14, marginTop: 10 },
  authButtonContent: { paddingVertical: 8 },

  // Loading & empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 16, fontSize: 14, color: '#6B7280' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyArt: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyArtSmall: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  seedButton: { borderRadius: 14, alignSelf: 'stretch' },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  refreshButton: { borderRadius: 12 },
});
