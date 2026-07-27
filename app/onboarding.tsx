import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLockup } from '../components/BrandLockup';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { getOnboardingComplete, setOnboardingComplete } from '../lib/preferences';
import { radius, spacing, typography } from '../lib/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [hydrated, setHydrated] = useState(false);

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
            ? ['rgba(13,148,136,0.32)', 'rgba(13,148,136,0.06)', 'rgba(11,18,32,0)']
            : ['rgba(13,148,136,0.2)', 'rgba(13,148,136,0.05)', 'rgba(246,248,251,0)']
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
        <View style={styles.hero}>
          <BrandLockup variant="full" logoSize={96} />
        </View>

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
