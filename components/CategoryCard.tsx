import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryProgress, VocabCategory } from '../types';
import { getCategoryInfo } from '../constants/categories';

interface CategoryCardProps {
  progress: CategoryProgress;
  onPress: (category: VocabCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ progress, onPress }) => {
  const categoryInfo = getCategoryInfo(progress.category);
  const progressValue = progress.percentMastered / 100;

  return (
    <TouchableOpacity onPress={() => onPress(progress.category)} activeOpacity={0.7}>
      <Surface style={styles.container} elevation={2}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color + '20' }]}>
            <MaterialCommunityIcons
              name={categoryInfo.icon as any}
              size={24}
              color={categoryInfo.color}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{categoryInfo.name}</Text>
            <Text style={styles.subtitle}>{progress.total} terms</Text>
          </View>
          <View style={styles.percentContainer}>
            <Text style={[styles.percent, { color: categoryInfo.color }]}>
              {progress.percentMastered}%
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progressValue}
            color={categoryInfo.color}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statText}>{progress.known} Known</Text>
          </View>
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statText}>{progress.learning} Learning</Text>
          </View>
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.statText}>{progress.new} New</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  percentContainer: {
    marginLeft: 12,
  },
  percent: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default CategoryCard;
