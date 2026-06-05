# Privacy Policy Hosting — LoopTidy

## Public URL

**https://haile-y-haile.github.io/Looptidy/privacy**

Use this URL in **App Store Connect → App Privacy → Privacy Policy URL**.

## What is published

| File | Purpose |
|------|---------|
| `docs/privacy/index.html` | Public privacy policy page (source: `privacy-policy.md` at repo root) |
| `docs/.nojekyll` | Disables Jekyll processing so static HTML is served as-is |

When updating the policy, edit `privacy-policy.md` first, then sync the HTML page to match.

## Enable GitHub Pages (one-time)

1. Open **https://github.com/haile-y-haile/Looptidy/settings/pages**
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**
3. **Branch:** `main` · **Folder:** `/docs`
4. Save. GitHub will publish within a few minutes.
5. Verify **https://haile-y-haile.github.io/Looptidy/privacy** loads in Safari without login.

Repository name casing in the URL (`Looptidy`) must match the GitHub repo name.

## Contact

**hello.hailelabs@gmail.com** — use the same email in App Store Connect Support URL or support page.

## In-app links

The app opens the hosted URL via `lib/links.ts` → `links.privacyPolicy` (Settings and About).

## Do not use as App Store URL

- Raw GitHub markdown links (`raw.githubusercontent.com/...`)
- In-app-only text without a public HTTPS page
