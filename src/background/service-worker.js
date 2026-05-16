// Krumb — background service worker (MV3, module).
// Responsibilities:
//   • Install hook → open welcome tab.
//   • Daily selector-list sync from GitHub via chrome.alarms.
//   • Context menu "Krumb — report this banner".
//   • Message router for popup / options / content-script messages.
//   • Per-tab badge / icon state.

import {
  getSettings, setSetting, patchSettings, getTabStatus, setTabStatus,
  clearTabStatus, bumpStat, isWhitelisted, addToWhitelist, removeFromWhitelist,
  domainOf, statsLast7Days, DEFAULTS, RULES_REMOTE_URL,
} from '../shared/storage.js';
import { MSG } from '../shared/messaging.js';

const ALARM_SYNC = 'krumb:sync-rules';
const ICONS = {
  default:    { 16: 'src/assets/icon-default-16.png',    32: 'src/assets/icon-default-32.png',    48: 'src/assets/icon-default-48.png',    128: 'src/assets/icon-default-128.png' },
  'just-acted': { 16: 'src/assets/icon-just-acted-16.png', 32: 'src/assets/icon-just-acted-32.png', 48: 'src/assets/icon-just-acted-48.png', 128: 'src/assets/icon-just-acted-128.png' },
  failed:     { 16: 'src/assets/icon-failed-16.png',     32: 'src/assets/icon-failed-32.png',     48: 'src/assets/icon-failed-48.png',     128: 'src/assets/icon-failed-128.png' },
  paused:     { 16: 'src/assets/icon-paused-16.png',     32: 'src/assets/icon-paused-32.png',     48: 'src/assets/icon-paused-48.png',     128: 'src/assets/icon-paused-128.png' },
};

// ─────────────────────────── Install / startup ───────────────────────────
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/welcome/welcome.html') });
  }
  await ensureDefaults();
  await registerContextMenu();
  await scheduleSync();
  await maybeSyncRules({ force: false });
  await primeBundledRulesCount();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureDefaults();
  await registerContextMenu();
  await scheduleSync();
});

async function ensureDefaults() {
  const s = await chrome.storage.local.get(Object.keys(DEFAULTS));
  const patch = {};
  for (const k of Object.keys(DEFAULTS)) {
    if (s[k] === undefined) patch[k] = DEFAULTS[k];
  }
  if (Object.keys(patch).length) await chrome.storage.local.set(patch);
}

async function primeBundledRulesCount() {
  try {
    const url = chrome.runtime.getURL('src/selectors/bundled-rules.json');
    const res = await fetch(url);
    const json = await res.json();
    const count = (json.rules || []).length;
    const { rulesCount } = await getSettings();
    if (!rulesCount) await setSetting('rulesCount', count);
  } catch {}
}

// ─────────────────────────── Context menu ───────────────────────────
async function registerContextMenu() {
  try {
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: 'krumb-report',
      title: 'Krumb — report this banner',
      contexts: ['page', 'selection'],
    });
  } catch {}
}

chrome.contextMenus.onClicked?.addListener?.((info, tab) => {
  if (info.menuItemId === 'krumb-report' && tab?.id != null) {
    // Open the action popup so the user lands in the report flow.
    chrome.action.openPopup?.().catch(() => {});
  }
});

// ─────────────────────────── Sync rules from GitHub ───────────────────────────
async function scheduleSync() {
  try {
    await chrome.alarms.clear(ALARM_SYNC);
    chrome.alarms.create(ALARM_SYNC, { periodInMinutes: 24 * 60 });
  } catch {}
}

chrome.alarms?.onAlarm?.addListener?.(async (alarm) => {
  if (alarm.name === ALARM_SYNC) {
    const { autoUpdateRules } = await getSettings();
    if (autoUpdateRules) maybeSyncRules({ force: false });
  }
});

async function maybeSyncRules({ force = false } = {}) {
  const { autoUpdateRules, rulesUpdatedAt } = await getSettings();
  if (!force && !autoUpdateRules) return false;
  if (!force && rulesUpdatedAt && (Date.now() - rulesUpdatedAt) < 23 * 60 * 60 * 1000) return false;
  try {
    const res = await fetch(RULES_REMOTE_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    const rules = Array.isArray(json.rules) ? json.rules : [];
    await chrome.storage.local.set({
      cachedRules: { rules, version: json.version || null, fetchedAt: Date.now() },
      rulesVersion: json.version || null,
      rulesUpdatedAt: Date.now(),
      rulesCount: rules.length,
    });
    return true;
  } catch (err) {
    // Silently keep cached / bundled rules.
    await setSetting('rulesUpdatedAt', Date.now()); // record attempt
    return false;
  }
}

// ─────────────────────────── Tab status / icon ───────────────────────────
async function applyIcon(tabId, state) {
  try {
    const set = ICONS[state] || ICONS.default;
    await chrome.action.setIcon({ tabId, path: set });
  } catch {}
}

async function applyBadge(tabId, status, paused) {
  try {
    if (paused) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      return;
    }
    if (status?.kind === 'failed') {
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#d4a800' });
      await chrome.action.setBadgeText({ tabId, text: '?' });
      return;
    }
    await chrome.action.setBadgeText({ tabId, text: '' });
  } catch {}
}

async function applyTabState(tabId, url) {
  const settings = await getSettings();
  if (!settings.enabled) {
    await applyIcon(tabId, 'paused');
    await applyBadge(tabId, null, true);
    return;
  }
  const host = domainOf(url || '');
  if (isWhitelisted(settings.whitelist, host)) {
    await applyIcon(tabId, 'paused');
    await applyBadge(tabId, null, true);
    return;
  }
  const status = await getTabStatus(tabId);
  if (status?.kind === 'rejected') {
    await applyIcon(tabId, 'just-acted');
    await applyBadge(tabId, status, false);
    // fade back to default after 2.5s.
    setTimeout(() => applyIcon(tabId, 'default'), 2500);
    return;
  }
  if (status?.kind === 'failed') {
    await applyIcon(tabId, 'failed');
    await applyBadge(tabId, status, false);
    return;
  }
  await applyIcon(tabId, 'default');
  await applyBadge(tabId, status, false);
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab) applyTabState(tabId, tab.url);
});
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === 'loading') clearTabStatus(tabId);
  applyTabState(tabId, tab.url);
});
chrome.tabs.onRemoved.addListener((tabId) => clearTabStatus(tabId));

// ─────────────────────────── Message router ───────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || !msg.type) return sendResponse(null);
    try {
      switch (msg.type) {
        case MSG.CONTENT_REPORT: {
          const tabId = sender.tab?.id;
          if (tabId == null) return sendResponse(null);
          const s = msg.status;
          // Only the top frame's verdict is authoritative for icon state,
          // but any frame's rejection counts as a stat.
          if (s.kind === 'rejected') {
            await bumpStat('total');
            if (s.source === 'heuristic') await bumpStat('heuristic');
            // Show first-time toast once.
            const settings = await getSettings();
            if (!settings.firstTimeToastShown) {
              await setSetting('firstTimeToastShown', true);
              chrome.tabs.sendMessage(tabId, { type: 'krumb:showToast', variant: 'first-time', site: s.site || domainOf(sender.tab.url) }).catch(() => {});
            } else if (settings.showToast) {
              chrome.tabs.sendMessage(tabId, { type: 'krumb:showToast', variant: 'confirm', site: s.site || domainOf(sender.tab.url) }).catch(() => {});
            }
          }
          if (s.kind === 'failed') await bumpStat('failed');
          if (msg.topFrame || s.kind === 'rejected') {
            await setTabStatus(tabId, s);
            applyTabState(tabId, sender.tab.url);
          }
          return sendResponse({ ok: true });
        }

        case MSG.TOGGLE_PAUSED: {
          const { paused } = msg;
          await setSetting('enabled', !paused);
          await broadcastSettingsChange();
          return sendResponse({ ok: true });
        }

        case MSG.TOGGLE_SITE: {
          const { site, enabled } = msg;
          if (!site) return sendResponse({ ok: false });
          if (enabled) await removeFromWhitelist(site);
          else         await addToWhitelist(site);
          await broadcastSettingsChange();
          // Toast the active tab.
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tab = tabs[0];
          if (tab?.id != null) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'krumb:showToast', variant: 'whitelist', site,
            }).catch(() => {});
          }
          return sendResponse({ ok: true });
        }

        case MSG.SETTINGS_CHANGED: {
          await broadcastSettingsChange();
          // Re-skin all tabs (icon state may need to change).
          const tabs = await chrome.tabs.query({});
          for (const t of tabs) if (t.id != null) applyTabState(t.id, t.url);
          return sendResponse({ ok: true });
        }

        case MSG.REQUEST_RULES_UPDATE: {
          const ok = await maybeSyncRules({ force: true });
          return sendResponse({ ok });
        }

        case MSG.OPEN_PICKER: {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tab = tabs[0];
          if (tab?.id == null) return sendResponse({ ok: false });
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id, allFrames: false },
              files: ['src/content/picker.js'],
            });
            return sendResponse({ ok: true });
          } catch (e) {
            return sendResponse({ ok: false, error: String(e) });
          }
        }

        case MSG.PICKER_RESULT: {
          // Stash the picked selector for the popup to read on next open.
          await chrome.storage.session.set({ 'picker:last': { selector: msg.selector, label: msg.label, at: Date.now() } });
          chrome.action.openPopup?.().catch(() => {});
          return sendResponse({ ok: true });
        }

        case MSG.GET_STATUS: {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tab = tabs[0];
          const status = tab?.id != null ? await getTabStatus(tab.id) : null;
          return sendResponse({ status, tab: { id: tab?.id, url: tab?.url } });
        }

        case MSG.RESET_TAB: {
          const tabId = msg.tabId ?? sender.tab?.id;
          if (tabId != null) {
            await clearTabStatus(tabId);
            applyTabState(tabId, msg.url);
          }
          return sendResponse({ ok: true });
        }
      }
    } catch (err) {
      console.error('[krumb sw]', err);
      sendResponse({ ok: false, error: String(err) });
    }
  })();
  return true; // keep channel open for async response
});

async function broadcastSettingsChange() {
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    if (t.id == null) continue;
    chrome.tabs.sendMessage(t.id, { type: 'krumb:reTry', because: 'settings-changed' }).catch(() => {});
  }
}
