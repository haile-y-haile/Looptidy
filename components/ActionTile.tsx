import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from './GlassCard';
import { radius, spacing, typography } from '../lib/theme';

export function ActionTile({
  title,
  subtitle,
  icon,
  onPress,
  accent = 'primary',
  glass = true,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  accent?: 'primary' | 'purple' | 'warning' | 'success';
  glass?: boolean;
}) {
  const { theme } = useTheme();

  const accentColor = (() => {
    switch (accent) {
      case 'purple':
        return theme.colors.purple;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary2;
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.press, pressed && { transform: [{ scale: 0.99 }], opacity: 0.92 }]}
    >
      {glass ? (
        <GlassCard style={styles.card} intensity={32} contentPadding={spacing.lg}>
          <LinearGradient
            colors={[`${accentColor}26`, `${accentColor}0C`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </GlassCard>
      ) : (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <LinearGradient
            colors={[`${accentColor}22`, `${accentColor}08`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    flex: 1,
  },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 92,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.callout,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
});

