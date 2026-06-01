import { View, Text, StyleSheet, Pressable, Animated, Easing, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLockup } from '../components/BrandLockup';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { getOnboardingComplete, setOnboardingComplete } from '../lib/preferences';
import { radius, spacing, typography } from '../lib/theme';

function AuthButton({
  label,
  tone = 'primary',
  onPress,
  disabled = false,
}: {
  label: string;
  tone?: 'primary' | 'secondary' | 'ghost';
  onPress: () => void;
  disabled?: boolean;
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
      disabled={disabled}
      style={({ pressed }) => [
        styles.authButton,
        { backgroundColor: style.backgroundColor, borderColor: style.borderColor },
        disabled && styles.disabled,
        !disabled && pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
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
    if (!hydrated) return;
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
  }, [cardEnter, hydrated, logoEnter]);

  const continueToApp = async () => {
    await setOnboardingComplete(true);
    router.replace('/');
  };

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(13,148,136,0.32)', 'rgba(99,102,241,0.08)', 'rgba(11,18,32,0)']
            : ['rgba(13,148,136,0.2)', 'rgba(99,102,241,0.06)', 'rgba(246,248,251,0)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: logoEnter,
            transform: [
              { translateY: logoEnter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          }}
        >
          <BrandLockup variant="full" logoSize={88} animate />
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
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Welcome</Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              Your data stays on this device. Sign-in options are coming soon — for now, jump
              straight in.
            </Text>

            <PrimaryButton label="Get started" onPress={continueToApp} style={{ marginBottom: spacing.sm }} />

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>sign-in coming soon</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
            </View>

            <AuthButton label="Continue with Apple" tone="secondary" disabled onPress={continueToApp} />
            <AuthButton label="Continue with Google" tone="secondary" disabled onPress={continueToApp} />
            <AuthButton label="Continue with Email" tone="secondary" disabled onPress={continueToApp} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
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
  disabled: {
    opacity: 0.45,
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
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
