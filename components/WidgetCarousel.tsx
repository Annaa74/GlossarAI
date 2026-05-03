import React from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { Widget, navigateForWidget } from './Widget';
import { useWidgetStore, WidgetConfig } from '../stores/widgetStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  widgets?: WidgetConfig[];
  onWidgetPress?: (config: WidgetConfig) => void;
}

/**
 * Horizontal-scrolling, snap-to-page widget carousel for the home screen.
 * Forces every widget to medium size so they share a single visual rhythm.
 */
export const WidgetCarousel: React.FC<Props> = ({ widgets, onWidgetPress }) => {
  const stored = useWidgetStore((s) => s.widgets);
  const list = (widgets ?? stored).filter((w) => w.enabled);

  if (list.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={SCREEN_WIDTH - 48}
      snapToAlignment="start"
      contentContainerStyle={styles.row}
    >
      {list.map((w) => (
        <Widget
          key={w.id}
          config={{ ...w, size: 'medium' }}
          style={styles.slot}
          onPress={() => (onWidgetPress ? onWidgetPress(w) : navigateForWidget(w.type))}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 12,
  },
  slot: {
    width: SCREEN_WIDTH - 64,
    height: 140,
  },
});

export default WidgetCarousel;
