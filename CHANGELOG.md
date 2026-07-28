# Changelog

All notable changes to LoopTidy are documented in this file.

## [1.0.0] — 2026-07 (Build 33)

Covers builds 27–33. Focused on launch reliability, data durability, and turning
Settings from a near-empty screen into a real control panel.

### Added

- **Settings control panel** — haptics, reduce motion, time format, week start,
  stale threshold, nudge tone, default reminder time, default snooze, and
  default loop type / priority / category for new captures
- **Today toggles** — show or hide PM signals and the weekly-review prompt
- **Notification permission row** — request in-app, or jump to iOS Settings once denied
- **Replay onboarding** and **restore weekly banner** from Settings
- **Backup status** — last full JSON backup shown in Settings
- **Version row** — app version and build number from the Expo config
- **Brand flash** — animated launch screen, skippable via reduce motion

### Changed

- **Splash** — single brand flash on launch; the second logo screen is gone
- **Preferences** — hydrated once at launch and read from a cache, so settings
  apply without a restart in most places
- **Week boundaries** — the weekly review and PM signals honor the "week starts
  on" preference instead of a rolling seven-day window
- **People** — top bottleneck rows open the person detail screen

### Fixed

- **Blank screen on fresh install** — theme hydration, brand flash completion,
  and a launch ceiling so the app always reaches a usable state
- **Biometric lock** — the unlock prompt can no longer hang on a spinner
- **Data durability** — corrupt rows are skipped instead of failing the whole
  read, malformed loop fields are repaired on load, and a failed legacy
  migration retries on the next launch instead of discarding data
- **Silent save failures** — storage errors now surface on Today with a retry
- **Dead ends** — "not found" screens, editing a deleted loop, and opening a
  missing decision all offer a way back
- **Weekly review banner** — no longer lingers past the weekend
- **Settings copy** — each control now describes what it actually does

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
