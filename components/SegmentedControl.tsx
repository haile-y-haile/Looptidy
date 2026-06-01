import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

export interface Segment<T extends string> {
  key: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  value,
  segments,
  onChange,
  glass = false,
}: {
  value: T;
  segments: Segment<T>[];
  onChange: (next: T) => void;
  glass?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: glass ? 'transparent' : theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {glass ? (
        <BlurView
          intensity={28}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
        />
      ) : null}
      {segments.map((s) => {
        const selected = s.key === value;
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? theme.colors.primary : theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    ...typography.caption,
    fontWeight: '800',
  },
});

