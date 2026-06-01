# LoopTidy

**Close the loops that matter.**

An open-loop tracker for follow-ups, blockers, commitments, and decisions.

LoopTidy is a local-first open-loop tracker for managing follow-ups, blockers, commitments, and unresolved decisions. It helps you keep track of what is **waiting**, what is **blocked**, what you **promised**, what is **due**, and what still needs a **decision**—with **risk** visible when a loop needs attention and **closure** when it no longer matters.

Data stays on your device in the current release. There is no backend, no cloud sync, and no real account system yet.

## Status

| | |
|---|---|
| **App** | LoopTidy |
| **Version** | 1.0.0 |
| **Platform** | iOS |
| **Availability** | TestFlight build available |
| **Repository** | https://github.com/haile-y-haile/Looptidy |

Request TestFlight access: [GitHub — TestFlight beta access](https://github.com/haile-y-haile/Looptidy/issues/new?title=TestFlight%20beta%20access&body=Apple%20ID%20email%20for%20invite%3A%0A%0A)

## Core MVP features (1.0.0)

- **Today dashboard** — focus, due items, waiting, promised, and high-risk loops
- **Open loop creation** — type, priority, risk, category, person, due date
- **Open loop list** — all open and closed loops in one place
- **Loop detail** — context, timeline, notes, decisions, closure
- **Waiting on others** — loops where progress depends on someone else
- **Promised by me** — commitments you made and their due dates
- **Decision log** — unresolved and recorded decisions
- **Weekly review placeholder** — stats snapshot and guided checklist
- **Local persistence** — AsyncStorage on device
- **Dark mode** — system, light, or dark appearance
- **Settings** — preferences and about
- **Local link attachments** — save URLs on a loop (files coming later)

## Current limitations

- **Mock auth UI only** — onboarding shows sign-in options; only **Get started** is active
- **No backend yet**
- **No cloud sync yet**
- **No real account system yet**
- **No analytics**
- **No ads**
- **No push notifications**

## Tech stack

- Expo
- React Native
- TypeScript
- Expo Router
- AsyncStorage
- EAS Build

## Build and run

```bash
git clone https://github.com/haile-y-haile/Looptidy.git
cd Looptidy
npm install
npx expo start
```

| Command | Purpose |
|---------|---------|
| `npx expo start` | Start Metro (local development) |
| `npx expo start --ios` | Open iOS Simulator |
| Press `i` / scan QR | Simulator or **Expo Go** preview on a device |

Pre-build checks and production commands: [BUILD.md](BUILD.md).

## TestFlight

1. Install [TestFlight](https://apps.apple.com/app/testflight/id899247664) on your iPhone or iPad.
2. [Request a beta invite](https://github.com/haile-y-haile/Looptidy/issues/new?title=TestFlight%20beta%20access&body=Apple%20ID%20email%20for%20invite%3A%0A%0A) with your Apple ID email.
3. Accept the invite and install LoopTidy from TestFlight.

Maintainers: see [BUILD.md](BUILD.md) for `eas build` and `eas submit`.

## Documentation

| Document | Purpose |
|----------|---------|
| [BUILD.md](BUILD.md) | Local dev, EAS, TestFlight upload |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [ROADMAP.md](ROADMAP.md) | MVP complete, next, future |
| [PRIVACY.md](PRIVACY.md) | Privacy practices |
| [SUPPORT.md](SUPPORT.md) | Help and contact |
| [SECURITY.md](SECURITY.md) | Security reports |
| [LICENSE](LICENSE) | All Rights Reserved |

## License

Copyright (c) 2026 Haile Haile. **All Rights Reserved.** See [LICENSE](LICENSE).
