// Krumb — Report dialog, selector picker, toasts

// ─────────────────────────────────────────────────────────────
// Report dialog — anchored to popup, same width
// ─────────────────────────────────────────────────────────────
function ReportDialog({ state = 'default' }) {
  const [domain, setDomain] = useState('forum.lemonde.fr');
  const [notes, setNotes] = useState("The banner says 'Continuer sans accepter' but Krumb didn't catch it.");
  const [selector, setSelector] = useState("button.didomi-button-reject");
  const submitted = state === 'submitted';
  return (
    <div data-screen-label="report dialog" style={{
      width: 340,
      background: 'var(--surface)', border: '1px solid var(--border-strong)',
      borderRadius: 14, overflow: 'hidden',
      boxShadow: 'var(--shadow-pop)',
      fontFamily: 'var(--font-ui)', color: 'var(--text)',
    }}>
      <div style={{
        padding: '14px 16px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon d={I.flag} size={14} style={{ color: 'var(--accent-bright)' }}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Report a broken banner</span>
        </div>
        <button style={{ color: 'var(--text-dim)' }}><Icon d={I.x} size={14}/></button>
      </div>

      {submitted ? (
        <div style={{ padding: '32px 22px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto',
            background: 'var(--accent-glow)', color: 'var(--accent-bright)',
            border: '1px solid oklch(0.80 0.16 145 / 0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={I.check} size={24} strokeWidth={2}/>
          </div>
          <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600 }}>Thanks — your issue is open</div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            A maintainer will verify the selector and merge it. Everyone gets the fix on the next daily sync.
          </div>
          <div style={{ marginTop: 18 }}>
            <KBtn variant="outline" size="sm" icon={I.github} iconRight={I.external}>View issue #4218</KBtn>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '16px 16px 4px' }}>
            <FieldRow label="Site">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MonoChip tone="accent" size="md">{domain}</MonoChip>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>auto-detected</span>
              </div>
            </FieldRow>

            <FieldRow label="What did you see?" optional>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={fieldInputStyle()}/>
            </FieldRow>

            <FieldRow label="Which button should be clicked?">
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                <input value={selector} onChange={e => setSelector(e.target.value)} placeholder="paste a CSS selector or click 'highlight'" style={{ ...fieldInputStyle(), flex: 1, height: 30, padding: '0 8px' }} className="k-mono"/>
                <KBtn variant="secondary" size="sm" icon={I.cursor}>Highlight</KBtn>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-faint)' }}>
                Clicking 'Highlight' lets you pick the reject button on the page itself.
              </div>
            </FieldRow>
          </div>

          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border)',
            background: 'var(--bg-elev)',
            display: 'flex', gap: 8,
          }}>
            <KBtn variant="primary" size="sm" full iconRight={I.external}>Open GitHub issue</KBtn>
            <KBtn variant="ghost" size="sm">Cancel</KBtn>
          </div>
          <div style={{
            padding: '10px 16px',
            fontSize: 10.5, color: 'var(--text-faint)', lineHeight: 1.5,
            borderTop: '1px solid var(--border)', background: 'var(--bg)',
          }}>
            Krumb sends nothing automatically — the next screen is GitHub, where <em>you</em> review and post.
          </div>
        </>
      )}
    </div>
  );
}

function FieldRow({ label, optional, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 11.5, color: 'var(--text-dim)', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</label>
        {optional && <span style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>optional</span>}
      </div>
      {children}
    </div>
  );
}

function fieldInputStyle() {
  return {
    width: '100%', background: 'var(--bg-elev)',
    border: '1px solid var(--border-strong)', borderRadius: 8,
    color: 'var(--text)', fontSize: 12.5, padding: '8px 10px',
    fontFamily: 'var(--font-ui)', resize: 'none',
    outline: 'none',
  };
}

// ─────────────────────────────────────────────────────────────
// Selector picker overlay — full-viewport, anchored to a button
// ─────────────────────────────────────────────────────────────
function PickerOverlay() {
  return (
    <div data-screen-label="selector picker" style={{
      position: 'relative', width: 720, height: 460,
      background: '#fefefa', overflow: 'hidden',
      borderRadius: 12, border: '1px solid var(--border-strong)',
      boxShadow: 'var(--shadow-pop)',
      color: '#111', fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Faux page content */}
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'serif' }}>Le Journal</div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#555' }}>
            <span>Politique</span><span>Économie</span><span>Culture</span><span>Sport</span>
          </div>
        </div>
        <div style={{ marginTop: 28, fontSize: 26, fontWeight: 700, fontFamily: 'serif', maxWidth: 480, lineHeight: 1.25 }}>
          Les transports publics gratuits dans 12 villes européennes
        </div>
        <div style={{ marginTop: 16, height: 4, width: 80, background: '#000' }}/>
        <div style={{ marginTop: 16, fontSize: 13, color: '#444', maxWidth: 560, lineHeight: 1.6 }}>
          Une étude récente montre que la gratuité totale dans les transports publics aurait un impact mesurable sur la fréquentation, mais des effets contrastés sur le financement…
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 14 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 70, background: '#eaeae3', borderRadius: 4 }}/>
          ))}
        </div>
      </div>

      {/* Cookie banner (the real thing) */}
      <div style={{
        position: 'absolute', left: 24, bottom: 24, right: 24,
        background: '#fff', border: '1px solid #ddd', borderRadius: 6,
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ flex: 1, fontSize: 12, color: '#222', lineHeight: 1.45 }}>
          Nous utilisons des cookies pour personnaliser le contenu et analyser le trafic. Vos données peuvent être partagées avec nos partenaires…
        </div>
        <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
          <button style={{
            padding: '8px 14px', background: '#fff', border: '1px solid #aaa', borderRadius: 4,
            fontSize: 12, color: '#222',
          }}>Continuer sans accepter</button>
          {/* picker highlight */}
          <div style={{
            position: 'absolute', inset: '-6px 50% -6px -6px',
            border: '2px solid var(--accent-bright)',
            borderRadius: 8, pointerEvents: 'none',
            boxShadow: '0 0 0 6px rgba(93,216,132,0.18)',
          }}>
            <div style={{
              position: 'absolute', left: -1, top: -22,
              background: 'var(--accent)', color: 'var(--accent-ink)',
              padding: '2px 8px', borderRadius: '4px 4px 4px 0',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              fontFamily: 'var(--font-mono)',
            }}>SELECT THIS BUTTON</div>
          </div>
          <button style={{
            padding: '8px 14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 4,
            fontSize: 12, fontWeight: 600,
          }}>Tout accepter</button>
        </div>
      </div>

      {/* Krumb HUD strip at the top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '10px 16px',
        background: 'rgba(11,12,14,0.96)', color: 'var(--text)',
        fontFamily: 'var(--font-ui)',
        display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: '1px solid var(--border)',
      }}>
        <KrumbMark size={16}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Click the reject button on the page</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Hover an element to preview · <span className="k-kbd">Esc</span> to cancel</div>
        </div>
        <div className="k-mono" style={{ fontSize: 11, color: 'var(--accent-bright)' }}>
          button.cookie-decline
        </div>
        <KBtn variant="outline" size="sm">Cancel</KBtn>
      </div>

      {/* dimmed overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'rgba(11,12,14,0.18)',
        mixBlendMode: 'multiply',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Toasts
// ─────────────────────────────────────────────────────────────
function Toast({ variant = 'confirm', site = 'nytimes.com' }) {
  const variants = {
    confirm: {
      icon: I.check, tone: 'accent',
      title: 'Cookie banner rejected',
      sub: site,
      width: 280,
    },
    'first-time': {
      icon: I.spark, tone: 'accent',
      title: 'Krumb auto-rejected this site\'s cookie banner.',
      sub: 'You\'ll never see this notice again.',
      width: 340, large: true,
    },
    whitelist: {
      icon: I.pause, tone: 'mute',
      title: <>Krumb is now off for <span className="k-mono" style={{ color: 'var(--text)' }}>{site}</span></>,
      sub: 'Cookie banners will appear normally here.',
      width: 320,
    },
    paused: {
      icon: I.pause, tone: 'mute',
      title: 'Krumb is paused',
      sub: 'Cookie banners will appear normally on every site.',
      width: 300,
    },
  };
  const v = variants[variant];
  const toneColor = v.tone === 'accent' ? 'var(--accent-bright)' : 'var(--text-dim)';
  const toneBg = v.tone === 'accent' ? 'var(--accent-glow)' : 'var(--surface-2)';

  return (
    <div data-screen-label={`toast · ${variant}`} style={{
      width: v.width,
      background: 'var(--surface)', border: '1px solid var(--border-strong)',
      borderRadius: 12, padding: v.large ? '14px 16px' : '12px 14px',
      boxShadow: 'var(--shadow-pop)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      fontFamily: 'var(--font-ui)', color: 'var(--text)',
    }}>
      <div style={{
        flex: 'none',
        width: v.large ? 32 : 26, height: v.large ? 32 : 26,
        borderRadius: 8, background: toneBg, color: toneColor,
        border: '1px solid ' + (v.tone === 'accent' ? 'oklch(0.80 0.16 145 / 0.25)' : 'var(--border-strong)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={v.icon} size={v.large ? 16 : 14} strokeWidth={1.8}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: v.large ? 13.5 : 13, fontWeight: 600, lineHeight: 1.35 }}>{v.title}</div>
        <div style={{ fontSize: v.large ? 12 : 11.5, color: 'var(--text-dim)', marginTop: 2 }}>{v.sub}</div>
      </div>
      <button style={{ color: 'var(--text-faint)', flex: 'none' }}><Icon d={I.x} size={12}/></button>
    </div>
  );
}

Object.assign(window, { ReportDialog, PickerOverlay, Toast });
