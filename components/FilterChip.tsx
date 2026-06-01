import { Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

export function FilterChip({
  label,
  selected,
  onPress,
  tone = 'default',
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  tone?: 'default' | 'danger' | 'warning' | 'success';
}) {
  const { theme } = useTheme();

  const toneColor = (() => {
    switch (tone) {
      case 'danger':
        return theme.colors.danger;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? `${toneColor}1A` : theme.colors.surface,
          borderColor: selected ? `${toneColor}66` : theme.colors.border,
        },
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: selected ? toneColor : theme.colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  text: {
    ...typography.caption,
    fontWeight: '800',
  },
});

