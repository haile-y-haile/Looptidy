# LoopTidy — Follow Up Tracker

## What is LoopTidy?

LoopTidy is a personal system for closing open loops — not a generic to-do app. It helps you track follow-ups, promises you've made, things you're waiting on from others, blockers, unresolved decisions, and items with approaching deadlines.

The core insight: most productivity friction comes from **unclosed loops** — commitments, dependencies, and decisions that linger without resolution. LoopTidy gives you a calm, focused view of what's still open and who owns the next action.

## MVP Scope

### Included

- **Today dashboard** — at-a-glance counts, due-soon items, high-risk loops, quick actions
- **Open loop creation** — title, description, type, priority, risk, category, person, due date
- **Open loop list** — all active loops in one view
- **Loop detail** — full context, timeline, notes, decisions, close action
- **Waiting on others** — filtered view of dependencies on other people
- **Promised by me** — filtered view of commitments you've made
- **Decision log** — pending decisions and historical record
- **Weekly review placeholder** — stats snapshot and review checklist
- **Local persistence** — AsyncStorage with mock data seed on first launch
- **Clean TypeScript types** — strict types for all domain entities

### Loop Types

| Type | Description |
|------|-------------|
| `waiting_on_others` | You're blocked on someone else's response or action |
| `promised_by_me` | You committed to doing something for someone |
| `decision_needed` | A choice needs to be made before progress can continue |
| `blocked` | External dependency is preventing progress |
| `follow_up` | You need to check in on something |
| `due` | Time-sensitive item with a deadline |

## Intentionally Excluded

These are deliberately out of scope for the MVP:

- **Backend / cloud sync** — local-only for now
- **Authentication / accounts** — single-user, device-local
- **Push notifications / reminders** — no notification system yet
- **Payments / subscriptions**
- **Complex settings** — no preferences screen
- **Search / filters** — basic type-based views only
- **Collaboration / sharing** — personal tool only
- **Attachments / files**
- **Recurring loops**
- **Import / export**

## Future Roadmap

1. **Guided weekly review** — step-by-step flow with close/archive prompts
2. **Smart reminders** — local notifications for due dates and stale loops
3. **Search and filters** — find loops by person, category, date range
4. **Person directory** — reusable contacts linked across loops
5. **Stale loop detection** — surface loops untouched for N days
6. **Export** — JSON/CSV backup of all data
7. **iCloud / cloud sync** — optional backup across devices
8. **Widgets** — Today widget showing open loop counts
9. **Siri shortcuts** — quick capture of new loops
10. **Analytics** — loop closure rate, average time-to-close trends

## Tech Stack

- Expo SDK 56
- React Native
- TypeScript (strict)
- Expo Router (file-based navigation)
- AsyncStorage (local persistence)
- No backend, no auth

## Getting Started

```bash
npm install
npx expo start
```

Press `i` for iOS simulator, or scan the QR code with Expo Go on a physical device.
