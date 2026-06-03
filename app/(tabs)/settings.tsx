import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenScroll } from '../../components/ScreenScroll';
import { SettingsRow } from '../../components/SettingsRow';
import { useTheme } from '../../context/ThemeContext';
import type { AppearanceMode } from '../../lib/preferences';
import { radius, spacing, typography } from '../../lib/theme';
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

  useEffect(() => {
    setModeLocal(theme.mode);
  }, [theme.mode]);

  const headerEnter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerEnter, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerEnter]);

  const onSetMode = async (next: AppearanceMode) => {
    setModeLocal(next);
    await setMode(next);
  };

  const appearanceLabel = useMemo(() => {
    if (theme.mode === 'system') return 'System';
    if (theme.mode === 'dark') return 'Dark';
    return 'Light';
  }, [theme.mode]);

  return (
    <ScreenScroll contentContainerStyle={{ paddingTop: spacing.lg + insets.top }}>
      <Animated.View
        style={{
          opacity: headerEnter,
          transform: [
            { translateY: headerEnter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          ],
        }}
      >
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
            LoopTidy stores everything on your iPhone. Appearance works today; account features
            are on the way.
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
          <Text style={[styles.appearanceHint, { color: theme.colors.textMuted }]}>
            Appearance: {appearanceLabel}
          </Text>
        </View>
      </Animated.View>

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Account</Text>
      <View style={[styles.accountCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.accountCardTitle, { color: theme.colors.text }]}>Sign in</Text>
        <Text style={[styles.accountCardSubtitle, { color: theme.colors.textSecondary }]}>
          Sync your loops across devices.
        </Text>
        <View style={styles.accountCardActions}>
          <Pressable style={[styles.accountBtnPrimary, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.accountBtnPrimaryText}>Sign in</Text>
          </Pressable>
          <Pressable style={[styles.accountBtnSecondary, { borderColor: theme.colors.border }]}>
            <Text style={[styles.accountBtnSecondaryText, { color: theme.colors.text }]}>Create account</Text>
          </Pressable>
        </View>
        <Text style={[styles.accountCardFooter, { color: theme.colors.textMuted }]}>
          All data is securely stored locally on this device. Cloud syncing is disabled by default for privacy.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Preferences</Text>
      <SettingsRow
        icon={settingsIcons.notifications}
        title="Notifications"
        subtitle="Reminders are set per loop in loop detail."
        right={{ type: 'none' }}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Data</Text>
      <SettingsRow
        icon={settingsIcons.backup}
        title="Backup & Restore"
        subtitle="Export JSON/CSV and restore on this device"
        onPress={() => router.push('/backup-restore')}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>About</Text>
      <SettingsRow
        icon={settingsIcons.about}
        title="About LoopTidy"
        subtitle="Product overview and story"
        onPress={() => router.push('/marketing')}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Danger Zone</Text>
      <SettingsRow
        icon={settingsIcons.danger}
        title="Delete all local data"
        subtitle="Manage in Backup & Restore danger zone"
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
  appearanceHint: {
    ...typography.caption,
    marginTop: spacing.sm,
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
    marginBottom: spacing.md,
  },
  accountCardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  accountBtnPrimary: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  accountBtnPrimaryText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  accountBtnSecondary: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  accountBtnSecondaryText: {
    ...typography.callout,
    fontWeight: '700',
  },
  accountCardFooter: {
    ...typography.caption,
  },
  footerText: {
    ...typography.caption,
    paddingHorizontal: spacing.sm,
  },
});
