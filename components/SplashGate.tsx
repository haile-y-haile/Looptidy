import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';
import { useFontsLoaded } from '../context/FontContext';
import { BrandSplash } from './BrandSplash';

SplashScreen.preventAutoHideAsync().catch(() => {});

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { loading } = useLoops();
  const { hydrationDone } = useTheme();
  const fontsLoaded = useFontsLoaded();
  const [nativeHidden, setNativeHidden] = useState(false);
  const [brandDone, setBrandDone] = useState(false);

  const appReady = !loading && hydrationDone && fontsLoaded;

  useEffect(() => {
    if (!appReady || nativeHidden) return;
    SplashScreen.hideAsync()
      .then(() => setNativeHidden(true))
      .catch(() => setNativeHidden(true));
  }, [appReady, nativeHidden]);

  const showBrand = appReady && nativeHidden && !brandDone;

  return (
    <View style={styles.root}>
      {appReady && brandDone ? children : null}
      <BrandSplash visible={showBrand} onFinish={() => setBrandDone(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
