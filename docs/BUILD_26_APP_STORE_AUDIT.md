# Build 26 — App Store Audit

**Date:** June 4, 2026  
**Branch:** `main`  
**Version:** 1.0.0 (build 26)  
**Contact:** hello.hailelabs@gmail.com

Build 26 is the App Store review candidate. Scope was limited to blockers, correctness fixes, lifecycle controls, performance, and documentation — no new major modules or redesign.

---

## App Store blockers fixed

| Blocker | Fix |
|---------|-----|
| Dead **Sign in** / **Create account** buttons in Settings | Removed; replaced with local-first informational copy |
| TestFlight / beta CTAs in production UI | `app/marketing.tsx` rewritten for App Store context; beta links removed from `lib/links.ts` |
| Privacy policy contact placeholder | Unified on **hello.hailelabs@gmail.com** across docs and in-app links |
| No hosted Privacy Policy URL plan | Added `docs/PRIVACY_POLICY_HOSTING.md` with target URL `https://haile-y-haile.github.io/Looptidy/privacy` |
| Automatic demo loop seeding on fresh install | `getLoops()` returns `[]` when empty; demo only via explicit **Load sample loops** in Backup & Restore |
| Mock data fallback on SQLite errors | Removed; storage no longer returns `mockLoops` on failure |
| Notification permission on app launch | Removed; permission requested only when user sets a reminder |
| Split / duplicate reminder scheduling | Consolidated on `lib/reminders.ts` as single source of truth |

---

## High-priority fixes completed

### Storage & fresh install

- Loops persist in SQLite; legacy AsyncStorage migration runs once with `@looptidy/asyncStorageMigrated` flag
- New installs start empty
- **Load sample loops** (Backup & Restore) is the only path to demo data
- Deleting all loops does not re-seed on relaunch

### Reminders & notifications

- `scheduleLoopReminder` / `cancelLoopReminder` in `lib/reminders.ts`
- Setting, changing, clearing, and snoozing reminders update scheduled local notifications correctly
- Close, archive, and delete cancel reminders for that loop
- `lib/notifications.ts` deprecated to thin re-exports
- `withRemovePushEntitlement` plugin unchanged (local notifications only)

### Loop lifecycle & editing

- **Edit loop** via `loops/new?id=…`
- **Archive** — hides from open views, confirmation, timeline event, cancels reminder
- **Reopen** — restores closed/archived to active, timeline event
- **Delete** — confirmation, cancels reminder, removes loop
- Attachment remove in edit and detail flows

### Command Center performance

- Main results converted from ScrollView + map to `Animated.FlatList`
- Search, filters, sorting, empty states, dark mode, and navigation preserved

### Settings & About

- Privacy Policy and Support rows link to hosted URL and mailto
- Splash image path fixed in `app.json`

---

## Files changed

### App & UI

- `app/(tabs)/settings.tsx`
- `app/marketing.tsx`
- `app/(tabs)/loops/[id].tsx`
- `app/(tabs)/loops/new.tsx`
- `app/(tabs)/loops/command-center.tsx`
- `app/backup-restore.tsx`
- `components/NotificationsHandler.tsx`
- `components/ReminderPanel.tsx`
- `context/LoopContext.tsx`

### Libraries

- `lib/storage.ts`
- `lib/db.ts`
- `lib/preferences.ts`
- `lib/reminders.ts`
- `lib/notifications.ts`
- `lib/links.ts`

### Config & docs

- `app.json` (build 26, splash)
- `README.md`, `CHANGELOG.md`, `ROADMAP.md`
- `PRIVACY.md`, `privacy-policy.md`, `SUPPORT.md`
- `docs/PRIVACY_POLICY_HOSTING.md`
- `docs/BUILD_26_PLAN.md`

---

## Verification results

| Check | Result |
|-------|--------|
| `npm install` | Pass |
| `npx expo-doctor` | 18/18 checks passed |
| `npx tsc --noEmit` | Pass |
| `npx expo export --platform ios` | Pass (bundle exported to `dist/`) |

EAS build was **not** run per instructions.

---

## Manual App Store Connect tasks

1. **Publish privacy policy** at `https://haile-y-haile.github.io/Looptidy/privacy` (GitHub Pages or equivalent HTML page — not raw markdown)
2. **Set Privacy Policy URL** in App Store Connect
3. **Set Support URL** or support contact — **hello.hailelabs@gmail.com**
4. **Update app description** — no TestFlight/beta wording; reflect local-first, SQLite, local reminders
5. **Capture screenshots** (6.7" and 6.5" iPhone, light + dark) — must not show dead auth buttons, TestFlight CTAs, or unlabeled demo data
6. **Review notes for App Review** — explain local-only storage, optional Face ID, notification permission on reminder set only, no accounts/cloud
7. **Increment build in ASC** when uploading build 26 from EAS (`eas build --platform ios --profile production`)
8. **App Privacy questionnaire** — no data collection to developer servers; local notifications; optional biometrics if enabled

---

## Manual iPhone / TestFlight checklist

- [ ] Fresh install → empty Today and Loops (no Alex/Jordan demo loops)
- [ ] Settings → no Sign in / Create account buttons; local-first copy visible
- [ ] About → no TestFlight / beta CTAs; Privacy and Support links work
- [ ] Create loop → edit loop → fields and attachments persist
- [ ] Set reminder → permission prompt appears; notification fires at scheduled time
- [ ] Change reminder time → old notification replaced
- [ ] Clear reminder → notification cancelled
- [ ] Snooze from notification → reschedules correctly
- [ ] Close / archive / delete loop → reminder cancelled
- [ ] Archive → loop hidden from open views; accessible via filters/history if applicable
- [ ] Reopen archived/closed loop → active again with timeline event
- [ ] Delete loop → confirmation required; loop removed
- [ ] Backup & Restore → **Load sample loops** loads demo data only when confirmed
- [ ] Delete all local data → relaunch stays empty
- [ ] Command Center with 50+ loops → scroll performance acceptable
- [ ] Optional Face ID lock → enable, background app, unlock works
- [ ] Dark mode across main tabs

---

## Items intentionally deferred

- Real account system and cloud sync
- Remote push notifications
- Analytics, ads, in-app purchases
- AI-assisted capture or triage
- Redesign or new major product modules
- EAS production build (manual step after review)
- GitHub Pages privacy HTML page (hosting doc provided; publish before ASC submission)
- `npm audit` dependency vulnerabilities (pre-existing; not in Build 26 scope)
- Historical docs (`docs/POST_CLEANUP_QA.md`, `docs/PERFORMANCE_AUDIT.md`, `BUILD.md` TestFlight framing) — not production-facing

---

## Privacy & support contact

**hello.hailelabs@gmail.com** — use everywhere in App Store Connect, review notes, and public support.
