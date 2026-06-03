import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedbackProvider } from '../context/FeedbackContext';
import { SplashGate } from '../components/SplashGate';
import { FontProvider } from '../context/FontContext';
import { LoopProvider } from '../context/LoopContext';
import { ScopeProvider } from '../context/ScopeContext';
import { SpotlightProvider } from '../context/SpotlightContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { NotificationsHandler } from '../components/NotificationsHandler';

function RootStack() {
  const { theme } = useTheme();
  return (
    <SplashGate>
      <BottomSheetModalProvider>
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
        <Stack.Screen name="decision-speed" options={{ title: 'Decision Speed' }} />
        <Stack.Screen name="ownership" options={{ title: 'Ownership' }} />
        <Stack.Screen name="scope-guard" options={{ title: 'Scope Guard' }} />
        <Stack.Screen name="feedback" options={{ title: 'Feedback' }} />
        <Stack.Screen name="waiting" options={{ headerShown: false }} />
        <Stack.Screen name="promised" options={{ headerShown: false }} />
        </Stack>
      </BottomSheetModalProvider>
    </SplashGate>
  );
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function authenticate() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock LoopTidy',
          fallbackLabel: 'Use Passcode',
        });
        if (result.success) {
          setIsAuthenticated(true);
        }
      } else {
        // If device has no biometrics, just let them in
        setIsAuthenticated(true);
      }
    }
    void authenticate();
  }, []);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B1220', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FontProvider>
            <LoopProvider>
              <NotificationsHandler />
              <ScopeProvider>
                <FeedbackProvider>
                  <SpotlightProvider>
                    <RootStack />
                  </SpotlightProvider>
                </FeedbackProvider>
              </ScopeProvider>
            </LoopProvider>
          </FontProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
