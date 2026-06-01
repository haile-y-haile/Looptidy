import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
        <Stack.Screen name="index" options={{ title: 'Today' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="loops" options={{ headerShown: false }} />
        <Stack.Screen name="waiting" options={{ title: 'Waiting On Others' }} />
        <Stack.Screen name="promised" options={{ title: 'Promised by Me' }} />
        <Stack.Screen name="decisions" options={{ title: 'Decision Log' }} />
        <Stack.Screen name="weekly-review" options={{ title: 'Weekly Review' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LoopProvider>
          <RootStack />
        </LoopProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
