import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { BrandFlash } from './BrandFlash';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { useFontsLoaded } from '../context/FontContext';
import { getOnboardingComplete } from '../lib/preferences';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: false, duration: 0 });

const FONT_LOAD_TIMEOUT_MS = 5000;

export function SplashGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading } = useLoops();
  const { hydrationDone, theme } = useTheme();
  const fontsLoaded = useFontsLoaded();
  const [nativeHidden, setNativeHidden] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [fontTimedOut, setFontTimedOut] = useState(false);
  const [brandDone, setBrandDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const dataReady = !loading && hydrationDone && (fontsLoaded || fontTimedOut);

  /** Resolve first-launch route while the stack stays mounted under the brand flash. */
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

  /** Hide the native Sample A splash as soon as BrandFlash paints (same art → seamless). */
  const hideNativeSplash = useCallback(() => {
    if (nativeHidden) return;
    SplashScreen.hideAsync()
      .then(() => setNativeHidden(true))
      .catch(() => setNativeHidden(true));
  }, [nativeHidden]);

  useEffect(() => {
    if (nativeHidden) return;
    const safety = setTimeout(hideNativeSplash, 1200);
    return () => clearTimeout(safety);
  }, [hideNativeSplash, nativeHidden]);

  const onBrandDone = useCallback(() => setBrandDone(true), []);

  const showBrandFlash = !brandDone;
  const brandReady = appReady && nativeHidden;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {dataReady ? children : null}
      {showBrandFlash ? (
        <BrandFlash ready={brandReady} onDone={onBrandDone} onReady={hideNativeSplash} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
