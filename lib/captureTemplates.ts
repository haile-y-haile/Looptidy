import type { Category, LoopStatus, LoopType, Priority, RiskLevel } from '../types';

export type CaptureTemplateId =
  | 'waiting_on_someone'
  | 'promise_i_made'
  | 'blocked_by_something'
  | 'decision_needed'
  | 'meeting_dump'
  | 'due_soon'
  | 'follow_up_later';

export interface CaptureTemplate {
  id: CaptureTemplateId;
  label: string;
  subtitle: string;
  type: LoopType;
  status: LoopStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  category: Category;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  personLabel: string;
}

export const CAPTURE_TEMPLATES: CaptureTemplate[] = [
  {
    id: 'waiting_on_someone',
    label: 'Waiting on someone',
    subtitle: 'Ball is in their court',
    type: 'waiting_on_others',
    status: 'waiting',
    priority: 'medium',
    riskLevel: 'low',
    category: 'work',
    titlePlaceholder: 'e.g. Waiting on Alex for signed contract',
    descriptionPlaceholder: 'What you need from them and when you last nudged…',
    personLabel: 'Waiting on',
  },
  {
    id: 'promise_i_made',
    label: 'Promise I made',
    subtitle: 'Commitment you own',
    type: 'promised_by_me',
    status: 'open',
    priority: 'high',
    riskLevel: 'medium',
    category: 'work',
    titlePlaceholder: 'e.g. Send revised deck to Jordan by Friday',
    descriptionPlaceholder: 'What you promised and any context they expect…',
    personLabel: 'Promised to',
  },
  {
    id: 'blocked_by_something',
    label: 'Blocked by something',
    subtitle: 'Cannot move until unblocked',
    type: 'blocked',
    status: 'blocked',
    priority: 'high',
    riskLevel: 'high',
    category: 'work',
    titlePlaceholder: 'e.g. Launch blocked until legal review',
    descriptionPlaceholder: 'What is blocking progress and who can unblock it…',
    personLabel: 'Blocked by / waiting on',
  },
  {
    id: 'decision_needed',
    label: 'Decision needed',
    subtitle: 'Unresolved choice',
    type: 'decision_needed',
    status: 'open',
    priority: 'medium',
    riskLevel: 'medium',
    category: 'work',
    titlePlaceholder: 'e.g. Choose vendor for Q3 tooling',
    descriptionPlaceholder: 'Options, stakes, and who needs to weigh in…',
    personLabel: 'Stakeholder (optional)',
  },
  {
    id: 'meeting_dump',
    label: 'Meeting dump',
    subtitle: 'Turn messy notes into loops',
    type: 'follow_up',
    status: 'open',
    priority: 'medium',
    riskLevel: 'low',
    category: 'work',
    titlePlaceholder: 'Paste meeting notes to extract action items',
    descriptionPlaceholder: 'Use Meeting Dump for bulk notes and suggested loops...',
    personLabel: 'Related person (optional)',
  },
  {
    id: 'due_soon',
    label: 'Due soon',
    subtitle: 'Time-sensitive follow-up',
    type: 'due',
    status: 'open',
    priority: 'urgent',
    riskLevel: 'medium',
    category: 'work',
    titlePlaceholder: 'e.g. Submit expense report before cutoff',
    descriptionPlaceholder: 'Deadline context and what “done” looks like…',
    personLabel: 'Related person (optional)',
  },
  {
    id: 'follow_up_later',
    label: 'Follow-up later',
    subtitle: 'Park without losing it',
    type: 'follow_up',
    status: 'open',
    priority: 'low',
    riskLevel: 'none',
    category: 'personal',
    titlePlaceholder: 'e.g. Check in with Sam about referral',
    descriptionPlaceholder: 'When to revisit and why it matters…',
    personLabel: 'Follow up with (optional)',
  },
];

export function getCaptureTemplate(id: string | undefined): CaptureTemplate | undefined {
  return CAPTURE_TEMPLATES.find((t) => t.id === id);
}

export const LOOP_TYPE_HELP: Record<LoopType, string> = {
  waiting_on_others: 'Someone else owes you a response, deliverable, or approval.',
  promised_by_me: 'You made a commitment — track it until it is closed.',
  decision_needed: 'A choice is unresolved; capture options and record the outcome later.',
  blocked: 'Progress is stuck until a dependency or blocker clears.',
  follow_up: 'A future nudge or check-in you do not want to forget.',
  due: 'A loop with a clear time boundary or deadline.',
};
