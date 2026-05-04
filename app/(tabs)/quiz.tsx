import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { QuizQuestion as QuizQuestionComponent } from '../../components';
import {
  useThemedColors,
  NEO,
  BRUTAL,
  BRUTAL_SHADOW,
  BRUTAL_SHADOW_SM,
} from '../../constants/theme';
import { useVocabulary } from '../../hooks';
import { useUserStore } from '../../stores/userStore';
import { QuizQuestion, QuizResult, VocabCategory } from '../../types';
import { generateQuizQuestions } from '../../utils/helpers';
import { CATEGORIES } from '../../constants/categories';

type QuizState = 'setup' | 'playing' | 'completed';

export default function QuizScreen() {
  const { isAuthenticated } = useUserStore();
  const { vocabularies, getVocabById } = useVocabulary();
  const c = useThemedColors();
  const params = useLocalSearchParams<{ category?: string; autoStart?: string }>();

  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [selectedCategory, setSelectedCategory] = useState<VocabCategory | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);

  const filteredVocabularies = useMemo(() => {
    if (selectedCategory === 'all') return vocabularies;
    return vocabularies.filter((v) => v.category === selectedCategory);
  }, [vocabularies, selectedCategory]);

  const startQuiz = useCallback(
    (overrideCategory?: VocabCategory | 'all', overrideCount?: number) => {
      const cat = overrideCategory ?? selectedCategory;
      const pool = cat === 'all' ? vocabularies : vocabularies.filter((v) => v.category === cat);
      const desired = overrideCount ?? questionCount;
      const count = Math.min(desired, pool.length);
      if (count < 4) return;
      const generatedQuestions = generateQuizQuestions(pool, count);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setResults([]);
      setQuizState('playing');
    },
    [vocabularies, selectedCategory, questionCount]
  );

  // Auto-start when arriving from the home deck-complete prompt.
  useEffect(() => {
    if (params.autoStart !== '1' || !params.category || vocabularies.length === 0) return;

    const cat = params.category as VocabCategory | 'all';
    const pool = cat === 'all' ? vocabularies : vocabularies.filter((v) => v.category === cat);

    if (pool.length < 4) {
      // Not enough cards for a quiz — drop into setup so the user sees why.
      setSelectedCategory(cat);
      router.setParams({ autoStart: undefined, category: undefined });
      return;
    }

    const count = Math.min(10, pool.length);
    setSelectedCategory(cat);
    setQuestionCount(count);
    startQuiz(cat, count);
    // Clear params so this doesn't re-fire if the user navigates back here.
    router.setParams({ autoStart: undefined, category: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.autoStart, params.category, vocabularies.length]);

  const handleAnswer = useCallback(
    (answer: string, correct: boolean) => {
      const currentQuestion = questions[currentQuestionIndex];

      const result: QuizResult = {
        questionId: currentQuestion.id,
        correct,
        userAnswer: answer,
        timeSpent: 0,
      };

      setResults((prev) => [...prev, result]);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setQuizState('completed');
      }
    },
    [currentQuestionIndex, questions]
  );

  const score = useMemo(() => {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  }, [results]);

  const resetQuiz = useCallback(() => {
    setQuizState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResults([]);
  }, []);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>SIGN IN TO TAKE QUIZZES</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (quizState === 'setup') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <ScrollView contentContainerStyle={styles.setupContainer}>
          <View style={styles.heroBanner}>
            <Text style={styles.heroEyebrow}>QUIZ MODE</Text>
            <Text style={styles.heroTitle}>TEST YOURSELF</Text>
            <Text style={styles.heroSubtitle}>{vocabularies.length} TERMS AVAILABLE</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>SELECT CATEGORY</Text>
            <View style={styles.categoryChips}>
              <CategoryChip
                label={`ALL (${vocabularies.length})`}
                selected={selectedCategory === 'all'}
                onPress={() => setSelectedCategory('all')}
              />
              {CATEGORIES.map((cat) => {
                const count = vocabularies.filter((v) => v.category === cat.id).length;
                return (
                  <CategoryChip
                    key={cat.id}
                    label={`${cat.name.split(' ')[0].toUpperCase()} (${count})`}
                    selected={selectedCategory === cat.id}
                    onPress={() => count > 0 && setSelectedCategory(cat.id)}
                    disabled={count === 0}
                    color={cat.color}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>QUESTIONS</Text>
            <View style={styles.countButtons}>
              {[5, 10, 15, 20].map((count) => {
                const isSelected = questionCount === count;
                const disabled = count > filteredVocabularies.length;
                return (
                  <Pressable
                    key={count}
                    onPress={() => !disabled && setQuestionCount(count)}
                    disabled={disabled}
                    style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.85 : 1 }]}
                  >
                    <View
                      style={[
                        styles.countButton,
                        {
                          backgroundColor: isSelected ? NEO.yellow : NEO.white,
                          opacity: disabled ? 0.4 : 1,
                        },
                      ]}
                    >
                      <Text style={styles.countText}>{count}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => startQuiz()}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            disabled={filteredVocabularies.length < 4}
            buttonColor={NEO.lime}
            textColor={NEO.ink}
            labelStyle={styles.startLabel}
          >
            START QUIZ
          </Button>

          {filteredVocabularies.length < 4 && (
            <Text style={styles.warningText}>NEED AT LEAST 4 TERMS</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizState === 'playing') {
    const currentQuestion = questions[currentQuestionIndex];
    const vocab = getVocabById(currentQuestion.vocabId);

    if (!vocab) return null;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <QuizQuestionComponent
          // Remount per question so selectedAnswer / textAnswer / hasSubmitted
          // reset between questions. Without this, the second question would
          // inherit the previous answer state and feel broken.
          key={currentQuestion.id}
          question={currentQuestion}
          vocabulary={vocab}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      </SafeAreaView>
    );
  }

  const scoreColor =
    score.percentage >= 70 ? NEO.lime : score.percentage >= 50 ? NEO.yellow : NEO.orange;
  const trophyIcon =
    score.percentage >= 70 ? 'trophy' : score.percentage >= 50 ? 'thumb-up' : 'refresh';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.completedContainer}>
        <View style={[styles.resultIcon, { backgroundColor: scoreColor }]}>
          <MaterialCommunityIcons name={trophyIcon} size={64} color={NEO.ink} />
        </View>

        <Text style={styles.resultTitle}>
          {score.percentage >= 70
            ? 'EXCELLENT!'
            : score.percentage >= 50
              ? 'GOOD JOB!'
              : 'KEEP PRACTICING'}
        </Text>

        <View style={[styles.scoreCard, { backgroundColor: scoreColor }]}>
          <Text style={styles.scorePercentage}>{score.percentage}%</Text>
          <Text style={styles.scoreDetail}>
            {score.correct} OF {score.total} CORRECT
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>RESULTS</Text>
          {results.map((result, index) => {
            const question = questions[index];
            const vocab = getVocabById(question.vocabId);
            return (
              <View key={index} style={styles.resultItem}>
                <View
                  style={[
                    styles.resultIconSmall,
                    { backgroundColor: result.correct ? NEO.lime : NEO.red },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={result.correct ? 'check' : 'close'}
                    size={16}
                    color={NEO.ink}
                  />
                </View>
                <View style={styles.resultItemText}>
                  <Text style={styles.resultTerm}>{vocab?.term}</Text>
                  {!result.correct && (
                    <Text style={styles.resultCorrect}>ANSWER: {question.correctAnswer}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={resetQuiz}
            style={styles.actionButton}
            buttonColor={NEO.white}
            textColor={NEO.ink}
            labelStyle={styles.actionLabel}
          >
            NEW QUIZ
          </Button>
          <Button
            mode="contained"
            onPress={() => startQuiz()}
            style={styles.actionButton}
            buttonColor={NEO.yellow}
            textColor={NEO.ink}
            labelStyle={styles.actionLabel}
          >
            TRY AGAIN
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CategoryChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}> = ({ label, selected, onPress, disabled, color }) => (
  <Pressable onPress={onPress} disabled={disabled}>
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected ? color || NEO.yellow : NEO.white,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Text style={styles.chipText}>{label}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  setupContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  heroBanner: {
    backgroundColor: NEO.yellow,
    padding: 22,
    marginBottom: 18,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  heroEyebrow: {
    color: NEO.ink,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: NEO.ink,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginTop: 4,
  },
  heroSubtitle: {
    color: NEO.ink,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: BRUTAL.radius,
    padding: 18,
    marginBottom: 16,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 3,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.6,
  },
  countButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  countButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 3,
    marginBottom: 4,
  },
  countText: {
    fontSize: 18,
    fontWeight: '900',
    color: NEO.ink,
  },
  startButton: {
    marginTop: 8,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  startButtonContent: {
    paddingVertical: 6,
  },
  startLabel: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  warningText: {
    textAlign: 'center',
    color: NEO.ink,
    marginTop: 12,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  completedContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultIcon: {
    width: 120,
    height: 120,
    marginTop: 24,
    marginBottom: 20,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: NEO.ink,
    marginBottom: 22,
    letterSpacing: -1,
  },
  scoreCard: {
    padding: 28,
    alignItems: 'center',
    marginBottom: 22,
    width: '95%',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
  },
  scorePercentage: {
    fontSize: 80,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -3,
  },
  scoreDetail: {
    fontSize: 13,
    color: NEO.ink,
    marginTop: 4,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  summaryCard: {
    borderRadius: BRUTAL.radius,
    padding: 18,
    width: '95%',
    marginBottom: 22,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: NEO.ink,
    gap: 10,
  },
  resultIconSmall: {
    width: 26,
    height: 26,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItemText: {
    flex: 1,
  },
  resultTerm: {
    fontSize: 14,
    fontWeight: '800',
    color: NEO.ink,
  },
  resultCorrect: {
    fontSize: 11,
    color: NEO.ink,
    marginTop: 2,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '95%',
  },
  actionButton: {
    flex: 1,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 3,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
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
