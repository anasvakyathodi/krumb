// Krumb — multilingual reject-button word list for the heuristic fallback.
// Each entry is matched against a normalised (lowercased, accent-stripped)
// button label. Order matters — strongest signals first.

export const REJECT_PHRASES = [
  // English
  'reject all', 'reject', 'decline all', 'decline', 'deny all', 'deny',
  'necessary only', 'only necessary', 'essential only', 'only essential',
  'no thanks', 'no, thanks', "don't accept", 'do not accept',
  'continue without accepting', 'opt out', 'manage choices and reject',
  'refuse all', 'refuse',

  // French
  'tout refuser', 'refuser', 'refuser tout', 'continuer sans accepter',
  'continuer sans accepter →', 'refuser et fermer', 'parametrer les cookies',
  'tout rejeter', 'rejeter tout', 'sans accepter',

  // German
  'alle ablehnen', 'ablehnen', 'nur notwendige', 'nur essenzielle',
  'nur erforderliche', 'ohne einwilligung weiter', 'auswahl bestatigen',

  // Spanish
  'rechazar todo', 'rechazar', 'rechazar todas', 'solo necesarias',
  'continuar sin aceptar',

  // Italian
  'rifiuta tutto', 'rifiuta', 'rifiuta tutti', 'solo necessari',
  'continua senza accettare',

  // Portuguese
  'rejeitar tudo', 'rejeitar', 'recusar tudo', 'recusar', 'apenas necessarios',

  // Dutch
  'alles weigeren', 'weigeren', 'alleen noodzakelijke', 'doorgaan zonder akkoord',

  // Polish
  'odrzuc wszystko', 'odrzuc', 'tylko niezbedne',

  // Swedish / Danish / Norwegian
  'avvisa alla', 'avvisa', 'avbojer alla', 'avbojer',
  'afvis alle', 'afvis',
  'avvis alle', 'avvis',

  // Russian
  'otklonit vse', 'otklonit', 'tolko neobkhodimye',

  // Turkish
  'tumunu reddet', 'reddet', 'sadece gerekli',

  // Japanese / Chinese / Korean (substring matched as-is)
  '拒否', 'すべて拒否', '同意しない',
  '拒绝', '全部拒绝', '仅必要', '不接受',
  '거부', '모두 거부', '필수만',
];

// Phrases that should *block* a match — words that look reject-y but are
// actually accept (or are auth/login affordances we never want to click).
export const POISON_PHRASES = [
  'accept', 'agree', 'allow', 'continue with all', 'accept all',
  'sign in', 'log in', 'login', 'submit', 'save', 'subscribe',
  'tout accepter', 'akzeptieren', 'aceptar', 'accetta', 'aceitar',
  'akkoord', '동의', '同意', '接受',
];

const STRIP_ACCENTS_RE = /[̀-ͯ]/g;

export function normalise(s) {
  if (!s) return '';
  return s.normalize('NFD').replace(STRIP_ACCENTS_RE, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function matchesReject(label) {
  const n = normalise(label);
  if (!n) return null;
  if (n.length > 64) return null; // banners aren't paragraphs
  for (const poison of POISON_PHRASES) {
    if (n === poison) return null;
    if (n.startsWith(poison + ' ') && !n.includes('without ' + poison) && !n.includes('sans ' + poison)) {
      // "accept all cookies" → poison, but "continue without accepting" survives.
      return null;
    }
  }
  for (const phrase of REJECT_PHRASES) {
    if (n === phrase) return { phrase, confidence: 1 };
    if (n.startsWith(phrase + ' ') || n.endsWith(' ' + phrase)) return { phrase, confidence: 0.85 };
  }
  // Last resort — phrase appears as a whole word in the label.
  for (const phrase of REJECT_PHRASES) {
    const re = new RegExp('(^|\\W)' + phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '($|\\W)');
    if (re.test(n)) return { phrase, confidence: 0.65 };
  }
  return null;
}
