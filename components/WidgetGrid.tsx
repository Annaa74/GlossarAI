import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Widget, navigateForWidget } from './Widget';
import { useWidgetStore, WidgetConfig } from '../stores/widgetStore';

interface WidgetGridProps {
  /** When provided, render exactly these widgets; otherwise pull from store. */
  widgets?: WidgetConfig[];
  onWidgetPress?: (config: WidgetConfig) => void;
}

/**
 * Lays out widgets in a grid: small widgets pair side-by-side,
 * medium and large take a full row.
 */
export const WidgetGrid: React.FC<WidgetGridProps> = ({ widgets, onWidgetPress }) => {
  const stored = useWidgetStore((s) => s.widgets);
  const list = (widgets ?? stored).filter((w) => w.enabled);

  // Group: pair two consecutive smalls into a row, otherwise one widget per row.
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
    <View style={styles.container}>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.row}>
          {row.map((w) => (
            <Widget
              key={w.id}
              config={w}
              onPress={() => (onWidgetPress ? onWidgetPress(w) : navigateForWidget(w.type))}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default WidgetGrid;
