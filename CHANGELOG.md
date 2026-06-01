# Changelog

All notable changes to LoopTidy are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/) where practical.

## [1.0.0] — 2026-06 (TestFlight)

First public TestFlight release. Local-first personal follow-up tracker.

### Added

- **Today** — dashboard with stats, focus loop, quick actions, segmented views, and filters
- **Loops** — list with search, filters (all, waiting, promised, blocked, due, closed), swipe to close
- **Loop detail** — notes, timeline, decisions, attachments (links), bottom action bar
- **New loop** — types, priority, risk, category, person, due date, link attachments
- **Decisions** tab for decision-type loops
- **Weekly review** — snapshot stats and guided step checklist
- **Settings** — appearance (system/light/dark), About/marketing screen
- **Onboarding** — welcome flow with mock sign-in UI (Get started only)
- **Brand experience** — splash animation, Plus Jakarta Sans, Ionicons (no emoji section icons)
- **Local persistence** — AsyncStorage; sample data on first launch
- **iOS** — TestFlight distribution via EAS (`com.hailehaile.looptidy`)

### Not included

- Backend, cloud sync, or real accounts
- Push notifications
- Analytics or advertising
- In-app payments

### Technical

- Expo SDK 54, Expo Router, TypeScript
- react-native-reanimated, lottie-react-native, expo-haptics

---

## Pre-release (development)

- Project scaffold and MVP domain model
- Tab navigation (Today, Loops, Decisions, Settings)
- TestFlight QA polish (dark mode, empty states, disabled actions)
- Premium UX pass (brand splash, marketing page, design tokens)

[1.0.0]: https://github.com/haile-y-haile/Looptidy/releases/tag/v1.0.0
