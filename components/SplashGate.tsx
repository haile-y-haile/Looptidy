import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { BrandFlash } from './BrandFlash';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { useFontsLoaded } from '../context/FontContext';
import {
  getOnboardingComplete,
  getPreferenceCache,
  hydratePreferenceCache,
} from '../lib/preferences';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: false, duration: 0 });

const FONT_LOAD_TIMEOUT_MS = 5000;
/** Absolute ceiling: mount the app even if a data gate never resolves. */
const LAUNCH_TIMEOUT_MS = 8000;

export function SplashGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading } = useLoops();
  const { hydrationDone, theme } = useTheme();
  const fontsLoaded = useFontsLoaded();
  const [nativeHidden, setNativeHidden] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [fontTimedOut, setFontTimedOut] = useState(false);
  const [brandDone, setBrandDone] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);
  const [launchTimedOut, setLaunchTimedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void hydratePreferenceCache()
      .then(() => {
        if (!cancelled) setPrefsReady(true);
      })
      .catch(() => {
        if (!cancelled) setPrefsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLaunchTimedOut(true), LAUNCH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const gatesReady = prefsReady && !loading && hydrationDone && (fontsLoaded || fontTimedOut);
  const dataReady = gatesReady || launchTimedOut;

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

  const reduceMotion = prefsReady && getPreferenceCache().reduceMotion;
  const showBrandFlash = !brandDone && !reduceMotion;
  const brandReady = appReady && nativeHidden;

  useEffect(() => {
    if (!reduceMotion || brandDone) return;
    hideNativeSplash();
    setBrandDone(true);
  }, [reduceMotion, brandDone, hideNativeSplash]);

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
