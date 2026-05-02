import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuizQuestion as QuizQuestionComponent } from '../../components';
import { useVocabulary } from '../../hooks';
import { useUserStore } from '../../stores/userStore';
import { QuizQuestion, QuizResult, VocabCategory } from '../../types';
import { generateQuizQuestions } from '../../utils/helpers';
import { CATEGORIES } from '../../constants/categories';

type QuizState = 'setup' | 'playing' | 'completed';

export default function QuizScreen() {
  const { isAuthenticated } = useUserStore();
  const { vocabularies, getVocabById } = useVocabulary();

  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [selectedCategory, setSelectedCategory] = useState<VocabCategory | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);

  // Filter vocabularies by category
  const filteredVocabularies = useMemo(() => {
    if (selectedCategory === 'all') return vocabularies;
    return vocabularies.filter((v) => v.category === selectedCategory);
  }, [vocabularies, selectedCategory]);

  // Start quiz
  const startQuiz = useCallback(() => {
    const generatedQuestions = generateQuizQuestions(filteredVocabularies, questionCount);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setResults([]);
    setQuizState('playing');
  }, [filteredVocabularies, questionCount]);

  // Handle answer
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

  // Calculate score
  const score = useMemo(() => {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  }, [results]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setQuizState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResults([]);
  }, []);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>Sign in to take quizzes</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Setup Screen
  if (quizState === 'setup') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.setupContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Quiz Mode</Text>
            <Text style={styles.subtitle}>Test your knowledge</Text>
          </View>

          {/* Category Selection */}
          <Surface style={styles.card} elevation={2}>
            <Text style={styles.cardTitle}>Select Category</Text>
            <View style={styles.categoryChips}>
              <Chip
                selected={selectedCategory === 'all'}
                onPress={() => setSelectedCategory('all')}
                style={styles.chip}
              >
                All ({vocabularies.length})
              </Chip>
              {CATEGORIES.map((cat) => {
                const count = vocabularies.filter((v) => v.category === cat.id).length;
                return (
                  <Chip
                    key={cat.id}
                    selected={selectedCategory === cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={styles.chip}
                    disabled={count === 0}
                  >
                    {cat.name.split(' ')[0]} ({count})
                  </Chip>
                );
              })}
            </View>
          </Surface>

          {/* Question Count */}
          <Surface style={styles.card} elevation={2}>
            <Text style={styles.cardTitle}>Number of Questions</Text>
            <View style={styles.countButtons}>
              {[5, 10, 15, 20].map((count) => (
                <Button
                  key={count}
                  mode={questionCount === count ? 'contained' : 'outlined'}
                  onPress={() => setQuestionCount(count)}
                  style={styles.countButton}
                  disabled={count > filteredVocabularies.length}
                >
                  {count}
                </Button>
              ))}
            </View>
          </Surface>

          {/* Start Button */}
          <Button
            mode="contained"
            onPress={startQuiz}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            disabled={filteredVocabularies.length < 4}
          >
            Start Quiz
          </Button>

          {filteredVocabularies.length < 4 && (
            <Text style={styles.warningText}>
              Need at least 4 terms to create a quiz
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Playing Screen
  if (quizState === 'playing') {
    const currentQuestion = questions[currentQuestionIndex];
    const vocab = getVocabById(currentQuestion.vocabId);

    if (!vocab) return null;

    return (
      <SafeAreaView style={styles.container}>
        <QuizQuestionComponent
          question={currentQuestion}
          vocabulary={vocab}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      </SafeAreaView>
    );
  }

  // Completed Screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.completedContainer}>
        <View style={styles.resultIcon}>
          <MaterialCommunityIcons
            name={score.percentage >= 70 ? 'trophy' : score.percentage >= 50 ? 'thumb-up' : 'refresh'}
            size={80}
            color={score.percentage >= 70 ? '#F59E0B' : score.percentage >= 50 ? '#6366F1' : '#6B7280'}
          />
        </View>

        <Text style={styles.resultTitle}>
          {score.percentage >= 70 ? 'Excellent!' : score.percentage >= 50 ? 'Good job!' : 'Keep practicing!'}
        </Text>

        <Surface style={styles.scoreCard} elevation={3}>
          <Text style={styles.scorePercentage}>{score.percentage}%</Text>
          <Text style={styles.scoreDetail}>
            {score.correct} out of {score.total} correct
          </Text>
        </Surface>

        {/* Results Summary */}
        <Surface style={styles.summaryCard} elevation={2}>
          <Text style={styles.summaryTitle}>Results Summary</Text>
          {results.map((result, index) => {
            const question = questions[index];
            const vocab = getVocabById(question.vocabId);
            return (
              <View key={index} style={styles.resultItem}>
                <MaterialCommunityIcons
                  name={result.correct ? 'check-circle' : 'close-circle'}
                  size={20}
                  color={result.correct ? '#10B981' : '#EF4444'}
                />
                <View style={styles.resultItemText}>
                  <Text style={styles.resultTerm}>{vocab?.term}</Text>
                  {!result.correct && (
                    <Text style={styles.resultCorrect}>
                      Correct: {question.correctAnswer}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </Surface>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={resetQuiz}
            style={styles.actionButton}
          >
            New Quiz
          </Button>
          <Button
            mode="contained"
            onPress={startQuiz}
            style={styles.actionButton}
          >
            Try Again
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  setupContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  countButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  countButton: {
    flex: 1,
  },
  startButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  startButtonContent: {
    paddingVertical: 8,
  },
  warningText: {
    textAlign: 'center',
    color: '#F59E0B',
    marginTop: 12,
    fontSize: 14,
  },
  completedContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultIcon: {
    marginTop: 40,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    width: '100%',
  },
  scorePercentage: {
    fontSize: 64,
    fontWeight: '800',
    color: '#6366F1',
  },
  scoreDetail: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultItemText: {
    marginLeft: 12,
    flex: 1,
  },
  resultTerm: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  resultCorrect: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
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
