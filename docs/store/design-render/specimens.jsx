// Krumb — toolbar icon specimen + store/marketing assets

// 4 toolbar icon states across 4 sizes
function IconSpecimen() {
  const states = [
    { key: 'default',    label: 'Default', sub: 'active, nothing happening', badge: null },
    { key: 'just-acted', label: 'Just acted', sub: 'briefly after rejection (~2s)', badge: { color: 'var(--accent)', glyph: '✓', ink: 'var(--accent-ink)' } },
    { key: 'failed',     label: 'Reject failed', sub: 'banner detected, no rule', badge: { color: 'var(--warn)', glyph: '?', ink: '#1a1300' } },
    { key: 'paused',     label: 'Paused', sub: 'globally disabled', badge: null, mono: true },
  ];
  const sizes = [16, 32, 48, 128];

  return (
    <div style={{
      background: 'var(--bg)', color: 'var(--text)', padding: 36,
      borderRadius: 12, fontFamily: 'var(--font-ui)',
      width: 880,
    }}>
      {/* swatch grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border-strong)', borderRadius: 10, overflow: 'hidden' }}>
        {states.map(s => (
          <div key={s.key} style={{ background: 'var(--surface)', padding: '22px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div className="k-mono" style={{ fontSize: 10.5, color: 'var(--accent-bright)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.key}</div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 14,
              padding: '18px 14px', borderRadius: 8,
              background: s.key === 'paused' ? 'var(--surface-2)' : 'var(--bg-elev)',
              border: '1px solid var(--border)',
              justifyContent: 'center',
            }}>
              {sizes.map(sz => (
                <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <KrumbMark size={sz} tone={s.mono ? 'mono' : 'accent'} badge={s.badge && sz >= 32 ? s.badge : null}/>
                  <span className="k-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{sz}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600 }}>{s.label}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* brand mark — at scale */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div style={{ padding: '40px 36px', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 28 }}>
          <KrumbMark size={120}/>
          <div>
            <div className="k-mono" style={{ fontSize: 10.5, color: 'var(--accent-bright)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>brand mark</div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Krumb — a rounded square, with crumbs taken out.</div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.55, maxWidth: 360 }}>
              Reads as a tile at 16px, gets warmer at 128. Avoids the cookie-with-a-strikethrough cliché every other blocker uses.
            </div>
          </div>
        </div>
        <div style={{ padding: '36px 32px', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="k-mono" style={{ fontSize: 10.5, color: 'var(--accent-bright)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>wordmark</div>
            <div style={{ marginTop: 18 }}><KrumbWordmark size={40}/></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <ColorChip color="var(--accent)"     name="accent" />
            <ColorChip color="var(--bg)"          name="bg" />
            <ColorChip color="var(--text)"        name="text" border />
            <ColorChip color="var(--warn)"        name="warn" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorChip({ color, name, border }) {
  return (
    <div style={{ flex: 1, padding: '12px 10px', background: 'var(--surface-2)', border: '1px solid var(--border-strong)', borderRadius: 8 }}>
      <div style={{ width: '100%', height: 28, borderRadius: 4, background: color, border: border ? '1px solid var(--border-strong)' : 'none' }}/>
      <div className="k-mono" style={{ marginTop: 6, fontSize: 10.5, color: 'var(--text-dim)' }}>{name}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Chrome Web Store assets
// ─────────────────────────────────────────────────────────────

// Small promo tile — 440 × 280
function StoreSmallTile() {
  return (
    <div data-screen-label="store · small tile (440×280)" style={{
      width: 440, height: 280, position: 'relative', overflow: 'hidden',
      background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-strong)',
      color: 'var(--text)', fontFamily: 'var(--font-ui)',
    }}>
      <div className="k-grid-bg" style={{
        position: 'absolute', inset: 0, opacity: 0.6,
        maskImage: 'radial-gradient(circle at 30% 50%, black 10%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle at 30% 50%, black 10%, transparent 70%)',
      }}/>
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 280, height: 280,
        background: 'radial-gradient(closest-side, var(--accent-glow), transparent 70%)',
      }}/>
      <div style={{ position: 'relative', padding: '28px 30px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KrumbMark size={22}/>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>Krumb</span>
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Auto-reject every<br/>cookie banner.
          </div>
          <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--text-dim)', display: 'flex', gap: 10 }}>
            <span>Free</span><span>·</span><span>Open-source</span><span>·</span><span>Zero tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marquee promo tile — 1400 × 560
function StoreMarquee() {
  return (
    <div data-screen-label="store · marquee (1400×560)" style={{
      width: 1400, height: 560, position: 'relative', overflow: 'hidden',
      background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border-strong)',
      color: 'var(--text)', fontFamily: 'var(--font-ui)',
    }}>
      <div className="k-grid-bg" style={{
        position: 'absolute', inset: 0, opacity: 0.5,
        maskImage: 'linear-gradient(90deg, black 30%, transparent 70%)',
        WebkitMaskImage: 'linear-gradient(90deg, black 30%, transparent 70%)',
      }}/>
      <div style={{
        position: 'absolute', top: -200, left: -200, width: 800, height: 800,
        background: 'radial-gradient(closest-side, var(--accent-glow), transparent 70%)',
      }}/>

      {/* left content */}
      <div style={{ position: 'relative', padding: '64px 72px', maxWidth: 760 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <KrumbWordmark size={20}/>
          <span style={{ width: 1, height: 16, background: 'var(--border-bright)' }}/>
          <span className="k-mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>Chrome extension · v1.0</span>
        </div>
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.02 }}>
          Never click <span style={{ color: 'var(--accent-bright)' }}>"Reject all"</span> again.
        </div>
        <div style={{ marginTop: 22, fontSize: 17, color: 'var(--text-dim)', lineHeight: 1.55, maxWidth: 520 }}>
          Krumb finds the reject button on every site you visit and clicks it for you. Silently. About a fifth of a second per page.
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 22, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Icon d={I.check} size={14} style={{ color: 'var(--accent-bright)' }}/> Free forever
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Icon d={I.check} size={14} style={{ color: 'var(--accent-bright)' }}/> No tracking
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Icon d={I.check} size={14} style={{ color: 'var(--accent-bright)' }}/> Open-source
          </span>
        </div>
      </div>

      {/* right: stacked browser mockup */}
      <div style={{
        position: 'absolute', right: -40, top: 50,
        transform: 'rotate(-2deg)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
      }}>
        <MiniBrowser/>
      </div>
      <div style={{
        position: 'absolute', right: 80, top: 130,
        transform: 'rotate(3deg)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
        zIndex: 2,
      }}>
        <MiniBrowser highlight/>
      </div>
    </div>
  );
}

function MiniBrowser({ highlight }) {
  return (
    <div style={{
      width: 520, height: 360, borderRadius: 10, overflow: 'hidden',
      background: '#202124', border: '1px solid rgba(0,0,0,0.5)',
    }}>
      <div style={{ height: 28, background: '#202124', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }}/>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }}/>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }}/>
      </div>
      <div style={{ height: 32, background: '#35363a', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
        <div style={{ flex: 1, height: 22, borderRadius: 11, background: '#282a2d', padding: '0 10px', display: 'flex', alignItems: 'center', fontSize: 10.5, color: '#e8eaed', fontFamily: 'system-ui' }}>
          thedailyledger.com
        </div>
        <KrumbMark size={14} badge={highlight ? { color: 'var(--accent)', glyph: '✓', ink: 'var(--accent-ink)' } : null}/>
      </div>
      <div style={{ background: '#faf9f6', height: 'calc(100% - 60px)', position: 'relative', overflow: 'hidden' }}>
        <FakeNewsPage showBanner={!highlight}/>
      </div>
    </div>
  );
}

Object.assign(window, { IconSpecimen, StoreSmallTile, StoreMarquee, MiniBrowser });
