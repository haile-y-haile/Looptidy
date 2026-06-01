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

export interface Decision {
  id: string;
  question: string;
  outcome: string;
  decidedAt: string;
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
  url?: string; // for links
  uri?: string; // for local files/media (future)
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
  reminder?: Reminder;
  attachments: LoopAttachment[];
  decisions: Decision[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  loopsClosed: number;
  loopsOpened: number;
  notes: string;
  completedAt?: string;
}
