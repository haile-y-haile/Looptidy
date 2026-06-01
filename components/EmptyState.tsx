import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../lib/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  compact?: boolean;
}

export function EmptyState({ icon = '◌', title, message, compact = false }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        compact && { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {!compact ? <Text style={[styles.icon, { color: theme.colors.textMuted }]}>{icon}</Text> : null}
      <Text style={[styles.title, { color: theme.colors.text }, compact && styles.compactTitle]}>
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          { color: theme.colors.textSecondary },
          compact && styles.compactMessage,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xxl,
  },
  compact: {
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  compactTitle: {
    textAlign: 'left',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
  },
  compactMessage: {
    textAlign: 'left',
  },
});
