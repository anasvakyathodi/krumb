// Krumb — shared atoms / icons / brand
// CRITICAL: every styles object scoped to component name to avoid collisions

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Brand mark — soft square with a "bite" taken out of one corner
// Geometric, recognizable at 16px, not a struck-through cookie.
// ─────────────────────────────────────────────────────────────
function KrumbMark({ size = 24, tone = 'accent', badge = null }) {
  const fill = tone === 'mono' ? 'currentColor' : 'var(--accent)';
  const ink = tone === 'mono' ? 'var(--bg)' : 'var(--accent-ink)';
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <mask id={`km-mask-${size}`}>
            <rect width="24" height="24" rx="6" fill="white"/>
            {/* Three bite-marks / crumbs */}
            <circle cx="19" cy="6" r="4.2" fill="black"/>
            <circle cx="6.5" cy="18" r="1.6" fill="black"/>
            <circle cx="16" cy="18.5" r="1.1" fill="black"/>
          </mask>
        </defs>
        <rect width="24" height="24" rx="6" fill={fill} mask={`url(#km-mask-${size})`} />
        {/* tiny inner mark for character at large sizes */}
        {size >= 32 && (
          <circle cx="10" cy="11" r="1.1" fill={ink} opacity="0.6" />
        )}
      </svg>
      {badge && (
        <span style={{
          position: 'absolute', right: -2, bottom: -2,
          width: Math.max(8, size * 0.42), height: Math.max(8, size * 0.42),
          borderRadius: '50%',
          background: badge.color,
          border: `2px solid var(--bg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.max(7, size * 0.32),
          color: badge.ink || 'var(--bg)',
          fontWeight: 700,
          lineHeight: 1,
        }}>{badge.glyph}</span>
      )}
    </span>
  );
}

function KrumbWordmark({ size = 22, color = 'var(--text)' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: size * 0.42,
      fontFamily: 'var(--font-ui)', color,
    }}>
      <KrumbMark size={size * 1.18} />
      <span style={{
        fontWeight: 600, letterSpacing: '-0.02em',
        fontSize: size,
      }}>Krumb</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Icons (stroke-based, 1.6px, matched to Inter)
// ─────────────────────────────────────────────────────────────
function Icon({ d, size = 16, stroke = 'currentColor', strokeWidth = 1.6, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {typeof d === 'string' ? <path d={d}/> : d}
    </svg>
  );
}
const I = {
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

// ─────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange, size = 'md', label, hint, accent = 'accent' }) {
  const w = size === 'sm' ? 30 : 38;
  const h = size === 'sm' ? 18 : 22;
  const dot = h - 4;
  const onColor = accent === 'warn' ? 'var(--warn)' : 'var(--accent)';
  const inner = (
    <span
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={() => onChange && onChange(!on)}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange && onChange(!on); } }}
      style={{
        position: 'relative', display: 'inline-flex', width: w, height: h,
        borderRadius: h, background: on ? onColor : 'var(--surface-3)',
        transition: 'background 140ms ease',
        flex: 'none',
        boxShadow: on ? `0 0 0 1px ${onColor === 'var(--warn)' ? 'var(--warn)' : 'var(--accent)'}, inset 0 0 0 1px rgba(0,0,0,0.2)` : 'inset 0 0 0 1px var(--border-bright)',
        cursor: 'pointer',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? w - dot - 2 : 2,
        width: dot, height: dot, borderRadius: '50%',
        background: on ? 'var(--accent-ink)' : 'var(--text)',
        transition: 'left 160ms ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
      }}/>
    </span>
  );
  if (!label) return inner;
  return (
    <label style={{ display: 'flex', alignItems: hint ? 'flex-start' : 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3, lineHeight: 1.5 }}>{hint}</div>}
      </span>
      {inner}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
function KBtn({ variant = 'ghost', size = 'md', icon, iconRight, children, onClick, full, danger, disabled, style }) {
  const sizes = {
    sm: { fs: 12, py: 6, px: 10, h: 26, rad: 6 },
    md: { fs: 13, py: 8, px: 14, h: 32, rad: 8 },
    lg: { fs: 14, py: 11, px: 18, h: 40, rad: 10 },
  }[size];
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: sizes.fs,
    height: sizes.h, padding: `0 ${sizes.px}px`, borderRadius: sizes.rad,
    border: '1px solid transparent', transition: 'background 120ms, border-color 120ms, color 120ms',
    width: full ? '100%' : undefined, opacity: disabled ? 0.45 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 600 },
    secondary: { background: 'var(--surface-2)', color: 'var(--text)', borderColor: 'var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--text-dim)' },
    outline: { background: 'transparent', color: 'var(--text)', borderColor: 'var(--border-bright)' },
    danger: { background: 'transparent', color: 'var(--danger)', borderColor: 'rgba(255,80,80,0.25)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...(style || {}) }}>
      {icon && <Icon d={icon} size={sizes.fs + 2} />}
      {children}
      {iconRight && <Icon d={iconRight} size={sizes.fs + 2} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Status pill — used in popup header, settings, etc.
// ─────────────────────────────────────────────────────────────
function StatusPill({ tone = 'accent', dot = true, children }) {
  const toneMap = {
    accent: { fg: 'var(--accent-bright)', bg: 'var(--accent-glow)', border: 'oklch(0.80 0.16 145 / 0.30)' },
    warn:   { fg: 'var(--warn)', bg: 'var(--warn-glow)', border: 'oklch(0.82 0.12 80 / 0.30)' },
    mute:   { fg: 'var(--text-dim)', bg: 'var(--surface-2)', border: 'var(--border-strong)' },
  };
  const t = toneMap[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px 3px 7px', borderRadius: 999,
      background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      fontSize: 11, fontWeight: 500, letterSpacing: '0.01em',
      fontFamily: 'var(--font-ui)',
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.fg, boxShadow: `0 0 6px ${t.fg}` }}/>}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Section row (used inside popup & settings)
// ─────────────────────────────────────────────────────────────
function Row({ children, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', ...(style || {}),
    }}>{children}</div>
  );
}

function Divider() { return <div style={{ height: 1, background: 'var(--border)' }}/>; }

// ─────────────────────────────────────────────────────────────
// Mono chip — used to show domain, version, selector
// ─────────────────────────────────────────────────────────────
function MonoChip({ children, tone = 'default', size = 'sm' }) {
  const fs = size === 'sm' ? 11 : size === 'md' ? 12 : 13;
  return (
    <span className="k-mono" style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 6px' : '4px 8px',
      borderRadius: 4,
      background: tone === 'accent' ? 'var(--accent-glow)' : 'var(--surface-2)',
      color: tone === 'accent' ? 'var(--accent-bright)' : 'var(--text)',
      border: `1px solid ${tone === 'accent' ? 'oklch(0.80 0.16 145 / 0.25)' : 'var(--border-strong)'}`,
      fontSize: fs,
    }}>{children}</span>
  );
}

// Section header (used on settings + welcome)
function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && <div className="k-mono" style={{ color: 'var(--accent-bright)', fontSize: 11, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{eyebrow}</div>}
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.5 }}>{subtitle}</div>}
    </div>
  );
}

// Field group with label + control
function Field({ label, hint, children, align = 'between' }) {
  return (
    <div style={{
      display: 'flex', alignItems: align === 'between' ? 'flex-start' : 'center',
      gap: 24, padding: '16px 0',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.5, maxWidth: 460 }}>{hint}</div>}
      </div>
      <div style={{ flex: 'none' }}>{children}</div>
    </div>
  );
}

// Radio segmented control (used for "Reject all / Necessary only / …")
function SegRadio({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex', padding: 3, background: 'var(--surface-2)',
      borderRadius: 8, border: '1px solid var(--border-strong)',
      gap: 2,
    }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange && onChange(o.value)} style={{
            padding: '6px 12px', borderRadius: 6,
            fontSize: 12.5, fontWeight: active ? 600 : 500,
            color: active ? 'var(--text)' : 'var(--text-dim)',
            background: active ? 'var(--surface-3)' : 'transparent',
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
            transition: 'all 120ms',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  KrumbMark, KrumbWordmark, Icon, I, Toggle, KBtn, StatusPill, Row, Divider, MonoChip, SectionHead, Field, SegRadio,
});
