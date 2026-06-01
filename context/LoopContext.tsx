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

  const persistLoops = useCallback(async (getNext: (prev: OpenLoop[]) => OpenLoop[]) => {
    let next: OpenLoop[] = [];
    setLoops((prev) => {
      next = getNext(prev);
      return next;
    });
    await saveLoops(next);
  }, []);

  const refreshLoops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoops();
      setLoops(data);
    } catch (error) {
      console.error('Failed to refresh loops:', error);
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
        attachments: input.attachments ?? [],
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

      await persistLoops((prev) => [newLoop, ...prev]);
    },
    [persistLoops]
  );

  const updateLoop = useCallback(
    async (id: string, updates: Partial<OpenLoop>) => {
      const now = new Date().toISOString();
      await persistLoops((prev) =>
        prev.map((loop) =>
          loop.id === id ? { ...loop, ...updates, updatedAt: now } : loop
        )
      );
    },
    [persistLoops]
  );

  const closeLoop = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      await persistLoops((prev) =>
        prev.map((loop) =>
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
        )
      );
    },
    [persistLoops]
  );

  const addDecision = useCallback(
    async (loopId: string, decision: Omit<Decision, 'id'>) => {
      const now = new Date().toISOString();
      await persistLoops((prev) =>
        prev.map((loop) => {
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
        })
      );
    },
    [persistLoops]
  );

  const addTimelineEvent = useCallback(
    async (loopId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
      const now = new Date().toISOString();
      await persistLoops((prev) =>
        prev.map((loop) =>
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
        )
      );
    },
    [persistLoops]
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
