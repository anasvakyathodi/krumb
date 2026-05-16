// Krumb — welcome page boot

import { I, iconSvg, krumbMarkSvg, krumbWordmarkHtml } from '../shared/icons.js';
import { getSettings, statsLast7Days } from '../shared/storage.js';

document.getElementById('wm-topbar').innerHTML = krumbWordmarkHtml({ size: 16 });
document.getElementById('ic-arrow').innerHTML = iconSvg(I.arrow, { size: 14 });
document.getElementById('ic-gh').innerHTML    = iconSvg(I.github, { size: 14 });
document.getElementById('ic-ext').innerHTML   = iconSvg(I.external, { size: 12 });
document.getElementById('ic-mark').innerHTML  = krumbMarkSvg({ size: 20 });
document.getElementById('ic-shield').innerHTML = iconSvg(I.shield, { size: 22 });

for (const id of ['b1', 'b2', 'b3', 'b4']) {
  document.getElementById(id).innerHTML = iconSvg(I.check, { size: 13 });
}

// Wire actions — these only work inside an extension context.
document.getElementById('open-settings').addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  }
});
function openTab(url) {
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url });
      return;
    }
  } catch {}
  window.open(url, '_blank');
}
document.getElementById('open-github').addEventListener('click', () => {
  openTab('https://github.com/anasvakyathodi/krumb');
});
document.getElementById('try-sample').addEventListener('click', () => {
  openTab('https://www.nytimes.com');
});

// Local week counter (best-effort; static fallback if storage is unavailable).
(async () => {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const settings = await getSettings();
    const { count } = statsLast7Days(settings.stats);
    document.getElementById('counter-local').textContent = count.toLocaleString();
  } catch {}
})();
