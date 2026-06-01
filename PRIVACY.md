# Privacy Policy — LoopTidy

**Last updated:** June 2026  
**Applies to:** LoopTidy iOS (TestFlight and future App Store releases)

LoopTidy is built as a **local-first** personal app. This policy describes what data the app handles today and what it does not do.

## Summary

- Your loops are stored **on your device** (AsyncStorage).
- LoopTidy does **not** run its own servers or sync your data to a backend.
- There is **no** in-app analytics, advertising, or third-party tracking SDKs.
- There is **no** real account system; sign-in buttons in onboarding are placeholders only.
- There are **no** push notifications in the current version.

## Data stored on your device

When you use LoopTidy, the app may store locally:

- Loop titles, descriptions, types, status, priority, and risk level
- Names and optional contact details you enter for “waiting on” or “promised to”
- Due dates, notes, timeline events, and decision outcomes
- App preferences (for example, appearance mode)
- Whether you completed onboarding

This data remains on your phone unless you delete the app or clear app storage.

## Data we do not collect

LoopTidy (as shipped today) does **not**:

- Require an account or collect email/password for app login
- Upload your loop content to LoopTidy-operated servers
- Sell or share your personal data with advertisers
- Use analytics services to profile your behavior inside the app
- Send push notifications

## Third-party services

### Apple TestFlight and App Store

If you install via TestFlight or the App Store, **Apple** processes installation, crash reports, and usage data according to [Apple’s privacy policy](https://www.apple.com/legal/privacy/). That is separate from LoopTidy’s local storage.

### Expo / EAS (developers only)

Source code may be built with [Expo Application Services (EAS)](https://expo.dev/eas) for TestFlight. Build pipelines do not receive your on-device loop content. Only project maintainers interact with EAS, not end users’ loop data.

### Links you open

If you add a link attachment and open it, your device’s browser handles that URL under its own terms.

## Children

LoopTidy is not directed at children under 13. We do not knowingly collect personal information from children.

## Your choices

- **Delete data:** Remove individual loops in the app, or delete the app to remove all local data.
- **Export:** Full export is not built into the app yet; see [ROADMAP.md](ROADMAP.md).

## Changes to this policy

We may update this policy as features change (for example, if cloud sync or accounts are added). Material changes will be reflected in this file and, when appropriate, in the app or TestFlight notes.

## Contact

Questions about privacy: open a [GitHub issue](https://github.com/haile-y-haile/Looptidy/issues/new?title=Privacy%20question) with the label or subject “Privacy”, or see [SUPPORT.md](SUPPORT.md).
