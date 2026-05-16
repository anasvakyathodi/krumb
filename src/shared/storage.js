// Krumb — thin chrome.storage wrappers with typed defaults.
// All settings live in chrome.storage.local. Per-tab status lives in
// chrome.storage.session (cleared on browser restart).

export const DEFAULTS = Object.freeze({
  enabled: true,                // master toggle
  behavior: 'site',             // 'reject' | 'necessary' | 'site'
  showToast: false,             // confirmation toast on every action
  autoUpdateRules: true,        // daily GitHub sync
  heuristic: true,              // multilingual fallback
  whitelist: [],                // [{ domain, addedAt }]
  stats: {
    total: 0,
    heuristic: 0,
    failed: 0,
    daily: {},                  // { 'YYYY-MM-DD': count }
  },
  firstTimeToastShown: false,   // one-shot welcome-style toast
  rulesVersion: null,
  rulesUpdatedAt: null,
  rulesCount: 0,
});

export const RULES_REMOTE_URL = 'https://raw.githubusercontent.com/krumb/list/main/rules.json';

export async function getSettings() {
  const raw = await chrome.storage.local.get(Object.keys(DEFAULTS));
  const out = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) if (raw[k] !== undefined) out[k] = raw[k];
  return out;
}

export async function setSetting(key, value) {
  return chrome.storage.local.set({ [key]: value });
}

export async function patchSettings(patch) {
  return chrome.storage.local.set(patch);
}

export async function getTabStatus(tabId) {
  if (tabId == null) return null;
  const k = 'tab:' + tabId;
  const raw = await chrome.storage.session.get(k);
  return raw[k] || null;
}

export async function setTabStatus(tabId, status) {
  if (tabId == null) return;
  return chrome.storage.session.set({ ['tab:' + tabId]: status });
}

export async function clearTabStatus(tabId) {
  if (tabId == null) return;
  return chrome.storage.session.remove('tab:' + tabId);
}

export async function bumpStat(field, by = 1) {
  const { stats } = await getSettings();
  const next = { ...stats };
  next[field] = (next[field] || 0) + by;
  next.daily = { ...(next.daily || {}) };
  const day = new Date().toISOString().slice(0, 10);
  next.daily[day] = (next.daily[day] || 0) + by;
  // Trim daily history to last 60 days.
  const cutoff = Date.now() - 60 * 86400 * 1000;
  for (const d of Object.keys(next.daily)) {
    if (new Date(d).getTime() < cutoff) delete next.daily[d];
  }
  await setSetting('stats', next);
  return next;
}

export function statsLast7Days(stats) {
  const out = { count: 0, days: [] };
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400 * 1000).toISOString().slice(0, 10);
    const n = (stats.daily && stats.daily[d]) || 0;
    out.count += n;
    out.days.push({ day: d, count: n });
  }
  return out;
}

export function domainOf(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch { return ''; }
}

export function isWhitelisted(whitelist, domain) {
  if (!domain) return false;
  return (whitelist || []).some(entry => {
    const d = typeof entry === 'string' ? entry : entry.domain;
    if (!d) return false;
    if (d === '*' ) return true;
    if (d === domain) return true;
    if (d.startsWith('*.')) return domain === d.slice(2) || domain.endsWith('.' + d.slice(2));
    return domain.endsWith('.' + d);
  });
}

export async function addToWhitelist(domain) {
  const { whitelist } = await getSettings();
  if (isWhitelisted(whitelist, domain)) return whitelist;
  const next = [...(whitelist || []), { domain, addedAt: Date.now() }];
  await setSetting('whitelist', next);
  return next;
}

export async function removeFromWhitelist(domain) {
  const { whitelist } = await getSettings();
  const next = (whitelist || []).filter(e => (typeof e === 'string' ? e : e.domain) !== domain);
  await setSetting('whitelist', next);
  return next;
}
