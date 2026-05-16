// Krumb — selector picker overlay.
// Injected into the active tab via chrome.scripting.executeScript when the
// user clicks "Highlight" in the report dialog. Lets them point at the
// reject button on the page; on click, returns the unique CSS selector
// back to the service worker via runtime.sendMessage.

(function () {
  if (window.__krumbPickerActive) return;
  window.__krumbPickerActive = true;

  const host = document.createElement('div');
  host.setAttribute('data-krumb-picker', '');
  host.style.cssText = 'position:fixed; inset:0; z-index:2147483646; pointer-events:none;';
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .hud {
        position: fixed; top: 0; left: 0; right: 0;
        padding: 10px 16px;
        background: rgba(11,12,14,0.96); color: #ededec;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        display: flex; align-items: center; gap: 14px;
        border-bottom: 1px solid rgba(255,255,255,0.10);
        pointer-events: auto;
      }
      .hud__mark {
        width: 16px; height: 16px; border-radius: 4px; background: #5dd884;
        position: relative;
      }
      .hud__mark::before {
        content: ''; position: absolute; top: -3px; right: -3px;
        width: 7px; height: 7px; border-radius: 50%; background: rgba(11,12,14,0.96);
      }
      .hud__main { flex: 1; }
      .hud__title { font-size: 12px; font-weight: 600; }
      .hud__sub   { font-size: 11px; color: #8e9298; margin-top: 2px; }
      .hud__sel   { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6ee895;
                    max-width: 280px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
      .hud__btn {
        font: inherit; color: #ededec; background: transparent;
        border: 1px solid rgba(255,255,255,0.18); border-radius: 6px;
        padding: 5px 10px; font-size: 12px; cursor: pointer;
      }
      .kbd {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 18px; height: 16px; padding: 0 5px;
        font-family: 'JetBrains Mono', monospace; font-size: 10px;
        color: #8e9298; background: #1c1f24;
        border: 1px solid rgba(255,255,255,0.10);
        border-bottom-width: 2px; border-radius: 4px;
      }
      .ring {
        position: fixed; pointer-events: none;
        border: 2px solid #6ee895;
        border-radius: 8px;
        box-shadow: 0 0 0 6px rgba(93,216,132,0.18);
        transition: all 60ms ease;
      }
      .ring__label {
        position: absolute; left: -1px; top: -22px;
        background: #5dd884; color: #06120a;
        padding: 2px 8px; border-radius: 4px 4px 4px 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
      }
      .dim {
        position: fixed; inset: 0; pointer-events: none;
        background: rgba(11,12,14,0.18);
        mix-blend-mode: multiply;
      }
    </style>
    <div class="dim"></div>
    <div class="hud">
      <div class="hud__mark"></div>
      <div class="hud__main">
        <div class="hud__title">Click the reject button on the page</div>
        <div class="hud__sub">Hover an element to preview · <span class="kbd">Esc</span> to cancel</div>
      </div>
      <div class="hud__sel" id="hud-sel">—</div>
      <button class="hud__btn" id="hud-cancel">Cancel</button>
    </div>
    <div class="ring" id="ring" style="display:none;"><div class="ring__label">SELECT THIS BUTTON</div></div>
  `;

  const ring = shadow.getElementById('ring');
  const hudSel = shadow.getElementById('hud-sel');
  shadow.getElementById('hud-cancel').addEventListener('click', cleanup);

  let lastEl = null;

  function uniqueSelector(el) {
    if (!el || el.nodeType !== 1) return '';
    if (el.id) return '#' + CSS.escape(el.id);
    const parts = [];
    let node = el;
    while (node && node !== document.documentElement) {
      let part = node.tagName.toLowerCase();
      if (node.classList?.length) {
        const cls = [...node.classList].slice(0, 2).map(c => '.' + CSS.escape(c)).join('');
        part += cls;
      }
      // disambiguate via :nth-of-type if siblings share the tag
      const parent = node.parentNode;
      if (parent && parent.children) {
        const sibs = [...parent.children].filter(s => s.tagName === node.tagName);
        if (sibs.length > 1) part += `:nth-of-type(${sibs.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = parent;
      if (parts.length > 5) break;
    }
    return parts.join(' > ');
  }

  function isOurs(el) {
    return el && (el === host || host.contains(el) || (el.closest && el.closest('[data-krumb-picker]')));
  }

  function onMove(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || isOurs(el)) { ring.style.display = 'none'; lastEl = null; hudSel.textContent = '—'; return; }
    if (el === lastEl) return;
    lastEl = el;
    const r = el.getBoundingClientRect();
    ring.style.display = 'block';
    ring.style.left = (r.left - 4) + 'px';
    ring.style.top = (r.top - 4) + 'px';
    ring.style.width = (r.width + 8) + 'px';
    ring.style.height = (r.height + 8) + 'px';
    hudSel.textContent = uniqueSelector(el);
  }

  function onClick(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || isOurs(el)) return;
    e.preventDefault(); e.stopPropagation();
    const selector = uniqueSelector(el);
    chrome.runtime.sendMessage({
      type: 'krumb:pickerResult',
      selector,
      label: (el.textContent || '').slice(0, 80).trim(),
    });
    cleanup();
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cleanup(); }
  }

  function cleanup() {
    window.__krumbPickerActive = false;
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey, true);
    host.remove();
  }

  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey, true);
})();
