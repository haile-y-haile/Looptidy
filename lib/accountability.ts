import type {
  AccountabilityStatus,
  EscalationLevel,
  OpenLoop,
  Person,
} from '../types';
import { isOpenLoop } from './utils';

export function getAccountabilityStatus(loop: OpenLoop): AccountabilityStatus {
  if (loop.accountabilityStatus) return loop.accountabilityStatus;
  if (!isOpenLoop(loop)) return 'resolved';
  if (loop.escalationLevel === 'escalated' || loop.escalationLevel === 'escalation_needed') {
    return 'escalated';
  }
  if (!loop.nextActionOwner && !loop.accountableOwner && !loop.waitingOn && loop.type !== 'promised_by_me') {
    return 'unclear';
  }
  if (loop.type === 'waiting_on_others' && loop.waitingOn) return 'waiting_on_owner';
  if (loop.lastFollowUpAt) {
    const days = (Date.now() - new Date(loop.lastFollowUpAt).getTime()) / (86400000);
    if (days > 7) return 'needs_follow_up';
  }
  return 'clear';
}

export function isNextCheckInToday(loop: OpenLoop): boolean {
  if (!loop.nextCheckInAt) return false;
  const d = new Date(loop.nextCheckInAt);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function getLoopsWithUnclearOwnership(loops: OpenLoop[]): OpenLoop[] {
  return loops.filter((l) => isOpenLoop(l) && getAccountabilityStatus(l) === 'unclear');
}

export function getLoopsNeedingFollowUp(loops: OpenLoop[]): OpenLoop[] {
  return loops.filter((l) => isOpenLoop(l) && getAccountabilityStatus(l) === 'needs_follow_up');
}

export function getEscalatedLoops(loops: OpenLoop[]): OpenLoop[] {
  return loops.filter(
    (l) =>
      isOpenLoop(l) &&
      (getAccountabilityStatus(l) === 'escalated' ||
        l.escalationLevel === 'escalated' ||
        l.escalationLevel === 'escalation_needed')
  );
}

export function getLoopsWithoutNextActionOwner(loops: OpenLoop[]): OpenLoop[] {
  return loops.filter((l) => isOpenLoop(l) && !l.nextActionOwner?.name?.trim());
}

export function getWaitingOnOthers(loops: OpenLoop[]): OpenLoop[] {
  return loops.filter((l) => isOpenLoop(l) && l.type === 'waiting_on_others');
}

export function getPromisedByMe(loops: OpenLoop[]): OpenLoop[] {
  return loops.filter((l) => isOpenLoop(l) && l.type === 'promised_by_me');
}

export interface AccountabilitySummary {
  unclear: number;
  needsFollowUp: number;
  escalated: number;
  waiting: number;
  promised: number;
  noNextOwner: number;
  checkInToday: number;
}

export function getAccountabilitySummary(loops: OpenLoop[]): AccountabilitySummary {
  const open = loops.filter(isOpenLoop);
  return {
    unclear: getLoopsWithUnclearOwnership(open).length,
    needsFollowUp: getLoopsNeedingFollowUp(open).length,
    escalated: getEscalatedLoops(open).length,
    waiting: getWaitingOnOthers(open).length,
    promised: getPromisedByMe(open).length,
    noNextOwner: getLoopsWithoutNextActionOwner(open).length,
    checkInToday: open.filter(isNextCheckInToday).length,
  };
}

export function accountabilityStatusLabel(s: AccountabilityStatus): string {
  const map: Record<AccountabilityStatus, string> = {
    clear: 'Clear',
    unclear: 'Owner unclear',
    waiting_on_owner: 'Waiting on owner',
    needs_follow_up: 'Needs follow-up',
    escalated: 'Escalated',
    resolved: 'Resolved',
  };
  return map[s];
}

export function escalationLevelLabel(e: EscalationLevel): string {
  const map: Record<EscalationLevel, string> = {
    none: 'None',
    soft_follow_up: 'Soft follow-up',
    firm_follow_up: 'Firm follow-up',
    escalation_needed: 'Escalation needed',
    escalated: 'Escalated',
  };
  return map[e];
}

export function personFromName(name: string): Person {
  return { id: `person-${name.trim().toLowerCase().replace(/\s+/g, '-')}`, name: name.trim() };
}
