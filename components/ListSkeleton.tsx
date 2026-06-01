import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../lib/theme';

function SkeletonBar({ width, height = 14 }: { width: number | `${number}%`; height?: number }) {
  const { theme } = useTheme();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        style,
        {
          width,
          height,
          backgroundColor: theme.colors.surface2,
        },
      ]}
    />
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  const { theme } = useTheme();

  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <SkeletonBar width="35%" height={10} />
          <SkeletonBar width="85%" height={16} />
          <SkeletonBar width="55%" height={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bar: {
    borderRadius: radius.sm,
  },
});
