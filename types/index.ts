export type LoopType =
  | 'waiting_on_others'
  | 'promised_by_me'
  | 'decision_needed'
  | 'blocked'
  | 'follow_up'
  | 'due';

export type LoopStatus =
  | 'open'
  | 'waiting'
  | 'blocked'
  | 'decided'
  | 'closed'
  | 'archived';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export type Category =
  | 'work'
  | 'personal'
  | 'finance'
  | 'health'
  | 'home'
  | 'other';

export interface Person {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Reminder {
  id: string;
  date: string;
  note?: string;
  completed: boolean;
}

export type DecisionStatus =
  | 'decision_needed'
  | 'options_reviewed'
  | 'decided'
  | 'revisiting'
  | 'archived';

export interface DecisionOption {
  id: string;
  label: string;
  tradeoff?: string;
}

export interface Decision {
  id: string;
  loopId: string;
  title: string;
  summary?: string;
  status: DecisionStatus;
  owner?: string;
  options: DecisionOption[];
  finalDecision?: string;
  rationale?: string;
  impact?: string;
  riskLevel: RiskLevel;
  decidedAt?: string;
  revisitAt?: string;
  createdAt: string;
  updatedAt: string;
  /** @deprecated Legacy fields — migrated on load */
  question?: string;
  outcome?: string;
  decidedBy?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'status_change' | 'note' | 'decision' | 'closed';
  title: string;
  description?: string;
  timestamp: string;
}

export type AttachmentType = 'link' | 'document' | 'photo' | 'audio' | 'video';

export interface LoopAttachment {
  id: string;
  type: AttachmentType;
  title: string;
  url?: string;
  uri?: string;
  createdAt: string;
}

export interface OpenLoop {
  id: string;
  title: string;
  description: string;
  type: LoopType;
  status: LoopStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  category: Category;
  owner: Person;
  waitingOn?: Person;
  promisedTo?: Person;
  dueDate?: string;
  /** @deprecated Legacy shape; prefer reminderAt / reminderEnabled */
  reminder?: Reminder;
  reminderAt?: string;
  reminderLabel?: string;
  snoozedUntil?: string;
  reminderEnabled?: boolean;
  localNotificationId?: string;
  attachments: LoopAttachment[];
  decisions: Decision[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface WeeklyReview {
  id: string;
  startedAt: string;
  completedAt?: string;
  reviewedLoopIds: string[];
  closedLoopIds: string[];
  notes: string;
  createdAt: string;
  /** @deprecated Legacy weekly review fields */
  weekStart?: string;
  weekEnd?: string;
  loopsClosed?: number;
  loopsOpened?: number;
}

export const BACKUP_FORMAT_VERSION = 2;

export interface LoopTidyBackup {
  version: number;
  exportedAt: string;
  loops: OpenLoop[];
  weeklyReviews: WeeklyReview[];
}
