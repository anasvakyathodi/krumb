// Krumb — In-context scene (browser frame showing rejection in action)
// + Before / after comparison

// A fake site that consistently looks like a banner-heavy news site.
// We render TWO browser windows side by side for a before/after, plus a
// third large one with the popup floating open over the toolbar.

function FakeNewsPage({ showBanner = false }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: '#faf9f6',
      color: '#1a1a1a', fontFamily: 'Georgia, serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 28px',
        borderBottom: '1px solid #e6e3dc',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>The Daily Ledger</div>
        <div style={{ display: 'flex', gap: 18, fontSize: 12, color: '#666', fontFamily: 'system-ui' }}>
          <span>News</span><span>Business</span><span>Opinion</span><span>Sport</span>
          <span style={{ color: '#1a1a1a', fontWeight: 600 }}>Subscribe</span>
        </div>
      </div>
      {/* Article */}
      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: '#a0392b', fontFamily: 'system-ui', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>POLITICS</div>
          <h1 style={{ marginTop: 8, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            New transit policy expected to reshape European city centres
          </h1>
          <div style={{ marginTop: 10, fontSize: 12, color: '#666', fontFamily: 'system-ui' }}>By M. Larsson · 4 min read</div>
          <div style={{
            marginTop: 14, height: 160, borderRadius: 4,
            background: 'repeating-linear-gradient(45deg, #d8d4c8, #d8d4c8 8px, #ccc6b6 8px, #ccc6b6 16px)',
            border: '1px solid #b8b3a5',
          }}/>
          <p style={{ marginTop: 14, fontSize: 13, color: '#222', lineHeight: 1.65 }}>
            A coalition of twelve mayors said this week they will phase in fare-free public transport over three years, citing congestion reduction and access-equity goals…
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 56, height: 56, background: '#e8e4d8', borderRadius: 3, flex: 'none' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>Markets close on a high after weeks of volatility</div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#888', fontFamily: 'system-ui' }}>2h ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cookie banner */}
      {showBanner && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: '#1a1a1a', color: '#fff',
          padding: '18px 28px',
          display: 'flex', alignItems: 'center', gap: 20,
          fontFamily: 'system-ui',
          borderTop: '3px solid #a0392b',
        }}>
          <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.55, maxWidth: 600 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>We value your privacy</strong>
            We and our 738 partners use cookies and process personal data such as IP addresses and browsing behaviour to deliver content, ads and analytics. You can change your choices at any time…
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              padding: '10px 14px', background: 'transparent', color: '#bbb',
              border: '1px solid #444', borderRadius: 3, fontSize: 12,
            }}>Reject all</button>
            <button style={{
              padding: '10px 18px', background: '#fff', color: '#000',
              border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 700,
            }}>Accept all</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Browser window with Krumb icon visible in toolbar (right of URL bar)
function BrowserWithKrumb({ url = 'thedailyledger.com', children, iconState = 'default', popupOpen = false, popupNode = null, height = 520, width = 780 }) {
  return (
    <div style={{
      width, borderRadius: 12, overflow: 'visible', position: 'relative',
      boxShadow: '0 28px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.15)',
      background: '#202124',
      fontFamily: 'system-ui',
    }}>
      {/* tab bar */}
      <div style={{ height: 38, background: '#202124', display: 'flex', alignItems: 'flex-end', padding: '0 12px', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, padding: '0 8px 9px 0' }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }}/>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }}/>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }}/>
        </div>
        <div style={{
          height: 30, padding: '0 14px', background: '#35363a',
          borderRadius: '8px 8px 0 0', color: '#e8eaed', fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 8,
          minWidth: 180, maxWidth: 260,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#9aa0a6', opacity: 0.6 }}/>
          {url}
        </div>
      </div>
      {/* toolbar */}
      <div style={{
        height: 40, background: '#35363a', padding: '0 12px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: '#52555a', opacity: 0.4 }}/>)}
        </div>
        <div style={{
          flex: 1, height: 28, borderRadius: 14,
          background: '#282a2d', padding: '0 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#e8eaed', fontSize: 12.5,
        }}>
          <Icon d={I.shield} size={12} stroke="#9aa0a6"/>
          <span style={{ color: '#9aa0a6' }}>https://</span>
          <span>{url}</span>
        </div>
        {/* Krumb extension icon, highlighted */}
        <div style={{ position: 'relative' }}>
          <ToolbarIcon state={iconState} />
          {popupOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: -8, zIndex: 10,
            }}>
              <div style={{
                position: 'absolute', top: -6, right: 16, width: 12, height: 12,
                background: 'var(--surface)', borderTop: '1px solid var(--border-strong)', borderLeft: '1px solid var(--border-strong)',
                transform: 'rotate(45deg)',
              }}/>
              {popupNode}
            </div>
          )}
        </div>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#52555a', opacity: 0.4 }}/>
      </div>
      <div style={{ height, background: '#fff', position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// Toolbar extension icon (rendered at the size Chrome uses, ~22×22 hit area)
function ToolbarIcon({ state = 'default', size = 22 }) {
  // icon at 16, with a 3px badge
  const tone = state === 'paused' ? 'mono' : 'accent';
  const badge =
    state === 'just-acted' ? { color: 'var(--accent)', glyph: '✓', ink: 'var(--accent-ink)' } :
    state === 'failed'     ? { color: 'var(--warn)',   glyph: '?', ink: '#1a1300' } :
    state === 'paused'     ? { color: 'var(--text-faint)', glyph: '', ink: '#000' } :
    null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: state === 'just-acted' ? 'var(--accent-glow)' : 'transparent',
      border: state === 'just-acted' ? '1px solid oklch(0.80 0.16 145 / 0.30)' : '1px solid transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 200ms ease',
    }}>
      <KrumbMark size={16} tone={state === 'paused' ? 'mono' : 'accent'} badge={badge}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Live "200ms flash" mini animation, plays once
// ─────────────────────────────────────────────────────────────
function LiveDemo({ width = 780, height = 520 }) {
  const [phase, setPhase] = useState('loading'); // loading -> banner-visible -> rejecting -> done
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('banner-visible'), 600);
    const t2 = setTimeout(() => setPhase('rejecting'), 1400);
    const t3 = setTimeout(() => setPhase('done'), 1700);
    const t4 = setTimeout(() => setPhase('loading'), 5500);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);

  const showBanner = phase === 'banner-visible' || phase === 'rejecting';
  const iconState = phase === 'done' ? 'just-acted' : 'default';

  return (
    <div style={{ position: 'relative' }}>
      <BrowserWithKrumb url="thedailyledger.com" iconState={iconState} width={width} height={height}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <FakeNewsPage showBanner={showBanner}/>
          {/* Reject crosshair flash while rejecting */}
          {phase === 'rejecting' && (
            <div style={{
              position: 'absolute', bottom: 38, left: '63%',
              width: 84, height: 36, border: '2px solid var(--accent-bright)',
              borderRadius: 4,
              boxShadow: '0 0 0 6px rgba(93,216,132,0.25)',
              pointerEvents: 'none',
            }}/>
          )}
          {/* HUD strip while live */}
          <div style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(11,12,14,0.92)', color: 'var(--text)',
            border: '1px solid var(--border-strong)', borderRadius: 8,
            padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-ui)', fontSize: 12,
            opacity: phase === 'loading' ? 0 : 1, transition: 'opacity 200ms',
            minWidth: 260,
          }}>
            {phase === 'banner-visible' && (
              <>
                <span className="k-live-dot"/>
                <span style={{ color: 'var(--text-dim)' }}>matching</span>
                <span className="k-mono" style={{ color: 'var(--accent-bright)' }}>thedailyledger.com</span>
              </>
            )}
            {phase === 'rejecting' && (
              <>
                <span className="k-live-dot"/>
                <span style={{ color: 'var(--text-dim)' }}>clicking</span>
                <span className="k-mono" style={{ color: 'var(--accent-bright)' }}>button[data-reject]</span>
              </>
            )}
            {phase === 'done' && (
              <>
                <Icon d={I.check} size={13} style={{ color: 'var(--accent-bright)' }}/>
                <span style={{ fontWeight: 600 }}>Banner rejected</span>
                <span className="k-mono" style={{ color: 'var(--text-faint)', marginLeft: 'auto' }}>142ms</span>
              </>
            )}
          </div>
        </div>
      </BrowserWithKrumb>
    </div>
  );
}

// Before / After static comparison
function BeforeAfter() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <Caption label="01 · WITHOUT KRUMB" sub="Every page. Every visit. Every site."/>
        <BrowserWithKrumb url="thedailyledger.com" width={600} height={400}>
          <FakeNewsPage showBanner/>
        </BrowserWithKrumb>
      </div>
      <div>
        <Caption label="02 · WITH KRUMB" sub="Banner is gone before you scroll. 142ms."/>
        <BrowserWithKrumb url="thedailyledger.com" iconState="just-acted" width={600} height={400}>
          <FakeNewsPage showBanner={false}/>
          <div style={{
            position: 'absolute', right: 18, bottom: 18,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 999, padding: '6px 12px 6px 8px',
            fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--text)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: 'var(--accent-glow)',
              border: '1px solid oklch(0.80 0.16 145 / 0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-bright)',
            }}>
              <Icon d={I.check} size={10} strokeWidth={2.2}/>
            </div>
            Banner rejected
          </div>
        </BrowserWithKrumb>
      </div>
    </div>
  );
}

function Caption({ label, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="k-mono" style={{ fontSize: 10.5, color: 'var(--accent-bright)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-dim)' }}>{sub}</div>
    </div>
  );
}

Object.assign(window, { FakeNewsPage, BrowserWithKrumb, ToolbarIcon, LiveDemo, BeforeAfter });
