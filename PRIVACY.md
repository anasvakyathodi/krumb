# Krumb Privacy Policy

**Last updated:** 2026-05-16
**Applies to:** Krumb v1.0.0 and later (Chrome Web Store + manual installs)

Krumb is designed around a single principle: **the extension should know as little about you as possible, and tell us nothing.** This page documents exactly what that means in practice.

## TL;DR

- Krumb does not collect, store, or transmit any personal data.
- Krumb does not use analytics, telemetry, or error-reporting SDKs.
- Krumb does not see, store, or transmit the URLs of sites you visit.
- Krumb makes exactly **one** outbound network request: a daily fetch of the public selector list from GitHub. That request goes directly from your browser to GitHub. Krumb has no servers.
- All settings, statistics, and the whitelist are stored locally on your device using `chrome.storage.local`. They never leave the device.

If you trust nothing else on this page, audit the source: <https://github.com/anasvakyathodi/krumb>. There is no backend code to hide because there is no backend.

## What Krumb does on each page you visit

When you load any web page, Krumb's content script runs and:

1. Reads your local Krumb settings from `chrome.storage.local` (master toggle, whitelist, heuristic preference, etc.).
2. Looks at the current page's hostname to determine whether the site is whitelisted.
3. If not whitelisted, attempts to find a "Reject all" / "Necessary only" cookie banner button using:
   - A community-maintained CSS-selector list bundled with the extension and refreshed daily from GitHub, **and/or**
   - A heuristic that scans visible buttons for reject-related words ("reject", "decline", "refuser", "ablehnen", …) inside containers that look like cookie banners (fixed/sticky positioned, near a cookie-related keyword).
4. If a matching button is found, clicks it.
5. Watches the DOM briefly afterward via a MutationObserver for late-loading banners.

What the content script does **not** do:

- It does not read page content beyond what's needed to find the banner.
- It does not extract form values, cookies, localStorage, history, credentials, or any other data.
- It does not transmit any data to any server.
- It explicitly bails on pages with a visible password field, to stay out of the way of authentication flows.

## What data is stored, and where

Everything is in `chrome.storage.local`, which is sandboxed per-extension and per-device:

- **Settings** — your toggle states, behaviour preference, whitelist of disabled sites.
- **Statistics** — local counters (total banners rejected, per-day counts for the last 60 days, heuristic-fallback successes).
- **Cached selector list** — the JSON file fetched from GitHub, with a timestamp.

A small amount of per-tab status (last seen banner verdict) lives in `chrome.storage.session`, which Chrome clears on browser restart.

None of this is synced anywhere. We do not enable `chrome.storage.sync`. Even your whitelist stays on the device that created it.

## Network requests Krumb makes

Krumb makes one kind of outbound request, in the background, at most once every 24 hours:

```
GET https://raw.githubusercontent.com/anasvakyathodi/krumb/main/src/selectors/bundled-rules.json
```

This is a fetch of a public file on GitHub. The fetch is made directly from your browser to GitHub's servers — Krumb has no servers in the middle. GitHub will see the same connection metadata it sees when you load any other public file (your IP address, your User-Agent, the time of the request). Krumb has no access to that information.

You can disable this fetch entirely in Krumb's settings (toggle off "Auto-update from GitHub once a day"). The extension will keep working with the rules bundled into your installed copy.

## Permissions and why we ask for them

Chrome shows you a permissions prompt when you install the extension. Each one exists for a specific reason:

| Permission | Why Krumb needs it |
|---|---|
| `<all_urls>` (host access) | Cookie banners appear on every website. The content script has to be able to inject into every site you visit to find and dismiss them. We do not use this access for anything else. |
| `storage` | To save your settings and statistics on your device. |
| `activeTab` | To act on the tab you're currently looking at when you click the toolbar icon (e.g. open the report dialog scoped to the current site). |
| `tabs` | To detect when you switch tabs / navigate, so the toolbar icon and badge can reflect the current page's banner status. |
| `scripting` | To inject the on-page selector picker on demand when you click "Highlight" in the report dialog. |
| `contextMenus` | To add the right-click "Krumb — report this banner" menu item. |
| `alarms` | To schedule the once-a-day selector list refresh from GitHub. |

We deliberately do **not** request `webRequest`, `webNavigation`, `cookies`, `history`, `downloads`, `clipboardRead`, or any other permission that could be used to surveil you.

## Third parties

Krumb integrates with two third-party services, only through actions you initiate:

- **GitHub** — for the daily selector-list fetch (a public file), and for the "Report a broken banner" flow, which opens a pre-filled GitHub issue page in a new tab. You choose whether to actually post the issue.
- **PayPal** — the README and welcome page link to `paypal.me/anasvakyathodi` for optional donations. Clicking the link takes you to PayPal's site; Krumb does not process any payments and never sees any payment information.

Krumb does not embed any third-party SDKs, fonts (Inter / JetBrains Mono are fetched from Google Fonts via the welcome and settings pages — see below), pixels, or trackers.

## Web fonts

The welcome page and settings page load `Inter` and `JetBrains Mono` from `fonts.googleapis.com` to match the design. Google Fonts logs IP addresses to serve those requests; their privacy policy applies to that specific load. The toolbar popup and content-script toasts use system fonts only, so day-to-day use of Krumb does not involve Google Fonts. If you'd prefer the welcome and settings pages avoid Google Fonts entirely, open an issue — we'd accept a PR that self-hosts them.

## Children

Krumb does not collect any data, so it does not collect data from children. It is suitable for users of any age.

## Changes to this policy

If this policy ever changes — for example, if a future version of Krumb adds opt-in telemetry — we will update this file and announce the change in the release notes and on the welcome page on first launch after the update. Past versions of this policy are available in the repo's git history.

## Contact

- File an issue: <https://github.com/anasvakyathodi/krumb/issues>
- Maintainer: Anas Vakyathodi

If you have a security concern that shouldn't be public, please open an issue marked `security` and we'll move to a private channel.
