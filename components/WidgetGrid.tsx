import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import { Widget, navigateForWidget } from './Widget';
import { useWidgetStore, WidgetConfig } from '../stores/widgetStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 12;

interface WidgetGridProps {
  /** When provided, render exactly these widgets; otherwise pull from store. */
  widgets?: WidgetConfig[];
  onWidgetPress?: (config: WidgetConfig) => void;
}

/**
 * Lays out widgets in a grid: small widgets pair side-by-side,
 * medium and large take a full row. Widgets size to the grid's
 * actual container width, not the screen width — so the grid can
 * sit inside cards with their own padding.
 */
export const WidgetGrid: React.FC<WidgetGridProps> = ({ widgets, onWidgetPress }) => {
  const stored = useWidgetStore((s) => s.widgets);
  const list = (widgets ?? stored).filter((w) => w.enabled);

  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 32);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - containerWidth) > 1) setContainerWidth(w);
  };

  const halfWidth = (containerWidth - GAP) / 2;
  const fullWidth = containerWidth;

  const rows: WidgetConfig[][] = [];
  let i = 0;
  while (i < list.length) {
    const w = list[i];
    if (w.size === 'small' && list[i + 1]?.size === 'small') {
      rows.push([w, list[i + 1]]);
      i += 2;
    } else {
      rows.push([w]);
      i += 1;
    }
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.row}>
          {row.map((w) => {
            const isSmallPair = row.length === 2;
            const width = isSmallPair ? halfWidth : fullWidth;
            const height = w.size === 'large' ? 220 : 140;
            return (
              <Widget
                key={w.id}
                config={w}
                style={{ width, height }}
                onPress={() => (onWidgetPress ? onWidgetPress(w) : navigateForWidget(w.type))}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
});

export default WidgetGrid;
