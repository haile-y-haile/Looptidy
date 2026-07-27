# LoopTidy — Follow Up Tracker (historical MVP notes)

> **Note:** This document is historical scope notes. For current product behavior, see [README.md](../README.md), [CHANGELOG.md](../CHANGELOG.md), and [ROADMAP.md](../ROADMAP.md).

## What is LoopTidy?

LoopTidy is a personal system for closing open loops — not a generic to-do app. It helps you track follow-ups, promises you've made, things you're waiting on from others, blockers, unresolved decisions, and items with approaching deadlines.

## Shipped in 1.0.0 (current)

- Today dashboard (focus, up next, PM signals)
- Open loop create / edit / close / archive / reopen / delete
- Loop detail with timeline, notes, decisions, local reminders
- Decisions tab and Decision Speed flow
- Command Center search, filters, sorting
- Weekly review (summary + guided)
- People, ownership, scope guard, feedback tools
- Insights (local snapshot)
- SQLite loop storage (legacy AsyncStorage migration once)
- Fresh installs start empty; sample data only via Backup → Load sample loops
- Local notifications for reminders (permission on set)
- Optional Face ID app lock
- Backup & restore (JSON/CSV)
- Dark mode

## Intentionally not in this release

- Backend / cloud sync
- Real accounts
- Remote push server
- Analytics / ads
- AI features
- Collaboration / sharing

## Tech stack (current)

- Expo · React Native · TypeScript · Expo Router
- expo-sqlite for loops
- AsyncStorage for preferences / scope / feedback / reviews
- expo-notifications (local only)
