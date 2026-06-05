import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Decision, LoopStatus, LoopType, OpenLoop, TimelineEvent } from '../types';
import { normalizeDecision } from '../lib/decisions';
import { clearAllLoops, getLoops, saveLoops, undoLastAction } from '../lib/storage';
import { generateId } from '../lib/utils';
import { cancelLoopReminder, scheduleLoopReminder } from '../lib/reminders';

export type CreateDecisionInput = Omit<
  Decision,
  'id' | 'loopId' | 'createdAt' | 'updatedAt' | 'options' | 'riskLevel' | 'title' | 'status'
> &
  Partial<Pick<Decision, 'options' | 'loopId' | 'riskLevel' | 'title' | 'status'>> & {
    title?: string;
    status?: Decision['status'];
    question?: string;
    outcome?: string;
    decidedBy?: string;
  };

function statusForType(type: LoopType): LoopStatus {
  if (type === 'blocked') return 'blocked';
  if (type === 'waiting_on_others') return 'waiting';
  return 'open';
}

function clearedReminderFields() {
  return {
    reminderEnabled: false,
    reminderAt: undefined,
    snoozedUntil: undefined,
    reminderLabel: undefined,
    localNotificationId: undefined,
  } as const;
}

interface LoopContextValue {
  loops: OpenLoop[];
  loading: boolean;
  loadError: string | null;
  addLoop: (
    loop: Omit<OpenLoop, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>
  ) => Promise<OpenLoop>;
  updateLoop: (id: string, updates: Partial<OpenLoop>) => Promise<void>;
  closeLoop: (id: string) => Promise<void>;
  archiveLoop: (id: string) => Promise<void>;
  reopenLoop: (id: string) => Promise<void>;
  deleteLoop: (id: string) => Promise<void>;
  addDecision: (loopId: string, decision: CreateDecisionInput) => Promise<void>;
  updateDecision: (
    loopId: string,
    decisionId: string,
    updates: Partial<Decision>
  ) => Promise<void>;
  addTimelineEvent: (
    loopId: string,
    event: Omit<TimelineEvent, 'id' | 'timestamp'>
  ) => Promise<void>;
  replaceAllLoops: (loops: OpenLoop[]) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  deleteAllLocalData: () => Promise<void>;
  refreshLoops: () => Promise<void>;
  undo: () => Promise<void>;
}

const LoopContext = createContext<LoopContextValue | null>(null);

function toCreateDecision(input: CreateDecisionInput, loopId: string): Decision {
  const now = new Date().toISOString();
  return normalizeDecision(
    {
      id: generateId(),
      loopId,
      title: input.title ?? input.question ?? 'Decision',
      summary: input.summary ?? input.question,
      status: input.status ?? (input.outcome || input.finalDecision ? 'decided' : 'decision_needed'),
      owner: input.owner ?? input.decidedBy,
      options: input.options ?? [],
      finalDecision: input.finalDecision ?? input.outcome,
      rationale: input.rationale ?? input.outcome,
      impact: input.impact,
      riskLevel: input.riskLevel ?? 'medium',
      decidedAt: input.decidedAt ?? (input.outcome ? now : undefined),
      revisitAt: input.revisitAt,
      createdAt: now,
      updatedAt: now,
    },
    loopId
  );
}

export function LoopProvider({ children }: { children: React.ReactNode }) {
  const [loops, setLoops] = useState<OpenLoop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      setLoadError(null);
    } catch (error) {
      console.error('Failed to refresh loops:', error);
      setLoops([]);
      setLoadError('Could not load your loops. Try again.');
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
        decisions: (input.decisions ?? []).map((d) =>
          normalizeDecision({ ...d, id: d.id || generateId() }, 'pending')
        ),
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
      newLoop.decisions = newLoop.decisions.map((d) =>
        normalizeDecision({ ...d, loopId: newLoop.id }, newLoop.id)
      );

      await persistLoops((prev) => [newLoop, ...prev]);
      return newLoop;
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
      const target = loops.find((l) => l.id === id);
      if (target) await cancelLoopReminder(target);

      await persistLoops((prev) =>
        prev.map((loop) =>
          loop.id === id
            ? {
                ...loop,
                status: 'closed' as const,
                closedAt: now,
                updatedAt: now,
                ...clearedReminderFields(),
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
    [loops, persistLoops]
  );

  const archiveLoop = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      const target = loops.find((l) => l.id === id);
      if (target) await cancelLoopReminder(target);

      await persistLoops((prev) =>
        prev.map((loop) =>
          loop.id === id
            ? {
                ...loop,
                status: 'archived' as const,
                closedAt: loop.closedAt ?? now,
                updatedAt: now,
                ...clearedReminderFields(),
                timeline: [
                  ...loop.timeline,
                  {
                    id: generateId(),
                    type: 'note' as const,
                    title: 'Loop archived',
                    timestamp: now,
                  },
                ],
              }
            : loop
        )
      );
    },
    [loops, persistLoops]
  );

  const reopenLoop = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      await persistLoops((prev) =>
        prev.map((loop) => {
          if (loop.id !== id) return loop;
          return {
            ...loop,
            status: statusForType(loop.type),
            closedAt: undefined,
            updatedAt: now,
            timeline: [
              ...loop.timeline,
              {
                id: generateId(),
                type: 'note' as const,
                title: 'Loop reopened',
                timestamp: now,
              },
            ],
          };
        })
      );
    },
    [persistLoops]
  );

  const deleteLoop = useCallback(
    async (id: string) => {
      const target = loops.find((l) => l.id === id);
      if (target) await cancelLoopReminder(target);
      await persistLoops((prev) => prev.filter((loop) => loop.id !== id));
    },
    [loops, persistLoops]
  );

  const addDecision = useCallback(
    async (loopId: string, input: CreateDecisionInput) => {
      const now = new Date().toISOString();
      const newDecision = toCreateDecision(input, loopId);
      await persistLoops((prev) =>
        prev.map((loop) => {
          if (loop.id !== loopId) return loop;
          const shouldMarkDecided =
            newDecision.status === 'decided' && loop.type === 'decision_needed';
          return {
            ...loop,
            status: shouldMarkDecided ? ('decided' as const) : loop.status,
            updatedAt: now,
            decisions: [...loop.decisions, newDecision],
            timeline: [
              ...loop.timeline,
              {
                id: generateId(),
                type: 'decision' as const,
                title: 'Decision recorded',
                description: newDecision.finalDecision ?? newDecision.title,
                timestamp: now,
              },
            ],
          };
        })
      );
    },
    [persistLoops]
  );

  const updateDecision = useCallback(
    async (loopId: string, decisionId: string, updates: Partial<Decision>) => {
      const now = new Date().toISOString();
      await persistLoops((prev) =>
        prev.map((loop) => {
          if (loop.id !== loopId) return loop;
          return {
            ...loop,
            updatedAt: now,
            decisions: loop.decisions.map((d) =>
              d.id === decisionId
                ? normalizeDecision(
                    { ...d, ...updates, id: d.id, updatedAt: now },
                    loopId
                  )
                : d
            ),
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

  const replaceAllLoops = useCallback(async (nextLoops: OpenLoop[]) => {
    const normalized = nextLoops.map((l) => ({
      ...l,
      decisions: l.decisions.map((d) => normalizeDecision({ ...d, id: d.id }, l.id)),
    }));
    await saveLoops(normalized);
    setLoops(normalized);
    setLoadError(null);
  }, []);

  const resetToDemoData = useCallback(async () => {
    const { resetLoops } = await import('../lib/storage');
    const seeded = await resetLoops();
    setLoops(seeded);
    setLoadError(null);
  }, []);

  const deleteAllLocalData = useCallback(async () => {
    await clearAllLoops();
    setLoops([]);
    setLoadError(null);
  }, []);

  const undo = useCallback(async () => {
    const previousState = await undoLastAction();
    if (previousState) {
      setLoops(previousState);
      setLoadError(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      loops,
      loading,
      loadError,
      addLoop,
      updateLoop,
      closeLoop,
      archiveLoop,
      reopenLoop,
      deleteLoop,
      addDecision,
      updateDecision,
      addTimelineEvent,
      replaceAllLoops,
      resetToDemoData,
      deleteAllLocalData,
      refreshLoops,
      undo,
    }),
    [
      loops,
      loading,
      loadError,
      addLoop,
      updateLoop,
      closeLoop,
      archiveLoop,
      reopenLoop,
      deleteLoop,
      addDecision,
      updateDecision,
      addTimelineEvent,
      replaceAllLoops,
      resetToDemoData,
      deleteAllLocalData,
      refreshLoops,
      undo,
    ]
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

export { statusForType };
