import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { router } from 'expo-router';
import { SwipeCard, StreakBadge, WidgetCarousel } from '../../components';
import { useVocabulary, useSpacedRepetition } from '../../hooks';
import { useUserStore } from '../../stores/userStore';
import { useVocabStore } from '../../stores/vocabStore';
import { Vocabulary, VocabCategory } from '../../types';
import { CATEGORIES, getCategoryInfo } from '../../constants/categories';
import {
  useThemedColors,
  NEO,
  BRUTAL,
  BRUTAL_SHADOW,
  BRUTAL_SHADOW_SM,
} from '../../constants/theme';
import { getGreeting } from '../../utils/helpers';
import { seedVocabulary } from '../../data/seedData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const swiperRef = useRef<Swiper<Vocabulary>>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deckHeight, setDeckHeight] = useState(0);
  const [completion, setCompletion] = useState<{
    visible: boolean;
    category: VocabCategory | 'all';
    count: number;
  }>({ visible: false, category: 'all', count: 0 });
  const c = useThemedColors();

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
  const reloadDeck = useVocabStore((s) => s.reloadDeck);
  const loadSmartDeck = useVocabStore((s) => s.loadSmartDeck);

  const filteredCards =
    selectedCategory === 'all'
      ? currentCards
      : currentCards.filter((c) => c.category === selectedCategory);

  // Local snapshot of the deck for the Swiper. We do NOT pass `filteredCards`
  // directly because:
  //   (a) processSwipe shrinks `currentCards` on every swipe, which would
  //       change the Swiper's `cards` prop mid-animation and force it to
  //       reinitialize — that's the lag/glitch the user sees.
  //   (b) the Swiper owns its own internal index; driving it via the
  //       `cardIndex` prop causes a reset on every swipe.
  // Refresh the snapshot when the category changes, vocab first loads, or
  // the user explicitly reloads.
  const [sessionDeck, setSessionDeck] = useState<Vocabulary[]>(filteredCards);
  const [swiperKey, setSwiperKey] = useState(0);

  useEffect(() => {
    setSessionDeck(filteredCards);
    setSwiperKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, vocabularies.length]);

  const dismissCompletion = useCallback(() => {
    setCompletion((prev) => ({ ...prev, visible: false }));
  }, []);

  const startQuizForCompletedDeck = useCallback(() => {
    const cat = completion.category;
    setCompletion((prev) => ({ ...prev, visible: false }));
    router.push({
      pathname: '/(tabs)/quiz',
      params: { category: String(cat), autoStart: '1' },
    });
  }, [completion.category]);

  const reloadCurrentDeck = useCallback(() => {
    reloadDeck();
    const fresh = useVocabStore.getState().currentCards;
    const next =
      selectedCategory === 'all' ? fresh : fresh.filter((c) => c.category === selectedCategory);
    setSessionDeck(next);
    setSwiperKey((k) => k + 1);
  }, [reloadDeck, selectedCategory]);

  const loadSmartCurrentDeck = useCallback(() => {
    loadSmartDeck();
    const fresh = useVocabStore.getState().currentCards;
    const next =
      selectedCategory === 'all' ? fresh : fresh.filter((c) => c.category === selectedCategory);
    setSessionDeck(next);
    setSwiperKey((k) => k + 1);
  }, [loadSmartDeck, selectedCategory]);

  const onSwipedLeft = useCallback(
    (index: number) => {
      const card = sessionDeck[index];
      if (card) handleSwipe(card.id, 'left');
    },
    [sessionDeck, handleSwipe]
  );

  const onSwipedRight = useCallback(
    (index: number) => {
      const card = sessionDeck[index];
      if (card) handleSwipe(card.id, 'right');
    },
    [sessionDeck, handleSwipe]
  );

  const onSwipedTop = useCallback(
    (index: number) => {
      const card = sessionDeck[index];
      if (card) handleSwipe(card.id, 'up');
    },
    [sessionDeck, handleSwipe]
  );

  const onSwipedAll = useCallback(() => {
    setCompletion({
      visible: true,
      category: selectedCategory,
      count: sessionDeck.length,
    });
    // Clear the local snapshot so noCards becomes true and the DECK CLEAR
    // empty-state view renders behind the modal (with reload/quiz buttons).
    setSessionDeck([]);
  }, [selectedCategory, sessionDeck.length]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
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

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.authPromptWrap}>
          <View style={styles.heroHero}>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="book-open-page-variant" size={44} color={NEO.ink} />
            </View>
            <Text style={styles.heroTitle}>
              GLOSSER<Text style={{ color: NEO.pink }}>AI</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              MASTER TECHNICAL VOCABULARY. SWIPE. LEARN. REPEAT.
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={() => router.push('/auth/login')}
            style={styles.authButton}
            contentStyle={styles.authButtonContent}
            buttonColor={NEO.ink}
            textColor={NEO.white}
            labelStyle={styles.authLabel}
          >
            SIGN IN
          </Button>
          <Button
            mode="contained"
            onPress={enterGuestMode}
            style={styles.guestButton}
            contentStyle={styles.authButtonContent}
            buttonColor={NEO.lime}
            textColor={NEO.ink}
            labelStyle={styles.authLabel}
            icon="account-arrow-right"
          >
            CONTINUE AS GUEST
          </Button>
          <Button
            mode="text"
            onPress={() => router.push('/auth/signup')}
            textColor={NEO.ink}
            labelStyle={styles.textBtnLabel}
          >
            CREATE AN ACCOUNT
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NEO.ink} />
          <Text style={styles.loadingText}>LOADING YOUR CARDS…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyArt}>
            <MaterialCommunityIcons name="auto-fix" size={64} color={NEO.ink} />
          </View>
          <Text style={styles.emptyTitle}>LOAD YOUR LIBRARY</Text>
          <Text style={styles.emptySubtitle}>
            Tap below to populate the deck with hand-curated vocabulary across AI, backend,
            frontend, and more.
          </Text>
          <Button
            mode="contained"
            onPress={handleSeedData}
            loading={isSeeding}
            disabled={isSeeding}
            style={styles.seedButton}
            contentStyle={{ paddingVertical: 4 }}
            buttonColor={NEO.yellow}
            textColor={NEO.ink}
            labelStyle={styles.authLabel}
          >
            {isSeeding ? 'LOADING…' : 'LOAD VOCABULARY'}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const noCards = sessionDeck.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {getGreeting().toUpperCase()}
            {user?.displayName ? `, ${user.displayName.split(' ')[0].toUpperCase()}` : ''}
          </Text>
          <Text style={styles.subGreeting}>
            {noCards ? 'NO CARDS IN THIS CATEGORY' : `${sessionDeck.length} CARDS IN YOUR DECK`}
          </Text>
        </View>
        {user && <StreakBadge streak={user.streak} size="small" />}
      </View>

      <View style={styles.widgetSection}>
        <WidgetCarousel />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryStrip}
      >
        <CategoryPill
          label="ALL"
          color={NEO.yellow}
          selected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
        />
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.id}
            label={cat.name.toUpperCase()}
            icon={cat.icon}
            color={cat.color}
            selected={selectedCategory === cat.id}
            onPress={() => setSelectedCategory(cat.id)}
          />
        ))}
      </ScrollView>

      <View
        style={styles.deckRegion}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && Math.abs(h - deckHeight) > 1) setDeckHeight(h);
        }}
      >
        {noCards ? (
          <View style={styles.completedContainer}>
            <View style={styles.completedIcon}>
              <MaterialCommunityIcons name="cards-outline" size={42} color={NEO.ink} />
            </View>
            <Text style={styles.completedTitle}>DECK CLEAR</Text>
            <Text style={styles.completedSubtitle}>
              {selectedCategory === 'all'
                ? 'You finished every card. Take a quiz or reload to keep practicing.'
                : `Done with ${getCategoryInfo(selectedCategory as VocabCategory).name}. Quiz yourself or reload.`}
            </Text>
            <View style={styles.completedActions}>
              <Button
                mode="contained"
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/quiz',
                    params: { category: String(selectedCategory), autoStart: '1' },
                  })
                }
                buttonColor={NEO.lime}
                textColor={NEO.ink}
                style={styles.completedBtn}
                labelStyle={styles.completedBtnLabel}
                icon="head-question"
              >
                QUIZ ME
              </Button>
              <Button
                mode="contained"
                onPress={loadSmartCurrentDeck}
                buttonColor={NEO.yellow}
                textColor={NEO.ink}
                style={styles.completedBtn}
                labelStyle={styles.completedBtnLabel}
                icon="auto-fix"
              >
                SMART DECK
              </Button>
            </View>
          </View>
        ) : (
          <Swiper
            key={swiperKey}
            ref={swiperRef}
            cards={sessionDeck}
            renderCard={(card) =>
              card ? (
                <SwipeCard vocab={card} height={deckHeight > 0 ? deckHeight - 16 : undefined} />
              ) : null
            }
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwipedTop={onSwipedTop}
            onSwipedAll={onSwipedAll}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={10}
            cardVerticalMargin={4}
            cardHorizontalMargin={16}
            animateOverlayLabelsOpacity
            disableBottomSwipe
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

      {!noCards && (
        <View style={styles.actionRow}>
          <ActionPill
            icon="close"
            color={NEO.orange}
            label="LEARNING"
            onPress={() => swiperRef.current?.swipeLeft()}
          />
          <ActionPill
            icon="heart"
            color={NEO.pink}
            label="FAV"
            onPress={() => swiperRef.current?.swipeTop()}
            prominent
          />
          <ActionPill
            icon="check"
            color={NEO.lime}
            label="KNOWN"
            onPress={() => swiperRef.current?.swipeRight()}
          />
        </View>
      )}

      <Modal
        visible={completion.visible}
        transparent
        animationType="fade"
        onRequestClose={dismissCompletion}
      >
        <Pressable style={styles.modalBackdrop} onPress={dismissCompletion}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons name="trophy" size={44} color={NEO.ink} />
            </View>
            <Text style={styles.modalTitle}>DECK COMPLETE!</Text>
            <Text style={styles.modalSubtitle}>
              {completion.count} {completion.count === 1 ? 'CARD' : 'CARDS'} REVIEWED
              {completion.category !== 'all'
                ? ` · ${getCategoryInfo(completion.category as VocabCategory).name.toUpperCase()}`
                : ''}
            </Text>
            <Text style={styles.modalBody}>
              Lock it in with a quick quiz on what you just reviewed?
            </Text>
            <Button
              mode="contained"
              onPress={startQuizForCompletedDeck}
              buttonColor={NEO.lime}
              textColor={NEO.ink}
              style={styles.modalBtnPrimary}
              labelStyle={styles.modalBtnLabel}
              icon="head-question"
            >
              YES, QUIZ ME
            </Button>
            <Button
              mode="contained"
              onPress={dismissCompletion}
              buttonColor={NEO.white}
              textColor={NEO.ink}
              style={styles.modalBtnSecondary}
              labelStyle={styles.modalBtnLabel}
            >
              MAYBE LATER
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
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
  <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
    <View style={[styles.categoryPill, { backgroundColor: selected ? color : NEO.white }]}>
      {icon && <MaterialCommunityIcons name={icon as any} size={14} color={NEO.ink} />}
      <Text style={styles.categoryPillText}>{label}</Text>
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
      opacity: pressed ? 0.85 : 1,
      flex: prominent ? 0 : 1,
    })}
  >
    <View
      style={[
        styles.actionPill,
        {
          backgroundColor: color,
          paddingHorizontal: prominent ? 22 : 14,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon as any} size={prominent ? 26 : 20} color={NEO.ink} />
      {!prominent && <Text style={styles.actionPillText}>{label}</Text>}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.6,
  },
  subGreeting: {
    fontSize: 10,
    color: NEO.ink,
    marginTop: 3,
    fontWeight: '900',
    letterSpacing: 1,
  },

  widgetSection: { marginTop: 6, marginBottom: 4 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.4,
  },
  sectionAction: {
    fontSize: 11,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 1,
  },

  categoryStrip: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    paddingBottom: 6,
    gap: 8,
    paddingRight: 24,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 3,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.8,
  },

  deckRegion: {
    flex: 1,
    minHeight: 280,
  },

  overlayLabelLeft: {
    backgroundColor: NEO.orange,
    color: NEO.ink,
    fontSize: 22,
    fontWeight: '900',
    padding: 12,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 24,
    marginRight: 24,
  },
  overlayLabelRight: {
    backgroundColor: NEO.lime,
    color: NEO.ink,
    fontSize: 22,
    fontWeight: '900',
    padding: 12,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 24,
    marginLeft: 24,
  },
  overlayLabelTop: {
    backgroundColor: NEO.pink,
    color: NEO.ink,
    fontSize: 22,
    fontWeight: '900',
    padding: 12,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  overlayWrapperTop: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 4,
    gap: 10,
    alignItems: 'center',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 3,
    marginBottom: 4,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.8,
  },

  authPromptWrap: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heroHero: {
    backgroundColor: NEO.yellow,
    height: 320,
    marginBottom: 24,
    padding: 28,
    justifyContent: 'flex-end',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: '6px 6px 0 #000000',
    marginRight: 6,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: BRUTAL.radius,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: NEO.ink,
    marginTop: 8,
    lineHeight: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  authButton: {
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  guestButton: {
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginTop: 14,
    marginRight: 4,
  },
  authButtonContent: { paddingVertical: 6 },
  authLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  textBtnLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 12,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyArt: {
    width: 120,
    height: 120,
    backgroundColor: NEO.lime,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginRight: 4,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: NEO.ink,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
    lineHeight: 19,
    fontWeight: '600',
  },
  seedButton: {
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    alignSelf: 'stretch',
    marginRight: 4,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completedIcon: {
    width: 84,
    height: 84,
    backgroundColor: NEO.lime,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginRight: 4,
  },
  completedTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.8,
  },
  completedSubtitle: {
    fontSize: 13,
    color: NEO.ink,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    fontWeight: '600',
    lineHeight: 19,
  },
  completedActions: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
    paddingHorizontal: 8,
  },
  completedBtn: {
    flex: 1,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 3,
    marginBottom: 4,
  },
  completedBtnLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: NEO.yellow,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: '6px 6px 0 #000000',
    padding: 24,
    alignItems: 'center',
    marginRight: 6,
  },
  modalIcon: {
    width: 80,
    height: 80,
    backgroundColor: NEO.lime,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginRight: 4,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.2,
    marginTop: 6,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13,
    color: NEO.ink,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 22,
    lineHeight: 19,
  },
  modalBtnPrimary: {
    alignSelf: 'stretch',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  modalBtnSecondary: {
    alignSelf: 'stretch',
    marginTop: 10,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 4,
  },
  modalBtnLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
