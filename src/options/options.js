// Krumb — settings/options page controller

import { I, iconSvg, krumbWordmarkHtml } from '../shared/icons.js';
import {
  getSettings, setSetting, removeFromWhitelist, statsLast7Days,
  RULES_REMOTE_URL,
} from '../shared/storage.js';
import { MSG, send } from '../shared/messaging.js';

// Demo mode for preview-without-extension. Mocks chrome.* so the page
// renders with fake settings/stats. Loaded via ?demo=1 or auto-enabled
// when chrome.* is missing (e.g. served from http:// directly).
{
  let needsStub = true;
  try { needsStub = !(globalThis.chrome && globalThis.chrome.storage && globalThis.chrome.storage.local); } catch { needsStub = true; }
  if (needsStub) installOptionsDemo();
}
function installOptionsDemo() {
  const fake = {
    enabled: true, behavior: 'site', showToast: false, autoUpdateRules: true, heuristic: true,
    whitelist: [
      { domain: 'banking.app',         addedAt: Date.now() - 2*86400000 },
      { domain: 'mail.proton.me',      addedAt: Date.now() - 14*86400000 },
      { domain: 'admin.workspace.com', addedAt: Date.now() - 30*86400000 },
      { domain: 'localhost:3000',      addedAt: Date.now() - 60*86400000 },
    ],
    stats: { total: 12406, heuristic: 142, failed: 0,
      daily: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [new Date(Date.now() - i*86400000).toISOString().slice(0,10), 100 + i*8])) },
    rulesVersion: 'v2026.05.16', rulesUpdatedAt: Date.now() - 6*60*1000, rulesCount: 4217,
  };
  const stub = {
    storage: {
      local: {
        get: (keys) => Promise.resolve(Object.fromEntries(
          (Array.isArray(keys) ? keys : (keys && typeof keys === 'object' ? Object.keys(keys) : Object.keys(fake)))
            .map(k => [k, fake[k]])
        )),
        set: (patch) => { Object.assign(fake, patch); return Promise.resolve(); },
        clear: () => { for (const k of Object.keys(fake)) delete fake[k]; return Promise.resolve(); },
      },
      session: { get: (k) => Promise.resolve({ [k]: null }), set: () => Promise.resolve() },
      onChanged: { addListener: () => {} },
    },
    runtime: { sendMessage: () => Promise.resolve(null), lastError: null, openOptionsPage: () => {} },
  };
  try {
    if (typeof globalThis.chrome !== 'undefined') {
      for (const k of Object.keys(stub)) {
        try { globalThis.chrome[k] = stub[k]; } catch {}
      }
    } else {
      globalThis.chrome = stub;
    }
  } catch {
    try { globalThis.chrome = stub; } catch {}
  }
}

document.getElementById('wm-top').innerHTML  = krumbWordmarkHtml({ size: 15 });
document.getElementById('ic-gh-top').innerHTML = iconSvg(I.github, { size: 14 });
document.getElementById('ic-ext-top').innerHTML = iconSvg(I.external, { size: 11 });

const page = document.getElementById('page');

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function relTime(ts) {
  if (!ts) return 'never';
  const d = Math.max(0, Date.now() - ts);
  const min = Math.round(d / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const days = Math.round(hr / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function renderToggle(id, on) {
  return `<button role="switch" aria-checked="${on ? 'true' : 'false'}" class="k-toggle" data-toggle="${id}">
    <span class="k-toggle__dot"></span>
  </button>`;
}

function renderSegRadio(id, options, value) {
  return `<div class="k-seg" data-seg="${id}">
    ${options.map(o => `
      <button class="k-seg__btn" aria-selected="${o.value === value ? 'true' : 'false'}" data-value="${o.value}">${o.label}</button>
    `).join('')}
  </div>`;
}

function fieldRow({ label, hint, control, align = 'between' }) {
  return `
    <div class="k-field ${align === 'center' ? 'k-field--center' : ''}">
      <div class="k-field__main">
        <div class="k-field__label">${label}</div>
        ${hint ? `<div class="k-field__hint">${hint}</div>` : ''}
      </div>
      <div class="k-field__control">${control}</div>
    </div>
  `;
}

function block({ eyebrow, title, subtitle, content }) {
  return `
    <section class="opt-block">
      <div class="opt-block__rail">
        <div class="opt-block__eyebrow">${eyebrow}</div>
        <div class="opt-block__title">${title}</div>
        ${subtitle ? `<div class="opt-block__sub">${subtitle}</div>` : ''}
      </div>
      <div>${content}</div>
    </section>
  `;
}

function whitelistList(items) {
  if (!items.length) {
    return `<div class="opt-whitelist"><div class="opt-whitelist__empty">No sites whitelisted. To stop Krumb on a site, open the toolbar popup on that site and toggle it off.</div></div>`;
  }
  return `
    <div class="opt-whitelist">
      ${items.map((it, i) => `
        <div class="opt-whitelist__row">
          <div class="opt-whitelist__left">
            <div class="opt-whitelist__globe">${iconSvg(I.globe, { size: 12 })}</div>
            <span class="opt-whitelist__domain">${escapeHtml(it.domain)}</span>
            <span class="opt-whitelist__added">added ${escapeHtml(relTime(it.addedAt))}</span>
          </div>
          <button class="opt-whitelist__remove" data-remove-domain="${escapeHtml(it.domain)}" title="Remove">${iconSvg(I.x, { size: 14 })}</button>
        </div>
      `).join('')}
    </div>
  `;
}

function updateRow({ version, count, updatedAt, fresh }) {
  const pill = fresh
    ? `<span class="k-pill k-pill--accent"><span class="k-pill__dot"></span>fresh</span>`
    : `<span class="k-pill k-pill--mute"><span class="k-pill__dot"></span>stale</span>`;
  return `
    <div class="opt-update">
      <div class="opt-update__main">
        <div class="opt-update__title">List up to date ${pill}</div>
        <div class="opt-update__meta">
          <span class="k-chip">${escapeHtml(version || 'bundled')} · ${count.toLocaleString()} rules</span>
          <span style="color:var(--text-faint);">·</span>
          <span>last checked ${escapeHtml(relTime(updatedAt))}</span>
        </div>
      </div>
      <button class="k-btn k-btn--secondary k-btn--sm" data-action="update-now">${iconSvg(I.refresh, { size: 14 })}<span>Update now</span></button>
    </div>
  `;
}

function statsGrid(stats) {
  const week = statsLast7Days(stats).count;
  const cells = [
    { value: (stats.total || 0).toLocaleString(),     label: 'Total banners auto-rejected',     mono: 'all time' },
    { value: week.toLocaleString(),                   label: 'In the last 7 days',              mono: 'rolling window' },
    { value: '—',                                     label: 'Sites covered by the list',       mono: 'community list', dyn: 'rulesCount' },
    { value: (stats.heuristic || 0).toLocaleString(), label: 'Times the fallback worked',       mono: 'heuristic' },
  ];
  return `
    <div class="opt-stats">
      ${cells.map(c => `
        <div class="opt-stats__cell"${c.dyn ? ` data-stat="${c.dyn}"` : ''}>
          <div class="opt-stats__value">${escapeHtml(c.value)}</div>
          <div class="opt-stats__label">${escapeHtml(c.label)}</div>
          <div class="opt-stats__mono">${escapeHtml(c.mono)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function render() {
  const s = await getSettings();
  page.innerHTML = `
    <div class="opt-header">
      <div>
        <div class="opt-header__eyebrow">Settings · v1.0.0</div>
        <h1 class="opt-header__title">How Krumb works for you</h1>
        <p class="opt-header__desc">Everything below is stored on this device only. Nothing here is ever sent anywhere — not to Krumb, not to your browser vendor, not to anyone.</p>
      </div>
      <span class="k-pill k-pill--${s.enabled ? 'accent' : 'mute'}">
        <span class="k-pill__dot"></span>${s.enabled ? 'active' : 'paused'}
      </span>
    </div>

    ${block({
      eyebrow: '01 · MASTER',
      title: 'Master controls',
      subtitle: 'The big switch and the sites where Krumb stays out of the way.',
      content:
        fieldRow({
          label: 'Krumb is active',
          hint: 'Turning this off pauses Krumb on every site. Your whitelist and rules are preserved.',
          control: renderToggle('enabled', s.enabled),
        }) +
        fieldRow({
          label: 'Whitelisted sites',
          hint: 'Sites where Krumb does nothing. Add a site by clicking the toolbar icon there and toggling "Run on this site" off.',
          control: `<span style="font-size:12.5px; color:var(--text-dim); font-variant-numeric:tabular-nums;">${(s.whitelist || []).length} sites</span>`,
          align: 'start',
        }) +
        whitelistList(s.whitelist || []),
    })}

    ${block({
      eyebrow: '02 · BEHAVIOR',
      title: 'Rejection behavior',
      subtitle: 'What Krumb clicks when a banner offers more than one option.',
      content:
        fieldRow({
          label: 'When the site offers a choice',
          hint: '"Whichever the site offers" is the default — it picks the strictest reject button the site actually exposes, which works on the most sites.',
          control: renderSegRadio('behavior', [
            { value: 'reject', label: 'Reject all' },
            { value: 'necessary', label: 'Necessary only' },
            { value: 'site', label: 'Whichever the site offers' },
          ], s.behavior),
        }) +
        fieldRow({
          label: 'Show a confirmation toast',
          hint: 'Briefly show a "Banner rejected on …" bubble in the corner whenever Krumb acts. Off by default — Krumb\'s job is to disappear.',
          control: renderToggle('showToast', s.showToast),
        }),
    })}

    ${block({
      eyebrow: '03 · SELECTOR LIST',
      title: 'The community list',
      subtitle: `This is the open-source CSS-selector list that tells Krumb which button is "Reject" on each site. It's a single JSON file on GitHub — you can read it, fork it, or contribute.`,
      content:
        fieldRow({
          label: 'Auto-update from GitHub once a day',
          hint: `Fetched from <span class="k-mono">github.com/anasvakyathodi/krumb</span>. The request goes directly to GitHub — never through us.`,
          control: renderToggle('autoUpdateRules', s.autoUpdateRules),
        }) +
        updateRow({
          version: s.rulesVersion,
          count: s.rulesCount || 0,
          updatedAt: s.rulesUpdatedAt,
          fresh: s.rulesUpdatedAt && (Date.now() - s.rulesUpdatedAt < 36 * 60 * 60 * 1000),
        }) +
        fieldRow({
          label: 'Heuristic fallback',
          hint: 'When a site isn\'t in the list, scan the page for visible buttons containing words like "reject", "decline", "necessary only", "no thanks" in 12+ languages. Can occasionally misfire.',
          control: renderToggle('heuristic', s.heuristic),
        }),
    })}

    ${block({
      eyebrow: '04 · STATISTICS',
      title: 'Counted locally, only for you',
      subtitle: 'These numbers live on this device. There is no remote dashboard. We can\'t see them.',
      content:
        statsGrid(s.stats || {}) +
        fieldRow({
          label: 'Reset statistics',
          hint: 'Clears all local counts. Doesn\'t affect your whitelist or rules.',
          control: `<button class="k-btn k-btn--outline k-btn--sm" data-action="reset-stats">${iconSvg(I.refresh, { size: 14 })}<span>Reset</span></button>`,
        }),
    })}

    ${block({
      eyebrow: '05 · RESET',
      title: 'Start over',
      subtitle: '',
      content:
        fieldRow({
          label: 'Reset all settings',
          hint: 'Restores every setting on this page to its default. Your whitelist is cleared. Statistics are kept.',
          control: `<button class="k-btn k-btn--danger k-btn--sm" data-action="reset-all">${iconSvg(I.trash, { size: 14 })}<span>Reset everything</span></button>`,
        }),
    })}

    <div class="opt-privacy">
      <div class="opt-privacy__icon">${iconSvg(I.shield, { size: 18 })}</div>
      <div class="opt-privacy__main">
        <div class="opt-privacy__title">Krumb is fully open-source.</div>
        <div class="opt-privacy__body">No analytics, no telemetry, no error reporting. The selector list is fetched from GitHub directly; we don't see those requests either.</div>
      </div>
      <a class="k-btn k-btn--outline k-btn--sm" href="https://github.com/anasvakyathodi/krumb" target="_blank" rel="noopener" style="text-decoration:none;">
        ${iconSvg(I.github, { size: 14 })}<span>Read the source</span>${iconSvg(I.external, { size: 14 })}
      </a>
    </div>
  `;
  // Patch in live rule count from session if available.
  try {
    const { rulesCount } = await getSettings();
    const cell = page.querySelector('[data-stat="rulesCount"] .opt-stats__value');
    if (cell) cell.textContent = (rulesCount || 0).toLocaleString();
  } catch {}
}

async function onToggle(id) {
  const s = await getSettings();
  const next = !s[id];
  await setSetting(id, next);
  await send(MSG.SETTINGS_CHANGED, { key: id, value: next });
  render();
}

async function onSeg(id, value) {
  await setSetting(id, value);
  await send(MSG.SETTINGS_CHANGED, { key: id, value });
  render();
}

page.addEventListener('click', async (e) => {
  const toggle = e.target.closest('.k-toggle[data-toggle]');
  if (toggle) return onToggle(toggle.getAttribute('data-toggle'));

  const segBtn = e.target.closest('.k-seg__btn');
  if (segBtn) {
    const seg = segBtn.closest('[data-seg]');
    return onSeg(seg.getAttribute('data-seg'), segBtn.getAttribute('data-value'));
  }

  const remove = e.target.closest('[data-remove-domain]');
  if (remove) {
    await removeFromWhitelist(remove.getAttribute('data-remove-domain'));
    return render();
  }

  const action = e.target.closest('[data-action]')?.getAttribute('data-action');
  if (action === 'update-now') {
    const btn = e.target.closest('[data-action]');
    btn.disabled = true;
    btn.innerHTML = `${iconSvg(I.refresh, { size: 14 })}<span>Updating…</span>`;
    await send(MSG.REQUEST_RULES_UPDATE);
    setTimeout(render, 400);
  }
  if (action === 'reset-stats') {
    if (confirm('Clear all local statistics?')) {
      await setSetting('stats', { total: 0, heuristic: 0, failed: 0, daily: {} });
      render();
    }
  }
  if (action === 'reset-all') {
    if (confirm('Reset all Krumb settings to defaults? Your whitelist will be cleared (statistics are kept).')) {
      const s = await getSettings();
      const stats = s.stats;
      await chrome.storage.local.clear();
      await chrome.storage.local.set({ stats });
      render();
    }
  }
});

render();
