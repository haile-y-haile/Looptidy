import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../lib/theme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} disabled={!onAction} hitSlop={8}>
          <Text
            style={[
              styles.action,
              { color: onAction ? theme.colors.primary : theme.colors.textMuted },
            ]}
          >
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  title: {
    ...typography.headline,
  },
  action: {
    ...typography.callout,
  },
});
