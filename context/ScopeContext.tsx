import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ScopeChange } from '../types';
import { clearScopeChanges, getScopeChanges, saveScopeChanges } from '../lib/scopeStorage';
import { generateId } from '../lib/utils';

interface ScopeContextValue {
  scopeChanges: ScopeChange[];
  loading: boolean;
  addScopeChange: (item: Omit<ScopeChange, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ScopeChange>;
  updateScopeChange: (id: string, updates: Partial<ScopeChange>) => Promise<void>;
  deleteScopeChange: (id: string) => Promise<void>;
  replaceAllScopeChanges: (items: ScopeChange[]) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ScopeContext = createContext<ScopeContextValue | null>(null);

export function ScopeProvider({ children }: { children: React.ReactNode }) {
  const [scopeChanges, setScopeChanges] = useState<ScopeChange[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setScopeChanges(await getScopeChanges());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(async (getNext: (prev: ScopeChange[]) => ScopeChange[]) => {
    let next: ScopeChange[] = [];
    setScopeChanges((prev) => {
      next = getNext(prev);
      return next;
    });
    await saveScopeChanges(next);
  }, []);

  const addScopeChange = useCallback(
    async (input: Omit<ScopeChange, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const item: ScopeChange = { ...input, id: generateId(), createdAt: now, updatedAt: now };
      await persist((prev) => [item, ...prev]);
      return item;
    },
    [persist]
  );

  const updateScopeChange = useCallback(
    async (id: string, updates: Partial<ScopeChange>) => {
      const now = new Date().toISOString();
      await persist((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s))
      );
    },
    [persist]
  );

  const deleteScopeChange = useCallback(
    async (id: string) => {
      await persist((prev) => prev.filter((s) => s.id !== id));
    },
    [persist]
  );

  const replaceAllScopeChanges = useCallback(
    async (items: ScopeChange[]) => {
      await persist(() => items);
    },
    [persist]
  );

  const clearAll = useCallback(async () => {
    await clearScopeChanges();
    setScopeChanges([]);
  }, []);

  const value = useMemo(
    () => ({
      scopeChanges,
      loading,
      addScopeChange,
      updateScopeChange,
      deleteScopeChange,
      replaceAllScopeChanges,
      clearAll,
      refresh,
    }),
    [
      scopeChanges,
      loading,
      addScopeChange,
      updateScopeChange,
      deleteScopeChange,
      replaceAllScopeChanges,
      clearAll,
      refresh,
    ]
  );

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScopeChanges(): ScopeContextValue {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error('useScopeChanges requires ScopeProvider');
  return ctx;
}
