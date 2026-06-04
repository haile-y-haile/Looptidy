# Post-Cleanup Runtime QA Report

**Date:** June 4, 2026  
**Scope:** Verify runtime safety, navigation, persistence, list performance, and TestFlight readiness after cleanup + performance pass. No new features or scope changes.

---

## Verification Commands & Results

| Command | Result |
|---------|--------|
| `npm install` | ✅ Passed — 907 packages, no install errors |
| `npx expo-doctor` | ✅ **18/18 checks passed** |
| `npx tsc --noEmit` | ✅ Passed — zero TypeScript errors |
| `npx expo export --platform ios` | ✅ Passed — 2201 modules bundled, iOS HBC **6.5 MB** |

---

## 1. Navigation

### Bottom tabs (verified via route config + link audit)

| Tab | Route | Status |
|-----|-------|--------|
| Today | `(tabs)/index` | ✅ Registered, `headerShown: false` |
| Loops | `(tabs)/loops` | ✅ Registered, nested stack for detail/new/command-center |
| Decisions | `(tabs)/decisions` | ✅ Registered |
| Settings | `(tabs)/settings` | ✅ Registered |

### Linked routes (verified in `app/_layout.tsx` + nested stacks)

| Route | Entry points | Status |
|-------|--------------|--------|
| New Loop | Loops `+`, Today CTA, Command Center, QuickCaptureSheet | ✅ `/loops/new` |
| Loop Detail | LoopCard, Spotlight, notifications | ✅ `/loops/[id]` |
| Command Center | Loops tools row | ✅ `/loops/command-center` |
| Insights | Today footer, Loops tools row | ✅ `/insights` |
| Decision Speed | Decisions tab, Command Center, loop detail | ✅ `/decision-speed` |
| Ownership | Command Center tools | ✅ `/ownership` |
| Scope Guard | Command Center tools + scope results | ✅ `/scope-guard` |
| Feedback | Command Center tools + feedback results | ✅ `/feedback` |
| Weekly Review | Today banner/footer, Command Center | ✅ `/weekly-review` |
| Backup/Restore | Settings → Data | ✅ `/backup-restore` |
| People | Today footer, Command Center | ✅ `/people` + `/people/[personKey]` |
| Legacy redirects | `/waiting`, `/promised` | ✅ Redirect to Loops with filter param |

**Global FAB:** Spotlight search overlay wired via `SpotlightProvider` + `GlobalFAB` on all tab screens.

---

## 2. Removed Component Safety

Grep across all `.ts`/`.tsx`/`.json` files for deleted symbols:

| Removed item | References found |
|--------------|------------------|
| `ActionTile` | ✅ None |
| `SectionHeader` | ✅ None |
| `ComingSoonBadge` | ✅ None |
| `loopTidyLogoPaths` | ✅ None |
| `AnimatedLogo` | ✅ None |
| `LoopTidyLogoSvg` | ✅ None |
| `lottie-react-native` | ✅ None (not in `package.json`) |
| `lib/apple` | ✅ None |
| `lib/comingSoon` | ✅ None |
| `BrandSplash` / `StaticLogo` / `expo-video` | ✅ None |

---

## 3. Startup Behavior

| Check | Finding |
|-------|---------|
| App launches cleanly | ✅ SplashGate waits for fonts + theme hydration + SQLite load, then hides native splash |
| Onboarding does not hang | ✅ Routes to `/onboarding` when incomplete; `Get started` sets preference and replaces to `/` |
| Static logo | ✅ `LogoMark` uses `assets/logo-official.png`; onboarding uses gradient wordmark (no animated logo) |
| No animated logo | ✅ No Lottie, MP4, or SVG logo animation code remains |
| Face ID only when enabled | ⚠️ **Was broken** — prompted on every launch if biometrics enrolled. **Fixed:** opt-in via Settings toggle (default off) |
| Face ID cancel does not hang | ⚠️ **Was broken** — infinite spinner on cancel. **Fixed:** lock screen with static logo + Unlock retry button |

---

## 4. Local Persistence (code-path verification)

All data types persist via SQLite (`lib/db.ts` + `lib/storage.ts`) or AsyncStorage:

| Operation | Storage path | Status |
|-----------|-------------|--------|
| Create loop | `saveLoops` → SQLite `documents` | ✅ |
| Edit loop | `updateLoop` → `saveLoops` + history | ✅ |
| Close loop | `closeLoop` → `saveLoops` | ✅ |
| Add reminder | `updateLoop` with reminder fields + `NotificationsHandler` sync | ✅ |
| Add feedback | `FeedbackContext` → AsyncStorage | ✅ |
| Add scope change | `ScopeContext` → AsyncStorage | ✅ |
| Add decision | `addDecision` → loop document in SQLite | ✅ |
| AsyncStorage migration | `migrateFromAsyncStorageIfNeeded` on first load | ✅ |
| Undo | `undoLastAction` → history table (last 20 states) | ✅ |

**Manual iPhone test required:** Force-quit and relaunch to confirm data survives.

---

## 5. Screen-Level Smoke Test (static review)

| Screen | Imports | Empty states | Dark mode | Scrolling | Safe areas |
|--------|---------|--------------|-----------|-----------|------------|
| Today | ✅ | ✅ focus + up-next empty | ✅ theme tokens | ✅ ScreenScroll + FlatList (Up Next) | ✅ insets.top |
| Loops | ✅ | ✅ filter + search empty | ✅ | ✅ FlatList (post-fix) | ✅ header padding |
| Decisions | ✅ | ✅ per-section empty | ✅ | ✅ ScreenScroll | ✅ |
| Settings | ✅ | N/A | ✅ appearance pills | ✅ ScreenScroll | ✅ |
| Command Center | ✅ | ✅ filter empty copy | ✅ | ✅ ScreenScroll | ✅ |
| Insights | ✅ | ✅ chart fallbacks | ✅ | ✅ ScreenScroll | ✅ |
| Weekly Review | ✅ | ✅ | ✅ | ✅ ScreenScroll | ✅ |
| Loop Detail | ✅ | ✅ attachments empty | ✅ | ✅ ScreenScroll | ✅ |
| Backup/Restore | ✅ | N/A | ✅ | ✅ ScreenScroll | ✅ |

**Note:** Settings “Sign in” / “Create account” buttons are presentational only (no handler) — intentional placeholder, not a regression.

---

## 6. Loops Tab — FlatList Regression

| Check | Status |
|-------|--------|
| Screen renders | ✅ `Animated.FlatList` with `ListHeaderComponent` |
| Header (title, tools, search, filters) | ✅ In header component |
| Loop cards render | ✅ `renderItem` → `LoopCard` |
| Scrolling / virtualization | ✅ FlatList (not ScrollView map) |
| Empty state | ✅ `ListEmptyComponent` with filter-aware copy |
| Search/filter | ✅ `useMemo` → `getLoopsForFilter` + `filterLoopsByQuery` |
| Layout / spacing | ⚠️ **Was missing tab-bar bottom padding.** **Fixed:** `paddingBottom: 100 + insets.bottom` (iOS) |
| Keyboard during search | ✅ `keyboardShouldPersistTaps="handled"` added |

---

## 7. Command Center & Search

| Check | Status |
|-------|--------|
| Search accuracy | ✅ `queryCommandCenter` uses `filterLoopsByQuery` (MiniSearch) |
| Filtering | ✅ 12 filter chips + reminder sub-filters |
| Sorting | ✅ SortSheet with urgent/recent/risk sorts |
| Empty search state | ✅ `getCommandCenterEmptyState` |
| Zero loops | ✅ Returns empty results, no crash |
| Index memoization | ✅ Rebuilds only when loops array reference changes |

**Known limitation (not a regression):** Command Center still maps loop results inside `ScreenScroll` (not FlatList). Acceptable for typical dataset sizes; large-library virtualization is a future optimization.

---

## 8. Backup/Restore

| Check | Status |
|-------|--------|
| Full JSON export | ✅ loops + weeklyReviews + scopeChanges + feedbackItems |
| CSV exports | ✅ open loops, decisions, reviews, scope, feedback |
| Import validation | ✅ `validateBackupJson` checks version + loops array |
| Restore confirmation | ✅ Destructive alert before replace |
| Delete all confirmation | ✅ Destructive alert in danger zone |
| Reset demo / scope / feedback | ✅ Each requires confirmation alert |

---

## 9. Notifications/Reminders

| Check | Status |
|-------|--------|
| Permission flow | ✅ `setupNotifications` requests permission; web skipped |
| Handler registration | ✅ `NotificationsHandler` in root layout |
| Reminder sync | ✅ Syncs scheduled notifications with open loops on `loops` change |
| Actionable notifications | ✅ SNOOZE_1_DAY, CLOSE_LOOP categories |
| Reminder badges on cards | ✅ `LoopCard` shows due-today / snoozed / overdue badges |
| Tap opens loop | ✅ `router.push(/loops/${loopId})` |

**Manual iPhone test required:** Grant/deny notification permission, schedule reminder, verify badge + notification fire.

---

## 10. Static Logo & Assets

| Asset | Reference | Status |
|-------|-----------|--------|
| `assets/logo-official.png` | `LogoMark`, lock screen | ✅ Valid |
| `assets/icon.png` | `app.json` icon | ✅ Valid (479 kB in bundle) |
| `assets/splash-icon.png` | Not referenced | ℹ️ Orphan file — safe to keep or remove later |
| Splash config | `app.json` — backgroundColor only, no image | ✅ No deleted splash image referenced |
| Android adaptive icons | `app.json` | ✅ All three files exist |

---

## 11. Issues Found & Fixed

| Issue | Severity | Fix |
|-------|----------|-----|
| Face ID prompted on every launch regardless of user preference | **High** | Added `getBiometricLockEnabled` preference (default off) + Settings toggle |
| App stuck on spinner when Face ID canceled | **High** | Lock screen with Unlock retry instead of infinite loading |
| Loops FlatList missing tab-bar bottom inset | **Medium** | Added platform-aware bottom padding |
| Loops FlatList missing keyboard persist taps | **Low** | Added `keyboardShouldPersistTaps="handled"` |
| LoopCard re-rendered on unrelated list scroll | **Low** | Wrapped in `React.memo` keyed on `id` + `updatedAt` |

---

## 12. Items Needing Manual iPhone / TestFlight Testing

- [ ] Cold start → onboarding → main app flow on physical device
- [ ] Enable App lock in Settings → Face ID prompt → cancel → Unlock retry
- [ ] Create/edit/close loop → force quit → relaunch → data intact
- [ ] Loops tab scroll performance with 100+ loops
- [ ] Swipe actions (Nudge / Snooze / Close) haptics and animation at 60fps
- [ ] Bottom sheet Quick Capture open/close
- [ ] Spotlight search (Global FAB) with typos
- [ ] Local notification fires at scheduled time; snooze/close actions work
- [ ] Backup export via share sheet → re-import on same device
- [ ] Dark mode toggle across all major screens
- [ ] Reduce Motion (iOS Accessibility) — animations still play; no explicit reduced-motion guard exists yet

---

## Verdict

**Codebase is TestFlight-ready from a static/runtime-safety perspective.** All build checks pass. Two high-severity startup bugs (Face ID) were fixed during this pass. Remaining validation is device-level interaction testing on iPhone.
