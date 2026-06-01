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

export type AccountabilityStatus =
  | 'clear'
  | 'unclear'
  | 'waiting_on_owner'
  | 'needs_follow_up'
  | 'escalated'
  | 'resolved';

export type EscalationLevel =
  | 'none'
  | 'soft_follow_up'
  | 'firm_follow_up'
  | 'escalation_needed'
  | 'escalated';

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
  | 'recommended'
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
  tradeoffs?: string;
  recommendedOption?: string;
  finalDecision?: string;
  rationale?: string;
  impact?: string;
  riskLevel: RiskLevel;
  decisionDeadline?: string;
  revisitAt?: string;
  nextAction?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
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
  accountableOwner?: Person;
  nextActionOwner?: Person;
  nextCheckInAt?: string;
  lastFollowUpAt?: string;
  accountabilityStatus?: AccountabilityStatus;
  escalationLevel?: EscalationLevel;
  accountabilityNotes?: string;
  dueDate?: string;
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

export type ScopeChangeType =
  | 'new_request'
  | 'requirement_change'
  | 'timeline_change'
  | 'priority_change'
  | 'resource_change'
  | 'decision_change'
  | 'blocker_added'
  | 'other';

export type ScopeChangeStatus =
  | 'captured'
  | 'under_review'
  | 'accepted'
  | 'parked'
  | 'rejected'
  | 'converted_to_loop'
  | 'resolved';

export type ImpactLevel = 'none' | 'low' | 'medium' | 'high';

export interface ScopeChange {
  id: string;
  loopId?: string;
  title: string;
  description: string;
  requestedBy?: string;
  owner?: string;
  source?: string;
  changeType: ScopeChangeType;
  status: ScopeChangeStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  impact: ImpactLevel;
  effort?: string;
  deadlineImpact?: string;
  costImpact?: string;
  reason?: string;
  decision?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type FeedbackSource =
  | 'customer'
  | 'stakeholder'
  | 'teammate'
  | 'manager'
  | 'vendor'
  | 'user_research'
  | 'meeting'
  | 'support'
  | 'personal_observation'
  | 'other';

export type FeedbackStatus =
  | 'captured'
  | 'triaged'
  | 'linked_to_loop'
  | 'linked_to_decision'
  | 'converted_to_loop'
  | 'converted_to_decision'
  | 'archived';

export type FeedbackSentiment = 'positive' | 'neutral' | 'negative' | 'mixed';

export type FeedbackUrgency = 'low' | 'medium' | 'high' | 'urgent';

export interface FeedbackItem {
  id: string;
  title: string;
  summary: string;
  source: FeedbackSource;
  sourcePerson?: string;
  category?: string;
  sentiment: FeedbackSentiment;
  urgency: FeedbackUrgency;
  status: FeedbackStatus;
  linkedLoopIds: string[];
  linkedDecisionIds: string[];
  tags: string[];
  theme?: string;
  suggestedAction?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface WeeklyReview {
  id: string;
  startedAt: string;
  completedAt?: string;
  reviewedLoopIds: string[];
  closedLoopIds: string[];
  notes: string;
  createdAt: string;
  weekStart?: string;
  weekEnd?: string;
  loopsClosed?: number;
  loopsOpened?: number;
}

export const BACKUP_FORMAT_VERSION = 3;

export interface LoopTidyBackup {
  version: number;
  exportedAt: string;
  loops: OpenLoop[];
  weeklyReviews: WeeklyReview[];
  scopeChanges?: ScopeChange[];
  feedbackItems?: FeedbackItem[];
}
