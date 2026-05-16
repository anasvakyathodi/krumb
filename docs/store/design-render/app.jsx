// Krumb — main canvas composition

function App() {
  return (
    <DesignCanvas>
      {/* ───────────────── Brand & identity ───────────────── */}
      <DCSection id="brand" title="Krumb · brand & identity"
        subtitle="A privacy tool's whole job is to feel quiet. Dark surface, single accent, monospace where the work happens.">
        <DCArtboard id="cover" label="01 · cover" width={1200} height={680}>
          <Cover/>
        </DCArtboard>
        <DCArtboard id="icon-specimen" label="02 · toolbar icon — all states × 4 sizes" width={880} height={680}>
          <IconSpecimen/>
        </DCArtboard>
      </DCSection>

      {/* ───────────────── In context ───────────────── */}
      <DCSection id="in-context" title="In context · the silent surface"
        subtitle="99% of users will never see anything but this: a banner that briefly flashes, then is gone. The popup is opened on click.">
        <DCArtboard id="live" label="01 · live · auto-rejects on page load" width={820} height={620}>
          <LiveStage/>
        </DCArtboard>
        <DCArtboard id="ba" label="02 · before / after" width={1280} height={520}>
          <div style={{ padding: 24, background: 'var(--bg)', height: '100%' }}>
            <BeforeAfter/>
          </div>
        </DCArtboard>
        <DCArtboard id="popup-in-context" label="03 · popup, anchored to toolbar" width={820} height={780}>
          <PopupInContextStage/>
        </DCArtboard>
      </DCSection>

      {/* ───────────────── Toolbar popup ───────────────── */}
      <DCSection id="popup" title="Toolbar popup · 5 states"
        subtitle="320px wide. Same chassis, the status card changes. Footer is always Settings · Report · Help.">
        <DCArtboard id="p-rejected"    label="01 · auto-rejected"      width={400} height={460}>
          <PopupStage><PopupRejected/></PopupStage>
        </DCArtboard>
        <DCArtboard id="p-no-banner"   label="02 · no banner"          width={400} height={460}>
          <PopupStage><PopupNoBanner/></PopupStage>
        </DCArtboard>
        <DCArtboard id="p-failed"      label="03 · reject failed"      width={400} height={500}>
          <PopupStage><PopupFailed/></PopupStage>
        </DCArtboard>
        <DCArtboard id="p-whitelisted" label="04 · site whitelisted"   width={400} height={500}>
          <PopupStage><PopupWhitelisted/></PopupStage>
        </DCArtboard>
        <DCArtboard id="p-paused"      label="05 · paused globally"    width={400} height={500}>
          <PopupStage><PopupPaused/></PopupStage>
        </DCArtboard>
      </DCSection>

      {/* ───────────────── Welcome ───────────────── */}
      <DCSection id="welcome" title="Welcome page · opens on install"
        subtitle="One screen. Confident, quiet. Does not gate the product — Krumb is already working.">
        <DCArtboard id="welcome-page" label="01 · welcome" width={1280} height={1280}>
          <WelcomePage/>
        </DCArtboard>
      </DCSection>

      {/* ───────────────── Settings ───────────────── */}
      <DCSection id="settings" title="Settings · new tab"
        subtitle="Single-column with a left rail of section meta. Auto-saves on change. Dense but readable.">
        <DCArtboard id="settings-page" label="01 · settings" width={1080} height={1640}>
          <SettingsPage/>
        </DCArtboard>
      </DCSection>

      {/* ───────────────── Report flow ───────────────── */}
      <DCSection id="report" title="Report a site · the contribution funnel"
        subtitle="No backend. Every report becomes a public GitHub issue the user reviews before posting.">
        <DCArtboard id="report-default" label="01 · report dialog" width={400} height={520}>
          <PopupStage><ReportDialog/></PopupStage>
        </DCArtboard>
        <DCArtboard id="report-submitted" label="02 · submitted" width={400} height={420}>
          <PopupStage><ReportDialog state="submitted"/></PopupStage>
        </DCArtboard>
        <DCArtboard id="picker" label="03 · selector picker (on page)" width={780} height={520}>
          <PickerStage/>
        </DCArtboard>
      </DCSection>

      {/* ───────────────── Toasts ───────────────── */}
      <DCSection id="toasts" title="Toasts · the rare visible moments"
        subtitle="Off by default. The first-time-aware variant is the only thing Krumb ever shows uninvited.">
        <DCArtboard id="toast-first" label="01 · first-time aware (one-shot)" width={420} height={180}>
          <ToastStage><Toast variant="first-time"/></ToastStage>
        </DCArtboard>
        <DCArtboard id="toast-confirm" label="02 · confirmation (opt-in)" width={420} height={160}>
          <ToastStage><Toast variant="confirm"/></ToastStage>
        </DCArtboard>
        <DCArtboard id="toast-whitelist" label="03 · whitelist confirmation" width={420} height={160}>
          <ToastStage><Toast variant="whitelist"/></ToastStage>
        </DCArtboard>
        <DCArtboard id="toast-paused" label="04 · paused" width={420} height={160}>
          <ToastStage><Toast variant="paused"/></ToastStage>
        </DCArtboard>
      </DCSection>

      {/* ───────────────── Store assets ───────────────── */}
      <DCSection id="store" title="Chrome Web Store · listing assets"
        subtitle="Hero shot of the moment Krumb pays for itself. Honest about permissions.">
        <DCArtboard id="store-marquee" label="01 · marquee · 1400×560" width={1400} height={560}>
          <StoreMarquee/>
        </DCArtboard>
        <DCArtboard id="store-small" label="02 · small tile · 440×280" width={440} height={280}>
          <StoreSmallTile/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ─────────────────────────────────────────────────────────────
// Stages — wrappers that center artboard content on a neutral floor
// ─────────────────────────────────────────────────────────────
function PopupStage({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--bg)',
      padding: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div className="k-grid-bg" style={{
        position: 'absolute', inset: 0, opacity: 0.4,
        maskImage: 'radial-gradient(closest-side, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(closest-side, black 30%, transparent 80%)',
      }}/>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

function ToastStage({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--bg)',
      padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div className="k-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }}/>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

function LiveStage() {
  return (
    <div style={{
      width: '100%', height: '100%', padding: 24, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div className="k-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}/>
      <div style={{ position: 'relative' }}>
        <LiveDemo width={760} height={520}/>
      </div>
    </div>
  );
}

function PickerStage() {
  return (
    <div style={{
      width: '100%', height: '100%', padding: 24, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div className="k-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}/>
      <div style={{ position: 'relative' }}>
        <PickerOverlay/>
      </div>
    </div>
  );
}

function PopupInContextStage() {
  return (
    <div style={{
      width: '100%', height: '100%', padding: 24, background: 'var(--bg)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      position: 'relative',
    }}>
      <div className="k-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}/>
      <div style={{ position: 'relative', paddingTop: 24 }}>
        <BrowserWithKrumb
          url="thedailyledger.com"
          iconState="just-acted"
          popupOpen
          popupNode={<PopupRejected site="thedailyledger.com"/>}
          width={760} height={400}>
          <FakeNewsPage/>
        </BrowserWithKrumb>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cover artboard — anchor of the canvas
// ─────────────────────────────────────────────────────────────
function Cover() {
  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--bg)',
      color: 'var(--text)', fontFamily: 'var(--font-ui)',
      position: 'relative', overflow: 'hidden',
      padding: '64px 72px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{
        position: 'absolute', top: -300, right: -200, width: 900, height: 900,
        background: 'radial-gradient(closest-side, var(--accent-glow), transparent 70%)',
      }}/>
      <div className="k-grid-bg" style={{
        position: 'absolute', inset: 0, opacity: 0.4,
        maskImage: 'radial-gradient(closest-side, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(closest-side, black 30%, transparent 80%)',
      }}/>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <KrumbMark size={42}/>
          <div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Krumb</div>
            <div className="k-mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginTop: 2 }}>
              cookie banner auto-rejector · v1.0 design hand-off
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 96, fontWeight: 600, letterSpacing: '-0.04em',
          lineHeight: 0.98, textWrap: 'balance', maxWidth: 980,
        }}>
          Quiet enough to be<br/>
          <span style={{ color: 'var(--accent-bright)', fontStyle: 'italic', fontWeight: 500 }}>forgotten</span>.
        </div>
        <div style={{
          marginTop: 24, fontSize: 17, color: 'var(--text-dim)',
          maxWidth: 600, lineHeight: 1.55,
        }}>
          Five surfaces total. Four of them you'll see at most once. The fifth is the one you don't see at all — the silent content script. That's the product.
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 32, alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 22 }}>
          <CoverStat n="5" label="surfaces"/>
          <CoverStat n="142ms" label="median dismiss"/>
          <CoverStat n="0" label="bytes phoned home"/>
          <CoverStat n="~38KB" label="extension size"/>
        </div>
        <div className="k-mono" style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'right', lineHeight: 1.6 }}>
          Inter · JetBrains Mono<br/>
          accent · oklch(0.80 0.16 145)<br/>
          MIT · open-source
        </div>
      </div>
    </div>
  );
}
function CoverStat({ n, label }) {
  return (
    <div style={{ paddingRight: 24, borderRight: '1px solid var(--border)', marginRight: 0 }}>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
      <div className="k-mono" style={{ marginTop: 4, fontSize: 10.5, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

// Boot
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
