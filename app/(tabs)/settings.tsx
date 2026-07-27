import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenScroll } from '../../components/ScreenScroll';
import { SettingsRow } from '../../components/SettingsRow';
import { useTheme } from '../../context/ThemeContext';
import type { AppearanceMode } from '../../lib/preferences';
import { getBiometricLockEnabled, setBiometricLockEnabled } from '../../lib/preferences';
import { radius, spacing, typography } from '../../lib/theme';
import { links } from '../../lib/links';
import { settingsIcons } from '../../lib/icons';

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

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, setMode } = useTheme();
  const [mode, setModeLocal] = useState<AppearanceMode>(theme.mode);
  const [biometricLock, setBiometricLock] = useState(false);

  useEffect(() => {
    setModeLocal(theme.mode);
  }, [theme.mode]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const enabled = await getBiometricLockEnabled();
      if (!cancelled) setBiometricLock(enabled);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSetMode = async (next: AppearanceMode) => {
    setModeLocal(next);
    await setMode(next);
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
          Customize appearance and manage your local LoopTidy data.
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

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Your data</Text>
      <View style={[styles.accountCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.accountCardTitle, { color: theme.colors.text }]}>Local-first storage</Text>
        <Text style={[styles.accountCardSubtitle, { color: theme.colors.textSecondary }]}>
          LoopTidy stores your loops on this device. No account required.
        </Text>
        <Text style={[styles.accountCardFooter, { color: theme.colors.textMuted }]}>
          LoopTidy does not use accounts or cloud sync.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Preferences</Text>
      <SettingsRow
        icon={settingsIcons.security}
        title="App lock (Face ID)"
        subtitle="Require Face ID or passcode when opening LoopTidy."
        right={{
          type: 'switch',
          value: biometricLock,
          onChange: (next) => {
            setBiometricLock(next);
            void setBiometricLockEnabled(next);
          },
        }}
      />
      <SettingsRow
        icon={settingsIcons.notifications}
        title="Local reminders"
        subtitle="Set on each loop in loop detail. No remote push."
        right={{ type: 'value', value: 'Per loop' }}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Data</Text>
      <SettingsRow
        icon={settingsIcons.backup}
        title="Backup & Restore"
        subtitle="Export JSON/CSV and restore on this device"
        onPress={() => router.push('/backup-restore')}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Legal & support</Text>
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

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>About</Text>
      <SettingsRow
        icon={settingsIcons.about}
        title="About LoopTidy"
        subtitle="Product overview and story"
        onPress={() => router.push('/marketing')}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Danger zone</Text>
      <SettingsRow
        icon={settingsIcons.danger}
        title="Backup & danger zone"
        subtitle="Export, restore, or delete all local data"
        tone="danger"
        onPress={() => router.push('/backup-restore')}
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
