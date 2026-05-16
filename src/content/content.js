// Krumb — content script. Runs at document_start in every frame.
// Responsibility:
//   1. Read settings (paused? whitelisted host? auth page?).
//   2. Load rules (bundled + cached remote).
//   3. Try selector match → if hit, click & report.
//   4. If no match, run the multilingual heuristic.
//   5. Watch DOM mutations and re-run, debounced.
//
// Imports are inlined (content scripts can't use ES modules from manifest
// without `"type":"module"` which only background supports), so we duplicate
// the small things we need from /shared/ inline below.

(function () {
  // Avoid re-injection (HMR-style page reloads, iframe rebinding).
  if (window.__krumbContent) return;
  window.__krumbContent = true;

  const START = performance.now();

  // ─────────────────────────── Inline shared bits ───────────────────────────
  const REJECT_PHRASES = [
    'reject all','reject','decline all','decline','deny all','deny',
    'necessary only','only necessary','essential only','only essential',
    'no thanks','no, thanks',"don't accept",'do not accept',
    'continue without accepting','opt out','refuse all','refuse',
    'tout refuser','refuser','refuser tout','continuer sans accepter',
    'tout rejeter','rejeter tout','sans accepter',
    'alle ablehnen','ablehnen','nur notwendige','nur essenzielle','nur erforderliche',
    'rechazar todo','rechazar','rechazar todas','solo necesarias','continuar sin aceptar',
    'rifiuta tutto','rifiuta','solo necessari','continua senza accettare',
    'rejeitar tudo','rejeitar','recusar tudo','recusar','apenas necessarios',
    'alles weigeren','weigeren','alleen noodzakelijke','doorgaan zonder akkoord',
    'odrzuc wszystko','odrzuc','tylko niezbedne',
    'avvisa alla','avvisa','afvis alle','afvis','avvis alle','avvis',
    'otklonit vse','otklonit','tolko neobkhodimye',
    'tumunu reddet','reddet','sadece gerekli',
    '拒否','すべて拒否','同意しない','拒绝','全部拒绝','仅必要','不接受','거부','모두 거부','필수만',
  ];
  const POISON_PHRASES = [
    'accept','agree','allow','accept all','continue with all',
    'sign in','log in','login','submit','save','subscribe',
    'tout accepter','akzeptieren','aceptar','accetta','aceitar','akkoord','동의','同意','接受',
  ];
  function normalise(s) {
    if (!s) return '';
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function matchesReject(label) {
    const n = normalise(label);
    if (!n || n.length > 64) return null;
    for (const p of POISON_PHRASES) if (n === p || n.startsWith(p + ' ') && !n.includes('without ' + p) && !n.includes('sans ' + p)) return null;
    for (const phrase of REJECT_PHRASES) {
      if (n === phrase) return { phrase, confidence: 1 };
      if (n.startsWith(phrase + ' ') || n.endsWith(' ' + phrase)) return { phrase, confidence: 0.85 };
    }
    return null;
  }

  function domainOf(href) {
    try { return new URL(href).hostname.replace(/^www\./, ''); } catch { return ''; }
  }

  function matchDomain(pattern, host) {
    if (!pattern || !host) return false;
    if (pattern === '*') return true;
    if (pattern === host) return true;
    if (pattern.startsWith('*.')) {
      const base = pattern.slice(2);
      return host === base || host.endsWith('.' + base);
    }
    return host === pattern || host.endsWith('.' + pattern);
  }

  function isWhitelisted(list, host) {
    if (!host) return false;
    return (list || []).some(e => matchDomain(typeof e === 'string' ? e : e.domain, host));
  }

  // ─────────────────────────── Setup ───────────────────────────
  const isTop = window === window.top;
  const host = location.hostname.replace(/^www\./, '');

  let settings = null;
  let rules = null;
  let observer = null;
  let didReport = false;
  let bannerSeen = false;

  function postStatus(status) {
    try {
      chrome.runtime.sendMessage({
        type: 'krumb:contentReport',
        status,
        site: host,
        url: location.href,
        topFrame: isTop,
      });
    } catch {}
  }

  function safeClick(el) {
    if (!el || !(el instanceof Element)) return false;
    try {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } catch {}
    try { el.click(); return true; }
    catch {}
    try {
      // Some banners use pointer events not 'click'.
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    } catch { return false; }
  }

  function elementVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function isAuthPage() {
    // Spec §7.8 — never interact on auth pages.
    const pwds = document.querySelectorAll('input[type="password"]');
    for (const p of pwds) if (elementVisible(p)) return true;
    return false;
  }

  function findFirstMatch(selectors) {
    for (const sel of selectors) {
      try {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (elementVisible(el)) return { el, sel };
        }
      } catch {/* invalid selector — skip */}
    }
    return null;
  }

  function pickBehaviorOrder(behavior) {
    // Returns the preferred order of phrase-match weights for heuristic mode.
    // 'reject' favors total rejection, 'necessary' favors "necessary only".
    if (behavior === 'necessary') {
      return ['necessary only','only necessary','essential only','reject all','reject','decline'];
    }
    if (behavior === 'reject') {
      return ['reject all','decline all','deny all','reject','decline','deny'];
    }
    return ['reject all','decline all','deny all','necessary only','only necessary',
            'reject','decline','deny','continue without accepting','refuser','tout refuser','ablehnen'];
  }

  // Banner-context keywords. The ancestor chain of a matching button must
  // contain at least one of these somewhere in its text or attributes, in
  // any of the supported languages. Anything else is treated as a false
  // positive (e.g. a "Decline review" button on a GitHub PR page).
  const BANNER_KEYWORDS_RE = /\b(cookie|cookies|consent|consents|consentement|privacy|privacidad|privacidade|privatsphare|gdpr|ccpa|tracking|trackers?|datenschutz|confidentialite|kuki|кук|쿠키|クッキー|cookie 政策|个人信息|个性化|偏好|prywatnosci|tietosuoja|integritet|biscoito|biscotti|cookie-erklarung|cookieinstellungen|cookie-einstellungen|cookie banner|cookie notice|cookie preferences|consent banner|consent management)\b/i;

  function ancestorIsBannerLike(el) {
    // Walk up the tree and check for: (a) a fixed/sticky-positioned ancestor
    // (banners are almost always overlay-positioned), AND (b) banner-keyword
    // text somewhere in that ancestor's subtree or attributes. If both,
    // we're confident the button is inside a banner.
    let node = el;
    let posAncestor = null;
    for (let i = 0; i < 12 && node && node !== document.body; i++) {
      try {
        const cs = getComputedStyle(node);
        if (cs.position === 'fixed' || cs.position === 'sticky') {
          posAncestor = node;
          break;
        }
      } catch {}
      node = node.parentElement;
    }
    if (!posAncestor) return false;

    // Check text content + key attributes of the fixed/sticky ancestor.
    const text = (posAncestor.textContent || '').slice(0, 4000);
    if (BANNER_KEYWORDS_RE.test(text)) return true;
    const attrs = [
      posAncestor.id, posAncestor.className,
      posAncestor.getAttribute?.('aria-label'),
      posAncestor.getAttribute?.('role'),
      posAncestor.getAttribute?.('data-testid'),
    ].filter(Boolean).join(' ');
    if (BANNER_KEYWORDS_RE.test(attrs)) return true;

    // Dialog role is also a strong signal (CMP modals often have role=dialog).
    const role = posAncestor.getAttribute?.('role');
    if (role === 'dialog' || role === 'alertdialog') {
      // Even in a dialog, require some keyword evidence elsewhere on page.
      const bodySnippet = (document.body?.textContent || '').slice(0, 8000);
      if (BANNER_KEYWORDS_RE.test(bodySnippet)) return true;
    }
    return false;
  }

  // The heuristic is only safe in the first few seconds after the page
  // starts loading. After that, the user is interacting with the actual
  // app and ambient "reject"/"decline" buttons (PR review, calendar
  // invites, etc.) become the more common kind.
  const HEURISTIC_WINDOW_MS = 8000;

  function runHeuristic(behavior) {
    if (isAuthPage()) return null;
    if (performance.now() - START > HEURISTIC_WINDOW_MS) return null;
    const candidates = document.querySelectorAll('button, a[role="button"], [role="button"], input[type="button"], input[type="submit"]');
    const prefs = pickBehaviorOrder(behavior);
    let best = null;
    for (const el of candidates) {
      if (!elementVisible(el)) continue;
      const label = el.getAttribute('aria-label') || el.textContent || el.value || '';
      const m = matchesReject(label);
      if (!m) continue;
      // Hard gate: button must live inside a plausible banner container.
      if (!ancestorIsBannerLike(el)) continue;
      const prefIdx = prefs.indexOf(m.phrase);
      const score = m.confidence + (prefIdx >= 0 ? (prefs.length - prefIdx) * 0.1 : 0);
      if (!best || score > best.score) best = { el, label, phrase: m.phrase, score };
    }
    return best;
  }

  async function loadSettings() {
    return new Promise(resolve => {
      try {
        chrome.storage.local.get(null, (raw) => {
          resolve(raw || {});
        });
      } catch { resolve({}); }
    });
  }

  async function loadRules() {
    // Prefer cached remote rules, else bundled.
    try {
      const data = await new Promise(resolve => {
        chrome.storage.local.get('cachedRules', (raw) => resolve(raw?.cachedRules || null));
      });
      if (data?.rules?.length) return data.rules;
    } catch {}
    try {
      const url = chrome.runtime.getURL('src/selectors/bundled-rules.json');
      const res = await fetch(url);
      const json = await res.json();
      return json.rules || [];
    } catch { return []; }
  }

  function matchingRulesFor(host, rules) {
    return rules.filter(r => matchDomain(r.domain, host));
  }

  async function tryReject() {
    if (didReport && !bannerSeen) return;
    if (!settings || settings.enabled === false) { return; }
    if (isWhitelisted(settings.whitelist, host)) {
      if (!didReport) { didReport = true; postStatus({ kind: 'no-banner', reason: 'whitelisted' }); }
      return;
    }
    if (isAuthPage()) { return; }

    // 1. Try rule selectors.
    const matchedRules = matchingRulesFor(host, rules || []);
    for (const rule of matchedRules) {
      const hit = findFirstMatch(rule.selectors);
      if (hit) {
        bannerSeen = true;
        if (safeClick(hit.el)) {
          didReport = true;
          const latency = performance.now() - START;
          postStatus({ kind: 'rejected', selector: hit.sel, source: 'rules', latency });
          return;
        }
      }
    }

    // 2. Heuristic fallback.
    if (settings.heuristic !== false) {
      const found = runHeuristic(settings.behavior || 'site');
      if (found) {
        bannerSeen = true;
        if (safeClick(found.el)) {
          didReport = true;
          const latency = performance.now() - START;
          postStatus({ kind: 'rejected', selector: '(heuristic)', source: 'heuristic', latency, phrase: found.phrase });
          return;
        }
      }
    }

    // 3. Nothing matched yet — keep watching; if MutationObserver settles
    //    without anything, report no-banner (after timeout).
  }

  let mutTimer = null;
  function onMutations() {
    clearTimeout(mutTimer);
    mutTimer = setTimeout(tryReject, 50);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(onMutations);
    const target = document.documentElement || document;
    observer.observe(target, { childList: true, subtree: true });
  }

  // After a quiet window, finalise status as no-banner.
  function scheduleNoBannerVerdict() {
    setTimeout(() => {
      if (!didReport) {
        didReport = true;
        postStatus({ kind: 'no-banner' });
      }
    }, 4000);
    setTimeout(() => {
      if (observer) observer.disconnect();
      observer = null;
    }, 15000);
  }

  // ─────────────────────────── Boot ───────────────────────────
  (async () => {
    settings = await loadSettings();
    if (settings.enabled === false) return; // do nothing
    rules = await loadRules();
    // Initial attempt as soon as DOM begins.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { tryReject(); }, { once: true });
    } else {
      tryReject();
    }
    startObserver();
    if (isTop) scheduleNoBannerVerdict();
  })();

  // Honour live settings changes (toast, behavior, master).
  chrome.storage.onChanged?.addListener?.((changes, area) => {
    if (area !== 'local') return;
    for (const k of Object.keys(changes)) {
      if (k in (settings || {})) settings[k] = changes[k].newValue;
    }
  });

  // Inject toast on demand from service worker.
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === 'krumb:showToast' && isTop) {
      showToast(msg.variant || 'confirm', msg.site || host);
    }
    if (msg.type === 'krumb:reTry' && msg.because === 'settings-changed') {
      didReport = false; bannerSeen = false;
      tryReject();
    }
    return false;
  });

  // ─────────────────────────── Toasts (Shadow DOM) ───────────────────────────
  let toastHost = null;
  function ensureToastHost() {
    if (toastHost && document.documentElement.contains(toastHost)) return toastHost;
    toastHost = document.createElement('div');
    toastHost.setAttribute('data-krumb-toast-host', '');
    toastHost.style.cssText = 'position:fixed; right:16px; bottom:16px; z-index:2147483647; pointer-events:none;';
    document.documentElement.appendChild(toastHost);
    const root = toastHost.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { all: initial; }
        .stack { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
        .toast {
          pointer-events: auto;
          background: #15171b; color: #ededec;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          padding: 12px 14px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06);
          display: flex; align-items: flex-start; gap: 12px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          opacity: 0; transform: translateY(20px);
          transition: opacity 180ms ease, transform 180ms ease;
        }
        .toast.in { opacity: 1; transform: translateY(0); }
        .toast.out { opacity: 0; transform: translateY(20px); }
        .toast--large { padding: 14px 16px; }
        .ic {
          width: 26px; height: 26px; border-radius: 8px;
          background: rgba(110, 232, 149, 0.12);
          color: #6ee895;
          border: 1px solid rgba(110, 232, 149, 0.25);
          display: flex; align-items: center; justify-content: center;
          flex: none;
        }
        .toast--large .ic { width: 32px; height: 32px; }
        .ic--mute {
          background: #1c1f24; color: #8e9298;
          border-color: rgba(255,255,255,0.10);
        }
        .title { font-size: 13px; font-weight: 600; line-height: 1.35; }
        .toast--large .title { font-size: 13.5px; }
        .sub { font-size: 11.5px; color: #8e9298; margin-top: 2px; }
        .toast--large .sub { font-size: 12px; }
        .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.86em; color: #ededec; }
        .close {
          background: none; border: 0; color: #5b6068; cursor: pointer; padding: 0;
        }
      </style>
      <div class="stack" id="stack"></div>
    `;
    toastHost.__root = root;
    return toastHost;
  }

  function showToast(variant, site) {
    const host = ensureToastHost();
    const root = host.__root;
    const stack = root.getElementById('stack');
    const variants = {
      confirm: { tone: 'accent', icon: 'check', title: 'Cookie banner rejected', sub: site, w: 280 },
      'first-time': { tone: 'accent', icon: 'spark', title: "Krumb auto-rejected this site's cookie banner.", sub: "You'll never see this notice again.", w: 340, large: true },
      whitelist:   { tone: 'mute', icon: 'pause', title: `Krumb is now off for <span class="mono">${site}</span>`, sub: 'Cookie banners will appear normally here.', w: 320 },
      paused:      { tone: 'mute', icon: 'pause', title: 'Krumb is paused', sub: 'Cookie banners will appear normally on every site.', w: 300 },
    };
    const v = variants[variant] || variants.confirm;
    const icons = {
      check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5 11-11"/></svg>',
      spark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4 M12 17v4 M3 12h4 M17 12h4 M5.5 5.5l2.8 2.8 M15.7 15.7l2.8 2.8 M5.5 18.5l2.8-2.8 M15.7 8.3l2.8-2.8"/></svg>',
      pause: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5v14 M15 5v14"/></svg>',
    };
    const node = document.createElement('div');
    node.className = 'toast' + (v.large ? ' toast--large' : '');
    node.style.width = v.w + 'px';
    node.innerHTML = `
      <div class="ic ${v.tone === 'mute' ? 'ic--mute' : ''}">${icons[v.icon]}</div>
      <div style="flex:1; min-width:0;">
        <div class="title">${v.title}</div>
        <div class="sub">${v.sub}</div>
      </div>
      <button class="close" aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12 M18 6l-12 12"/></svg>
      </button>
    `;
    stack.appendChild(node);
    requestAnimationFrame(() => node.classList.add('in'));
    const dismiss = () => {
      node.classList.remove('in'); node.classList.add('out');
      setTimeout(() => node.remove(), 220);
    };
    node.querySelector('.close').addEventListener('click', dismiss);
    setTimeout(dismiss, v.large ? 4500 : 3000);
  }
})();
