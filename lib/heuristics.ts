import type { LoopType, Priority, RiskLevel } from '../types';

export function analyzeLoopText(text: string) {
  const t = text.toLowerCase();
  
  let type: LoopType | null = null;
  let priority: Priority | null = null;
  let riskLevel: RiskLevel | null = null;
  let waitingOnName: string | null = null;

  // Type Heuristics
  if (t.includes('waiting on') || t.includes('waiting for')) {
    type = 'waiting_on_others';
    const match = t.match(/waiting (?:on|for)\s+([a-zA-Z]+)/);
    if (match && match[1]) {
      waitingOnName = match[1];
    }
  } else if (t.includes('promise') || t.includes('owe') || t.includes('will send')) {
    type = 'promised_by_me';
  } else if (t.includes('decide') || t.includes('decision') || t.includes('choose')) {
    type = 'decision_needed';
  } else if (t.includes('blocked') || t.includes('stuck')) {
    type = 'blocked';
  }

  // Priority Heuristics
  if (t.includes('asap') || t.includes('urgent') || t.includes('emergency')) {
    priority = 'urgent';
  } else if (t.includes('important') || t.includes('high priority')) {
    priority = 'high';
  }

  // Risk Heuristics
  if (t.includes('risk') || t.includes('critical') || t.includes('blocker') || t.includes('delay')) {
    riskLevel = 'high';
  }

  return { type, priority, riskLevel, waitingOnName };
}
