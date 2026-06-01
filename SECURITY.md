# Security Policy — LoopTidy

## Scope

LoopTidy is **local-only** today. Open-loop data (follow-ups, blockers, commitments, decisions, waiting, promised, due, and closure) is stored on the user’s device. The app does **not** use a LoopTidy backend in the current release.

## Supported versions

| Version | Support |
|---------|---------|
| Latest TestFlight build | Yes |
| Older TestFlight builds | Best effort |
| `main` branch (development) | Fixes land on `main`; new TestFlight when needed |

## Reporting a vulnerability

Please **do not** report security issues in public GitHub issues.

Use [GitHub private vulnerability reporting](https://github.com/haile-y-haile/Looptidy/security/advisories/new) if it is enabled on the repository. Otherwise, open a minimal public issue titled **Security — private contact requested** without exploit details or sensitive data, and a maintainer will follow up.

Include:

- Description and impact
- Steps to reproduce
- App version and iOS version
- Whether data leaves the device (for current builds, loop content should not)

## Public issues — please do not post

When filing normal bugs on GitHub, **do not** include:

- Passwords or app-specific passwords
- API tokens, keys, or certificates
- Apple Developer or App Store Connect credentials
- Private user data from your loops
- Sensitive screenshots (redact personal names and commitments if sharing UI issues)

## In-scope examples

- Unexpected network transmission of loop content
- Secrets committed to the repository
- Unsafe handling of link URLs that could lead to unexpected behavior
- Local data exposure beyond normal iOS app sandbox rules

## Known design (not vulnerabilities)

- Anyone with access to an unlocked device can open the app and read local data
- No encryption beyond what iOS provides for app storage
- Mock sign-in UI does not authenticate users
- No remote account to compromise

## Response

We aim to acknowledge valid reports within a reasonable time and ship fixes for confirmed issues affecting TestFlight users when appropriate.

## Encryption

LoopTidy uses standard HTTPS only when you open external links. Export compliance is declared in `app.json` (`ITSAppUsesNonExemptEncryption: false`).
