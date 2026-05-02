import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { CategoryProgress } from '../types';
import { CATEGORIES } from '../constants/categories';

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

  // Pie chart data for overall progress
  const pieData = [
    {
      name: 'Known',
      count: knownCards,
      color: '#10B981',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Learning',
      count: learningCards,
      color: '#F59E0B',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'New',
      count: newCards,
      color: '#E5E7EB',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
  ].filter((d) => d.count > 0);

  // Bar chart data for category progress
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
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#E5E7EB',
    },
  };

  const overallProgress = totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Overall Progress Card */}
      <Surface style={styles.overallCard} elevation={2}>
        <Text style={styles.sectionTitle}>Overall Progress</Text>
        <View style={styles.overallStats}>
          <View style={styles.mainStat}>
            <Text style={styles.mainStatValue}>{overallProgress}%</Text>
            <Text style={styles.mainStatLabel}>Mastered</Text>
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
                {item.name}: {item.count}
              </Text>
            </View>
          ))}
        </View>
      </Surface>

      {/* Category Progress Card */}
      <Surface style={styles.categoryCard} elevation={2}>
        <Text style={styles.sectionTitle}>Progress by Category</Text>
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
      </Surface>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Surface style={styles.statCard} elevation={1}>
          <Text style={styles.statValue}>{totalCards}</Text>
          <Text style={styles.statLabel}>Total Terms</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{knownCards}</Text>
          <Text style={styles.statLabel}>Mastered</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{learningCards}</Text>
          <Text style={styles.statLabel}>Learning</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <Text style={[styles.statValue, { color: '#6B7280' }]}>{newCards}</Text>
          <Text style={styles.statLabel}>New</Text>
        </Surface>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  overallCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
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
    fontSize: 48,
    fontWeight: '700',
    color: '#6366F1',
  },
  mainStatLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  pieContainer: {
    flex: 1,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#374151',
  },
  categoryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  barChart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ProgressChart;
