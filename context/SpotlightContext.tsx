import React, { createContext, useContext, useState, useMemo } from 'react';
import { SpotlightSearch } from '../components/SpotlightSearch';

interface SpotlightContextValue {
  openSpotlight: () => void;
  closeSpotlight: () => void;
}

const SpotlightContext = createContext<SpotlightContextValue | null>(null);

export function useSpotlight() {
  const ctx = useContext(SpotlightContext);
  if (!ctx) throw new Error('useSpotlight must be used within SpotlightProvider');
  return ctx;
}

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const value = useMemo(
    () => ({
      openSpotlight: () => setVisible(true),
      closeSpotlight: () => setVisible(false),
    }),
    []
  );

  return (
    <SpotlightContext.Provider value={value}>
      {children}
      <SpotlightSearch visible={visible} onClose={() => setVisible(false)} />
    </SpotlightContext.Provider>
  );
}
