import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenCentered } from '../components/ScreenCentered';
import { useTheme } from '../context/ThemeContext';

/** Preserves legacy route; opens Loops tab with Promised filter. */
export default function PromisedRedirectScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    router.replace({ pathname: '/loops', params: { filter: 'promised' } });
  }, [router]);

  return (
    <ScreenCentered>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </ScreenCentered>
  );
}
