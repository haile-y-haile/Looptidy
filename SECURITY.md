# Security Policy — LoopTidy

We take security reports seriously, even for a local-first beta app.

## Supported versions

| Version | Supported |
|---------|-----------|
| Latest TestFlight build | Yes |
| Older TestFlight builds | Best effort |
| Source on `main` (development) | Security fixes land on `main`; new TestFlight build when warranted |

## What to report

Please report issues such as:

- Ways to read or modify another user’s loop data on the same device without authorization (unexpected sandbox escapes)
- Hardcoded secrets or API keys in the repository
- Insecure handling of link URLs (unexpected code execution, unsafe WebView usage if added later)
- Data unexpectedly transmitted to third-party servers (the current release should **not** send loop content to LoopTidy servers)

## Out of scope (current design)

These are **known limitations**, not vulnerabilities:

- Data is readable by anyone with physical access to an unlocked device (standard iOS app storage)
- No encryption at rest beyond what iOS provides for app containers
- No remote account compromise (there is no real account system)
- Mock sign-in UI that does not authenticate

## How to report

**Do not** open public GitHub issues for exploitable security problems.

Instead:

1. Use GitHub **Private vulnerability reporting** if enabled on the repository, **or**
2. Open a minimal GitHub issue asking for a private contact channel without exploit details, **or**
3. Contact the maintainer through the channel listed in [SUPPORT.md](SUPPORT.md) with subject **Security**.

Include:

- Description of the issue and impact
- Steps to reproduce
- Affected version (TestFlight build number if known)
- Your environment (iOS version, device)

## What to expect

- Acknowledgment within a reasonable time (goal: 7 days for valid reports)
- A fix or mitigation plan for confirmed issues affecting users
- Credit in release notes if you wish and the fix is shipped (optional)

## Secure development practices

Maintainers aim to:

- Keep dependencies updated and run `expo-doctor` before releases
- Avoid committing secrets (`.env`, keys, certificates)
- Review permissions before adding networking, accounts, or analytics

## Encryption export

LoopTidy declares standard encryption only (`ITSAppUsesNonExemptEncryption: false` in `app.json`) — HTTPS for external links only, no custom cryptography in the app today.
