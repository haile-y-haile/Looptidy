import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScreenScroll } from '../components/ScreenScroll';
import { SettingsRow } from '../components/SettingsRow';
import { useTheme } from '../context/ThemeContext';
import type { AppearanceMode } from '../lib/preferences';
import { radius, spacing, typography } from '../lib/theme';

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
    <ScreenScroll>
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
            Local-first preferences and placeholders for future account features.
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
      <SettingsRow icon="👤" title="Profile" subtitle="UI placeholder" onPress={() => {}} />
      <SettingsRow icon="🔐" title="Security" subtitle="UI placeholder" onPress={() => {}} />
      <SettingsRow icon="🕵️" title="Privacy" subtitle="UI placeholder" onPress={() => {}} />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Preferences</Text>
      <SettingsRow
        icon="🎨"
        title="Appearance"
        subtitle="Dark mode works locally"
        right={{ type: 'value', value: appearanceLabel }}
        onPress={() => {}}
      />
      <SettingsRow icon="🌐" title="Language" subtitle="UI placeholder" onPress={() => {}} />
      <SettingsRow icon="♿" title="Accessibility" subtitle="UI placeholder" onPress={() => {}} />
      <SettingsRow icon="🔔" title="Notifications" subtitle="No push notifications in MVP" onPress={() => {}} />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Data</Text>
      <SettingsRow icon="💾" title="Backup & Restore" subtitle="UI placeholder" onPress={() => {}} />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Help</Text>
      <SettingsRow icon="📄" title="Legal" subtitle="Privacy policy and terms (placeholder)" onPress={() => {}} />
      <SettingsRow icon="💬" title="Support" subtitle="Contact and help (placeholder)" onPress={() => {}} />

      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Danger Zone</Text>
      <SettingsRow
        icon="⚠️"
        title="Delete Account"
        subtitle="UI-only placeholder (no account system yet)"
        tone="danger"
        onPress={() => {}}
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
});

