import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

export function ComingSoonBadge({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  compact: {
    marginBottom: 0,
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
