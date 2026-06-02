import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { TAGLINE } from '../lib/fonts';
import { getOnboardingComplete, setOnboardingComplete } from '../lib/preferences';
import { showComingSoon } from '../lib/comingSoon';
import { radius, spacing, typography } from '../lib/theme';

type AuthProvider = 'apple' | 'google' | 'email';

function AuthButton({
  label,
  provider,
  onPress,
}: {
  label: string;
  provider: AuthProvider;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  const icon = useMemo(() => {
    switch (provider) {
      case 'apple':
        return 'logo-apple' as const;
      case 'google':
        return 'logo-google' as const;
      case 'email':
        return 'mail-outline' as const;
    }
  }, [provider]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.authButton,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        styles.comingSoon,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={provider === 'apple' && theme.isDark ? '#FFFFFF' : theme.colors.text}
      />
      <Text style={[styles.authButtonText, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [hydrated, setHydrated] = useState(false);

  const heroEnter = useRef(new Animated.Value(0)).current;
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
    Animated.stagger(100, [
      Animated.timing(heroEnter, {
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
  }, [cardEnter, heroEnter, hydrated]);

  const continueToApp = async () => {
    await setOnboardingComplete(true);
    router.replace('/');
  };

  const placeholderSignIn = () => {
    showComingSoon('Sign-in is coming soon. Use Get started to use LoopTidy on this device.');
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
          style={[
            styles.hero,
            {
              opacity: heroEnter,
              transform: [
                { translateY: heroEnter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
              ],
            },
          ]}
        >
          <View style={styles.logoSlot}>
            <AnimatedLogo size={88} enableTapReplay enableIdle />
          </View>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>{TAGLINE}</Text>
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
              Your loops stay on this device. Sign in when accounts arrive — or get started now.
            </Text>

            <AuthButton label="Continue with Apple" provider="apple" onPress={placeholderSignIn} />
            <AuthButton label="Continue with Google" provider="google" onPress={placeholderSignIn} />
            <AuthButton label="Continue with Email" provider="email" onPress={placeholderSignIn} />

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
            </View>

            <PrimaryButton label="Get started" onPress={continueToApp} />
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
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  },
  logoSlot: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    ...typography.tagline,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xxl,
  },
  cardTitle: {
    ...typography.title,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  authButtonText: {
    ...typography.callout,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  comingSoon: {
    opacity: 0.72,
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
