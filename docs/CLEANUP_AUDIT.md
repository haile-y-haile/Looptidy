# LoopTidy Codebase Cleanup Audit

**Date:** June 3, 2026

## 1. Files Removed
The following files were removed because they were completely unused (abandoned components, old logo animations, dead helpers):
- `lib/loopTidyLogoPaths.ts` (Abandoned logo SVG paths)
- `components/ComingSoonBadge.tsx` (Unused after removing "Coming Soon" placeholders)
- `lib/comingSoon.ts` (Unused after removing "Coming Soon" placeholders)
- `components/ActionTile.tsx` (Unused tile component)
- `components/SectionHeader.tsx` (Unused section header component)
- `lib/apple.ts` (Unused apple-specific helper)

## 2. Dependencies Removed
The following NPM packages were removed from `package.json` because they were installed but not imported anywhere:
- `lottie-react-native` (Abandoned animated splash experiment)

*Note: `link-preview-js` and `expo-intent-launcher` remain for safety or are used by other packages, but `lottie-react-native` was explicitly confirmed unused.*

## 3. Duplicate Code Consolidated / Exports Cleaned
The following functions/types were verified as unused externally (via `knip` and manual inspection) and had their `export` declarations removed, or were deleted entirely:
- `sortLoops` in `lib/commandCenter.ts` (Made internal)
- `getFeedbackByStatus` in `lib/feedback.ts` (Deleted)
- `convertFeedbackToDecisionInput` in `lib/feedback.ts` (Deleted)
- `buildFeedbackSearchHaystack` in `lib/feedback.ts` (Made internal)
- `quickActionIcons` in `lib/icons.ts` (Deleted)
- `buildSearchHaystack` in `lib/loopSearch.ts` (Deleted)
- `buildPersonNudge` in `lib/nudge.ts` (Made internal)
- `findPersonKey` in `lib/people.ts` (Deleted)
- `getReminderPermissionStatus` in `lib/reminders.ts` (Deleted)
- `resyncAllLoopReminders` in `lib/reminders.ts` (Deleted)
- `parseReminderInput` in `lib/reminders.ts` (Deleted)
- `buildScopeSearchHaystack` in `lib/scopeGuard.ts` (Made internal)
- `closedThisWeek` in `lib/weeklyReview.ts` (Made internal)
- `ThemeColors` in `context/ThemeContext.tsx` (Made internal)
- `Reminder` in `types/index.ts` (Made internal, still used in `OpenLoop` type)
- `motion`, `colors`, `surfaceFlat`, `surfaceElevated` in `lib/theme.ts` (Deleted unused exports)

## 4. Unused Routes
- All files in `app/` are actively used routes or parts of the current routing setup.

## 5. Unused Assets
- No assets were deleted. The official images are maintained, and it is risky to delete any default Expo assets or icons referenced in `app.json`.

## 6. Items Kept Intentionally
- `babel-preset-expo`: Flagged by `knip`, but essential for Expo.
- `plugins/withRemovePushEntitlement.js`: Used in `app.json`.
- `app.json` configuration for `expo-updates`, `expo-system-ui`, etc.

## 7. Verification Results
- `npm install` runs cleanly.
- `npx tsc --noEmit` returns zero errors.
- App functionality verified (all routes present and correct).

**Overall:** The codebase is cleaner, smaller, and free of abandoned code snippets. It is now highly optimized for Build 24!
