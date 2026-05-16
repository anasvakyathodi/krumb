# Krumb

> Auto-rejects cookie banners on every site you visit. Open-source. Zero tracking.

Krumb is a Chrome Manifest V3 extension. It runs silently on every page, finds the "Reject all" / "Necessary only" button via a community-maintained selector list (with a multilingual heuristic fallback), and clicks it for you. The banner is gone in roughly 200ms — you typically never see it.

The whole product is the silent content script. Five UI surfaces exist, four of which you will see at most once:

- The toolbar **popup** (5 states)
- The **welcome** page (one-shot, opens on install)
- The **settings** page
- The in-popup **report-a-broken-banner** flow
- The on-page **selector picker** overlay

## Install (developer mode)

1. Open `chrome://extensions`.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked** and select this folder (`krumb/`).
4. The welcome page opens automatically.

## Project layout

```
krumb/
├── manifest.json
├── README.md
├── scripts/
│   └── build-icons.mjs            # pure-JS PNG rasteriser (4 states × 4 sizes)
└── src/
    ├── assets/                    # icon SVG + 16 PNG variants
    ├── background/service-worker.js
    ├── content/
    │   ├── content.js             # rule match + heuristic + MutationObserver + toast
    │   └── picker.js              # selector-picker overlay (Shadow DOM)
    ├── popup/      popup.html · popup.js · popup.css
    ├── options/    options.html · options.js · options.css
    ├── welcome/    welcome.html · welcome.js · welcome.css
    ├── report/     report.js · report.css
    ├── selectors/  bundled-rules.json    (~50 starter rules incl. CMP defaults)
    └── shared/     tokens.css · ui.css · icons.js · storage.js · messaging.js · i18n.js
```

## Privacy

The extension makes one outbound request: a daily fetch of the public selector list from GitHub. No analytics. No telemetry. No error reporting. Local statistics live only on your device.

## Re-render the icons

```bash
node scripts/build-icons.mjs
```

## License

MIT. See LICENSE.
