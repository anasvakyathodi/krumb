// Krumb — Welcome page (opens on install)
// Single-shot scroll. Confident, quiet, never preachy.

function WelcomePage() {
  return (
    <div data-screen-label="welcome" style={{
      background: 'var(--bg)', color: 'var(--text)', minHeight: '100%',
      fontFamily: 'var(--font-ui)', position: 'relative',
    }}>
      <WelcomeBg/>
      <WelcomeTopbar/>

      {/* Hero */}
      <section style={{
        position: 'relative',
        maxWidth: 920, margin: '0 auto', padding: '96px 56px 64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <span className="k-live-dot"/>
          <span className="k-mono" style={{ fontSize: 11.5, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
            Krumb is installed and already working.
          </span>
        </div>
        <h1 style={{
          fontSize: 72, fontWeight: 600, letterSpacing: '-0.035em',
          lineHeight: 1.02, margin: 0, color: 'var(--text)',
          maxWidth: 760, textWrap: 'balance',
        }}>
          You'll never see another <span style={{ color: 'var(--accent-bright)', fontStyle: 'italic', fontWeight: 500 }}>cookie&nbsp;banner</span>.
        </h1>
        <p style={{
          marginTop: 24, fontSize: 18, lineHeight: 1.55, color: 'var(--text-dim)',
          maxWidth: 560,
        }}>
          From now on, when you land on a site that wants to show you a consent banner, Krumb finds the reject button before you do and clicks it for you. Silently. About a fifth of a second per page.
        </p>
        <div style={{ marginTop: 36, display: 'flex', gap: 12, alignItems: 'center' }}>
          <KBtn variant="primary" size="lg" iconRight={I.arrow}>Try it on a sample site</KBtn>
          <KBtn variant="ghost" size="lg" icon={I.github} iconRight={I.external}>See the source on GitHub</KBtn>
        </div>
      </section>

      {/* Live counter */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '8px 56px 80px' }}>
        <CommunityCounter/>
      </section>

      <div style={{ height: 1, background: 'var(--border)', maxWidth: 920, margin: '0 auto' }}/>

      {/* How it works */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '80px 56px' }}>
        <div className="k-mono" style={{ fontSize: 11, color: 'var(--accent-bright)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
          How it works
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 40, maxWidth: 540 }}>
          Three things to know. None of them require your attention again.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <Step n="01" head="It runs silently" body="No toast, no popup, no badge. The banner is gone before you'd have noticed it. Quiet is the whole product." />
          <Step n="02" head={<>Look for the mark <span style={{ verticalAlign: 'middle', marginLeft: 4 }}><KrumbMark size={20}/></span></>} body={<>Krumb lives in the Chrome toolbar. Click it to see what happened on the current page, pause it for one site, or open settings.</>} />
          <Step n="03" head="Help the next person" body={<>If a site sneaks past Krumb, click the toolbar and "report it". That opens a pre-filled GitHub issue. The fix lands for everyone on the next daily sync.</>} />
        </div>
      </section>

      {/* The permission honesty section */}
      <section style={{ maxWidth: 920, margin: '0 auto', padding: '40px 56px 96px' }}>
        <div style={{
          background: 'var(--bg-elev)', border: '1px solid var(--border-strong)',
          borderRadius: 16, padding: '36px 40px',
          display: 'grid', gridTemplateColumns: '44px 1fr', gap: 24, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--accent-glow)', color: 'var(--accent-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid oklch(0.80 0.16 145 / 0.25)',
          }}>
            <Icon d={I.shield} size={22}/>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Yes, Krumb has access to every site you visit.
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.65, maxWidth: 600 }}>
              That permission is non-negotiable for a cookie blocker — banners are on every site, so we have to be there too. But Krumb only ever looks for banner DOM elements and clicks them. It doesn't read page content, doesn't store URLs, doesn't phone home. The selector list is fetched directly from GitHub.
            </p>
            <div style={{ marginTop: 18, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Bullet>0 bytes sent to Krumb's servers</Bullet>
              <Bullet>0 analytics SDKs</Bullet>
              <Bullet>100% MIT-licensed</Bullet>
              <Bullet>~38 KB total</Bullet>
            </div>
          </div>
        </div>
      </section>

      <WelcomeFooter/>
    </div>
  );
}

// soft top-left glow + grid
function WelcomeBg() {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -200, left: -200, width: 700, height: 700,
          background: 'radial-gradient(closest-side, var(--accent-glow), transparent 70%)',
          filter: 'blur(20px)', opacity: 0.6,
        }}/>
      </div>
      <div className="k-grid-bg" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        maskImage: 'radial-gradient(closest-side, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(closest-side, black 30%, transparent 80%)',
        opacity: 0.7,
      }}/>
    </>
  );
}

function WelcomeTopbar() {
  return (
    <div style={{
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 56px',
    }}>
      <KrumbWordmark size={16}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-dim)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
          v1.0.0 · MIT
        </span>
        <span>·</span>
        <span>Settings</span>
      </div>
    </div>
  );
}

function CommunityCounter() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      background: 'var(--bg-elev)', border: '1px solid var(--border-strong)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <CounterCell mono="rejected today" value="2,847,193" hint="across all Krumb users · loaded from GitHub Pages, no tracking" />
      <div style={{ width: 1, background: 'var(--border)' }}/>
      <CounterCell mono="this week, on this device" value="847" hint="local count · only visible to you" />
    </div>
  );
}
function CounterCell({ mono, value, hint }) {
  return (
    <div style={{ padding: '28px 32px' }}>
      <div className="k-mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{mono}</div>
      <div style={{
        marginTop: 8, fontSize: 44, fontWeight: 600,
        letterSpacing: '-0.025em', color: 'var(--text)',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--text-dim)' }}>{hint}</div>
    </div>
  );
}

function Step({ n, head, body }) {
  return (
    <div style={{
      padding: '24px 22px',
      background: 'var(--surface)', border: '1px solid var(--border-strong)',
      borderRadius: 14, position: 'relative',
    }}>
      <div className="k-mono" style={{ fontSize: 11, color: 'var(--accent-bright)', letterSpacing: '0.12em' }}>{n}</div>
      <div style={{ marginTop: 14, fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{head}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12.5, color: 'var(--text)',
    }}>
      <Icon d={I.check} size={13} style={{ color: 'var(--accent-bright)' }}/>
      {children}
    </span>
  );
}

function WelcomeFooter() {
  return (
    <footer style={{
      position: 'relative', zIndex: 2,
      maxWidth: 920, margin: '0 auto', padding: '40px 56px 56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
        Krumb is free and open-source forever. There is no paid tier.
      </div>
      <div style={{ display: 'flex', gap: 18, fontSize: 12.5, color: 'var(--text-dim)' }}>
        <span>GitHub</span>
        <span>Selector list</span>
        <span>FAQ</span>
        <span>Privacy</span>
      </div>
    </footer>
  );
}

Object.assign(window, { WelcomePage });
