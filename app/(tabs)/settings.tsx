import { View, Text, StyleSheet, Pressable, Linking, Alert, Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenScroll } from '../../components/ScreenScroll';
import { SettingsRow } from '../../components/SettingsRow';
import { useLoops } from '../../context/LoopContext';
import { useTheme } from '../../context/ThemeContext';
import type { Category, LoopType, Priority } from '../../types';
import {
  clearWeeklyReviewBannerDismissed,
  getBiometricLockEnabled,
  getPreferenceCache,
  hydratePreferenceCache,
  resetOnboarding,
  setBiometricLockEnabled,
  setDefaultCategory,
  setDefaultLoopType,
  setDefaultPriority,
  setDefaultReminderHour,
  setDefaultSnooze,
  setHapticsEnabled,
  setNudgeTone,
  setReduceMotion,
  setShowPmSignals,
  setShowWeeklyBanner,
  setStaleDays,
  setTimeFormat,
  setWeekStartsOn,
  type DefaultSnoozePreset,
  type NudgeTone,
  type PreferenceSnapshot,
  type StaleDaysOption,
  type TimeFormat,
  type WeekStartsOn,
} from '../../lib/preferences';
import {
  getReminderPermissionStatus,
  requestReminderPermission,
  SNOOZE_PRESETS,
} from '../../lib/reminders';
import { formatDate } from '../../lib/utils';
import { getVersionLabel } from '../../lib/version';
import { links } from '../../lib/links';
import { settingsIcons } from '../../lib/icons';
import { categoryLabels, loopTypeLabels, priorityLabels } from '../../lib/utils';
import { radius, spacing, typography } from '../../lib/theme';
import { isOpenLoop } from '../../lib/utils';

function AppearancePill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
        pressed && { opacity: 0.9 },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          { color: selected ? theme.colors.primary : theme.colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function cycleNext<T>(options: readonly T[], current: T): T {
  const idx = options.indexOf(current);
  return options[(idx + 1) % options.length] ?? options[0];
}

const LOOP_TYPES: LoopType[] = [
  'follow_up',
  'waiting_on_others',
  'promised_by_me',
  'decision_needed',
  'blocked',
  'due',
];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES: Category[] = ['work', 'personal', 'finance', 'health', 'home', 'other'];
const SNOOZE_KEYS = SNOOZE_PRESETS.map((p) => p.key);
const STALE_OPTIONS: StaleDaysOption[] = [7, 14, 21];
const REMINDER_HOURS = [7, 8, 9, 10, 12, 17, 18];

function formatHourLabel(hour: number, timeFormat: TimeFormat): string {
  if (timeFormat === '24h') return `${String(hour).padStart(2, '0')}:00`;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${suffix}`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, setMode } = useTheme();
  const { loops } = useLoops();
  const [mode, setModeLocal] = useState(theme.mode);
  const [biometricLock, setBiometricLock] = useState(false);
  const [prefs, setPrefs] = useState<PreferenceSnapshot>(getPreferenceCache());
  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined'
  );

  const refreshPrefs = useCallback(async () => {
    try {
      const next = await hydratePreferenceCache();
      setPrefs({ ...next });
    } catch {
      setPrefs({ ...getPreferenceCache() });
    }
  }, []);

  useEffect(() => {
    setModeLocal(theme.mode);
  }, [theme.mode]);

  /** Re-read on focus so a new backup or a permission change in iOS Settings shows up here. */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        try {
          const [enabled, status] = await Promise.all([
            getBiometricLockEnabled().catch(() => false),
            getReminderPermissionStatus().catch(() => 'undetermined' as const),
            refreshPrefs(),
          ]);
          if (cancelled) return;
          setBiometricLock(enabled);
          setNotifStatus(status);
        } catch {
          // Settings must always render, even if a read fails.
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [refreshPrefs])
  );

  const onSetMode = async (next: typeof theme.mode) => {
    setModeLocal(next);
    await setMode(next);
  };

  const openLoops = loops.filter(isOpenLoop).length;
  const closedLoops = loops.filter((l) => l.status === 'closed' || l.status === 'archived').length;
  const lastBackupLabel = prefs.lastBackupAt ? formatDate(prefs.lastBackupAt) : 'Never';

  const notifLabel =
    notifStatus === 'granted' ? 'On' : notifStatus === 'denied' ? 'Off' : 'Not set';

  const onNotificationsPress = async () => {
    try {
      if (notifStatus === 'granted') {
        Alert.alert('Notifications', 'Local reminder permission is already granted.');
        return;
      }
      if (notifStatus === 'denied') {
        if (Platform.OS === 'ios') await Linking.openSettings();
        return;
      }
      const granted = await requestReminderPermission();
      setNotifStatus(granted ? 'granted' : 'denied');
    } catch {
      Alert.alert(
        'Notifications',
        'Could not update notification permission. Enable it in iOS Settings › LoopTidy.'
      );
    }
  };

  return (
    <ScreenScroll contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
          Appearance, reminders, capture defaults, and local data controls.
        </Text>

        <View style={styles.pillsRow}>
          <AppearancePill
            label="System"
            selected={mode === 'system'}
            onPress={() => void onSetMode('system')}
          />
          <AppearancePill
            label="Light"
            selected={mode === 'light'}
            onPress={() => void onSetMode('light')}
          />
          <AppearancePill
            label="Dark"
            selected={mode === 'dark'}
            onPress={() => void onSetMode('dark')}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Notifications</Text>
      <SettingsRow
        icon={settingsIcons.notifications}
        title="Local reminders"
        subtitle={
          notifStatus === 'denied'
            ? 'Permission denied — open iOS Settings to enable'
            : 'On-device only. No remote push.'
        }
        onPress={() => void onNotificationsPress()}
        right={{ type: 'value', value: notifLabel }}
      />
      <SettingsRow
        icon={settingsIcons.time}
        title="Default reminder time"
        subtitle="Used when you snooze a loop"
        onPress={() => {
          const next = cycleNext(REMINDER_HOURS, prefs.defaultReminderHour);
          setPrefs((p) => ({ ...p, defaultReminderHour: next }));
          void setDefaultReminderHour(next);
        }}
        right={{
          type: 'value',
          value: formatHourLabel(prefs.defaultReminderHour, prefs.timeFormat),
        }}
      />
      <SettingsRow
        icon={settingsIcons.snooze}
        title="Default snooze"
        subtitle="Swipe snooze on loop cards"
        onPress={() => {
          const next = cycleNext(SNOOZE_KEYS, prefs.defaultSnooze) as DefaultSnoozePreset;
          setPrefs((p) => ({ ...p, defaultSnooze: next }));
          void setDefaultSnooze(next);
        }}
        right={{
          type: 'value',
          value: SNOOZE_PRESETS.find((p) => p.key === prefs.defaultSnooze)?.label ?? 'Tomorrow',
        }}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Preferences</Text>
      <SettingsRow
        icon={settingsIcons.haptics}
        title="Haptics"
        subtitle="Light feedback on taps and actions"
        right={{
          type: 'switch',
          value: prefs.hapticsEnabled,
          onChange: (next) => {
            setPrefs((p) => ({ ...p, hapticsEnabled: next }));
            void setHapticsEnabled(next);
          },
        }}
      />
      <SettingsRow
        icon={settingsIcons.motion}
        title="Reduce motion"
        subtitle="Skip the animated launch screen"
        right={{
          type: 'switch',
          value: prefs.reduceMotion,
          onChange: (next) => {
            setPrefs((p) => ({ ...p, reduceMotion: next }));
            void setReduceMotion(next);
          },
        }}
      />
      <SettingsRow
        icon={settingsIcons.time}
        title="Time format"
        subtitle="How reminder times are displayed"
        onPress={() => {
          const next: TimeFormat = prefs.timeFormat === '12h' ? '24h' : '12h';
          setPrefs((p) => ({ ...p, timeFormat: next }));
          void setTimeFormat(next);
        }}
        right={{ type: 'value', value: prefs.timeFormat === '12h' ? '12-hour' : '24-hour' }}
      />
      <SettingsRow
        icon={settingsIcons.calendar}
        title="Week starts on"
        subtitle="Weekly review and Insights"
        onPress={() => {
          const next: WeekStartsOn = prefs.weekStartsOn === 1 ? 0 : 1;
          setPrefs((p) => ({ ...p, weekStartsOn: next }));
          void setWeekStartsOn(next);
        }}
        right={{ type: 'value', value: prefs.weekStartsOn === 1 ? 'Monday' : 'Sunday' }}
      />
      <SettingsRow
        icon={settingsIcons.stale}
        title="Stale after"
        subtitle="Flag loops with no follow-up for this long"
        onPress={() => {
          const next = cycleNext(STALE_OPTIONS, prefs.staleDays);
          setPrefs((p) => ({ ...p, staleDays: next }));
          void setStaleDays(next);
        }}
        right={{ type: 'value', value: `${prefs.staleDays} days` }}
      />
      <SettingsRow
        icon={settingsIcons.nudge}
        title="Nudge tone"
        subtitle="Soft check-in or firmer ask"
        onPress={() => {
          const next: NudgeTone = prefs.nudgeTone === 'soft' ? 'firm' : 'soft';
          setPrefs((p) => ({ ...p, nudgeTone: next }));
          void setNudgeTone(next);
        }}
        right={{ type: 'value', value: prefs.nudgeTone === 'soft' ? 'Soft' : 'Firm' }}
      />
      <SettingsRow
        icon={settingsIcons.security}
        title="App lock (Face ID)"
        subtitle="Require Face ID or passcode when opening LoopTidy"
        right={{
          type: 'switch',
          value: biometricLock,
          onChange: (next) => {
            setBiometricLock(next);
            void setBiometricLockEnabled(next);
          },
        }}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Capture defaults</Text>
      <SettingsRow
        icon={settingsIcons.capture}
        title="Default loop type"
        onPress={() => {
          const next = cycleNext(LOOP_TYPES, prefs.defaultLoopType);
          setPrefs((p) => ({ ...p, defaultLoopType: next }));
          void setDefaultLoopType(next);
        }}
        right={{ type: 'value', value: loopTypeLabels[prefs.defaultLoopType] }}
      />
      <SettingsRow
        icon={settingsIcons.capture}
        title="Default priority"
        onPress={() => {
          const next = cycleNext(PRIORITIES, prefs.defaultPriority);
          setPrefs((p) => ({ ...p, defaultPriority: next }));
          void setDefaultPriority(next);
        }}
        right={{ type: 'value', value: priorityLabels[prefs.defaultPriority] }}
      />
      <SettingsRow
        icon={settingsIcons.capture}
        title="Default category"
        onPress={() => {
          const next = cycleNext(CATEGORIES, prefs.defaultCategory);
          setPrefs((p) => ({ ...p, defaultCategory: next }));
          void setDefaultCategory(next);
        }}
        right={{ type: 'value', value: categoryLabels[prefs.defaultCategory] }}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Today</Text>
      <SettingsRow
        icon={settingsIcons.today}
        title="PM signals"
        subtitle="Show attention signals on Today"
        right={{
          type: 'switch',
          value: prefs.showPmSignals,
          onChange: (next) => {
            setPrefs((p) => ({ ...p, showPmSignals: next }));
            void setShowPmSignals(next);
          },
        }}
      />
      <SettingsRow
        icon={settingsIcons.today}
        title="Weekly review banner"
        subtitle="Weekend prompt on Today"
        right={{
          type: 'switch',
          value: prefs.showWeeklyBanner,
          onChange: (next) => {
            setPrefs((p) => ({ ...p, showWeeklyBanner: next }));
            void setShowWeeklyBanner(next);
          },
        }}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Help</Text>
      <SettingsRow
        icon={settingsIcons.tour}
        title="Replay onboarding"
        subtitle="Show the product tour on next launch"
        onPress={() => {
          Alert.alert('Replay onboarding?', 'The tour will show the next time you open LoopTidy.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replay',
              onPress: () => {
                void (async () => {
                  try {
                    await resetOnboarding();
                    Alert.alert('Ready', 'Close and reopen the app to see onboarding.');
                  } catch {
                    Alert.alert('Could not reset', 'Please try again.');
                  }
                })();
              },
            },
          ]);
        }}
      />
      <SettingsRow
        icon={settingsIcons.today}
        title="Restore weekly banner"
        subtitle="Show this week’s review prompt again"
        onPress={() => {
          void (async () => {
            try {
              await clearWeeklyReviewBannerDismissed();
              Alert.alert('Restored', 'The weekly review banner can show again this weekend.');
            } catch {
              Alert.alert('Could not restore', 'Please try again.');
            }
          })();
        }}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Data</Text>
      <View
        style={[
          styles.accountCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.accountCardTitle, { color: theme.colors.text }]}>
          On this device
        </Text>
        <Text style={[styles.accountCardSubtitle, { color: theme.colors.textSecondary }]}>
          {openLoops} open · {closedLoops} closed/archived · {loops.length} total
        </Text>
        <Text style={[styles.accountCardFooter, { color: theme.colors.textMuted }]}>
          Last full backup: {lastBackupLabel}
        </Text>
      </View>
      <SettingsRow
        icon={settingsIcons.backup}
        title="Backup & Restore"
        subtitle="Export JSON/CSV or restore on this device"
        onPress={() => router.push('/backup-restore')}
      />
      <SettingsRow
        icon={settingsIcons.danger}
        title="Delete all local data"
        subtitle="Open Backup & Restore → Danger zone"
        tone="danger"
        onPress={() => router.push('/backup-restore')}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>About</Text>
      <SettingsRow
        icon={settingsIcons.about}
        title="Version"
        subtitle="LoopTidy build on this device"
        right={{ type: 'value', value: getVersionLabel() }}
      />
      <SettingsRow
        icon={settingsIcons.about}
        title="About LoopTidy"
        subtitle="Product overview and story"
        onPress={() => router.push('/marketing')}
      />
      <SettingsRow
        icon={settingsIcons.privacy}
        title="Privacy Policy"
        subtitle="How LoopTidy handles your data"
        onPress={() => void Linking.openURL(links.privacyPolicy)}
      />
      <SettingsRow
        icon={settingsIcons.support}
        title="Support"
        subtitle="hello.hailelabs@gmail.com"
        onPress={() => void Linking.openURL(links.supportEmail)}
      />
      <SettingsRow
        icon={settingsIcons.rate}
        title="Rate on the App Store"
        subtitle="Opens when the listing is live"
        onPress={() => void Linking.openURL(links.appStore)}
      />

      <View style={{ height: spacing.xxl }} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.title,
  },
  heroSubtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pillText: {
    ...typography.caption,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.label,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  accountCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  accountCardTitle: {
    ...typography.callout,
    fontWeight: '700',
  },
  accountCardSubtitle: {
    ...typography.body,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  accountCardFooter: {
    ...typography.caption,
  },
});
