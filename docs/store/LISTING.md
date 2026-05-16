# Krumb · Chrome Web Store Listing Copy

Paste-ready strings for the developer dashboard at
<https://chrome.google.com/webstore/devconsole>.

---

## Item name
*(45 chars max)*

```
Krumb — auto-reject cookie banners
```

## Short summary
*(132 chars max — shown beneath the title in search results)*

```
Auto-rejects cookie banners on every site you visit. Open-source, zero tracking, ~200 ms per page. Works on 4,000+ sites.
```
*(123 chars — fits.)*

## Category

```
Productivity
```

*(Secondary, if asked: "Tools".)*

---

## Detailed description
*(16,000 chars max — paste verbatim. Markdown is not rendered; use plain text + blank-line paragraph breaks.)*

```
Krumb is a quiet Chrome extension that finds the "Reject all" or "Necessary only" button on cookie consent banners and clicks it for you. About a fifth of a second after the page loads, the banner is gone. You never see it. You never click anything.

If you visit 30 sites a day, that's 30 clicks a day, every day, that Krumb does for you. Forever. For free.

═════════════════════════════════════════════════
THE WHOLE PRODUCT IS BEING QUIET
═════════════════════════════════════════════════

By default, Krumb does its work silently. No toast. No popup. No badge. No "we just did a thing!" notification. The banner disappears before you'd notice it was there, and the page is yours.

You'll know it's working because you stop seeing cookie banners.

═════════════════════════════════════════════════
HOW IT WORKS
═════════════════════════════════════════════════

1. A community-maintained list of CSS selectors (one entry per site) ships bundled with the extension and is refreshed once a day from a public GitHub file. The list covers the top news sites, retailers, social networks, streaming services, and the major consent management platforms (OneTrust, Cookiebot, Didomi, Quantcast, TrustArc, Usercentrics, TCF) — roughly 4,000+ sites at launch and growing.

2. For sites not in the list, a multilingual heuristic looks for buttons labeled "reject", "decline", "necessary only", "refuser", "ablehnen", "拒否", and 30+ other variants — but only inside containers that look like cookie banners (fixed/sticky positioned, contains "cookie"/"consent"/"GDPR" keywords). It refuses to fire after the first 8 seconds of page load to stay out of the way of regular app buttons.

3. If a site sneaks past Krumb, the toolbar popup has a "Report this site" button that opens a pre-filled GitHub issue. The next user benefits within 24 hours.

═════════════════════════════════════════════════
WHAT MAKES KRUMB DIFFERENT
═════════════════════════════════════════════════

• 100 % free, forever. No premium tier. No paywall. No upsell.
• Zero tracking. No analytics SDKs, no telemetry, no usage data, no error reporting. We have no servers; there is nowhere for your data to go.
• Open-source. MIT licensed. The full source code, including the selector list, is on GitHub. Audit it: github.com/anasvakyathodi/krumb
• Fast. No LLM, no server roundtrip, no perceptible slowdown. Pure CSS-selector clicks.
• Local-only. Settings, statistics, and your per-site whitelist are stored on your device with chrome.storage.local and never synced anywhere.

═════════════════════════════════════════════════
A NOTE ABOUT PERMISSIONS
═════════════════════════════════════════════════

Krumb requests access to "all websites" — the same permission every cookie blocker needs. We're upfront about why: banners are on every site, so we have to be there too.

Here's the honest version: the content script only looks for cookie-banner DOM elements and clicks them. It does not read page content. It does not extract form values, cookies, credentials, history, or any other data. It does not transmit anything to any server. It explicitly bails on pages with a visible password field.

You don't have to take our word for it. The full source code is on GitHub. The full privacy policy is here:
github.com/anasvakyathodi/krumb/blob/main/PRIVACY.md

═════════════════════════════════════════════════
NOT IN SCOPE (BY DESIGN)
═════════════════════════════════════════════════

Krumb does one thing: dismiss consent banners. It does not:

• Block trackers (uBlock Origin already does this well)
• Manage or delete cookies
• Block ads
• Run on mobile (Chrome extensions don't)
• Customize per-cookie-category preferences

If you want per-cookie-category control, use a GDPR-specific tool instead.

═════════════════════════════════════════════════
HELP, BUGS, AND CONTRIBUTING
═════════════════════════════════════════════════

• Found a site Krumb doesn't handle? Click the toolbar icon → Report this site. A pre-filled GitHub issue opens; you review and submit.
• Want to add a selector yourself? Open a PR against src/selectors/bundled-rules.json. The format is documented in the README.
• Have a privacy question? See PRIVACY.md.

GitHub: github.com/anasvakyathodi/krumb
Maintainer: Anas Vakyathodi
License: MIT
```

---

## Privacy practices (developer dashboard form)

### Single purpose
```
Automatically dismiss cookie consent banners on websites the user visits.
```

### Permission justification — `<all_urls>` host permission
```
Cookie consent banners appear on virtually every website. The extension's content script must be able to run on any URL to detect the banner DOM and click the appropriate reject button. The script does not read or transmit page content; it only looks for banner-shaped elements and clicks them.
```

### Permission justification — `storage`
```
To save the user's settings (toggle states, behavior preference, whitelist of disabled sites) and local-only statistics (count of banners dismissed) on the user's device. None of this is synced anywhere.
```

### Permission justification — `activeTab`
```
To scope user-initiated actions (opening the report dialog, toggling the site whitelist) to the currently active tab when the user clicks the toolbar icon.
```

### Permission justification — `tabs`
```
To detect tab navigation and updates so the toolbar icon and badge can reflect the current page's banner-dismissal status (e.g. green checkmark after a successful reject, paused icon on a whitelisted site).
```

### Permission justification — `scripting`
```
To inject the on-page selector picker overlay when the user clicks "Highlight" in the report dialog, so they can point at the reject button that Krumb's selector list missed.
```

### Permission justification — `contextMenus`
```
To add a right-click menu entry "Krumb — report this banner" that lets the user file a report from anywhere on the page.
```

### Permission justification — `alarms`
```
To schedule the once-daily background fetch of the public selector list from GitHub.
```

### Data usage disclosures
*(Tick exactly these on the form; untick everything else.)*

```
☐ Personally identifiable information
☐ Health information
☐ Financial and payment information
☐ Authentication information
☐ Personal communications
☐ Location
☐ Web history
☐ User activity
☐ Website content
```

**Tick:** none.

### Certifications
- [x] I do not sell user data to third parties.
- [x] I do not use or transfer user data for purposes unrelated to the item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL
```
https://github.com/anasvakyathodi/krumb/blob/main/PRIVACY.md
```

### Homepage URL
```
https://github.com/anasvakyathodi/krumb
```

### Support URL
```
https://github.com/anasvakyathodi/krumb/issues
```

---

## Assets checklist

Located in `docs/store/`:

| Slot | File | Dimensions |
|---|---|---|
| Icon (128×128) | `../../src/assets/icon-default-128.png` | 128 × 128 |
| Screenshot 1 (hero) | `screenshot-1-hero.png` | 1280 × 800 |
| Screenshot 2 (before/after) | `screenshot-2-before-after.png` | 1280 × 800 |
| Screenshot 3 (popup states) | `screenshot-3-popup-states.png` | 1280 × 800 |
| Screenshot 4 (settings) | `screenshot-4-settings.png` | 1280 × 800 |
| Screenshot 5 (welcome) | `screenshot-5-welcome.png` | 1280 × 800 |
| Small promo tile | `promo-tile-440x280.png` | 440 × 280 |
| Marquee promo tile | `promo-marquee-1400x560.png` | 1400 × 560 |

Upload at least 1 screenshot (5 is the maximum). The small tile is required for featuring in any Chrome Web Store collection. The marquee is optional but recommended.
