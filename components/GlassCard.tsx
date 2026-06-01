import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../lib/theme';

/**
 * Frosted glass surface (real blur). Use sparingly for performance.
 * Falls back to solid surface for Android/web where blur may vary.
 */
export function GlassCard({
  children,
  style,
  intensity = 40,
  tint,
  contentPadding = spacing.xxl,
  ...props
}: ViewProps & {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  contentPadding?: number;
}) {
  const { theme } = useTheme();
  const resolvedTint = tint ?? (theme.isDark ? 'dark' : 'light');

  return (
    <View
      {...props}
      style={[
        styles.wrap,
        {
          borderColor: theme.colors.overlay,
        },
        style,
      ]}
    >
      <BlurView intensity={intensity} tint={resolvedTint} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.00)']
            : ['rgba(255,255,255,0.70)', 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0.10)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, { padding: contentPadding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    padding: spacing.xxl,
  },
});

