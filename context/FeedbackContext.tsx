import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { FeedbackItem } from '../types';
import { clearFeedbackItems, getFeedbackItems, saveFeedbackItems } from '../lib/feedbackStorage';
import { generateId } from '../lib/utils';

interface FeedbackContextValue {
  feedbackItems: FeedbackItem[];
  loading: boolean;
  addFeedback: (item: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'linkedLoopIds' | 'linkedDecisionIds' | 'tags'> & { linkedLoopIds?: string[]; linkedDecisionIds?: string[]; tags?: string[] }) => Promise<FeedbackItem>;
  updateFeedback: (id: string, updates: Partial<FeedbackItem>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  replaceAllFeedback: (items: FeedbackItem[]) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setFeedbackItems(await getFeedbackItems());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(async (getNext: (prev: FeedbackItem[]) => FeedbackItem[]) => {
    let next: FeedbackItem[] = [];
    setFeedbackItems((prev) => {
      next = getNext(prev);
      return next;
    });
    await saveFeedbackItems(next);
  }, []);

  const addFeedback = useCallback(
    async (
      input: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'linkedLoopIds' | 'linkedDecisionIds' | 'tags'> & {
        linkedLoopIds?: string[];
        linkedDecisionIds?: string[];
        tags?: string[];
      }
    ) => {
      const now = new Date().toISOString();
      const item: FeedbackItem = {
        ...input,
        id: generateId(),
        linkedLoopIds: input.linkedLoopIds ?? [],
        linkedDecisionIds: input.linkedDecisionIds ?? [],
        tags: input.tags ?? [],
        createdAt: now,
        updatedAt: now,
      };
      await persist((prev) => [item, ...prev]);
      return item;
    },
    [persist]
  );

  const updateFeedback = useCallback(
    async (id: string, updates: Partial<FeedbackItem>) => {
      const now = new Date().toISOString();
      await persist((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: now } : f))
      );
    },
    [persist]
  );

  const deleteFeedback = useCallback(
    async (id: string) => {
      await persist((prev) => prev.filter((f) => f.id !== id));
    },
    [persist]
  );

  const replaceAllFeedback = useCallback(
    async (items: FeedbackItem[]) => {
      await persist(() => items);
    },
    [persist]
  );

  const clearAll = useCallback(async () => {
    await clearFeedbackItems();
    setFeedbackItems([]);
  }, []);

  const value = useMemo(
    () => ({
      feedbackItems,
      loading,
      addFeedback,
      updateFeedback,
      deleteFeedback,
      replaceAllFeedback,
      clearAll,
      refresh,
    }),
    [
      feedbackItems,
      loading,
      addFeedback,
      updateFeedback,
      deleteFeedback,
      replaceAllFeedback,
      clearAll,
      refresh,
    ]
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback requires FeedbackProvider');
  return ctx;
}
