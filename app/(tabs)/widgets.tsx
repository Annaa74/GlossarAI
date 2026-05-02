import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Surface, Switch, Chip, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Widget, WidgetGrid } from '../../components';
import {
  useWidgetStore,
  WIDGET_CATALOG,
  WidgetConfig,
  WidgetSize,
} from '../../stores/widgetStore';

export default function WidgetsScreen() {
  const { widgets, toggleWidget, setWidgetSize, reorderWidget, resetWidgets } =
    useWidgetStore();

  const enabled = widgets.filter((w) => w.enabled);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Widgets</Text>
            <Text style={styles.subtitle}>
              Personalize your home — pick what matters today.
            </Text>
          </View>
          <MaterialCommunityIcons name="widgets" size={36} color="#6366F1" />
        </View>

        {/* Live preview */}
        <Surface style={styles.previewCard} elevation={1}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <Text style={styles.sectionHint}>
              {enabled.length} of {widgets.length} active
            </Text>
          </View>

          {enabled.length === 0 ? (
            <View style={styles.emptyPreview}>
              <MaterialCommunityIcons name="widgets-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No widgets enabled</Text>
              <Text style={styles.emptySubtext}>
                Toggle one on below to see it here.
              </Text>
            </View>
          ) : (
            <WidgetGrid widgets={enabled} />
          )}
        </Surface>

        {/* Manage list */}
        <View style={styles.manageList}>
          <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginBottom: 12 }]}>
            All Widgets
          </Text>
          {widgets.map((w, idx) => {
            const meta = WIDGET_CATALOG.find((c) => c.type === w.type)!;
            const isFirst = idx === 0;
            const isLast = idx === widgets.length - 1;
            return (
              <Surface key={w.id} style={styles.row} elevation={1}>
                <View style={styles.rowHeader}>
                  <View
                    style={[
                      styles.rowIcon,
                      { backgroundColor: meta.accent[0] + '22' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={meta.icon as any}
                      size={20}
                      color={meta.accent[0]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{meta.title}</Text>
                    <Text style={styles.rowDescription}>{meta.description}</Text>
                  </View>
                  <Switch
                    value={w.enabled}
                    onValueChange={() => toggleWidget(w.id)}
                  />
                </View>

                {w.enabled && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.controls}>
                      <View style={styles.sizeRow}>
                        <Text style={styles.controlLabel}>Size</Text>
                        <View style={styles.sizeChips}>
                          {(['small', 'medium', 'large'] as WidgetSize[]).map((s) => {
                            const supported = meta.supportedSizes.includes(s);
                            return (
                              <Chip
                                key={s}
                                selected={w.size === s}
                                disabled={!supported}
                                onPress={() => setWidgetSize(w.id, s)}
                                compact
                                style={styles.sizeChip}
                              >
                                {s[0].toUpperCase() + s.slice(1)}
                              </Chip>
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.reorderRow}>
                        <Button
                          icon="arrow-up"
                          mode="text"
                          compact
                          disabled={isFirst}
                          onPress={() => reorderWidget(w.id, 'up')}
                        >
                          Up
                        </Button>
                        <Button
                          icon="arrow-down"
                          mode="text"
                          compact
                          disabled={isLast}
                          onPress={() => reorderWidget(w.id, 'down')}
                        >
                          Down
                        </Button>
                      </View>
                    </View>
                  </>
                )}
              </Surface>
            );
          })}
        </View>

        <Button
          mode="text"
          onPress={resetWidgets}
          style={styles.resetButton}
          icon="restore"
        >
          Reset to defaults
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  previewCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionHint: { fontSize: 12, color: '#6B7280' },
  emptyPreview: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontWeight: '600',
  },
  emptySubtext: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  manageList: {
    paddingHorizontal: 16,
  },
  row: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rowDescription: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  divider: { marginVertical: 12 },
  controls: { gap: 12 },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sizeChips: { flexDirection: 'row', gap: 6 },
  sizeChip: {},
  reorderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  resetButton: { marginTop: 8 },
});
