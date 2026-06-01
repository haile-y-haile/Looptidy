import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { motion } from '../lib/motion';
import { radius, spacing, typography } from '../lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'primary' | 'danger' | 'secondary';
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  tone = 'primary',
  style,
}: PrimaryButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg =
    tone === 'danger'
      ? theme.colors.danger
      : tone === 'secondary'
        ? theme.colors.surface
        : theme.colors.primary;
  const border =
    tone === 'secondary' ? theme.colors.border : bg;
  const textColor = tone === 'secondary' ? theme.colors.text : '#FFFFFF';

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: motion.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.fast });
      }}
      style={[
        styles.button,
        animatedStyle,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled || loading ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.callout,
  },
});
