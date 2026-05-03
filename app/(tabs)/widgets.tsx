import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { Text, Switch, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WidgetGrid } from '../../components';
import {
  useThemedColors,
  NEO,
  BRUTAL,
  BRUTAL_SHADOW,
  BRUTAL_SHADOW_SM,
} from '../../constants/theme';
import { useWidgetStore, WIDGET_CATALOG, WidgetSize } from '../../stores/widgetStore';

export default function WidgetsScreen() {
  const { widgets, toggleWidget, setWidgetSize, reorderWidget, resetWidgets } = useWidgetStore();
  const c = useThemedColors();

  const enabled = widgets.filter((w) => w.enabled);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>WIDGETS</Text>
            <Text style={styles.subtitle}>PERSONALIZE YOUR HOME</Text>
          </View>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="widgets" size={26} color={NEO.ink} />
          </View>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>PREVIEW</Text>
            <Text style={styles.sectionHint}>
              {enabled.length} OF {widgets.length} ACTIVE
            </Text>
          </View>

          {enabled.length === 0 ? (
            <View style={styles.emptyPreview}>
              <MaterialCommunityIcons name="widgets-outline" size={42} color={NEO.ink} />
              <Text style={styles.emptyText}>NO WIDGETS ENABLED</Text>
              <Text style={styles.emptySubtext}>Toggle one on below to see it here.</Text>
            </View>
          ) : (
            <WidgetGrid widgets={enabled} />
          )}
        </View>

        <View style={styles.manageList}>
          <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginBottom: 12 }]}>
            ALL WIDGETS
          </Text>
          {widgets.map((w, idx) => {
            const meta = WIDGET_CATALOG.find((c) => c.type === w.type)!;
            const isFirst = idx === 0;
            const isLast = idx === widgets.length - 1;
            return (
              <View key={w.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <View style={[styles.rowIcon, { backgroundColor: meta.accent[0] }]}>
                    <MaterialCommunityIcons name={meta.icon as any} size={20} color={NEO.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{meta.title.toUpperCase()}</Text>
                    <Text style={styles.rowDescription}>{meta.description}</Text>
                  </View>
                  <Switch
                    value={w.enabled}
                    onValueChange={() => toggleWidget(w.id)}
                    color={NEO.ink}
                  />
                </View>

                {w.enabled && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.controls}>
                      <View style={styles.sizeRow}>
                        <Text style={styles.controlLabel}>SIZE</Text>
                        <View style={styles.sizeChips}>
                          {(['small', 'medium', 'large'] as WidgetSize[]).map((s) => {
                            const supported = meta.supportedSizes.includes(s);
                            const selected = w.size === s;
                            return (
                              <Pressable
                                key={s}
                                onPress={() => supported && setWidgetSize(w.id, s)}
                                disabled={!supported}
                              >
                                <View
                                  style={[
                                    styles.sizeChip,
                                    {
                                      backgroundColor: selected ? NEO.yellow : NEO.white,
                                      opacity: !supported ? 0.4 : 1,
                                    },
                                  ]}
                                >
                                  <Text style={styles.sizeChipText}>
                                    {s[0].toUpperCase() + s.slice(1)}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.reorderRow}>
                        <Pressable
                          onPress={() => !isFirst && reorderWidget(w.id, 'up')}
                          disabled={isFirst}
                        >
                          <View style={[styles.reorderBtn, isFirst && { opacity: 0.4 }]}>
                            <MaterialCommunityIcons name="arrow-up" size={16} color={NEO.ink} />
                            <Text style={styles.reorderText}>UP</Text>
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => !isLast && reorderWidget(w.id, 'down')}
                          disabled={isLast}
                        >
                          <View style={[styles.reorderBtn, isLast && { opacity: 0.4 }]}>
                            <MaterialCommunityIcons name="arrow-down" size={16} color={NEO.ink} />
                            <Text style={styles.reorderText}>DOWN</Text>
                          </View>
                        </Pressable>
                      </View>
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={resetWidgets}
          style={styles.resetButton}
          icon="restore"
          buttonColor={NEO.cream}
          textColor={NEO.ink}
          labelStyle={styles.resetLabel}
        >
          RESET TO DEFAULTS
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    color: NEO.ink,
    marginTop: 4,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    backgroundColor: NEO.lime,
    boxShadow: BRUTAL_SHADOW_SM,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
  },
  previewCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: BRUTAL.radius,
    marginBottom: 22,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.2,
  },
  sectionHint: {
    fontSize: 11,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  emptyPreview: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 13,
    color: NEO.ink,
    marginTop: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  emptySubtext: {
    fontSize: 12,
    color: NEO.ink,
    marginTop: 4,
    fontWeight: '600',
  },
  manageList: {
    paddingHorizontal: 16,
  },
  row: {
    borderRadius: BRUTAL.radius,
    padding: 14,
    marginBottom: 12,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.4,
  },
  rowDescription: {
    fontSize: 11,
    color: NEO.ink,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    height: BRUTAL.border,
    backgroundColor: NEO.ink,
    marginVertical: 12,
  },
  controls: { gap: 12 },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 11,
    color: NEO.ink,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sizeChips: { flexDirection: 'row', gap: 5 },
  sizeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    marginRight: 2,
  },
  sizeChipText: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.4,
  },
  reorderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    backgroundColor: NEO.cream,
  },
  reorderText: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 0.6,
  },
  resetButton: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW_SM,
    marginRight: 20,
  },
  resetLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
