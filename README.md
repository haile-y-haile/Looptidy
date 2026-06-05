# LoopTidy

**Close the loops that matter.**

An open-loop tracker for follow-ups, blockers, commitments, and decisions.

LoopTidy is a local-first open-loop tracker for managing follow-ups, blockers, commitments, and unresolved decisions. Data stays on your device — no backend, no cloud sync, and no account required in v1.

## Status

| | |
|---|---|
| **App** | LoopTidy |
| **Version** | 1.0.0 |
| **Platform** | iOS |
| **Storage** | SQLite (loops) + on-device preferences |
| **Repository** | https://github.com/haile-y-haile/Looptidy |

**Support:** hello.hailelabs@gmail.com  
**Privacy Policy:** https://haile-y-haile.github.io/Looptidy/privacy

## Core features (1.0.0)

- **Today dashboard** — focus, due items, waiting, promised, and high-risk loops
- **Open loop creation & editing** — type, priority, risk, category, person, due date, attachments
- **Loop lifecycle** — close, archive, reopen, delete
- **Loop detail** — context, timeline, notes, decisions, local reminders
- **Decision log** — unresolved and recorded decisions
- **Command Center** — search, filters, sorting across loops and related data
- **Local reminders** — on-device notifications (permission requested when you set a reminder)
- **Backup & restore** — JSON/CSV export and import on this device
- **Dark mode** — system, light, or dark appearance
- **Optional app lock** — Face ID / passcode (Settings)

## Current limitations

- **No backend or cloud sync**
- **No real account system**
- **No analytics or ads**
- **No AI features in this release**
- **Local notifications only** — no remote push server

## Tech stack

- Expo · React Native · TypeScript · Expo Router
- **expo-sqlite** for loop storage
- AsyncStorage for preferences, scope, feedback, and weekly reviews
- EAS Build for iOS distribution

## Build and run

```bash
git clone https://github.com/haile-y-haile/Looptidy.git
cd Looptidy
npm install
npx expo start
```

Pre-build checks and production commands: [BUILD.md](BUILD.md).

## Documentation

| Document | Purpose |
|----------|---------|
| [BUILD.md](BUILD.md) | Local dev and EAS |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [ROADMAP.md](ROADMAP.md) | Shipped vs planned |
| [PRIVACY.md](PRIVACY.md) | Privacy practices |
| [SUPPORT.md](SUPPORT.md) | Help and contact |
| [docs/PRIVACY_POLICY_HOSTING.md](docs/PRIVACY_POLICY_HOSTING.md) | Hosted privacy URL setup |

## License

Copyright (c) 2026 Haile Haile. **All Rights Reserved.** See [LICENSE](LICENSE).
