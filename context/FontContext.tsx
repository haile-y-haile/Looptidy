import React, { createContext, useContext } from 'react';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

interface FontContextValue {
  fontsLoaded: boolean;
}

const FontContext = createContext<FontContextValue | null>(null);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  return (
    <FontContext.Provider value={{ fontsLoaded: fontsLoaded ?? false }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFontsLoaded(): boolean {
  const value = useContext(FontContext);
  if (!value) throw new Error('useFontsLoaded must be used within FontProvider');
  return value.fontsLoaded;
}
