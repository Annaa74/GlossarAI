import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuizQuestion as QuizQuestionType, Vocabulary } from '../types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  vocabulary: Vocabulary;
  onAnswer: (answer: string, correct: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  vocabulary,
  onAnswer,
  questionNumber,
  totalQuestions,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelectOption = (option: string) => {
    if (hasSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (hasSubmitted) return;

    const answer = question.type === 'fill_blank' ? textAnswer.trim() : selectedAnswer;
    if (!answer) return;

    const isCorrect =
      question.type === 'fill_blank'
        ? answer.toLowerCase() === question.correctAnswer.toLowerCase()
        : answer === question.correctAnswer;

    setHasSubmitted(true);

    // Delay to show result before moving to next question
    setTimeout(() => {
      onAnswer(answer, isCorrect);
    }, 1500);
  };

  const getOptionStyle = (option: string) => {
    if (!hasSubmitted) {
      return option === selectedAnswer ? styles.selectedOption : styles.option;
    }

    if (option === question.correctAnswer) {
      return styles.correctOption;
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return styles.incorrectOption;
    }

    return styles.option;
  };

  const getOptionIcon = (option: string) => {
    if (!hasSubmitted) return null;

    if (option === question.correctAnswer) {
      return <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />;
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return <MaterialCommunityIcons name="close-circle" size={24} color="#EF4444" />;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          Question {questionNumber} of {totalQuestions}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(questionNumber / totalQuestions) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Question Card */}
      <Surface style={styles.questionCard} elevation={2}>
        <Text style={styles.questionType}>
          {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Fill in the Blank'}
        </Text>
        <Text style={styles.question}>{question.question}</Text>

        {/* Multiple Choice Options */}
        {question.type === 'multiple_choice' && question.options && (
          <View style={styles.options}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectOption(option)}
                activeOpacity={0.7}
                disabled={hasSubmitted}
              >
                <Surface style={getOptionStyle(option)} elevation={1}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                    {getOptionIcon(option)}
                  </View>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Fill in the Blank Input */}
        {question.type === 'fill_blank' && (
          <View style={styles.fillBlank}>
            <TextInput
              mode="outlined"
              label="Your answer"
              value={textAnswer}
              onChangeText={setTextAnswer}
              disabled={hasSubmitted}
              style={styles.textInput}
              autoCapitalize="none"
            />
            {hasSubmitted && (
              <View style={styles.answerFeedback}>
                {textAnswer.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                  <View style={styles.feedbackCorrect}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.feedbackText}>Correct!</Text>
                  </View>
                ) : (
                  <View style={styles.feedbackIncorrect}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                    <Text style={styles.feedbackText}>
                      Correct answer: {question.correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </Surface>

      {/* Submit Button */}
      {!hasSubmitted && (
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={question.type === 'multiple_choice' ? !selectedAnswer : !textAnswer.trim()}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Submit Answer
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progress: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  questionCard: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  questionType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  correctOption: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  incorrectOption: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  fillBlank: {
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
  },
  answerFeedback: {
    marginTop: 12,
  },
  feedbackCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  feedbackIncorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  feedbackText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});

export default QuizQuestion;
