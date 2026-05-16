// Krumb — Toolbar popup (320px wide)
// 5 states from spec §5.2: rejected ✓, no-banner, reject-failed, whitelisted, paused

const POPUP_W = 340;

function PopupShell({ children, label }) {
  return (
    <div style={{
      width: POPUP_W,
      background: 'var(--surface)',
      border: '1px solid var(--border-strong)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-pop)',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text)',
      display: 'flex', flexDirection: 'column',
    }} data-screen-label={label}>
      {children}
    </div>
  );
}

function PopupHeader({ paused }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px 12px 14px',
      borderBottom: '1px solid var(--border)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)',
    }}>
      <KrumbWordmark size={14} />
      {paused
        ? <StatusPill tone="mute" dot={false}><Icon d={I.pause} size={10}/> paused</StatusPill>
        : <StatusPill tone="accent">active</StatusPill>}
    </div>
  );
}

function PopupFooter({ rejectedCount }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderTop: '1px solid var(--border)',
      background: 'var(--bg-elev)',
      fontSize: 11.5, color: 'var(--text-dim)',
    }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <button style={linkStyle}>Settings</button>
        <button style={linkStyle}>Report</button>
        <button style={linkStyle}>Help</button>
      </div>
      <div className="k-mono" style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>
        v1.0.0
      </div>
    </div>
  );
}
const linkStyle = {
  fontSize: 11.5, color: 'var(--text-dim)', cursor: 'pointer',
  borderBottom: '1px dashed transparent',
};

// Big status card — center of the popup
function StatusCard({ icon, iconBg, iconColor, title, sub, cta, tone = 'accent' }) {
  return (
    <div style={{
      padding: '18px 16px 16px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: 'none',
          border: '1px solid ' + (tone === 'accent' ? 'oklch(0.80 0.16 145 / 0.25)' : tone === 'warn' ? 'oklch(0.82 0.12 80 / 0.25)' : 'var(--border-strong)'),
        }}>
          <Icon d={icon} size={18} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3, lineHeight: 1.45, wordBreak: 'break-word' }}>{sub}</div>}
        </div>
      </div>
      {cta && <div style={{ marginTop: 12 }}>{cta}</div>}
    </div>
  );
}

// Toggle rows (master + per-site)
function ToggleRow({ label, sub, on, onChange, disabled }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 16px',
      opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500 }}>{label}</div>
        {sub && <div className="k-mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} size="sm" />
    </div>
  );
}

// Stat strip (banners auto-rejected this week)
function StatStrip({ value, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 8,
      padding: '11px 16px',
      background: 'var(--bg-elev)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</span>
      <span style={{ fontSize: 11.5, color: 'var(--text-dim)', flex: 1 }}>{label}</span>
      <span className="k-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>local only</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 popup variants
// ─────────────────────────────────────────────────────────────

function PopupRejected({ site = 'nytimes.com' }) {
  return (
    <PopupShell label="popup · auto-rejected">
      <PopupHeader />
      <StatusCard
        icon={I.check}
        iconBg="var(--accent-glow)"
        iconColor="var(--accent-bright)"
        title="Banner auto-rejected"
        sub={<>on <span className="k-mono" style={{ color: 'var(--text)' }}>{site}</span> · 142ms</>}
        tone="accent"
      />
      <ToggleRow label="Krumb is active" sub="globally enabled" on={true} />
      <Divider/>
      <ToggleRow label="Run on this site" sub={site} on={true} />
      <StatStrip value="1,284" label="banners rejected this week" />
      <PopupFooter />
    </PopupShell>
  );
}

function PopupNoBanner({ site = 'wikipedia.org' }) {
  return (
    <PopupShell label="popup · no banner">
      <PopupHeader />
      <StatusCard
        icon={I.shield}
        iconBg="var(--surface-2)"
        iconColor="var(--text-dim)"
        title="No banner detected"
        sub={<>nothing to dismiss on <span className="k-mono" style={{ color: 'var(--text)' }}>{site}</span></>}
        tone="mute"
      />
      <ToggleRow label="Krumb is active" sub="globally enabled" on={true} />
      <Divider/>
      <ToggleRow label="Run on this site" sub={site} on={true} />
      <StatStrip value="1,284" label="banners rejected this week" />
      <PopupFooter />
    </PopupShell>
  );
}

function PopupFailed({ site = 'forum.lemonde.fr' }) {
  return (
    <PopupShell label="popup · reject failed">
      <PopupHeader />
      <StatusCard
        icon={I.question}
        iconBg="var(--warn-glow)"
        iconColor="var(--warn)"
        title="Couldn't find the reject button"
        sub={<>banner detected on <span className="k-mono" style={{ color: 'var(--text)' }}>{site}</span> but we don't have a rule for it yet.</>}
        tone="warn"
        cta={
          <div style={{ display: 'flex', gap: 8 }}>
            <KBtn variant="primary" size="sm" icon={I.flag} full>Report this site</KBtn>
            <KBtn variant="secondary" size="sm">Dismiss</KBtn>
          </div>
        }
      />
      <ToggleRow label="Krumb is active" sub="globally enabled" on={true} />
      <Divider/>
      <ToggleRow label="Run on this site" sub={site} on={true} />
      <StatStrip value="1,284" label="banners rejected this week" />
      <PopupFooter />
    </PopupShell>
  );
}

function PopupWhitelisted({ site = 'banking.app' }) {
  return (
    <PopupShell label="popup · whitelisted">
      <PopupHeader />
      <StatusCard
        icon={I.pause}
        iconBg="var(--surface-2)"
        iconColor="var(--text-dim)"
        title="Krumb is off for this site"
        sub={<>you've turned us off on <span className="k-mono" style={{ color: 'var(--text)' }}>{site}</span>. cookie banners will appear normally.</>}
        tone="mute"
        cta={<KBtn variant="outline" size="sm" full icon={I.play}>Re-enable on this site</KBtn>}
      />
      <ToggleRow label="Krumb is active" sub="globally enabled" on={true} />
      <Divider/>
      <ToggleRow label="Run on this site" sub={site} on={false} />
      <StatStrip value="1,284" label="banners rejected this week" />
      <PopupFooter />
    </PopupShell>
  );
}

function PopupPaused() {
  return (
    <PopupShell label="popup · paused">
      <PopupHeader paused />
      <StatusCard
        icon={I.pause}
        iconBg="var(--surface-2)"
        iconColor="var(--text-dim)"
        title="Krumb is paused"
        sub="cookie banners will appear normally on every site. nothing is being auto-rejected."
        tone="mute"
        cta={<KBtn variant="primary" size="sm" full icon={I.play}>Resume Krumb</KBtn>}
      />
      <ToggleRow label="Krumb is active" sub="globally disabled" on={false} />
      <Divider/>
      <ToggleRow label="Run on this site" sub="—" on={false} disabled />
      <StatStrip value="1,284" label="banners rejected this week" />
      <PopupFooter />
    </PopupShell>
  );
}

Object.assign(window, {
  PopupShell, PopupHeader, PopupFooter,
  PopupRejected, PopupNoBanner, PopupFailed, PopupWhitelisted, PopupPaused,
});
