import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NEO, BRUTAL, BRUTAL_SHADOW, BRUTAL_SHADOW_SM } from '../constants/theme';

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
    if (streak >= 30) return NEO.orange;
    if (streak >= 14) return NEO.pink;
    if (streak >= 7) return NEO.yellow;
    if (streak >= 3) return NEO.lime;
    return NEO.cream;
  };

  const getStreakLabel = () => {
    if (streak >= 30) return 'ON FIRE!';
    if (streak >= 14) return 'AMAZING!';
    if (streak >= 7) return 'GREAT!';
    if (streak >= 3) return 'GOOD!';
    return 'KEEP GOING';
  };

  const color = getStreakColor();

  if (size === 'large') {
    return (
      <View style={[styles.largeContainer, { backgroundColor: color }]}>
        <View style={styles.largeContent}>
          <View style={styles.fireBackground}>
            <MaterialCommunityIcons name="fire" size={40} color={NEO.ink} />
          </View>
          <Text style={styles.largeNumber}>{streak}</Text>
          <Text style={styles.largeLabel}>DAY STREAK</Text>
          {showLabel && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getStreakLabel()}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  const isSmall = size === 'small';

  return (
    <View style={[styles.container, { backgroundColor: color }, isSmall && styles.containerSmall]}>
      <MaterialCommunityIcons name="fire" size={isSmall ? 14 : 20} color={NEO.ink} />
      <Text style={[styles.number, isSmall && styles.numberSmall]}>{streak}</Text>
      {showLabel && size === 'medium' && <Text style={styles.label}>DAYS</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  number: {
    fontWeight: '900',
    fontSize: 18,
    color: NEO.ink,
    letterSpacing: -0.5,
  },
  numberSmall: {
    fontSize: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.8,
    marginLeft: 2,
  },
  largeContainer: {
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    padding: 24,
    alignSelf: 'stretch',
  },
  largeContent: {
    alignItems: 'center',
  },
  fireBackground: {
    width: 72,
    height: 72,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    backgroundColor: NEO.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeNumber: {
    fontWeight: '900',
    fontSize: 56,
    color: NEO.ink,
    letterSpacing: -2,
  },
  largeLabel: {
    color: NEO.ink,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: -4,
  },
  badge: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    backgroundColor: NEO.ink,
  },
  badgeText: {
    color: NEO.white,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.2,
  },
});

export default StreakBadge;
