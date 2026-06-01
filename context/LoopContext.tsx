import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Decision, OpenLoop, TimelineEvent } from '../types';
import { getLoops, saveLoops } from '../lib/storage';
import { generateId } from '../lib/utils';

interface LoopContextValue {
  loops: OpenLoop[];
  loading: boolean;
  addLoop: (loop: Omit<OpenLoop, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => Promise<void>;
  updateLoop: (id: string, updates: Partial<OpenLoop>) => Promise<void>;
  closeLoop: (id: string) => Promise<void>;
  addDecision: (loopId: string, decision: Omit<Decision, 'id'>) => Promise<void>;
  addTimelineEvent: (
    loopId: string,
    event: Omit<TimelineEvent, 'id' | 'timestamp'>
  ) => Promise<void>;
  refreshLoops: () => Promise<void>;
}

const LoopContext = createContext<LoopContextValue | null>(null);

export function LoopProvider({ children }: { children: React.ReactNode }) {
  const [loops, setLoops] = useState<OpenLoop[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshLoops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoops();
      setLoops(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLoops();
  }, [refreshLoops]);

  const addLoop = useCallback(
    async (input: Omit<OpenLoop, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => {
      const now = new Date().toISOString();
      const newLoop: OpenLoop = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            id: generateId(),
            type: 'created',
            title: 'Loop created',
            timestamp: now,
          },
        ],
      };

      setLoops((prev) => {
        const updated = [newLoop, ...prev];
        void saveLoops(updated);
        return updated;
      });
    },
    []
  );

  const updateLoop = useCallback(async (id: string, updates: Partial<OpenLoop>) => {
    const now = new Date().toISOString();
    setLoops((prev) => {
      const updated = prev.map((loop) =>
        loop.id === id ? { ...loop, ...updates, updatedAt: now } : loop
      );
      void saveLoops(updated);
      return updated;
    });
  }, []);

  const closeLoop = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setLoops((prev) => {
      const updated = prev.map((loop) =>
        loop.id === id
          ? {
              ...loop,
              status: 'closed' as const,
              closedAt: now,
              updatedAt: now,
              timeline: [
                ...loop.timeline,
                {
                  id: generateId(),
                  type: 'closed' as const,
                  title: 'Loop closed',
                  timestamp: now,
                },
              ],
            }
          : loop
      );
      void saveLoops(updated);
      return updated;
    });
  }, []);

  const addDecision = useCallback(async (loopId: string, decision: Omit<Decision, 'id'>) => {
    const now = new Date().toISOString();
    setLoops((prev) => {
      const updated = prev.map((loop) => {
        if (loop.id !== loopId) return loop;
        const newDecision: Decision = { ...decision, id: generateId() };
        return {
          ...loop,
          status: 'decided' as const,
          updatedAt: now,
          decisions: [...loop.decisions, newDecision],
          timeline: [
            ...loop.timeline,
            {
              id: generateId(),
              type: 'decision' as const,
              title: 'Decision recorded',
              description: decision.outcome,
              timestamp: now,
            },
          ],
        };
      });
      void saveLoops(updated);
      return updated;
    });
  }, []);

  const addTimelineEvent = useCallback(
    async (loopId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
      const now = new Date().toISOString();
      setLoops((prev) => {
        const updated = prev.map((loop) =>
          loop.id === loopId
            ? {
                ...loop,
                updatedAt: now,
                timeline: [
                  ...loop.timeline,
                  { ...event, id: generateId(), timestamp: now },
                ],
              }
            : loop
        );
        void saveLoops(updated);
        return updated;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      loops,
      loading,
      addLoop,
      updateLoop,
      closeLoop,
      addDecision,
      addTimelineEvent,
      refreshLoops,
    }),
    [loops, loading, addLoop, updateLoop, closeLoop, addDecision, addTimelineEvent, refreshLoops]
  );

  return <LoopContext.Provider value={value}>{children}</LoopContext.Provider>;
}

export function useLoops(): LoopContextValue {
  const context = useContext(LoopContext);
  if (!context) {
    throw new Error('useLoops must be used within a LoopProvider');
  }
  return context;
}
