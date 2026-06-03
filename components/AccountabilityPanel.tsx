import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { OpenLoop } from '../types';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { Badge } from './Badge';
import { DatePickerField } from './DatePickerField';
import {
  accountabilityStatusLabel,
  escalationLevelLabel,
  getAccountabilityStatus,
  personFromName,
} from '../lib/accountability';
import { formatDate } from '../lib/utils';
import { radius, spacing, typography } from '../lib/theme';
import { hapticLight } from '../lib/haptics';

export function AccountabilityPanel({ loop }: { loop: OpenLoop }) {
  const { theme } = useTheme();
  const { updateLoop } = useLoops();
  const status = getAccountabilityStatus(loop);
  const [notes, setNotes] = useState(loop.accountabilityNotes ?? '');
  const [nextOwner, setNextOwner] = useState(loop.nextActionOwner?.name ?? '');
  const [accountable, setAccountable] = useState(loop.accountableOwner?.name ?? '');
  const [checkIn, setCheckIn] = useState(loop.nextCheckInAt ?? '');

  const apply = async (updates: Partial<OpenLoop>) => {
    void hapticLight();
    await updateLoop(loop.id, updates);
  };

  const quickActions = [
    { label: 'Ownership clear', updates: { accountabilityStatus: 'clear' as const, escalationLevel: 'none' as const } },
    { label: 'Owner unclear', updates: { accountabilityStatus: 'unclear' as const } },
    { label: 'Waiting on owner', updates: { accountabilityStatus: 'waiting_on_owner' as const } },
    { label: 'Needs follow-up', updates: { accountabilityStatus: 'needs_follow_up' as const } },
    { label: 'Escalate', updates: { accountabilityStatus: 'escalated' as const, escalationLevel: 'escalated' as const } },
    { label: 'Resolved', updates: { accountabilityStatus: 'resolved' as const } },
    {
      label: 'Follow-up sent',
      updates: { lastFollowUpAt: new Date().toISOString(), accountabilityStatus: 'clear' as const },
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Ownership & Accountability</Text>
        <Badge
          label={accountabilityStatusLabel(status)}
          color={theme.colors.primary}
          backgroundColor={theme.colors.primaryLight}
        />
      </View>

      <View style={styles.metaGrid}>
        {loop.accountableOwner ? (
          <Meta label="Accountable" value={loop.accountableOwner.name} theme={theme} />
        ) : null}
        {loop.nextActionOwner ? (
          <Meta label="Next action" value={loop.nextActionOwner.name} theme={theme} />
        ) : null}
        {loop.waitingOn ? <Meta label="Waiting on" value={loop.waitingOn.name} theme={theme} /> : null}
        {loop.promisedTo ? <Meta label="Promised to" value={loop.promisedTo.name} theme={theme} /> : null}
        {loop.lastFollowUpAt ? (
          <Meta label="Last follow-up" value={formatDate(loop.lastFollowUpAt)} theme={theme} />
        ) : null}
        {loop.nextCheckInAt ? (
          <Meta label="Next check-in" value={formatDate(loop.nextCheckInAt)} theme={theme} />
        ) : null}
        {loop.escalationLevel ? (
          <Meta label="Escalation" value={escalationLevelLabel(loop.escalationLevel)} theme={theme} />
        ) : null}
      </View>

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Set owners</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
        value={accountable}
        onChangeText={setAccountable}
        placeholder="Accountable owner"
        placeholderTextColor={theme.colors.textMuted}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
        value={nextOwner}
        onChangeText={setNextOwner}
        placeholder="Next action owner"
        placeholderTextColor={theme.colors.textMuted}
      />
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Next check-in</Text>
      <DatePickerField
        value={checkIn}
        onChange={setCheckIn}
        mode="date"
        placeholder="Select next check-in date"
        style={{ marginBottom: spacing.sm }}
      />
      <Pressable
        onPress={() =>
          void apply({
            accountableOwner: accountable.trim() ? personFromName(accountable) : undefined,
            nextActionOwner: nextOwner.trim() ? personFromName(nextOwner) : undefined,
            nextCheckInAt: checkIn.trim() || undefined,
            accountabilityStatus: 'clear',
          })
        }
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: theme.colors.primary },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.saveBtnText}>Save ownership</Text>
      </Pressable>

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Notes</Text>
      <TextInput
        style={[styles.input, styles.area, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Accountability context…"
        placeholderTextColor={theme.colors.textMuted}
        multiline
      />
      <Pressable
        onPress={() => void apply({ accountabilityNotes: notes.trim() })}
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.link, { color: theme.colors.primary }]}>Save notes</Text>
      </Pressable>

      <View style={styles.chips}>
        {quickActions.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => void apply(a.updates)}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.chipText, { color: theme.colors.text }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Meta({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: { ...typography.headline, flex: 1 },
  metaGrid: { marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  metaLabel: { ...typography.caption },
  metaValue: { ...typography.caption, fontWeight: '700' },
  label: { ...typography.callout, marginTop: spacing.sm, marginBottom: spacing.sm },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...typography.body,
  },
  area: { minHeight: 72, textAlignVertical: 'top' },
  saveBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  saveBtnText: { ...typography.callout, color: '#FFF', fontWeight: '800' },
  link: { ...typography.caption, fontWeight: '800', marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chipText: { ...typography.caption, fontWeight: '700' },
});
