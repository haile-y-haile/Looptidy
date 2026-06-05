# Build 26 — App Store Review Candidate Plan

**Date:** June 4, 2026  
**Status:** Planning audit only — **no code changes made yet**  
**Goal:** Final App Store review candidate. No new major features, no redesign, no scope expansion.

---

## Executive summary

Build 25 is functionally rich but has **App Store rejection risks** from dead UI, beta/TestFlight copy in production screens, outdated docs that contradict shipped behavior, automatic demo-data seeding, and a **split notification system** that requests permission on launch and may schedule duplicate reminders.

Build 26 should focus on **completing existing flows** (edit, reopen, archive, delete, attachment removal), **hardening storage and reminders**, **scrubbing beta language**, and **aligning documentation** — not adding product scope.

**Estimated touch surface:** ~25 files (code + docs), no EAS/config changes unless you approve splash image in `app.json`.

---

## Implementation order (recommended)

| Phase | Focus | Why first |
|-------|--------|-----------|
| **A** | App Store blockers (dead UI, beta copy, privacy URL prep) | Review rejection risk |
| **B** | Storage safety (no demo auto-seed, migration flag, error fallback) | Data integrity for existing TestFlight users |
| **C** | Reminder correctness (single notification path, no launch permission) | Permission + behavior bugs |
| **D** | Core loop CRUD completeness (edit, reopen, archive, delete, remove attachment) | Product completeness gaps |
| **E** | Documentation accuracy | Metadata/support alignment |
| **F** | Performance safety (Command Center list) | Only if time allows; can defer |

---

## 1. App Store blockers

### 1.1 Dead Sign in / Create account buttons

| | |
|---|---|
| **Issue** | Settings shows tappable-looking **Sign in** and **Create account** buttons with no `onPress` handlers. Apple Guideline 2.1 (App Completeness) flags non-functional UI. |
| **Files** | `app/(tabs)/settings.tsx` |
| **Proposed fix** | Remove the interactive Account card buttons. Replace with a single non-interactive informational block: *“LoopTidy stores all data locally on this device. Cloud accounts are not available in v1.”* Remove subtitle *“account features are on the way”* from the Settings hero (implies unfinished product). |
| **Risk** | **Low** |
| **Verify** | Settings screen: no pressable Sign in/Create account; no visual affordance suggesting auth works. |

### 1.2 Beta / TestFlight language in production UI

| | |
|---|---|
| **Issue** | Production-accessible screens still promote TestFlight beta access. |
| **Files** | `app/marketing.tsx`, `lib/links.ts`, `app/(tabs)/settings.tsx` (hero copy), optionally `README.md` / `SUPPORT.md` (repo docs, not in-app) |
| **Current offenders** | `marketing.tsx`: “Join the TestFlight beta”, “Install TestFlight”, “Request beta access”, “TestFlight beta — request an invite on GitHub”. `lib/links.ts`: `githubBetaRequest`, `testflightInstall`. |
| **Proposed fix** | Rewrite `marketing.tsx` CTAs for App Store context: **Open the app**, **Privacy Policy**, **Support** (email link). Remove TestFlight install/request links from in-app About screen. Keep GitHub issue links only in SUPPORT docs, not primary in-app CTAs. Update `lib/links.ts` with `privacyPolicy`, `supportEmail` (`mailto:haile.y.haile@gmail.com`). |
| **Risk** | **Low** |
| **Verify** | Navigate Settings → About LoopTidy: zero “TestFlight”, “beta”, or “invite” strings. |

### 1.3 Privacy Policy URL requirement

| | |
|---|---|
| **Issue** | App Store Connect requires a **public Privacy Policy URL**. `privacy-policy.md` exists but has placeholder `[Insert Your Contact Email Here]`. `PRIVACY.md` contradicts app behavior (claims no notifications; app uses local notifications + optional Face ID). |
| **Files** | `privacy-policy.md`, `PRIVACY.md`, `app/marketing.tsx` (link), optionally `lib/links.ts` |
| **Proposed fix** | Unify `privacy-policy.md` and `PRIVACY.md` content: local-first SQLite storage, local notifications (not remote push), optional Face ID app lock, no analytics/ads/accounts. Set contact to **haile.y.haile@gmail.com**. Host at a stable public URL (see **Manual actions**). Add in-app link from Settings or About. |
| **Risk** | **Low** (docs); **Medium** (URL must be live before submission) |
| **Verify** | URL loads in Safari; content matches actual app behavior; email is correct. |

### 1.4 App Store metadata readiness

| | |
|---|---|
| **Issue** | Not a code task — metadata must match v1 local-first reality. |
| **Manual actions (App Store Connect)** | See section **Manual actions in App Store Connect** below. |
| **Risk** | N/A (your action) |

### 1.5 Screenshot readiness

| | |
|---|---|
| **Issue** | No code change — screenshots must not show beta/TestFlight CTAs, dead auth buttons, or demo-only sample data unless labeled. |
| **Manual actions** | Capture on Build 26 device/simulator after blockers fixed: Today, Loops, Loop Detail (with reminder), Decisions, Settings, Dark mode. |
| **Risk** | N/A |

---

## 2. Core product completeness

### 2.1 Edit Loop flow — **MISSING**

| | |
|---|---|
| **Issue** | Loop detail is read-only for title, description, type, priority, person, due date, and attachments. Copy says *“Add a link when creating or editing a loop”* but no edit route exists. |
| **Files** | `app/(tabs)/loops/new.tsx` (extend for edit mode), `app/(tabs)/loops/_layout.tsx` (register screen), `app/(tabs)/loops/[id].tsx` (Edit button), `context/LoopContext.tsx` (`updateLoop` already exists) |
| **Proposed fix** | Add edit entry point on loop detail (header or action bar). Reuse `new.tsx` form with `?id=` param: prefill fields, title “Edit Loop”, call `updateLoop` instead of `addLoop`, preserve `id`/timeline/createdAt. |
| **Risk** | **Medium** — form has many fields; must not overwrite decisions/timeline on save. |
| **Verify** | Edit title/description/type → persists after force-quit; existing timeline/decisions unchanged. |

### 2.2 Reopen loop — **MISSING**

| | |
|---|---|
| **Issue** | `closeLoop` sets `status: 'closed'`. Closed loops hide ReminderPanel and action bar. No way to reopen. |
| **Files** | `app/(tabs)/loops/[id].tsx`, `context/LoopContext.tsx` (add `reopenLoop` or use `updateLoop`) |
| **Proposed fix** | On closed/archived detail: show **Reopen loop** button → set status back to appropriate open status (derive from `type` via existing `statusForType` in `new.tsx`), clear `closedAt`, append timeline event. |
| **Risk** | **Low** |
| **Verify** | Close loop → appears in Closed filter → reopen → returns to open filters and Today. |

### 2.3 Archive loop — **MISSING (type exists, no UI)**

| | |
|---|---|
| **Issue** | `OpenLoop.status` includes `'archived'`; filters treat archived like closed. No user action sets archived. |
| **Files** | `app/(tabs)/loops/[id].tsx`, `context/LoopContext.tsx` |
| **Proposed fix** | Add **Archive** action (distinct from Close) on open loop detail → `status: 'archived'`, timeline event, cancel reminder. Closed = done; Archived = off active lists but kept for history. |
| **Risk** | **Low–Medium** — needs clear UX copy so users understand Close vs Archive. |
| **Verify** | Archive → shows under Closed filter → does not appear in Today/Up Next. |

> **Needs my approval:** Is **Archive** required for v1, or is **Close + Reopen + Delete** sufficient? If Archive adds confusion, defer Archive and ship Close/Reopen/Delete only.

### 2.4 Delete loop — **MISSING**

| | |
|---|---|
| **Issue** | No permanent delete. Users can only close loops or wipe all data in Backup danger zone. |
| **Files** | `context/LoopContext.tsx`, `lib/storage.ts`, `app/(tabs)/loops/[id].tsx` |
| **Proposed fix** | Add `deleteLoop(id)`: remove from SQLite, cancel notification, confirm via destructive Alert. Place in loop detail overflow/menu (closed loops too). |
| **Risk** | **Medium** — irreversible; must require confirmation. |
| **Verify** | Delete loop → gone from all lists → notification canceled → survives app restart as deleted. |

### 2.5 Remove attachment — **MISSING**

| | |
|---|---|
| **Issue** | Attachments can be added in `new.tsx` but not removed in detail or edit. |
| **Files** | `app/(tabs)/loops/[id].tsx`, edit form in `new.tsx` |
| **Proposed fix** | Add remove (×) control on each attachment in detail and edit form → `updateLoop` with filtered `attachments` array. |
| **Risk** | **Low** |
| **Verify** | Add link → remove → gone after reload. |

### 2.6 Prevent automatic demo data for real users — **BUG**

| | |
|---|---|
| **Issue** | `lib/storage.ts` → `getLoops()` calls `seedMockLoops()` when SQLite has zero loops. Fresh App Store installs get fake “Alex / Jordan” demo loops automatically. Error path also returns in-memory `mockLoops`. |
| **Files** | `lib/storage.ts`, `lib/db.ts` (remove unused `mockLoops` import if possible), `context/LoopContext.tsx` (empty state handling) |
| **Proposed fix** | On empty DB: return `[]`. On read error: return `[]` and set error flag in context (show “Could not load data” with retry). Keep demo seed **only** via Backup & Restore → “Reset demo data” (`resetToDemoData`). |
| **Risk** | **Medium** — must not re-seed when user intentionally deletes all loops. Must not affect users with existing SQLite rows. |
| **Verify** | Fresh install → empty Loops/Today. Existing TestFlight DB with real loops → unchanged. Delete all loops → stays empty (no mock reappear). Backup “Reset demo data” still works. |

---

## 3. Reminder correctness

### 3.1 No notification permission on app launch — **BUG**

| | |
|---|---|
| **Issue** | `components/NotificationsHandler.tsx` calls `setupNotifications()` on mount/`loops` change. `lib/notifications.ts` → `setupNotifications()` calls `requestPermissionsAsync()` when not granted. This triggers the iOS permission dialog at launch. |
| **Files** | `lib/notifications.ts`, `components/NotificationsHandler.tsx` |
| **Proposed fix** | Split setup: **`configureNotifications()`** — handler + notification categories only, **no permission request**. Permission stays in `lib/reminders.ts` → `requestReminderPermission()`, called only when user sets a reminder (already in `ReminderPanel` and `new.tsx`). |
| **Risk** | **Low** |
| **Verify** | Fresh install → open app → no permission dialog. Set reminder on loop detail → dialog appears once. |

### 3.2 Duplicate notification systems — **RISKY**

| | |
|---|---|
| **Issue** | Two parallel APIs: `lib/reminders.ts` (loop-aware, cancels by `localNotificationId`) and `lib/notifications.ts` (generic id, used by `NotificationsHandler`). `LoopContext.tsx` imports from `notifications.ts` but **does not use them** (dead imports). Handler may schedule notifications without storing `localNotificationId` on the loop → duplicates and orphaned schedules. |
| **Files** | `lib/notifications.ts`, `lib/reminders.ts`, `components/NotificationsHandler.tsx`, `context/LoopContext.tsx`, `components/ReminderPanel.tsx`, `app/(tabs)/loops/new.tsx` |
| **Proposed fix** | **Consolidate on `lib/reminders.ts`** as single source. `NotificationsHandler` either: (a) removed entirely if ReminderPanel/new handle scheduling, or (b) rewritten to sync using `reminders.ts` helpers and respect `localNotificationId`, rescheduling when `reminderAt`/`snoozedUntil` changes. Keep response listener for SNOOZE/CLOSE in one place. |
| **Risk** | **High** — notification regressions are hard to spot without device testing. |
| **Verify** | Set reminder → one scheduled notification. Change time → old canceled, new scheduled, `localNotificationId` updated. Clear → canceled. Snooze → rescheduled. Close/delete loop → canceled. No permission on cold start. |

### 3.3 Changing reminder time — **PARTIAL GAP**

| | |
|---|---|
| **Issue** | `ReminderPanel` allows set/snooze/clear but **no “Change time”** when a reminder exists (must clear and re-set). `applyUpdate` + `scheduleLoopReminder` in `reminders.ts` already cancel old ID before scheduling. |
| **Files** | `components/ReminderPanel.tsx` |
| **Proposed fix** | When `hasReminder`, show **Change time** → datetime picker → `applyUpdate({ reminderAt, snoozedUntil: undefined })`. |
| **Risk** | **Low** |
| **Verify** | Set reminder → Change time → fires at new time; old notification canceled. |

### 3.4 Close / delete loop must cancel reminder — **BUG**

| | |
|---|---|
| **Issue** | `closeLoop` in `LoopContext.tsx` does not call `cancelLoopReminder`. `deleteLoop` (to be added) must also cancel. |
| **Files** | `context/LoopContext.tsx` |
| **Proposed fix** | Before persisting close/delete/archive: `await cancelLoopReminder(loop)` and clear `localNotificationId` / reminder fields as appropriate. |
| **Risk** | **Low** |
| **Verify** | Set reminder → close loop → notification no longer in scheduled list. |

### 3.5 Keep local notifications only

| | |
|---|---|
| **Issue** | `plugins/withRemovePushEntitlement` already removes push entitlement. Plan must not add remote push. |
| **Files** | No change planned to `eas.json`, `app.json` plugins, or push entitlements. |
| **Risk** | **None** if scope held. |
| **Verify** | Confirm no `aps-environment` entitlement; privacy copy says local only. |

---

## 4. Storage safety

### 4.1 SQLite fallback must not show mock loops — **BUG**

| | |
|---|---|
| **Issue** | `getLoops()` catch block returns `cloneLoops(mockLoops)`. Storage failure shows fake data. |
| **Files** | `lib/storage.ts`, `context/LoopContext.tsx` |
| **Proposed fix** | Return `[]` on error; expose `loadError` in context; show retry UI on Today/Loops. |
| **Risk** | **Low** |
| **Verify** | Simulate DB failure (dev-only) → empty UI + error, not demo loops. |

### 4.2 Migration-done flag — **OPTIMIZATION + SAFETY**

| | |
|---|---|
| **Issue** | `migrateFromAsyncStorageIfNeeded()` runs a SQLite `COUNT(*)` on every `getLoops()` call, then may read AsyncStorage if count is 0. Unnecessary work every startup; edge case: user with empty SQLite but cleared migration source could re-trigger logic. |
| **Files** | `lib/db.ts`, `lib/preferences.ts` |
| **Proposed fix** | Add `@looptidy/asyncStorageMigrated` flag in preferences. After successful migration (or confirmed empty source), set flag. Skip migration when flag is true. **Do not delete** AsyncStorage source until migration verified (or leave as harmless duplicate). |
| **Risk** | **Medium** — incorrect flag could skip migration for legacy TestFlight users still on AsyncStorage-only data. Mitigation: set flag only after successful insert OR confirmed no AsyncStorage key. |
| **Verify** | Existing SQLite user → one-time no-op. Legacy AsyncStorage user (simulate) → migrates once, flag set, data preserved on relaunch. |

### 4.3 Preserve existing TestFlight user data

| | |
|---|---|
| **Issue** | Any change to `getLoops`, migration, or seed logic could wipe or overwrite real data. |
| **Files** | `lib/storage.ts`, `lib/db.ts` |
| **Proposed fix** | No schema destructive changes. No `DELETE FROM documents` except explicit user actions. Migration is insert-only. Demo seed removal only affects **empty** database. |
| **Risk** | **High** if seed/migration logic wrong — treat as **risky**, test with exported backup from Build 25 before shipping. |
| **Verify** | Restore Build 25 backup JSON on Build 26 → all loops/reviews/scope/feedback intact. |

---

## 5. Documentation accuracy

| Doc | Issue | Proposed fix | Risk |
|-----|-------|--------------|------|
| `README.md` | Says AsyncStorage for loops; says no push notifications; TestFlight-first framing; mock auth on onboarding | Loops: **SQLite** (+ AsyncStorage for prefs/scope/feedback/reviews). **Local notifications** supported. Onboarding: Get started only. App Store availability wording. | Low |
| `CHANGELOG.md` | “Not in this release: Push notifications or local reminders”; AsyncStorage for loops | Add Build 26 section; mark reminders, SQLite, backup, Face ID opt-in as shipped | Low |
| `ROADMAP.md` | Lists tabs, search, export, reminders as **Next**; mentions brand splash (removed) | Move shipped items to “Complete”; keep only genuine future work | Low |
| `PRIVACY.md` | “Does not send push notifications”; TestFlight-only framing; GitHub-only contact | Local notifications + Face ID; App Store release; **haile.y.haile@gmail.com** | Low |
| `SUPPORT.md` | TestFlight-centric; “No push notifications”; “Some Settings items are placeholders” | Support email primary; local notifications documented; remove placeholder note after Settings fix | Low |
| `privacy-policy.md` | Placeholder email | **haile.y.haile@gmail.com**; align with PRIVACY.md | Low |
| `docs/MVP.md` | AsyncStorage + mock seed on first launch | Update to SQLite, no auto-seed (optional: note as internal doc only) | Low |

**Verify:** Grep docs for `AsyncStorage` (loop storage), `no push`, `placeholder`, `TestFlight beta`, `coming soon` — only historical CHANGELOG entries remain.

---

## 6. App polish

### 6.1 Static logo only — **OK**

| | |
|---|---|
| **Finding** | `LogoMark` → `assets/logo-official.png`. No `AnimatedLogo`, `lottie`, or `expo-video` references in codebase. |
| **Action** | None required. Grep verification only during implementation. |

### 6.2 Splash image missing in app.json — **GAP**

| | |
|---|---|
| **Issue** | `app.json` splash has `backgroundColor` only. `assets/splash-icon.png` exists but is unused. Native splash may show blank color flash. |
| **Files** | `app.json` (expo.splash.image + `expo-splash-screen` plugin image) |
| **Proposed fix** | Add `"image": "./assets/splash-icon.png"` to splash config and plugin. Static image only. |
| **Risk** | **Low** |
| **Verify** | Cold start shows static logo on splash background; no animation. |

### 6.3 Dead buttons / placeholder UI

| Item | Location | Fix |
|------|----------|-----|
| Sign in / Create account | `settings.tsx` | §1.1 |
| TestFlight CTAs | `marketing.tsx` | §1.2 |
| “account features are on the way” | `settings.tsx` hero | Remove or reword |
| Attachments “editing” copy without edit | `[id].tsx` | §2.1 + §2.5 |

### 6.4 Broken links

| | |
|---|---|
| **Finding** | In-app routes verified in Build 25 QA. `lib/links.ts` beta URLs need replacement for production About screen. |
| **Action** | Update links as part of §1.2 / §1.3. |

---

## 7. Performance safety

### 7.1 Keep Loops FlatList — **NO CHANGE**

| | |
|---|---|
| **Finding** | `app/(tabs)/loops/index.tsx` uses `Animated.FlatList` with `ListHeaderComponent`. Keep as-is. |
| **Action** | Regression check only. |

### 7.2 Command Center large result rendering — **GAP**

| | |
|---|---|
| **Issue** | `app/(tabs)/loops/command-center.tsx` maps `results.map(...)` inside `ScreenScroll` — same pre-Build-25 Loops problem. Large result sets render all `LoopCard`s at once. |
| **Files** | `app/(tabs)/loops/command-center.tsx` |
| **Proposed fix** | Extract loop results into `Animated.FlatList` with header containing filters/search (mirror Loops tab pattern). Scope/feedback aux results can stay as small mapped lists. |
| **Risk** | **Medium** — layout/safe-area/tab-bar regression possible. |
| **Verify** | Command Center with 100+ results scrolls smoothly; filters/search/sort still work; empty state intact. |

> **Recommendation:** Include in Build 26 if time allows; otherwise defer post-launch (see Deferrals). Not an App Store blocker for typical data sizes.

### 7.3 Do not introduce ScrollView/map for huge lists

| | |
|---|---|
| **Rule** | Any new list work uses FlatList/SectionList virtualization. |
| **Other screens to watch** | `app/ownership.tsx` (SectionList-style sections), `app/(tabs)/decisions.tsx` (ScreenScroll + maps), `app/people/index.tsx` (map). Acceptable for v1 unless profiling shows issues. |

---

## 8. Minor cleanup (included in Build 26)

| File | Issue | Fix | Risk |
|------|-------|-----|------|
| `context/LoopContext.tsx` | Unused imports from `lib/notifications.ts` | Remove after notification consolidation | Low |
| `lib/db.ts` | Unused `mockLoops` import | Remove when seed logic removed | Low |
| `lib/loopSearch.ts` | Index keyed on array reference | Already optimized in Build 25; no change | — |

---

## Needs my approval before implementation

1. **Archive vs Close only** — Ship Archive action, or limit to Close + Reopen + Delete?
2. **Privacy Policy hosting URL** — Options:
   - GitHub raw: `https://raw.githubusercontent.com/haile-y-haile/Looptidy/main/privacy-policy.md`
   - GitHub Pages / dedicated site (preferred for App Store polish)
   - Paste into App Store Connect only (no in-app link)
3. **First-launch empty state** — Confirm: zero loops on fresh install (no sample data prompt)?
4. **Account section** — Remove card entirely vs keep informational text only?
5. **Command Center FlatList** — Include in Build 26 or defer?
6. **Notification consolidation approach** — Remove `NotificationsHandler` sync entirely vs rewrite to use `reminders.ts`?

---

## Manual actions in App Store Connect (your work)

- [ ] **Privacy Policy URL** — live link matching `privacy-policy.md` content
- [ ] **Support URL** — GitHub SUPPORT.md or simple support page with **haile.y.haile@gmail.com**
- [ ] **App description** — local-first, no account required, local reminders (not push)
- [ ] **Keywords / subtitle** — open loops, follow-ups, decisions (no “beta”)
- [ ] **Screenshots** — 6.7" and 6.5" iPhone, light + dark; no TestFlight CTAs
- [ ] **App Review notes** — explain local-only data, Face ID opt-in in Settings, how to test reminders
- [ ] **Age rating questionnaire** — no unrestricted web, no accounts
- [ ] **Export compliance** — already `ITSAppUsesNonExemptEncryption: false`
- [ ] **Version/build** — 1.0.0 (26) after EAS autoIncrement

---

## Recommend deferring until after App Store launch

| Item | Reason |
|------|--------|
| Real account system / cloud sync | Explicitly out of scope |
| Command Center FlatList | Performance polish, not review blocker |
| Reduced Motion guards for Reanimated | Accessibility enhancement |
| People / Decisions / Ownership FlatList virtualization | Low traffic paths |
| `assets/splash-icon.png` orphan cleanup | Non-blocking if splash configured |
| npm audit vulnerabilities | Dependency churn risk before review |
| Sign-in UI for future accounts | Post-launch monetization |

---

## Verification checklist (post-implementation, pre-EAS)

```bash
npm install
npx expo-doctor
npx tsc --noEmit
npx expo export --platform ios
```

**Manual iPhone checks:**

- [ ] Fresh install: empty loops, no demo data, no notification permission on launch
- [ ] Create → edit → close → reopen → delete loop
- [ ] Add/remove attachment
- [ ] Set → change → snooze → clear reminder; close loop cancels notification
- [ ] Settings: no dead buttons; About: no TestFlight copy
- [ ] Restore Build 25 backup → data intact
- [ ] Face ID lock (opt-in) still works
- [ ] Loops tab FlatList still smooth

---

## Files expected to modify (summary)

| Area | Files |
|------|-------|
| App Store blockers | `app/(tabs)/settings.tsx`, `app/marketing.tsx`, `lib/links.ts`, `privacy-policy.md`, `PRIVACY.md` |
| Core CRUD | `app/(tabs)/loops/new.tsx`, `app/(tabs)/loops/_layout.tsx`, `app/(tabs)/loops/[id].tsx`, `context/LoopContext.tsx` |
| Storage | `lib/storage.ts`, `lib/db.ts`, `lib/preferences.ts` |
| Reminders | `lib/notifications.ts`, `lib/reminders.ts`, `components/NotificationsHandler.tsx`, `components/ReminderPanel.tsx`, `context/LoopContext.tsx` |
| Polish | `app.json` |
| Performance | `app/(tabs)/loops/command-center.tsx` (if approved) |
| Docs | `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `SUPPORT.md`, `docs/MVP.md` (optional) |

**Not modifying (per instructions):** `eas.json`, bundle ID, app name, EAS profiles, TestFlight ASC app ID config.

---

## Stop point

**Waiting for your approval** before any code, commit, push, or EAS build.

Please confirm:

1. Approval of overall plan (or section-by-section)
2. Answers to **Needs my approval** items (Archive, privacy URL, empty first launch, Account card, Command Center FlatList, notification approach)

Once approved, implementation will proceed in phase order A → F with verification after each phase.
