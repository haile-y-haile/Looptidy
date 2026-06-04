import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Pressable, Text, StyleSheet } from 'react-native';
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
import { LogoMark } from '../components/LogoMark';
import { getBiometricLockEnabled } from '../lib/preferences';
import { spacing, typography } from '../lib/theme';

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

type AuthState = 'checking' | 'locked' | 'authenticated';

function BiometricGate({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [authState, setAuthState] = useState<AuthState>('checking');

  const tryAuthenticate = useCallback(async () => {
    setAuthState('checking');
    try {
      const enabled = await getBiometricLockEnabled();
      if (!enabled) {
        setAuthState('authenticated');
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setAuthState('authenticated');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock LoopTidy',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });

      setAuthState(result.success ? 'authenticated' : 'locked');
    } catch {
      setAuthState('locked');
    }
  }, []);

  useEffect(() => {
    void tryAuthenticate();
  }, [tryAuthenticate]);

  if (authState === 'authenticated') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.lockScreen, { backgroundColor: theme.colors.background }]}>
      {authState === 'checking' ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <>
          <LogoMark size={96} />
          <Text style={[styles.lockTitle, { color: theme.colors.text }]}>LoopTidy is locked</Text>
          <Text style={[styles.lockSubtitle, { color: theme.colors.textSecondary }]}>
            Use Face ID or your device passcode to continue.
          </Text>
          <Pressable
            onPress={() => void tryAuthenticate()}
            style={({ pressed }) => [
              styles.unlockBtn,
              { backgroundColor: theme.colors.primary },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.unlockBtnText}>Unlock</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FontProvider>
            <BiometricGate>
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
            </BiometricGate>
          </FontProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  lockTitle: {
    ...typography.title,
    marginTop: spacing.lg,
  },
  lockSubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  unlockBtn: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    marginTop: spacing.sm,
  },
  unlockBtnText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
