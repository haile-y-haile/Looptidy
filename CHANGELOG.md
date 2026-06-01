# Changelog

All notable changes to LoopTidy are documented in this file.

## [1.0.0] — 2026-06

Initial **TestFlight** release. Local-first open-loop tracker for follow-ups, blockers, commitments, and unresolved decisions.

### Added

- **Today dashboard** — open-loop overview, focus, due / waiting / promised views, risk-aware highlights
- **Open loop creation** — title, description, type, priority, risk, category, person, due date
- **Open loop list** — browse, filter, and close loops
- **Loop detail** — full context, timeline, notes, decision outcomes, closure
- **Waiting on others** — loops blocked on someone else’s action
- **Promised by me** — commitments with due dates
- **Decision log** — pending and recorded decisions
- **Weekly review placeholder** — weekly stats and checklist / stepper
- **Local persistence** — AsyncStorage on device
- **Dark mode** — system, light, or dark
- **Settings** — appearance and about
- **Local link attachments** — attach and open URLs on a loop
- **Onboarding** — mock auth UI (Get started only; no real sign-in)
- **iOS TestFlight** distribution via EAS Build

### Not in this release

- Backend or cloud sync
- Real account system (Apple / Google / email sign-in)
- Analytics or ads
- Push notifications or local reminders
- Payments

### Technical

- Expo, React Native, TypeScript, Expo Router, AsyncStorage, EAS Build

[1.0.0]: https://github.com/haile-y-haile/Looptidy/releases/tag/v1.0.0
