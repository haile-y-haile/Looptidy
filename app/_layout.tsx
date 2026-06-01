import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashGate } from '../components/SplashGate';
import { FontProvider } from '../context/FontContext';
import { LoopProvider } from '../context/LoopContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function RootStack() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
          contentStyle: { backgroundColor: theme.colors.background },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="marketing" options={{ headerShown: false }} />
        <Stack.Screen name="weekly-review" options={{ title: 'Weekly Review' }} />
        <Stack.Screen name="insights" options={{ title: 'Insights' }} />
        <Stack.Screen name="people" options={{ headerShown: false }} />
        <Stack.Screen name="decision-detail" options={{ title: 'Decision' }} />
        <Stack.Screen name="backup-restore" options={{ title: 'Backup & Restore' }} />
        <Stack.Screen name="waiting" options={{ headerShown: false }} />
        <Stack.Screen name="promised" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FontProvider>
          <LoopProvider>
            <SplashGate>
              <RootStack />
            </SplashGate>
          </LoopProvider>
        </FontProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
