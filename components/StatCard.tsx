import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../lib/theme';

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, color = colors.primary, onPress }: StatCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  pressed: {
    opacity: 0.7,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
