// Krumb — icon path strings (ported from components.jsx) + render helpers.
// Pure browser globals — usable from popup, options, welcome, content scripts.

export const I = {
  check:    'M4 12.5l5 5 11-11',
  x:        'M6 6l12 12 M18 6l-12 12',
  cog:      'M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM19.4 13a7.4 7.4 0 000-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 00-1.7-1L15 3.4h-4l-.4 2.6a7.4 7.4 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 001.7 1L11 20.6h4l.4-2.6a7.4 7.4 0 001.7-1l2.4 1 2-3.4z',
  flag:     'M5 21V4 M5 4h11l-2 4 2 4H5',
  external: 'M9 4H4v16h16v-5 M14 4h6v6 M9 15L20 4',
  arrow:    'M5 12h14 M13 6l6 6-6 6',
  chev:     'M9 6l6 6-6 6',
  chevDown: 'M6 9l6 6 6-6',
  pause:    'M9 5v14 M15 5v14',
  play:     'M7 5l12 7-12 7z',
  refresh:  'M4 4v6h6 M20 20v-6h-6 M4.5 14a8 8 0 0014.5 4 M19.5 10A8 8 0 005 6',
  github:   'M12 2a10 10 0 00-3.16 19.5c.5.09.68-.22.68-.48v-1.7c-2.8.6-3.4-1.35-3.4-1.35-.46-1.17-1.12-1.48-1.12-1.48-.92-.62.07-.6.07-.6 1 .07 1.55 1.04 1.55 1.04.9 1.55 2.37 1.1 2.95.84.09-.66.35-1.1.64-1.36-2.24-.25-4.6-1.12-4.6-5 0-1.1.4-2 1.04-2.71-.1-.26-.45-1.3.1-2.7 0 0 .85-.27 2.78 1.03a9.55 9.55 0 015.06 0c1.93-1.3 2.78-1.03 2.78-1.03.55 1.4.2 2.44.1 2.7.65.7 1.04 1.6 1.04 2.71 0 3.89-2.37 4.74-4.62 4.99.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0012 2z',
  cookie:   'M12 3a9 9 0 109 9 4.5 4.5 0 01-4.5-4.5A4.5 4.5 0 0112 3z M9 9.5h.01 M14 14h.01 M8 14.5h.01 M15 9h.01',
  shield:   'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  zap:      'M13 3L4 14h7l-1 7 9-11h-7l1-7z',
  trash:    'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  cursor:   'M5 3l13 7-5.5 1.5L11 19z',
  search:   'M11 4a7 7 0 105 12 M16 16l5 5',
  list:     'M4 6h16 M4 12h16 M4 18h10',
  question: 'M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2.2-2.5 4 M12 17.5h.01',
  warning:  'M12 4l10 17H2L12 4z M12 10v5 M12 18h.01',
  globe:    'M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3a14 14 0 010 18 M12 3a14 14 0 000 18',
  spark:    'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M5.5 5.5l2.8 2.8 M15.7 15.7l2.8 2.8 M5.5 18.5l2.8-2.8 M15.7 8.3l2.8-2.8',
  copy:     'M9 9h11v11H9z M5 15V4h11',
  link:     'M10 14l4-4 M9 7l3-3a4 4 0 015.7 5.7l-3 3 M15 17l-3 3a4 4 0 01-5.7-5.7l3-3',
  download: 'M12 3v13 M6 12l6 6 6-6 M4 21h16',
  send:     'M21 3L3 11l8 2 2 8 8-18z',
};

const SVG_NS = 'http://www.w3.org/2000/svg';

// Returns SVG markup string for inline insertion.
export function iconSvg(d, { size = 16, stroke = 'currentColor', strokeWidth = 1.6, fill = 'none' } = {}) {
  // Multi-segment paths (multiple M tokens) render fine with one <path>.
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}

// Build an SVG element programmatically (for places where you can't use innerHTML).
export function iconEl(d, opts = {}) {
  const { size = 16, stroke = 'currentColor', strokeWidth = 1.6, fill = 'none' } = opts;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', fill);
  svg.setAttribute('stroke', stroke);
  svg.setAttribute('stroke-width', strokeWidth);
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  return svg;
}

// Brand mark — soft rounded square with three bite-marks cut out.
// Ported from KrumbMark in components.jsx. `tone` accepts 'accent' (default),
// 'mono' (currentColor), or a custom CSS color string.
export function krumbMarkSvg({ size = 24, tone = 'accent', badge = null } = {}) {
  const fill = tone === 'mono' ? 'currentColor' : tone === 'accent' ? 'var(--accent)' : tone;
  const ink  = tone === 'mono' ? 'var(--bg)' : 'var(--accent-ink)';
  const uid = 'km-' + Math.random().toString(36).slice(2, 8);
  const inner = size >= 32 ? `<circle cx="10" cy="11" r="1.1" fill="${ink}" opacity="0.6"/>` : '';
  let badgeMarkup = '';
  if (badge) {
    const bs = Math.max(8, size * 0.42);
    const fs = Math.max(7, size * 0.32);
    badgeMarkup = `<g transform="translate(${24 - bs/2}, ${24 - bs/2})">
      <circle cx="${bs/2}" cy="${bs/2}" r="${bs/2}" fill="${badge.color}" stroke="var(--bg)" stroke-width="2"/>
      <text x="${bs/2}" y="${bs/2 + fs*0.36}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${badge.ink || 'var(--bg)'}" font-family="var(--font-ui)">${badge.glyph}</text>
    </g>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs>
      <mask id="${uid}">
        <rect width="24" height="24" rx="6" fill="white"/>
        <circle cx="19" cy="6"   r="4.2" fill="black"/>
        <circle cx="6.5" cy="18" r="1.6" fill="black"/>
        <circle cx="16" cy="18.5" r="1.1" fill="black"/>
      </mask>
    </defs>
    <rect width="24" height="24" rx="6" fill="${fill}" mask="url(#${uid})"/>
    ${inner}
    ${badgeMarkup}
  </svg>`;
}

export function krumbWordmarkHtml({ size = 14 } = {}) {
  return `<span class="k-wordmark" style="gap:${size*0.45}px;">
    ${krumbMarkSvg({ size: Math.round(size * 1.18) })}
    <span class="k-wordmark__text" style="font-size:${size}px;">Krumb</span>
  </span>`;
}
