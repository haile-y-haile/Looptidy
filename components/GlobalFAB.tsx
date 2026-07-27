import { StyleSheet, Pressable } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { useSpotlight } from '../context/SpotlightContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../lib/haptics';

/** Hide search FAB on screens that already have bottom actions or dense chrome. */
function shouldHideFab(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.includes('/loops/') ||
    pathname.includes('/new') ||
    pathname.includes('/decision-') ||
    pathname.includes('/backup-restore') ||
    pathname.includes('/weekly-review')
  );
}

export function GlobalFAB() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { openSpotlight } = useSpotlight();

  if (shouldHideFab(pathname)) {
    return null;
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          bottom: 100 + insets.bottom,
          shadowOpacity: theme.isDark ? 0.28 : 0.14,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => {
        void hapticLight();
        openSpotlight();
      }}
      accessibilityLabel="Search"
    >
      <AppIcon name="search" size={24} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
});
