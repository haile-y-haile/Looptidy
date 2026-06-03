import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { OpenLoop } from '../types';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { Badge } from './Badge';
import { DatePickerField } from './DatePickerField';
import { PrimaryButton } from './PrimaryButton';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import {
  computeSnoozeUntil,
  defaultReminderLabel,
  formatReminderDisplay,
  getEffectiveReminderTime,
  isReminderSnoozed,
  requestReminderPermission,
  scheduleLoopReminder,
  cancelLoopReminder,
  SNOOZE_PRESETS,
  type SnoozePreset,
} from '../lib/reminders';
import { radius, spacing, typography } from '../lib/theme';
import { formatDate } from '../lib/utils';

export function ReminderPanel({ loop }: { loop: OpenLoop }) {
  const { theme } = useTheme();
  const { updateLoop, addTimelineEvent } = useLoops();
  const [reminderInput, setReminderInput] = useState('');
  const [labelInput, setLabelInput] = useState(loop.reminderLabel ?? '');
  const [busy, setBusy] = useState(false);

  const effective = getEffectiveReminderTime(loop);
  const hasReminder = Boolean(loop.reminderEnabled && effective);

  const applyUpdate = async (updates: Partial<OpenLoop>) => {
    setBusy(true);
    try {
      const merged = { ...loop, ...updates };
      if (updates.reminderEnabled === false) {
        await cancelLoopReminder(loop);
        await updateLoop(loop.id, {
          ...updates,
          snoozedUntil: undefined,
          localNotificationId: undefined,
        });
      } else {
        const notificationId = await scheduleLoopReminder(merged);
        await updateLoop(loop.id, { ...updates, localNotificationId: notificationId ?? undefined });
      }
      await hapticSuccess();
    } finally {
      setBusy(false);
    }
  };

  const handleSetReminder = async () => {
    if (!reminderInput.trim()) return;
    const at = reminderInput.trim();
    const when = new Date(at);
    if (Number.isNaN(when.getTime())) {
      Alert.alert('Invalid date', 'Choose a valid reminder date and time.');
      return;
    }
    void hapticLight();
    const granted = await requestReminderPermission();
    if (!granted) {
      Alert.alert(
        'Notifications needed',
        'LoopTidy uses local notifications only — on this device — to nudge you when it is time to follow up. No cloud or remote push.',
        [{ text: 'OK' }]
      );
      return;
    }
    await applyUpdate({
      reminderEnabled: true,
      reminderAt: at,
      snoozedUntil: undefined,
      reminderLabel: labelInput.trim() || defaultReminderLabel(loop),
    });
    await addTimelineEvent(loop.id, {
      type: 'note',
      title: 'Reminder set',
      description: formatReminderDisplay(at),
    });
    setReminderInput('');
  };

  const handleSnooze = async (preset: SnoozePreset) => {
    void hapticLight();
    const until = computeSnoozeUntil(preset);
    await applyUpdate({ snoozedUntil: until, reminderEnabled: true });
    await addTimelineEvent(loop.id, {
      type: 'note',
      title: 'Reminder snoozed',
      description: formatReminderDisplay(until),
    });
  };

  const handleClear = async () => {
    Alert.alert('Clear reminder?', 'This removes the local reminder for this loop.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await applyUpdate({
              reminderEnabled: false,
              reminderAt: undefined,
              snoozedUntil: undefined,
              reminderLabel: undefined,
              localNotificationId: undefined,
            });
          })();
        },
      },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Local reminder</Text>
        {hasReminder ? (
          <Badge
            label={isReminderSnoozed(loop) ? 'Snoozed' : 'Reminder set'}
            color={theme.colors.primary}
            backgroundColor={theme.colors.primaryLight}
          />
        ) : null}
      </View>
      <Text style={[styles.helper, { color: theme.colors.textMuted }]}>
        On-device follow-up nudges only. No cloud sync or remote push.
      </Text>

      {hasReminder ? (
        <View
          style={[
            styles.statusCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
            {isReminderSnoozed(loop) ? 'Snoozed until' : 'Remind me'}
          </Text>
          <Text style={[styles.statusValue, { color: theme.colors.text }]}>
            {formatDate(effective!)}
          </Text>
          {loop.reminderLabel ? (
            <Text style={[styles.statusMeta, { color: theme.colors.textMuted }]}>
              {loop.reminderLabel}
            </Text>
          ) : null}
        </View>
      ) : null}

      {!hasReminder ? (
        <>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>When</Text>
          <DatePickerField
            value={reminderInput}
            onChange={setReminderInput}
            mode="datetime"
            placeholder="Select reminder date & time"
            style={{ marginBottom: spacing.sm }}
          />
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Label (optional)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={labelInput}
            onChangeText={setLabelInput}
            placeholder="Follow up on contract"
            placeholderTextColor={theme.colors.textMuted}
          />
          <PrimaryButton
            label="Set reminder"
            onPress={() => void handleSetReminder()}
            disabled={!reminderInput.trim() || busy}
          />
        </>
      ) : (
        <>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Snooze</Text>
          <View style={styles.snoozeRow}>
            {SNOOZE_PRESETS.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => void handleSnooze(p.key)}
                disabled={busy}
                style={({ pressed }) => [
                  styles.snoozeChip,
                  { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.snoozeText, { color: theme.colors.text }]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => void handleClear()} disabled={busy}>
            <Text style={[styles.clearLink, { color: theme.colors.danger }]}>Clear reminder</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headline,
  },
  helper: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  statusCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statusLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  statusValue: {
    ...typography.callout,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  statusMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  label: {
    ...typography.callout,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
    marginBottom: spacing.sm,
  },
  snoozeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  snoozeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  snoozeText: {
    ...typography.caption,
    fontWeight: '800',
  },
  clearLink: {
    ...typography.callout,
    fontWeight: '800',
    marginTop: spacing.md,
  },
});
