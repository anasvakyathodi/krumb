// Krumb — Settings page (desktop)
// Single-column, dense, opens as a new tab. Width: 880 max.

function SettingsPage() {
  const [master, setMaster] = useState(true);
  const [behavior, setBehavior] = useState('site');
  const [toast, setToast] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [heuristic, setHeuristic] = useState(true);

  const whitelist = [
    { domain: 'banking.app',         added: '2 days ago' },
    { domain: 'mail.proton.me',      added: '2 weeks ago' },
    { domain: 'admin.workspace.com', added: '1 month ago' },
    { domain: 'localhost:3000',      added: '2 months ago' },
  ];

  return (
    <div data-screen-label="settings" style={{
      background: 'var(--bg)', minHeight: '100%', color: 'var(--text)',
      fontFamily: 'var(--font-ui)',
    }}>
      <SettingsTopbar />
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 56px 80px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <div className="k-mono" style={{ color: 'var(--accent-bright)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              Settings · v1.0.0
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>How Krumb works for you</h1>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 10, maxWidth: 540, lineHeight: 1.55 }}>
              Everything below is stored on this device only. Nothing here is ever sent anywhere — not to Krumb, not to your browser vendor, not to anyone.
            </p>
          </div>
          <StatusPill tone={master ? 'accent' : 'mute'}>{master ? 'active' : 'paused'}</StatusPill>
        </div>

        {/* Master controls */}
        <Block
          eyebrow="01 · Master"
          title="Master controls"
          subtitle="The big switch and the sites where Krumb stays out of the way."
        >
          <Field
            label="Krumb is active"
            hint="Turning this off pauses Krumb on every site. Your whitelist and rules are preserved."
          >
            <Toggle on={master} onChange={setMaster} />
          </Field>
          <Field
            label="Whitelisted sites"
            hint="Sites where Krumb does nothing. Add a site by clicking the toolbar icon there and toggling 'Run on this site' off."
            align="start"
          >
            <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>{whitelist.length} sites</span>
          </Field>
          <WhitelistList items={whitelist}/>
        </Block>

        {/* Rejection behavior */}
        <Block
          eyebrow="02 · Behavior"
          title="Rejection behavior"
          subtitle="What Krumb clicks when a banner offers more than one option."
        >
          <Field
            label="When the site offers a choice"
            hint="'Whichever the site offers' is the default — it picks the strictest reject button the site actually exposes, which works on the most sites."
          >
            <SegRadio
              value={behavior} onChange={setBehavior}
              options={[
                { value: 'reject', label: 'Reject all' },
                { value: 'necessary', label: 'Necessary only' },
                { value: 'site', label: 'Whichever the site offers' },
              ]}
            />
          </Field>
          <Field
            label="Show a confirmation toast"
            hint="Briefly show a 'Banner rejected on …' bubble in the corner whenever Krumb acts. Off by default — Krumb's job is to disappear."
          >
            <Toggle on={toast} onChange={setToast} />
          </Field>
        </Block>

        {/* Selector list */}
        <Block
          eyebrow="03 · Selector list"
          title="The community list"
          subtitle={
            <>This is the open-source CSS-selector list that tells Krumb which button is 'Reject' on each site. It's a single JSON file on GitHub — you can read it, fork it, or contribute.</>
          }
        >
          <Field
            label="Auto-update from GitHub once a day"
            hint={
              <>Fetched from <span className="k-mono">github.com/anasvakyathodi/krumb</span>. The request goes directly to GitHub — never through us.</>
            }
          >
            <Toggle on={autoUpdate} onChange={setAutoUpdate} />
          </Field>
          <UpdateRow />
          <Field
            label="Heuristic fallback"
            hint="When a site isn't in the list, scan the page for visible buttons containing words like 'reject', 'decline', 'necessary only', 'no thanks' in 12+ languages. Can occasionally misfire."
          >
            <Toggle on={heuristic} onChange={setHeuristic} />
          </Field>
        </Block>

        {/* Statistics */}
        <Block
          eyebrow="04 · Statistics"
          title="Counted locally, only for you"
          subtitle="These numbers live on this device. There is no remote dashboard. We can't see them."
        >
          <StatsGrid/>
          <Field
            label="Reset statistics"
            hint="Clears all local counts. Doesn't affect your whitelist or rules."
          >
            <KBtn variant="outline" size="sm" icon={I.refresh}>Reset</KBtn>
          </Field>
        </Block>

        {/* Danger */}
        <Block
          eyebrow="05 · Reset"
          title="Start over"
          subtitle=""
        >
          <Field
            label="Reset all settings"
            hint="Restores every setting on this page to its default. Your whitelist is cleared. Statistics are kept."
          >
            <KBtn variant="danger" size="sm" icon={I.trash}>Reset everything</KBtn>
          </Field>
        </Block>

        <PrivacyFooter/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function SettingsTopbar() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 32px', height: 56,
      background: 'rgba(11,12,14,0.75)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <KrumbWordmark size={15}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-dim)' }}>
        <a style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)' }}>
          <Icon d={I.github} size={14}/> github.com/anasvakyathodi/krumb
          <Icon d={I.external} size={11}/>
        </a>
      </div>
    </div>
  );
}

function Block({ eyebrow, title, subtitle, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 48, alignItems: 'flex-start' }}>
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="k-mono" style={{ color: 'var(--accent-bright)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{eyebrow}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.55 }}>{subtitle}</div>}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function WhitelistList({ items }) {
  return (
    <div style={{
      marginTop: 0,
      borderTop: '1px solid var(--border)',
      borderRadius: 0,
      overflow: 'hidden',
    }}>
      {items.map((it, i) => (
        <div key={it.domain} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 0',
          borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
              <Icon d={I.globe} size={12}/>
            </div>
            <span className="k-mono" style={{ fontSize: 13, color: 'var(--text)' }}>{it.domain}</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>added {it.added}</span>
          </div>
          <button style={{ color: 'var(--text-dim)', fontSize: 12, padding: 6 }}>
            <Icon d={I.x} size={14}/>
          </button>
        </div>
      ))}
      <div style={{ padding: '14px 0 0' }}>
        <KBtn variant="outline" size="sm" icon={I.list}>Import from text…</KBtn>
      </div>
    </div>
  );
}

function UpdateRow() {
  return (
    <div style={{
      marginTop: 14, padding: '14px 16px',
      background: 'var(--bg-elev)',
      border: '1px solid var(--border-strong)', borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          List up to date
          <StatusPill tone="accent" dot>fresh</StatusPill>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="k-mono">v2026.05.16 · 4,217 rules</span>
          <span style={{ color: 'var(--text-faint)' }}>·</span>
          <span>last checked 6 minutes ago</span>
        </div>
      </div>
      <KBtn variant="secondary" size="sm" icon={I.refresh}>Update now</KBtn>
    </div>
  );
}

function StatsGrid() {
  const stats = [
    { value: '12,406', label: 'Total banners auto-rejected', mono: 'all time' },
    { value: '847',    label: 'In the last 7 days',          mono: '↑ 11% vs prior' },
    { value: '4,217',  label: 'Sites covered by the list',   mono: 'community list' },
    { value: '142',    label: 'Times the fallback worked',   mono: 'heuristic' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', border: '1px solid var(--border-strong)', borderRadius: 10, overflow: 'hidden' }}>
      {stats.map(s => (
        <div key={s.label} style={{ padding: '18px 18px', background: 'var(--surface)' }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{s.value}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>{s.label}</div>
          <div className="k-mono" style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 6, letterSpacing: '0.04em' }}>{s.mono}</div>
        </div>
      ))}
    </div>
  );
}

function PrivacyFooter() {
  return (
    <div style={{
      marginTop: 56, padding: '20px 22px',
      background: 'var(--bg-elev)',
      border: '1px solid var(--border)', borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-glow)', color: 'var(--accent-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid oklch(0.80 0.16 145 / 0.25)' }}>
        <Icon d={I.shield} size={18}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Krumb is fully open-source.</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3, lineHeight: 1.55 }}>
          No analytics, no telemetry, no error reporting. The selector list is fetched from GitHub directly; we don't see those requests either.
        </div>
      </div>
      <KBtn variant="outline" size="sm" icon={I.github} iconRight={I.external}>Read the source</KBtn>
    </div>
  );
}

Object.assign(window, { SettingsPage });
