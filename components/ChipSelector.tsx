import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

export function ChipSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  formatLabel = (v) => v.charAt(0).toUpperCase() + v.slice(1),
  toneForValue,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  formatLabel?: (value: T) => string;
  toneForValue?: (value: T) => string | undefined;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = value === opt;
          const tone = toneForValue?.(opt) ?? theme.colors.primary;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? `${tone}1A` : theme.colors.surface,
                  borderColor: selected ? `${tone}66` : theme.colors.border,
                },
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? tone : theme.colors.textSecondary },
                ]}
              >
                {formatLabel(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
  },
  label: {
    ...typography.callout,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '800',
  },
});
