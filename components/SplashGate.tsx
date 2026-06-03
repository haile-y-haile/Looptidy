import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { useFontsLoaded } from '../context/FontContext';
import { getOnboardingComplete } from '../lib/preferences';

SplashScreen.preventAutoHideAsync().catch(() => {});

export function SplashGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading } = useLoops();
  const { hydrationDone } = useTheme();
  const fontsLoaded = useFontsLoaded();
  const [nativeHidden, setNativeHidden] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const appReady = !loading && hydrationDone && fontsLoaded;

  useEffect(() => {
    if (!appReady || nativeHidden) return;
    SplashScreen.hideAsync()
      .then(() => setNativeHidden(true))
      .catch(() => setNativeHidden(true));
  }, [appReady, nativeHidden]);

  /** Route to onboarding early without blocking app rendering. */
  useEffect(() => {
    if (!appReady || onboardingChecked) return;
    let cancelled = false;
    void (async () => {
      try {
        const onboardingDone = await getOnboardingComplete();
        if (cancelled) return;
        if (!onboardingDone) {
          router.replace('/onboarding');
        }
      } catch {
        // Never block app rendering if onboarding preference read fails.
      } finally {
        if (!cancelled) setOnboardingChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appReady, onboardingChecked, router]);

  const showApp = appReady && nativeHidden;

  return (
    <View style={styles.root}>
      {showApp ? children : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
