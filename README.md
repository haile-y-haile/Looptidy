# LoopTidy

**Close the loops that matter.**

LoopTidy is a personal follow-up tracker for open loops: things you are waiting on, promises you made, decisions still hanging, and deadlines that deserve attention. It is not a generic to-do list or project-management app.

The app is **local-first** today. Your loops stay on your device. There is no backend, no real account system, and no cloud sync in the current release.

## Status

| | |
|---|---|
| **Version** | 1.0.0 |
| **Platform** | iOS (TestFlight) |
| **Distribution** | [TestFlight beta](https://github.com/haile-y-haile/Looptidy/issues/new?title=TestFlight%20beta%20access) |
| **Repository** | https://github.com/haile-y-haile/Looptidy |

## What LoopTidy helps with

- **Waiting on others** — who owes you a reply or deliverable
- **Promised by me** — commitments you made and their due dates
- **Decisions** — choices that block progress until resolved
- **Follow-ups and due items** — time-sensitive loops in one calm view
- **Weekly review** — a short ritual to reset what is still open

## What is in the app today

- Today dashboard with focus, filters, and quick actions
- Loops list with search and category filters (waiting, promised, blocked, due, closed)
- Loop detail with notes, timeline, and close actions
- Swipe to close on loop cards
- Decisions tab and weekly review stepper
- Dark mode and onboarding (mock sign-in UI only — **Get started** works; Apple/Google/email sign-in is not active)
- Local storage via AsyncStorage

## What is not included yet

- Backend or cloud sync
- Real authentication or accounts
- Push notifications or reminders
- Analytics, ads, or third-party tracking
- Payments or subscriptions
- Collaboration or sharing between users

## Tech stack

- Expo SDK 54, React Native, TypeScript
- Expo Router, AsyncStorage
- EAS Build for iOS TestFlight

## Documentation

| Document | Purpose |
|----------|---------|
| [BUILD.md](BUILD.md) | Run locally, EAS builds, TestFlight |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [ROADMAP.md](ROADMAP.md) | Planned direction |
| [PRIVACY.md](PRIVACY.md) | Data and privacy |
| [SUPPORT.md](SUPPORT.md) | Help and feedback |
| [SECURITY.md](SECURITY.md) | Reporting security issues |
| [LICENSE](LICENSE) | Copyright and rights |

## Development

```bash
git clone https://github.com/haile-y-haile/Looptidy.git
cd Looptidy
npm install
npx expo start
```

See [BUILD.md](BUILD.md) for iOS simulator, Expo Go, and production builds.

## License

Copyright (c) 2026 Haile Haile. **All Rights Reserved.** See [LICENSE](LICENSE).
