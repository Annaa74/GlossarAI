import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { CategoryProgress } from '../types';
import { NEO, BRUTAL, BRUTAL_SHADOW, BRUTAL_SHADOW_SM } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProgressChartProps {
  categoryProgress: CategoryProgress[];
  totalCards: number;
  knownCards: number;
  learningCards: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  categoryProgress,
  totalCards,
  knownCards,
  learningCards,
}) => {
  const newCards = totalCards - knownCards - learningCards;

  const pieData = [
    {
      name: 'Known',
      count: knownCards,
      color: NEO.lime,
      legendFontColor: NEO.ink,
      legendFontSize: 12,
    },
    {
      name: 'Learning',
      count: learningCards,
      color: NEO.orange,
      legendFontColor: NEO.ink,
      legendFontSize: 12,
    },
    {
      name: 'New',
      count: newCards,
      color: NEO.blue,
      legendFontColor: NEO.ink,
      legendFontSize: 12,
    },
  ].filter((d) => d.count > 0);

  const barData = {
    labels: categoryProgress.slice(0, 6).map((p) => {
      const name = p.category.split('/')[0].split(' ')[0];
      return name.length > 6 ? name.slice(0, 6) : name;
    }),
    datasets: [
      {
        data: categoryProgress.slice(0, 6).map((p) => p.percentMastered),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: NEO.white,
    backgroundGradientTo: NEO.white,
    decimalPlaces: 0,
    color: () => NEO.ink,
    labelColor: () => NEO.ink,
    style: { borderRadius: BRUTAL.radius },
    propsForBackgroundLines: { strokeDasharray: '', stroke: NEO.ink, strokeWidth: 1 },
  };

  const overallProgress = totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.overallCard}>
        <Text style={styles.sectionTitle}>OVERALL PROGRESS</Text>
        <View style={styles.overallStats}>
          <View style={styles.mainStat}>
            <Text style={styles.mainStatValue}>{overallProgress}%</Text>
            <Text style={styles.mainStatLabel}>MASTERED</Text>
          </View>
          <View style={styles.pieContainer}>
            {pieData.length > 0 && (
              <PieChart
                data={pieData}
                width={160}
                height={100}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="0"
                center={[0, 0]}
                hasLegend={false}
                absolute
              />
            )}
          </View>
        </View>
        <View style={styles.legend}>
          {pieData.map((item) => (
            <View key={item.name} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.name.toUpperCase()}: {item.count}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>PROGRESS BY CATEGORY</Text>
        {categoryProgress.length > 0 && (
          <BarChart
            data={barData}
            width={SCREEN_WIDTH - 64}
            height={180}
            chartConfig={chartConfig}
            style={styles.barChart}
            fromZero
            showValuesOnTopOfBars
            yAxisSuffix="%"
            yAxisLabel=""
          />
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: NEO.white }]}>
          <Text style={styles.statValue}>{totalCards}</Text>
          <Text style={styles.statLabel}>TOTAL TERMS</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: NEO.lime }]}>
          <Text style={styles.statValue}>{knownCards}</Text>
          <Text style={styles.statLabel}>MASTERED</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: NEO.orange }]}>
          <Text style={styles.statValue}>{learningCards}</Text>
          <Text style={styles.statLabel}>LEARNING</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: NEO.blue }]}>
          <Text style={styles.statValue}>{newCards}</Text>
          <Text style={styles.statLabel}>NEW</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  overallCard: {
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    backgroundColor: NEO.white,
    boxShadow: BRUTAL_SHADOW,
    padding: 18,
    marginBottom: 18,
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  overallStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainStat: {
    flex: 1,
  },
  mainStatValue: {
    fontSize: 56,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -2,
  },
  mainStatLabel: {
    fontSize: 12,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pieContainer: {
    flex: 1,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    borderRadius: BRUTAL.radius,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: NEO.ink,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: NEO.ink,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryCard: {
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    backgroundColor: NEO.white,
    boxShadow: BRUTAL_SHADOW,
    padding: 18,
    marginBottom: 18,
    marginRight: 4,
  },
  barChart: {
    borderRadius: BRUTAL.radius,
    marginLeft: -16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    padding: 14,
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 3,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
});

export default ProgressChart;
