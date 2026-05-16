// Krumb — popup controller (state machine)

import { I, iconSvg, krumbWordmarkHtml } from '../shared/icons.js';
import {
  getSettings, getTabStatus, setSetting, patchSettings,
  domainOf, isWhitelisted, addToWhitelist, removeFromWhitelist,
  statsLast7Days,
} from '../shared/storage.js';
import { MSG, send, sendToTab } from '../shared/messaging.js';
import { renderReport } from '../report/report.js';

const root = document.getElementById('root');

// Demo mode: serve popup.html?demo=1&state=rejected (or no-banner / failed /
// whitelisted / paused). Used to preview state variants without the full
// extension runtime. Stubs chrome.* with deterministic fake data.
const DEMO = new URLSearchParams(location.search);
{
  let hasChrome = false;
  try { hasChrome = !!(globalThis.chrome && globalThis.chrome.storage && globalThis.chrome.storage.local); } catch {}
  if (DEMO.get('demo') === '1' || !hasChrome) installDemoStubs(DEMO.get('state') || 'rejected');
}

function installDemoStubs(state) {
  const fakeSettings = {
    enabled: state !== 'paused',
    behavior: 'site', showToast: false, autoUpdateRules: true, heuristic: true,
    whitelist: state === 'whitelisted' ? [{ domain: 'banking.app', addedAt: Date.now() }] : [],
    stats: { total: 12406, heuristic: 142, failed: 0, daily: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [new Date(Date.now() - i*86400000).toISOString().slice(0,10), 100 + i*8])) },
    firstTimeToastShown: true,
  };
  const fakeUrl = state === 'whitelisted' ? 'https://banking.app/dashboard'
    : state === 'no-banner' ? 'https://en.wikipedia.org/wiki/HTTP_cookie'
    : state === 'failed' ? 'https://forum.lemonde.fr/article'
    : 'https://www.nytimes.com/2026/05/16/world/headline.html';
  const fakeStatus = state === 'rejected' ? { kind: 'rejected', latency: 142, source: 'rules' }
    : state === 'failed' ? { kind: 'failed' }
    : null;
  const stub = {
    tabs: {
      query: () => Promise.resolve([{ id: 1, url: fakeUrl }]),
      reload: () => {},
      create: ({ url }) => window.open(url, '_blank'),
    },
    storage: {
      local: {
        get: (keys) => Promise.resolve(Object.fromEntries(
          (Array.isArray(keys) ? keys : (keys && typeof keys === 'object' ? Object.keys(keys) : Object.keys(fakeSettings)))
            .map(k => [k, fakeSettings[k]])
        )),
        set: (patch) => { Object.assign(fakeSettings, patch); return Promise.resolve(); },
      },
      session: {
        get: (k) => Promise.resolve({ [k]: fakeStatus }),
        set: () => Promise.resolve(),
        remove: () => Promise.resolve(),
      },
      onChanged: { addListener: () => {} },
    },
    runtime: {
      sendMessage: () => Promise.resolve(null),
      openOptionsPage: () => window.open('../options/options.html?demo=1', '_blank'),
      lastError: null,
    },
  };
  try {
    if (typeof globalThis.chrome !== 'undefined') {
      for (const k of Object.keys(stub)) { try { globalThis.chrome[k] = stub[k]; } catch {} }
    } else { globalThis.chrome = stub; }
  } catch { try { globalThis.chrome = stub; } catch {} }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

function decideState({ settings, tab, status }) {
  if (!settings.enabled) return { kind: 'paused' };
  const site = domainOf(tab?.url || '');
  if (!site) return { kind: 'no-banner', site: 'this page' };
  if (isWhitelisted(settings.whitelist, site)) return { kind: 'whitelisted', site };
  if (!status) return { kind: 'no-banner', site };
  if (status.kind === 'rejected') return { kind: 'rejected', site, latency: status.latency, source: status.source };
  if (status.kind === 'failed')   return { kind: 'failed', site };
  return { kind: 'no-banner', site };
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function shell({ paused, body, weekCount = 0 }) {
  return `
    <div class="popup-header">
      ${krumbWordmarkHtml({ size: 14 })}
      ${paused
        ? `<span class="k-pill k-pill--mute">${iconSvg(I.pause, { size: 10 })} paused</span>`
        : `<span class="k-pill k-pill--accent"><span class="k-pill__dot"></span>active</span>`}
    </div>
    ${body}
    <div class="popup-stat-strip">
      <span class="popup-stat-strip__value">${weekCount.toLocaleString()}</span>
      <span class="popup-stat-strip__label">banners rejected this week</span>
      <span class="popup-stat-strip__local">local only</span>
    </div>
    <div class="popup-footer">
      <div class="popup-footer__links">
        <button class="popup-footer__link" data-action="settings">Settings</button>
        <button class="popup-footer__link" data-action="report">Report</button>
        <button class="popup-footer__link" data-action="help">Help</button>
      </div>
      <div class="popup-footer__version">v1.0.0</div>
    </div>
  `;
}

function statusCard({ tone, icon, title, sub, cta }) {
  return `
    <div class="popup-status-card">
      <div class="popup-status-card__row">
        <div class="popup-status-card__icon popup-status-card__icon--${tone}">
          ${iconSvg(icon, { size: 18, strokeWidth: 1.8 })}
        </div>
        <div style="flex:1; min-width:0; padding-top:1px;">
          <div class="popup-status-card__title">${title}</div>
          ${sub ? `<div class="popup-status-card__sub">${sub}</div>` : ''}
        </div>
      </div>
      ${cta ? `<div class="popup-status-card__cta">${cta}</div>` : ''}
    </div>
  `;
}

function toggleRow({ id, label, sub, on, disabled = false }) {
  return `
    <div class="popup-toggle-row ${disabled ? 'popup-toggle-row--disabled' : ''}">
      <div class="popup-toggle-row__main">
        <div class="popup-toggle-row__label">${label}</div>
        ${sub ? `<div class="popup-toggle-row__sub">${escapeHtml(sub)}</div>` : ''}
      </div>
      <button role="switch" aria-checked="${on ? 'true' : 'false'}" class="k-toggle k-toggle--sm" data-id="${id}">
        <span class="k-toggle__dot"></span>
      </button>
    </div>
  `;
}

function divider() { return `<div class="k-divider"></div>`; }

function btn(variant, size, label, { icon = null, iconRight = null, full = false, action } = {}) {
  const classes = ['k-btn', `k-btn--${variant}`, `k-btn--${size}`, full ? 'k-btn--full' : ''].filter(Boolean).join(' ');
  return `<button class="${classes}" data-action="${action}">
    ${icon ? iconSvg(icon, { size: 14 }) : ''}
    <span>${label}</span>
    ${iconRight ? iconSvg(iconRight, { size: 14 }) : ''}
  </button>`;
}

// ─────────────────────────── State variants ───────────────────────────
function renderState(state, ctx) {
  const { settings, site } = ctx;
  const masterOn = settings.enabled;
  const siteOn = !isWhitelisted(settings.whitelist, site);
  const weekCount = statsLast7Days(settings.stats).count;
  let body = '';
  let paused = false;

  switch (state.kind) {
    case 'rejected': {
      const meta = state.latency
        ? `on <span class="k-mono" style="color:var(--text);">${escapeHtml(state.site)}</span> · ${Math.round(state.latency)}ms${state.source === 'heuristic' ? ' · heuristic' : ''}`
        : `on <span class="k-mono" style="color:var(--text);">${escapeHtml(state.site)}</span>`;
      body = statusCard({
        tone: 'accent', icon: I.check,
        title: 'Banner auto-rejected',
        sub: meta,
      });
      break;
    }
    case 'no-banner': {
      body = statusCard({
        tone: 'mute', icon: I.shield,
        title: 'No banner detected',
        sub: `nothing to dismiss on <span class="k-mono" style="color:var(--text);">${escapeHtml(state.site)}</span>`,
      });
      break;
    }
    case 'failed': {
      body = statusCard({
        tone: 'warn', icon: I.question,
        title: "Couldn't find the reject button",
        sub: `banner detected on <span class="k-mono" style="color:var(--text);">${escapeHtml(state.site)}</span> but we don't have a rule for it yet.`,
        cta: btn('primary', 'sm', 'Report this site', { icon: I.flag, full: true, action: 'report' })
           + btn('secondary', 'sm', 'Dismiss', { action: 'dismiss-failed' }),
      });
      break;
    }
    case 'whitelisted': {
      body = statusCard({
        tone: 'mute', icon: I.pause,
        title: 'Krumb is off for this site',
        sub: `you've turned us off on <span class="k-mono" style="color:var(--text);">${escapeHtml(state.site)}</span>. cookie banners will appear normally.`,
        cta: btn('outline', 'sm', 'Re-enable on this site', { icon: I.play, full: true, action: 'reenable-site' }),
      });
      break;
    }
    case 'paused': {
      paused = true;
      body = statusCard({
        tone: 'mute', icon: I.pause,
        title: 'Krumb is paused',
        sub: 'cookie banners will appear normally on every site. nothing is being auto-rejected.',
        cta: btn('primary', 'sm', 'Resume Krumb', { icon: I.play, full: true, action: 'resume' }),
      });
      break;
    }
  }

  body += toggleRow({
    id: 'master',
    label: 'Krumb is active',
    sub: masterOn ? 'globally enabled' : 'globally disabled',
    on: masterOn,
  });
  body += divider();
  body += toggleRow({
    id: 'site',
    label: 'Run on this site',
    sub: site || '—',
    on: masterOn ? siteOn : false,
    disabled: !masterOn || !site || state.kind === 'paused',
  });

  return shell({ paused, body, weekCount });
}

// ─────────────────────────── Boot ───────────────────────────
async function consumePickerResult() {
  try {
    const raw = await chrome.storage.session.get('picker:last');
    const data = raw['picker:last'];
    if (!data) return null;
    // Drop stale picks (>5 min old).
    if (Date.now() - (data.at || 0) > 5 * 60 * 1000) {
      await chrome.storage.session.remove('picker:last');
      return null;
    }
    await chrome.storage.session.remove('picker:last');
    return data;
  } catch { return null; }
}

async function boot() {
  const tab = await getActiveTab();
  const settings = await getSettings();
  const site = domainOf(tab?.url || '');

  // If the user just finished using the on-page selector picker, jump
  // back into the report dialog with the picked selector pre-filled
  // instead of reverting to the home state.
  const pick = await consumePickerResult();
  if (pick && pick.selector) {
    renderReport({ root, site, onCancel: boot, prefill: pick });
    return;
  }

  const status = tab ? await getTabStatus(tab.id) : null;
  const stateDecision = decideState({ settings, tab, status });
  root.innerHTML = renderState(stateDecision, { settings, site, tab });
  bind({ tab, settings, site });
}

function bind({ tab, settings, site }) {
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action], .k-toggle');
    if (!t) return;
    const action = t.getAttribute('data-action');
    const toggleId = t.classList.contains('k-toggle') ? t.getAttribute('data-id') : null;

    if (toggleId === 'master') {
      const next = !settings.enabled;
      await setSetting('enabled', next);
      await send(MSG.SETTINGS_CHANGED, { key: 'enabled', value: next });
      return boot();
    }
    if (toggleId === 'site' && site) {
      const currentlyOn = !isWhitelisted(settings.whitelist, site);
      if (currentlyOn) await addToWhitelist(site);
      else             await removeFromWhitelist(site);
      await send(MSG.TOGGLE_SITE, { site, enabled: !currentlyOn });
      if (tab?.id != null) chrome.tabs.reload(tab.id);
      return boot();
    }
    if (action === 'settings') {
      chrome.runtime.openOptionsPage();
      window.close();
    }
    if (action === 'help') {
      chrome.tabs.create({ url: 'https://github.com/krumb/list#readme' });
      window.close();
    }
    if (action === 'report' || action === 'dismiss-failed') {
      if (action === 'report') {
        renderReport({ root, site, onCancel: boot });
      } else {
        // just re-render with no-banner state
        boot();
      }
    }
    if (action === 'reenable-site' && site) {
      await removeFromWhitelist(site);
      await send(MSG.TOGGLE_SITE, { site, enabled: true });
      if (tab?.id != null) chrome.tabs.reload(tab.id);
      return boot();
    }
    if (action === 'resume') {
      await setSetting('enabled', true);
      await send(MSG.SETTINGS_CHANGED, { key: 'enabled', value: true });
      if (tab?.id != null) chrome.tabs.reload(tab.id);
      return boot();
    }
  });
}

boot().catch(err => {
  console.error('[krumb popup] boot error', err);
  root.innerHTML = `<div class="popup-loading">Something went wrong loading Krumb. Try reopening this popup.</div>`;
});
