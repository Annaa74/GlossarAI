import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  size = 'medium',
  showLabel = true,
}) => {
  const getStreakColor = () => {
    if (streak >= 30) return '#F59E0B'; // Gold
    if (streak >= 14) return '#F97316'; // Orange
    if (streak >= 7) return '#EF4444'; // Red
    if (streak >= 3) return '#EC4899'; // Pink
    return '#9CA3AF'; // Gray
  };

  const getStreakIcon = () => {
    if (streak >= 30) return 'fire';
    if (streak >= 14) return 'fire';
    if (streak >= 7) return 'fire';
    if (streak >= 3) return 'fire';
    return 'fire';
  };

  const getStreakLabel = () => {
    if (streak >= 30) return 'On Fire!';
    if (streak >= 14) return 'Amazing!';
    if (streak >= 7) return 'Great!';
    if (streak >= 3) return 'Good!';
    return 'Keep going!';
  };

  const sizes = {
    small: {
      container: { padding: 8 },
      icon: 16,
      number: 16,
      label: 10,
    },
    medium: {
      container: { padding: 12 },
      icon: 24,
      number: 24,
      label: 12,
    },
    large: {
      container: { padding: 20 },
      icon: 40,
      number: 48,
      label: 16,
    },
  };

  const sizeConfig = sizes[size];
  const color = getStreakColor();

  if (size === 'large') {
    return (
      <Surface style={[styles.largeContainer, sizeConfig.container]} elevation={3}>
        <View style={styles.largeContent}>
          <View style={[styles.fireBackground, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={getStreakIcon() as any} size={sizeConfig.icon} color={color} />
          </View>
          <Text style={[styles.largeNumber, { color, fontSize: sizeConfig.number }]}>
            {streak}
          </Text>
          <Text style={[styles.largeLabel, { fontSize: sizeConfig.label }]}>
            day streak
          </Text>
          {showLabel && (
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{getStreakLabel()}</Text>
            </View>
          )}
        </View>
      </Surface>
    );
  }

  return (
    <View style={[styles.container, sizeConfig.container]}>
      <MaterialCommunityIcons name={getStreakIcon() as any} size={sizeConfig.icon} color={color} />
      <Text style={[styles.number, { color, fontSize: sizeConfig.number }]}>{streak}</Text>
      {showLabel && size === 'medium' && (
        <Text style={[styles.label, { fontSize: sizeConfig.label }]}>day streak</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  number: {
    fontWeight: '700',
    marginLeft: 4,
  },
  label: {
    color: '#92400E',
    marginLeft: 4,
  },
  largeContainer: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  largeContent: {
    alignItems: 'center',
  },
  fireBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeNumber: {
    fontWeight: '800',
  },
  largeLabel: {
    color: '#6B7280',
    marginTop: 4,
  },
  badge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default StreakBadge;
