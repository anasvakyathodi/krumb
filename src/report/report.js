// Krumb — report dialog (rendered inside the popup body)
// Submitting opens a pre-filled GitHub issue in a new tab; no backend.

import { I, iconSvg } from '../shared/icons.js';
import { MSG, send } from '../shared/messaging.js';

const ISSUE_URL = 'https://github.com/anasvakyathodi/krumb/issues/new';

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function renderReport({ root, site, onCancel, prefill = null }) {
  root.innerHTML = `
    <div class="report-shell">
      <div class="report-header">
        <div class="report-header__title">
          ${iconSvg(I.flag, { size: 14, stroke: 'var(--accent-bright)' })}
          <span>Report a broken banner</span>
        </div>
        <button class="report-close" data-action="close">${iconSvg(I.x, { size: 14 })}</button>
      </div>
      <div class="report-body" id="report-body">
        <div class="report-field">
          <div class="report-field__row">
            <label class="report-field__label">SITE</label>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="k-chip k-chip--accent k-chip--md">${escapeHtml(site || 'this site')}</span>
            <span style="font-size:11px; color:var(--text-faint);">auto-detected</span>
          </div>
        </div>

        <div class="report-field">
          <div class="report-field__row">
            <label class="report-field__label">WHAT DID YOU SEE?</label>
            <span class="report-field__optional">optional</span>
          </div>
          <textarea id="report-notes" rows="3" class="report-input" placeholder="The banner says '…' but Krumb didn't catch it."></textarea>
        </div>

        <div class="report-field">
          <div class="report-field__row">
            <label class="report-field__label">WHICH BUTTON SHOULD BE CLICKED?</label>
          </div>
          <div style="display:flex; align-items:stretch; gap:6px;">
            <input id="report-selector" type="text" class="report-input k-mono" placeholder="paste a CSS selector or click 'highlight'" />
            <button class="k-btn k-btn--secondary k-btn--sm" data-action="highlight">
              ${iconSvg(I.cursor, { size: 14 })}<span>Highlight</span>
            </button>
          </div>
          <div class="report-field__hint">Clicking 'Highlight' lets you pick the reject button on the page itself.</div>
        </div>
      </div>

      <div class="report-footer">
        <button class="k-btn k-btn--primary k-btn--sm k-btn--full" data-action="submit">
          <span>Open GitHub issue</span>${iconSvg(I.external, { size: 14 })}
        </button>
        <button class="k-btn k-btn--ghost k-btn--sm" data-action="cancel">Cancel</button>
      </div>
      <div class="report-disclaimer">
        Krumb sends nothing automatically — the next screen is GitHub, where <em>you</em> review and post.
      </div>
    </div>
  `;

  // Pre-fill when arriving here from the on-page picker. Restore the
  // notes the user typed before clicking Highlight, then the selector
  // (preferring the freshly-picked one over anything they had manually
  // typed). If they typed nothing, leave a hint about the picked label.
  if (prefill) {
    const sel = document.getElementById('report-selector');
    const notesEl = document.getElementById('report-notes');
    if (sel) sel.value = prefill.selector || prefill.manualSelector || '';
    if (notesEl) {
      if (prefill.notes) {
        notesEl.value = prefill.notes;
      } else if (prefill.label) {
        notesEl.value = `Reject button label on page: "${prefill.label}"`;
      }
    }
  }

  const close = () => { if (typeof onCancel === 'function') onCancel(); };

  root.addEventListener('click', async (e) => {
    const action = e.target.closest('[data-action]')?.getAttribute('data-action');
    if (action === 'cancel' || action === 'close') return close();

    if (action === 'highlight') {
      // Save the in-flight notes so the user doesn't lose what they
      // typed during the picker round-trip. Read both fields back when
      // the popup reopens with the picker result.
      const notes = document.getElementById('report-notes')?.value || '';
      const selector = document.getElementById('report-selector')?.value || '';
      try {
        await chrome.storage.session.set({
          'report:draft': { notes, selector, site, at: Date.now() },
        });
      } catch {}
      await send(MSG.OPEN_PICKER, { site });
      window.close();
      return;
    }

    if (action === 'submit') {
      const notes = document.getElementById('report-notes')?.value || '';
      const selector = document.getElementById('report-selector')?.value || '';
      const title = `[selector] ${site || 'unknown-site'}`;
      const body = [
        `**Site:** ${site || 'unknown'}`,
        '',
        `**What I saw:**`,
        notes || '_(not provided)_',
        '',
        `**Suggested selector:**`,
        selector ? '`' + selector + '`' : '_(not provided)_',
        '',
        '— filed via Krumb v1.0.0',
      ].join('\n');
      const url = `${ISSUE_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent('selector,from-extension')}`;
      // Open in a real Chrome tab — window.open from a popup is often
      // suppressed because the popup loses focus the moment we click,
      // dismissing the open call before the tab can be created.
      try {
        await chrome.tabs.create({ url });
      } catch {
        window.open(url, '_blank'); // last-ditch fallback for non-extension contexts
      }
      // Show a brief "submitted" state then close.
      renderSubmitted({ root, onCancel });
    }
  }, { once: false });
}

export function renderSubmitted({ root, onCancel }) {
  root.innerHTML = `
    <div class="report-shell">
      <div class="report-header">
        <div class="report-header__title">
          ${iconSvg(I.flag, { size: 14, stroke: 'var(--accent-bright)' })}
          <span>Report a broken banner</span>
        </div>
        <button class="report-close" data-action="close">${iconSvg(I.x, { size: 14 })}</button>
      </div>
      <div class="report-submitted">
        <div class="report-submitted__icon">${iconSvg(I.check, { size: 24, strokeWidth: 2 })}</div>
        <div class="report-submitted__title">Thanks — your issue is open</div>
        <div class="report-submitted__sub">A maintainer will verify the selector and merge it. Everyone gets the fix on the next daily sync.</div>
        <div style="margin-top:18px;">
          <button class="k-btn k-btn--outline k-btn--sm" data-action="done">${iconSvg(I.check, { size: 14 })}<span>Done</span></button>
        </div>
      </div>
    </div>
  `;
  root.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.getAttribute('data-action');
    if (action === 'done' || action === 'close') {
      if (typeof onCancel === 'function') onCancel();
    }
  });
}
