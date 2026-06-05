# Privacy Policy Hosting — LoopTidy

## Recommended public URL

Publish the privacy policy at:

**https://haile-y-haile.github.io/Looptidy/privacy**

Use this URL in **App Store Connect → App Privacy → Privacy Policy URL**.

## Hosting options

### Option A — GitHub Pages (recommended)

1. Enable GitHub Pages for the `haile-y-haile/Looptidy` repository (Settings → Pages).
2. Publish from the `main` branch using the `/docs` folder or a dedicated `gh-pages` branch.
3. Add a static HTML page at `docs/privacy/index.html` (or convert `privacy-policy.md` to HTML).
4. Verify the URL loads in Safari without authentication.

### Option B — Simple static host

Any HTTPS host works (Netlify, Cloudflare Pages, etc.) as long as:

- The URL is stable and public
- Content matches `privacy-policy.md` in this repo
- Contact email is **hello.hailelabs@gmail.com**

## Do not use as final App Store URL

- Raw GitHub markdown links (`raw.githubusercontent.com/...`) — poor formatting and not ideal for App Review
- In-app-only text without a public URL

## In-app links

The app links to the hosted URL via `lib/links.ts` → `links.privacyPolicy`.

Settings and About screens open this URL with `Linking.openURL`.

## Support contact

**hello.hailelabs@gmail.com** — use the same email in App Store Connect Support URL field or a dedicated support page.
