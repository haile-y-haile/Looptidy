import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

type RightAccessory =
  | { type: 'chevron' }
  | { type: 'value'; value: string }
  | { type: 'switch'; value: boolean; onChange: (next: boolean) => void }
  | { type: 'none' };

interface SettingsRowProps {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: RightAccessory;
  tone?: 'default' | 'danger';
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  right = { type: 'chevron' },
  tone = 'default',
}: SettingsRowProps) {
  const { theme } = useTheme();
  const isDanger = tone === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
        {icon ? <Text style={[styles.icon, { color: theme.colors.textMuted }]}>{icon}</Text> : null}
        <View style={styles.texts}>
          <Text
            style={[
              styles.title,
              { color: isDanger ? theme.colors.danger : theme.colors.text },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {right.type === 'value' ? (
          <Text style={[styles.value, { color: theme.colors.textMuted }]}>{right.value}</Text>
        ) : null}
        {right.type === 'switch' ? (
          <Switch
            value={right.value}
            onValueChange={right.onChange}
            trackColor={{ false: theme.colors.borderLight, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        ) : null}
        {right.type === 'chevron' ? (
          <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>›</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  icon: {
    width: 22,
    textAlign: 'center',
    fontSize: 16,
  },
  texts: {
    flex: 1,
  },
  title: {
    ...typography.callout,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    ...typography.caption,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    marginTop: -1,
  },
});

