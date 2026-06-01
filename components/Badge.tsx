import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../lib/theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, color, backgroundColor, variant = 'default', style }: BadgeProps) {
  const { theme } = useTheme();
  const variantStyle: { bg: string; text: string } = (() => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primaryLight, text: theme.colors.primary };
      case 'success':
        return { bg: theme.colors.successLight, text: theme.colors.success };
      case 'warning':
        return { bg: theme.colors.warningLight, text: theme.colors.warning };
      case 'danger':
        return { bg: theme.colors.dangerLight, text: theme.colors.danger };
      case 'purple':
        return { bg: theme.colors.purpleLight, text: theme.colors.purple };
      case 'default':
      default:
        return { bg: theme.colors.borderLight, text: theme.colors.textSecondary };
    }
  })();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: backgroundColor ?? variantStyle.bg,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: color ?? variantStyle.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
