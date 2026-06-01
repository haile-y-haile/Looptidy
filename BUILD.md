# Build — LoopTidy

How to run LoopTidy locally, preview with Expo Go, verify before release, and ship iOS builds to TestFlight.

## Requirements

- Node.js 20+ and npm
- Expo account for EAS builds
- Apple Developer Program for TestFlight
- macOS recommended for iOS Simulator and submission (Windows can run Metro and verification commands)

## Local start

```bash
git clone https://github.com/haile-y-haile/Looptidy.git
cd Looptidy
npm install
npx expo start
```

## Expo Go preview

With Metro running:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on a physical iPhone, or press **`i`** for the iOS Simulator.

Expo Go is fine for UI work. Features that rely on the full native binary (for example Lottie splash, some Reanimated behavior) are best tested on a **TestFlight** or EAS development build.

## Pre-build verification

Run before tagging or uploading a TestFlight build:

```bash
npx expo-doctor
npx tsc --noEmit
npx expo export --platform ios
```

All three should complete without errors.

## iOS production build

```bash
npm run build:ios
```

Equivalent:

```bash
npx eas-cli build --platform ios --profile production
```

Builds appear at: https://expo.dev/accounts/astrohaile/projects/looptidy/builds

Version and iOS build number are read from `app.json`. The production profile may auto-increment the build number on EAS.

## Submit to TestFlight

Set `ascAppId` in `eas.json` (App Store Connect → LoopTidy → App Information → Apple ID) for non-interactive submit, then:

```bash
npm run submit:ios
```

Equivalent:

```bash
npx eas-cli submit --platform ios --latest --wait
```

Or submit a specific build:

```bash
npx eas-cli submit --platform ios --id BUILD_UUID --wait
```

After upload, wait for Apple processing in [App Store Connect](https://appstoreconnect.apple.com) → **TestFlight**.

## Configuration (reference)

| File | Purpose |
|------|---------|
| `app.json` | App version, `ios.buildNumber`, bundle ID |
| `eas.json` | Build profiles and submit settings |
| `.npmrc` | `legacy-peer-deps=true` for EAS `npm ci` |

Do not change bundle ID or EAS project ID without updating Apple and Expo project settings.

## Troubleshooting

| Issue | Suggestion |
|-------|------------|
| `npm ci` fails on EAS | Commit `package-lock.json`; keep `.npmrc` |
| Submit requires `ascAppId` | Add to `eas.json` or run submit interactively once |
| Metro cache issues | `npx expo start -c` |

See also [README.md](README.md) and [SUPPORT.md](SUPPORT.md).
