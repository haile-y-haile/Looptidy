import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useLoops } from '../context/LoopContext';
import { useScopeChanges } from '../context/ScopeContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { GlassCard } from '../components/GlassCard';
import { ScreenScroll } from '../components/ScreenScroll';
import {
  SCOPE_CHANGE_TYPE_LABELS,
  SCOPE_STATUS_LABELS,
  buildScopeSummaryText,
  convertScopeChangeToLoop,
  getHighImpactScopeChanges,
  getScopeChangeSummary,
  getScopeChangesByStatus,
} from '../lib/scopeGuard';
import type { ScopeChangeStatus, ScopeChangeType, ImpactLevel, Priority, RiskLevel } from '../types';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { radius, spacing, typography } from '../lib/theme';

export default function ScopeGuardScreen() {
  const { theme } = useTheme();
  const { scopeChanges, addScopeChange, updateScopeChange } = useScopeChanges();
  const { addLoop } = useLoops();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<ScopeChangeStatus | 'high_impact' | 'all'>('all');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [changeType, setChangeType] = useState<ScopeChangeType>('new_request');
  const [impact, setImpact] = useState<ImpactLevel>('medium');

  const summary = useMemo(() => getScopeChangeSummary(scopeChanges), [scopeChanges]);

  const filtered = useMemo(() => {
    if (filter === 'high_impact') return getHighImpactScopeChanges(scopeChanges);
    if (filter === 'all') return scopeChanges;
    return getScopeChangesByStatus(scopeChanges, filter);
  }, [scopeChanges, filter]);

  const capture = async () => {
    if (!title.trim()) {
      Alert.alert('Title required');
      return;
    }
    await addScopeChange({
      title: title.trim(),
      description: description.trim(),
      requestedBy: requestedBy.trim() || undefined,
      changeType,
      status: 'captured',
      priority: 'medium' as Priority,
      riskLevel: 'medium' as RiskLevel,
      impact,
    });
    setTitle('');
    setDescription('');
    setRequestedBy('');
    setShowForm(false);
    void hapticSuccess();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Scope Guard' }} />
      <ScreenScroll>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          Capture scope changes before they become hidden work.
        </Text>
        <GlassCard intensity={28} style={styles.stats}>
          <Text style={[styles.statLine, { color: theme.colors.text }]}>
            {summary.open} open · {summary.highImpact} high impact
          </Text>
        </GlassCard>

        <Pressable
          onPress={() => setShowForm((v) => !v)}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Capture scope change'}</Text>
        </Pressable>

        {showForm ? (
          <GlassCard intensity={24} style={styles.form}>
            <FormField label="Title" value={title} onChange={setTitle} theme={theme} />
            <FormField label="Description" value={description} onChange={setDescription} theme={theme} multiline />
            <FormField label="Requested by" value={requestedBy} onChange={setRequestedBy} theme={theme} />
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Change type</Text>
            <View style={styles.chipRow}>
              {(Object.keys(SCOPE_CHANGE_TYPE_LABELS) as ScopeChangeType[]).slice(0, 4).map((t) => (
                <FilterChip key={t} label={SCOPE_CHANGE_TYPE_LABELS[t]} selected={changeType === t} onPress={() => setChangeType(t)} />
              ))}
            </View>
            <Pressable onPress={() => void capture()} style={[styles.save, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {(['all', 'captured', 'under_review', 'accepted', 'high_impact'] as const).map((f) => (
            <FilterChip
              key={f}
              label={f === 'high_impact' ? 'High impact' : f === 'all' ? 'All' : SCOPE_STATUS_LABELS[f]}
              selected={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </ScrollView>

        {filtered.length > 0 ? (
          filtered.map((item) => (
            <ScopeCard
              key={item.id}
              item={item}
              onAccept={() => void updateScopeChange(item.id, { status: 'accepted' })}
              onPark={() => void updateScopeChange(item.id, { status: 'parked' })}
              onReject={() => void updateScopeChange(item.id, { status: 'rejected' })}
              onResolve={() => void updateScopeChange(item.id, { status: 'resolved', resolvedAt: new Date().toISOString() })}
              onConvert={async () => {
                const loop = await addLoop(convertScopeChangeToLoop(item));
                await updateScopeChange(item.id, { status: 'converted_to_loop', loopId: loop.id });
              }}
              onCopy={async () => {
                await Clipboard.setStringAsync(buildScopeSummaryText(item));
                Alert.alert('Copied');
              }}
            />
          ))
        ) : (
          <EmptyState title="No scope changes" message="Capture a change to track impact and decisions." />
        )}
      </ScreenScroll>
    </>
  );
}

function ScopeCard({
  item,
  onAccept,
  onPark,
  onReject,
  onResolve,
  onConvert,
  onCopy,
}: {
  item: import('../types').ScopeChange;
  onAccept: () => void;
  onPark: () => void;
  onReject: () => void;
  onResolve: () => void;
  onConvert: () => void;
  onCopy: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.cardMeta, { color: theme.colors.textMuted }]}>
        {SCOPE_CHANGE_TYPE_LABELS[item.changeType]} · {SCOPE_STATUS_LABELS[item.status]} · {item.impact} impact
      </Text>
      {item.description ? (
        <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]} numberOfLines={3}>
          {item.description}
        </Text>
      ) : null}
      <View style={styles.actions}>
        {['Accept', 'Park', 'Reject', 'To loop', 'Resolve', 'Copy'].map((label, i) => {
          const fn = [onAccept, onPark, onReject, onConvert, onResolve, onCopy][i];
          return (
            <Pressable key={label} onPress={fn} style={[styles.actionChip, { borderColor: theme.colors.border }]}>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FormField({
  label,
  value,
  onChange,
  theme,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  theme: ReturnType<typeof useTheme>['theme'];
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 72 }, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.background }]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        placeholderTextColor={theme.colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { ...typography.body, marginBottom: spacing.md },
  stats: { marginBottom: spacing.md },
  statLine: { ...typography.callout, fontWeight: '700' },
  addBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  addBtnText: { color: '#FFF', fontWeight: '800' },
  form: { marginBottom: spacing.lg },
  label: { ...typography.caption, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, ...typography.body },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  save: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '800' },
  filters: { marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { ...typography.headline },
  cardMeta: { ...typography.caption, marginTop: spacing.xs },
  cardDesc: { ...typography.body, marginTop: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  actionChip: { borderWidth: 1, borderRadius: radius.full, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  actionText: { ...typography.caption, fontWeight: '700' },
});
