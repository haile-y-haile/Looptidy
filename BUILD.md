# Build & release — LoopTidy

Instructions for running LoopTidy locally and producing iOS builds for TestFlight.

## Requirements

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **macOS** (for iOS Simulator and App Store submission; Windows can run Metro and `tsc` but not local iOS builds)
- [Expo account](https://expo.dev) and [EAS CLI](https://docs.expo.dev/build/setup/) for TestFlight builds
- Apple Developer Program membership for TestFlight

## Local development

```bash
git clone https://github.com/haile-y-haile/Looptidy.git
cd Looptidy
npm install
npx expo start
```

| Command | Purpose |
|---------|---------|
| `npx expo start` | Metro bundler; scan QR with Expo Go or press `i` for simulator |
| `npx expo start --ios` | Open iOS simulator |
| `npx tsc --noEmit` | Typecheck |
| `npx expo-doctor` | Validate Expo project health |
| `npx expo export --platform ios` | Smoke-test production bundle |

### Notes

- **Expo Go** works for much of the UI; native modules (Reanimated, Lottie) behave best on a **development build** or TestFlight build.
- Data is stored in AsyncStorage on the device you use; reinstalling clears data unless you back up the app container.

## Project configuration

| File | Role |
|------|------|
| `app.json` | App name, version, iOS `buildNumber`, bundle ID `com.hailehaile.looptidy` |
| `eas.json` | EAS build profiles (`development`, `preview`, `production`) and submit settings |
| `.npmrc` | `legacy-peer-deps=true` for consistent `npm ci` on EAS |

**Version source:** `appVersionSource: local` in `eas.json` — bump `expo.version` and `ios.buildNumber` in `app.json` before release builds. Production profile has `autoIncrement: true`, which may bump the build number on EAS during upload.

## EAS iOS production build (TestFlight)

```bash
# From project root
npm run build:ios
# equivalent:
npx eas-cli build --platform ios --profile production
```

Monitor the build at [expo.dev](https://expo.dev/accounts/astrohaile/projects/looptidy/builds).

### Submit to App Store Connect / TestFlight

1. Add your App Store Connect **Apple ID** (numeric app id) to `eas.json`:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@email.com",
      "appleTeamId": "YOUR_TEAM_ID",
      "ascAppId": "1234567890"
    }
  }
}
```

Find `ascAppId` in App Store Connect → **LoopTidy** → **App Information** → **Apple ID**.

2. Submit the latest or a specific build:

```bash
npm run submit:ios
# or
npx eas-cli submit --platform ios --latest --wait
npx eas-cli submit --platform ios --id BUILD_UUID --wait
```

3. In [App Store Connect](https://appstoreconnect.apple.com) → **TestFlight**, wait for processing, then enable testers.

**Non-interactive CI:** `ascAppId` is required when using `--non-interactive`.

### Preview / internal builds

```bash
npm run build:ios:preview
```

Uses the `preview` profile in `eas.json` (internal distribution).

## Marketing static site (optional)

```bash
npm run marketing:preview
```

Serves the repo root; open `/marketing/index.html` for the static landing page.

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `npm ci` fails on EAS | Ensure `package-lock.json` is committed; `.npmrc` has `legacy-peer-deps=true` |
| Submit fails: `ascAppId` | Set `ascAppId` in `eas.json` or run submit interactively once |
| Reanimated errors | Clear Metro cache: `npx expo start -c`; use a dev client or TestFlight build, not stale Expo Go |
| Build number mismatch | Sync `app.json` `ios.buildNumber` with the build shown in EAS |

## Related docs

- [README.md](README.md) — product overview  
- [CHANGELOG.md](CHANGELOG.md) — what shipped in each version  
- [SUPPORT.md](SUPPORT.md) — TestFlight access for testers  
