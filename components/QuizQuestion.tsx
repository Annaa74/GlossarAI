import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuizQuestion as QuizQuestionType, Vocabulary } from '../types';
import { NEO, BRUTAL, BRUTAL_SHADOW, BRUTAL_SHADOW_SM } from '../constants/theme';

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
      return <MaterialCommunityIcons name="check-circle" size={22} color={NEO.ink} />;
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return <MaterialCommunityIcons name="close-circle" size={22} color={NEO.ink} />;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          QUESTION {questionNumber} OF {totalQuestions}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${(questionNumber / totalQuestions) * 100}%` }]}
          />
        </View>
      </View>

      <View style={styles.questionCard}>
        <View style={styles.questionTypePill}>
          <Text style={styles.questionType}>
            {question.type === 'multiple_choice' ? 'MULTIPLE CHOICE' : 'FILL IN THE BLANK'}
          </Text>
        </View>
        <Text style={styles.question}>{question.question}</Text>

        {question.type === 'multiple_choice' && question.options && (
          <View style={styles.options}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectOption(option)}
                activeOpacity={0.85}
                disabled={hasSubmitted}
              >
                <View style={getOptionStyle(option)}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>{String.fromCharCode(65 + index)}</Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                    {getOptionIcon(option)}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'fill_blank' && (
          <View style={styles.fillBlank}>
            <TextInput
              mode="outlined"
              label="Your answer"
              value={textAnswer}
              onChangeText={setTextAnswer}
              disabled={hasSubmitted}
              style={styles.textInput}
              outlineColor={NEO.ink}
              activeOutlineColor={NEO.ink}
              autoCapitalize="none"
            />
            {hasSubmitted && (
              <View style={styles.answerFeedback}>
                {textAnswer.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                  <View style={styles.feedbackCorrect}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={NEO.ink} />
                    <Text style={styles.feedbackText}>CORRECT!</Text>
                  </View>
                ) : (
                  <View style={styles.feedbackIncorrect}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={NEO.ink} />
                    <Text style={styles.feedbackText}>ANSWER: {question.correctAnswer}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {!hasSubmitted && (
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={question.type === 'multiple_choice' ? !selectedAnswer : !textAnswer.trim()}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          buttonColor={NEO.yellow}
          textColor={NEO.ink}
          labelStyle={styles.submitLabel}
        >
          SUBMIT ANSWER
        </Button>
      )}
    </View>
  );
};

const baseOption = {
  borderRadius: BRUTAL.radius,
  padding: 14,
  borderWidth: BRUTAL.border,
  borderColor: NEO.ink,
  boxShadow: BRUTAL_SHADOW_SM,
  marginRight: 3,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progress: {
    marginBottom: 22,
  },
  progressText: {
    fontSize: 12,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: NEO.white,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NEO.lime,
  },
  questionCard: {
    borderRadius: BRUTAL.radius,
    padding: 20,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  questionTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: NEO.yellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    marginBottom: 14,
  },
  questionType: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: '800',
    color: NEO.ink,
    lineHeight: 30,
    marginBottom: 22,
    letterSpacing: -0.5,
  },
  options: {
    gap: 10,
  },
  option: {
    ...baseOption,
    backgroundColor: NEO.white,
  },
  selectedOption: {
    ...baseOption,
    backgroundColor: NEO.yellow,
  },
  correctOption: {
    ...baseOption,
    backgroundColor: NEO.lime,
  },
  incorrectOption: {
    ...baseOption,
    backgroundColor: NEO.red,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: BRUTAL.radius,
    backgroundColor: NEO.ink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '900',
    color: NEO.white,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: NEO.ink,
    fontWeight: '700',
  },
  fillBlank: {
    marginTop: 4,
  },
  textInput: {
    backgroundColor: NEO.white,
  },
  answerFeedback: {
    marginTop: 12,
  },
  feedbackCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: NEO.lime,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    gap: 8,
  },
  feedbackIncorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: NEO.red,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    gap: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  submitButton: {
    marginTop: 22,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  submitButtonContent: {
    paddingVertical: 6,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default QuizQuestion;
