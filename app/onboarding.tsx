import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { TAGLINE } from '../lib/fonts';
import { getOnboardingComplete, setOnboardingComplete } from '../lib/preferences';
import { radius, spacing, typography } from '../lib/theme';

const LOGO_GRADIENT = {
  start: '#1DD4FE',
  mid: '#2FBFFB',
  end: '#6782F7',
} as const;

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
          <Text style={styles.wordmark} accessibilityRole="header">
            <Text style={[styles.wordmarkLoop, { color: LOGO_GRADIENT.start }]}>Loop</Text>
            <Text style={[styles.wordmarkTidy, { color: LOGO_GRADIENT.end }]}>Tidy</Text>
          </Text>
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
              Track follow-ups, blockers, commitments, and decisions — all on this device.
            </Text>

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
  wordmark: {
    ...typography.largeTitle,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -1.1,
  },
  wordmarkLoop: {},
  wordmarkTidy: {},
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
});
