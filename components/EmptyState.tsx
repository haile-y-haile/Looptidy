import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppIcon, type AppIconName } from './AppIcon';
import { LoopIllustration } from './LoopIllustration';
import { spacing, typography } from '../lib/theme';
import { emptyStateIcons } from '../lib/icons';

interface EmptyStateProps {
  icon?: AppIconName;
  title: string;
  message: string;
  compact?: boolean;
  illustration?: boolean;
}

export function EmptyState({
  icon = emptyStateIcons.default,
  title,
  message,
  compact = false,
  illustration = false,
}: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        compact && { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {!compact ? (
        <View style={styles.iconWrap}>
          {illustration ? (
            <LoopIllustration size={108} />
          ) : (
            <AppIcon name={icon} size={28} variant="circle" tone="primary" />
          )}
        </View>
      ) : null}
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
    paddingVertical: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xxl,
  },
  compact: {
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconWrap: {
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
    maxWidth: 320,
  },
  compactMessage: {
    textAlign: 'left',
    maxWidth: undefined,
  },
});
