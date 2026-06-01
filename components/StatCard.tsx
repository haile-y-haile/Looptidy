import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows, spacing, typography } from '../lib/theme';

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
  onPress?: () => void;
  /** Transparent styling for use inside GlassCard */
  embedded?: boolean;
}

export function StatCard({ label, value, color, onPress, embedded = false }: StatCardProps) {
  const { theme } = useTheme();
  const displayColor = color ?? theme.colors.primary;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        embedded
          ? styles.embedded
          : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.value, { color: displayColor }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  embedded: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    textAlign: 'center',
  },
});
