import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useLoops } from '../context/LoopContext';
import { useTheme } from '../context/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { loading } = useLoops();
  const { hydrationDone } = useTheme();

  useEffect(() => {
    if (!loading && hydrationDone) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading, hydrationDone]);

  return children;
}
