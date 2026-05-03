import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryProgress, VocabCategory } from '../types';
import { getCategoryInfo } from '../constants/categories';
import { NEO, BRUTAL, BRUTAL_SHADOW } from '../constants/theme';

interface CategoryCardProps {
  progress: CategoryProgress;
  onPress: (category: VocabCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ progress, onPress }) => {
  const categoryInfo = getCategoryInfo(progress.category);
  const pct = Math.max(0, Math.min(100, progress.percentMastered));

  return (
    <TouchableOpacity onPress={() => onPress(progress.category)} activeOpacity={0.85}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color }]}>
            <MaterialCommunityIcons name={categoryInfo.icon as any} size={22} color={NEO.ink} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{categoryInfo.name}</Text>
            <Text style={styles.subtitle}>{progress.total} TERMS</Text>
          </View>
          <View style={[styles.percentContainer, { backgroundColor: categoryInfo.color }]}>
            <Text style={styles.percent}>{pct}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${pct}%`, backgroundColor: categoryInfo.color }]}
          />
        </View>

        <View style={styles.stats}>
          <View style={[styles.statBlock, { backgroundColor: NEO.lime }]}>
            <Text style={styles.statValue}>{progress.known}</Text>
            <Text style={styles.statText}>KNOWN</Text>
          </View>
          <View style={[styles.statBlock, { backgroundColor: NEO.orange }]}>
            <Text style={styles.statValue}>{progress.learning}</Text>
            <Text style={styles.statText}>LEARNING</Text>
          </View>
          <View style={[styles.statBlock, { backgroundColor: NEO.cream }]}>
            <Text style={styles.statValue}>{progress.new}</Text>
            <Text style={styles.statText}>NEW</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: NEO.white,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    padding: 14,
    marginBottom: 14,
    marginRight: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: NEO.ink,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  percentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
  },
  percent: {
    fontSize: 16,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.5,
  },
  progressTrack: {
    height: 14,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    backgroundColor: NEO.cream,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
  },
  stats: {
    flexDirection: 'row',
    gap: 6,
  },
  statBlock: {
    flex: 1,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    borderRadius: BRUTAL.radius,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: NEO.ink,
  },
  statText: {
    fontSize: 9,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 1,
  },
});

export default CategoryCard;
