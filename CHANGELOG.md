# Changelog

All notable changes to LoopTidy are documented in this file.

## [1.0.0] — 2026-06 (Build 26 — App Store candidate)

App Store review candidate. Local-first open-loop tracker with SQLite storage and local reminders.

### Added

- **Edit loop** — update title, fields, attachments, and reminders
- **Loop lifecycle** — archive, reopen, delete (with confirmation)
- **Remove attachments** — in edit flow and loop detail
- **Local reminders** — schedule, change, snooze, clear; permission on set only
- **Optional app lock** — Face ID / passcode in Settings
- **Backup & restore** — full JSON + CSV exports
- **Command Center FlatList** — virtualized results for large libraries
- **Privacy & support links** — in Settings and About

### Changed

- **Storage** — loops in SQLite (migrated from legacy AsyncStorage)
- **Fresh installs** — start empty; sample loops via explicit “Load sample loops” only
- **About screen** — App Store–ready copy (no TestFlight beta CTAs)
- **Settings** — informational local-first copy; no dead sign-in buttons

### Not in this release

- Backend, cloud sync, or real accounts
- Remote push notifications
- Analytics, ads, or in-app purchases
- AI assistance

### Technical

- Expo 54 · React Native · TypeScript · expo-sqlite · expo-notifications · EAS Build

[1.0.0]: https://github.com/haile-y-haile/Looptidy/releases/tag/v1.0.0
