import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { useFontsLoaded } from '../context/FontContext';
import { getOnboardingComplete } from '../lib/preferences';

SplashScreen.preventAutoHideAsync().catch(() => {});

const FONT_LOAD_TIMEOUT_MS = 5000;

export function SplashGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading } = useLoops();
  const { hydrationDone, theme } = useTheme();
  const fontsLoaded = useFontsLoaded();
  const [nativeHidden, setNativeHidden] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [fontTimedOut, setFontTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const dataReady = !loading && hydrationDone && (fontsLoaded || fontTimedOut);

  /** Resolve first-launch route while the stack stays mounted under an overlay. */
  useEffect(() => {
    if (!dataReady || routeReady) return;
    let cancelled = false;
    void (async () => {
      try {
        const onboardingDone = await getOnboardingComplete();
        if (cancelled) return;
        if (!onboardingDone) {
          router.replace('/onboarding');
        }
      } catch {
        // Never block launch if preference read fails.
      } finally {
        if (!cancelled) setRouteReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dataReady, routeReady, router]);

  const appReady = dataReady && routeReady;

  useEffect(() => {
    if (!appReady || nativeHidden) return;
    SplashScreen.hideAsync()
      .then(() => setNativeHidden(true))
      .catch(() => setNativeHidden(true));
  }, [appReady, nativeHidden]);

  const showApp = appReady && nativeHidden;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {dataReady ? children : null}
      {!showApp ? (
        <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
