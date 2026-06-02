import type { Category, LoopType, OpenLoop, Priority, RiskLevel } from '../types';
import { personFromName } from './accountability';

export type MeetingTemplate =
  | 'team_meeting'
  | 'client_call'
  | 'one_on_one'
  | 'product_review'
  | 'project_kickoff'
  | 'vendor_call'
  | 'family_life_admin'
  | 'general_notes';

export type SuggestedMeetingItemType = 'promise' | 'waiting' | 'blocker' | 'decision' | 'follow_up';

export interface SuggestedMeetingItem {
  id: string;
  type: SuggestedMeetingItemType;
  title: string;
  description: string;
  person?: string;
  dueDate?: string;
  category: Category;
  priority: Priority;
  riskLevel: RiskLevel;
  sourceText: string;
  accepted: boolean;
  mergedIntoId?: string;
}

export interface MeetingParseResult {
  suggestedItems: SuggestedMeetingItem[];
  people: string[];
  dueDates: string[];
  categories: Category[];
  summary: string;
  actionPlan: {
    whatIOwe: SuggestedMeetingItem[];
    whatOthersOwe: SuggestedMeetingItem[];
    decisions: SuggestedMeetingItem[];
    blocked: SuggestedMeetingItem[];
    whatToDoFirst: SuggestedMeetingItem[];
  };
}

export const MEETING_TEMPLATES: { key: MeetingTemplate; label: string }[] = [
  { key: 'team_meeting', label: 'Team meeting' },
  { key: 'client_call', label: 'Client call' },
  { key: 'one_on_one', label: '1:1' },
  { key: 'product_review', label: 'Product review' },
  { key: 'project_kickoff', label: 'Project kickoff' },
  { key: 'vendor_call', label: 'Vendor call' },
  { key: 'family_life_admin', label: 'Family/life admin' },
  { key: 'general_notes', label: 'General notes' },
];

const CATEGORY_KEYWORDS: Record<Category, RegExp> = {
  work: /\b(launch|project|client|vendor|proposal|review|deck|legal|pricing|product|team|meeting)\b/i,
  personal: /\b(family|friend|school|travel|birthday|personal)\b/i,
  finance: /\b(budget|invoice|pricing|cost|payment|expense|finance|contract)\b/i,
  health: /\b(doctor|health|appointment|medication|therapy|fitness)\b/i,
  home: /\b(home|house|repair|rent|move|maintenance)\b/i,
  other: /.^/,
};

const STOP_NAMES = new Set([
  'I',
  'We',
  'Need',
  'Decide',
  'Friday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Saturday',
  'Sunday',
  'Next',
  'This',
  'The',
]);

function id(prefix: string, index: number): string {
  return `${prefix}-${Date.now()}-${index}`;
}

function splitSentences(rawNotes: string): string[] {
  return rawNotes
    .split(/[\n.;]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function titleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (char) => char.toUpperCase());
}

function detectCategory(text: string): Category {
  const match = (Object.keys(CATEGORY_KEYWORDS) as Category[]).find((category) =>
    CATEGORY_KEYWORDS[category].test(text)
  );
  return match ?? 'work';
}

function priorityFor(type: SuggestedMeetingItemType, text: string): Priority {
  if (/\b(today|urgent|asap|blocked|blocking|overdue)\b/i.test(text)) return 'urgent';
  if (type === 'blocker' || /\b(friday|tomorrow|this week|by)\b/i.test(text)) return 'high';
  if (type === 'promise' || type === 'decision') return 'medium';
  return 'medium';
}

function riskFor(type: SuggestedMeetingItemType, text: string): RiskLevel {
  if (/\b(blocked|blocking|legal|approval|risk|urgent|asap)\b/i.test(text)) return 'high';
  if (type === 'decision' || type === 'promise') return 'medium';
  return 'low';
}

function parseRelativeDueDate(value: string): string | undefined {
  const text = value.toLowerCase();
  const d = new Date();
  d.setHours(9, 0, 0, 0);

  if (/\btomorrow\b/.test(text)) {
    d.setDate(d.getDate() + 1);
    return d.toISOString();
  }
  if (/\bnext week\b/.test(text)) {
    d.setDate(d.getDate() + 7);
    return d.toISOString();
  }

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekday = weekdays.findIndex((day) => new RegExp(`\\b${day}\\b`, 'i').test(text));
  if (weekday >= 0) {
    const current = d.getDay();
    const distance = (weekday - current + 7) % 7 || 7;
    d.setDate(d.getDate() + distance);
    return d.toISOString();
  }

  const iso = value.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso?.[1]) return new Date(`${iso[1]}T09:00:00`).toISOString();

  return undefined;
}

function dueFromSentence(sentence: string): string | undefined {
  const duePhrase = sentence.match(/\b(?:by|due|before)\s+([^,.;]+)/i)?.[1] ?? sentence;
  return parseRelativeDueDate(duePhrase);
}

function cleanAction(text: string): string {
  return titleCase(
    text
      .replace(/\b(by|due|before)\s+[^,.;]+/i, '')
      .replace(/\b(i'll|i will|i owe|i told\s+\w+\s+i'?d|i said\s+i'?d|need to|need|please)\b/gi, '')
      .replace(/\b(waiting on|blocked by|blocking|decide|need to decide|follow up with|circle back|check with|depends on|approval from)\b/gi, '')
      .trim()
  );
}

function extractPersonFromSentence(sentence: string): string | undefined {
  const explicit =
    sentence.match(/\b(?:with|to|on|from|by|approval from|waiting on|check with|follow up with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)?.[1] ??
    sentence.match(/\b(?:with|to|on|from|by|approval from|waiting on|check with|follow up with)\s+([a-z]+(?:\s+[a-z]+)?)/i)?.[1];
  if (explicit) return titleCase(explicit.replace(/\b(the|a|an)\b/gi, '').trim());

  const capitalized = sentence.match(/\b[A-Z][a-z]+\b/g) ?? [];
  return capitalized.find((name) => !STOP_NAMES.has(name));
}

function buildItem(
  sentence: string,
  type: SuggestedMeetingItemType,
  title: string,
  index: number,
  person?: string
): SuggestedMeetingItem {
  const dueDate = dueFromSentence(sentence);
  return {
    id: id(type, index),
    type,
    title: titleCase(title),
    description: sentence,
    person,
    dueDate,
    category: detectCategory(sentence),
    priority: priorityFor(type, sentence),
    riskLevel: riskFor(type, sentence),
    sourceText: sentence,
    accepted: true,
  };
}

export function extractPeople(rawNotes: string): string[] {
  const names = new Set<string>();
  splitSentences(rawNotes).forEach((sentence) => {
    const person = extractPersonFromSentence(sentence);
    if (person) names.add(person);
  });
  return [...names].sort();
}

export function extractDueDates(rawNotes: string): string[] {
  return Array.from(
    new Set(splitSentences(rawNotes).map(dueFromSentence).filter((date): date is string => Boolean(date)))
  );
}

export function extractPromises(rawNotes: string): SuggestedMeetingItem[] {
  return splitSentences(rawNotes)
    .map((sentence, index) => {
      if (!/\b(i'll|i will|i owe|i told\s+\w+\s+i'?d|i said\s+i'?d)\b/i.test(sentence)) return null;
      const person = extractPersonFromSentence(sentence);
      const title = cleanAction(sentence) || 'Promise from meeting';
      return buildItem(sentence, 'promise', title, index, person);
    })
    .filter((item): item is SuggestedMeetingItem => Boolean(item));
}

export function extractWaitingItems(rawNotes: string): SuggestedMeetingItem[] {
  return splitSentences(rawNotes)
    .map((sentence, index) => {
      if (!/\b(waiting on|need .+ from|approval from|depends on)\b/i.test(sentence)) return null;
      const person = extractPersonFromSentence(sentence);
      const title = cleanAction(sentence) || `Waiting on ${person ?? 'someone'}`;
      return buildItem(sentence, 'waiting', title, index, person);
    })
    .filter((item): item is SuggestedMeetingItem => Boolean(item));
}

export function extractBlockers(rawNotes: string): SuggestedMeetingItem[] {
  return splitSentences(rawNotes)
    .map((sentence, index) => {
      if (!/\b(blocked by|blocking|blocker)\b/i.test(sentence)) return null;
      const person = extractPersonFromSentence(sentence);
      const title = cleanAction(sentence) || 'Blocked from meeting';
      return buildItem(sentence, 'blocker', title, index, person);
    })
    .filter((item): item is SuggestedMeetingItem => Boolean(item));
}

export function extractDecisions(rawNotes: string): SuggestedMeetingItem[] {
  return splitSentences(rawNotes)
    .map((sentence, index) => {
      if (!/\b(decide|need to decide|choose|pick)\b/i.test(sentence)) return null;
      const title = cleanAction(sentence) || 'Decision needed';
      return buildItem(sentence, 'decision', title, index);
    })
    .filter((item): item is SuggestedMeetingItem => Boolean(item));
}

function extractFollowUps(rawNotes: string): SuggestedMeetingItem[] {
  return splitSentences(rawNotes)
    .map((sentence, index) => {
      if (!/\b(follow up with|circle back|check with)\b/i.test(sentence)) return null;
      const person = extractPersonFromSentence(sentence);
      const title = cleanAction(sentence) || `Follow up with ${person ?? 'someone'}`;
      return buildItem(sentence, 'follow_up', title, index, person);
    })
    .filter((item): item is SuggestedMeetingItem => Boolean(item));
}

function uniqueItems(items: SuggestedMeetingItem[]): SuggestedMeetingItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}:${item.title.toLowerCase()}:${item.person ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseMeetingNotes(rawNotes: string): MeetingParseResult {
  const suggestedItems = uniqueItems([
    ...extractPromises(rawNotes),
    ...extractWaitingItems(rawNotes),
    ...extractBlockers(rawNotes),
    ...extractDecisions(rawNotes),
    ...extractFollowUps(rawNotes),
  ]);
  const people = extractPeople(rawNotes);
  const dueDates = extractDueDates(rawNotes);
  const categories = Array.from(new Set(suggestedItems.map((item) => item.category)));
  const promises = suggestedItems.filter((item) => item.type === 'promise');
  const waiting = suggestedItems.filter((item) => item.type === 'waiting' || item.type === 'follow_up');
  const blockers = suggestedItems.filter((item) => item.type === 'blocker');
  const decisions = suggestedItems.filter((item) => item.type === 'decision');

  return {
    suggestedItems,
    people,
    dueDates,
    categories,
    summary: `From this meeting: ${promises.length} promise${promises.length === 1 ? '' : 's'}, ${blockers.length} blocker${blockers.length === 1 ? '' : 's'}, ${decisions.length} decision${decisions.length === 1 ? '' : 's'}, ${people.length} people, ${dueDates.length} due date${dueDates.length === 1 ? '' : 's'}.`,
    actionPlan: {
      whatIOwe: promises,
      whatOthersOwe: waiting,
      decisions,
      blocked: blockers,
      whatToDoFirst: [...blockers, ...promises, ...decisions, ...waiting].slice(0, 3),
    },
  };
}

function loopTypeForItem(type: SuggestedMeetingItemType): LoopType {
  switch (type) {
    case 'promise':
      return 'promised_by_me';
    case 'waiting':
      return 'waiting_on_others';
    case 'blocker':
      return 'blocked';
    case 'decision':
      return 'decision_needed';
    case 'follow_up':
    default:
      return 'follow_up';
  }
}

export function convertSuggestedItemToLoop(
  item: SuggestedMeetingItem
): Omit<OpenLoop, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> {
  const type = loopTypeForItem(item.type);
  const person = item.person ? personFromName(item.person) : undefined;
  return {
    title: item.title,
    description: `From meeting notes: ${item.description}`,
    type,
    status: type === 'blocked' ? 'blocked' : type === 'waiting_on_others' ? 'waiting' : 'open',
    priority: item.priority,
    riskLevel: item.riskLevel,
    category: item.category,
    owner: { id: 'me', name: 'You' },
    waitingOn: type === 'waiting_on_others' || type === 'blocked' ? person : undefined,
    promisedTo: type === 'promised_by_me' ? person : undefined,
    accountableOwner: type === 'blocked' ? person : undefined,
    dueDate: item.dueDate,
    followUpHistory: [],
    decisions: [],
    attachments: [],
  };
}
