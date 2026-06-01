import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { getOnboardingComplete, setOnboardingComplete } from '../lib/preferences';
import { radius, spacing, typography } from '../lib/theme';

function AuthButton({
  label,
  tone = 'primary',
  onPress,
}: {
  label: string;
  tone?: 'primary' | 'secondary' | 'ghost';
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const style = useMemo(() => {
    switch (tone) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          text: theme.colors.text,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border,
          text: theme.colors.textSecondary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
          text: '#FFFFFF',
        };
    }
  }, [theme, tone]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.authButton,
        { backgroundColor: style.backgroundColor, borderColor: style.borderColor },
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}
    >
      <Text style={[styles.authButtonText, { color: style.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [hydrated, setHydrated] = useState(false);

  const logoEnter = useRef(new Animated.Value(0)).current;
  const cardEnter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const done = await getOnboardingComplete();
      if (cancelled) return;
      setHydrated(true);
      if (done) router.replace('/');
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    Animated.stagger(90, [
      Animated.timing(logoEnter, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardEnter, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardEnter, logoEnter]);

  const continueToApp = async () => {
    await setOnboardingComplete(true);
    router.replace('/');
  };

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(79,70,229,0.35)', 'rgba(37,99,235,0.05)', 'rgba(11,18,32,0)']
            : ['rgba(79,70,229,0.28)', 'rgba(37,99,235,0.06)', 'rgba(245,247,251,0)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={{
          opacity: logoEnter,
          transform: [
            { translateY: logoEnter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        }}
      >
        <View style={styles.brand}>
          <View
            style={[
              styles.logoDot,
              { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary },
            ]}
          />
          <Text style={[styles.brandTitle, { color: theme.colors.text }]}>LoopTidy</Text>
        </View>
        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
          Close open loops. Track follow-ups, promises, blockers, and decisions.
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: cardEnter,
          transform: [
            { translateY: cardEnter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          ],
        }}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Mock Login / Signup
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
            These buttons are placeholders for now. No real auth or backend is used.
          </Text>

          <AuthButton label="Continue with Apple" tone="secondary" onPress={continueToApp} />
          <AuthButton label="Continue with Google" tone="secondary" onPress={continueToApp} />
          <AuthButton label="Continue with Email" tone="secondary" onPress={continueToApp} />

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
          </View>

          <AuthButton label="Create a Loop" tone="primary" onPress={continueToApp} />
          <AuthButton label="Skip for now" tone="ghost" onPress={continueToApp} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  brandTitle: {
    ...typography.largeTitle,
  },
  tagline: {
    ...typography.body,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xxl,
  },
  cardTitle: {
    ...typography.title,
  },
  cardSubtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  authButton: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  authButtonText: {
    ...typography.callout,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  divider: {
    height: 1,
    flex: 1,
  },
  dividerText: {
    ...typography.caption,
    fontWeight: '700',
  },
});

