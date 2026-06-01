import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

export function TabBarBackground() {
  const { theme } = useTheme();

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <BlurView
      intensity={72}
      tint={theme.isDark ? 'dark' : 'light'}
      style={StyleSheet.absoluteFill}
    />
  );
}
