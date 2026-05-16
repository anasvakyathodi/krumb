// Krumb — render icon PNGs (4 states × 4 sizes) using pure Node (no deps).
// Algorithm:
//  1. Build an in-memory RGBA framebuffer for each icon variant.
//  2. Rasterise: rounded-square fill, mask out three bite-mark circles,
//     overlay state badge (check / question / pause).
//  3. Encode as PNG (zlib raw IDAT, scanline filter 0).

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'assets');
mkdirSync(OUT, { recursive: true });

// Palette (mirrors tokens.css resolved to sRGB approximations of the oklch greens).
const C = {
  accent:       [0x5d, 0xd8, 0x84, 0xff],
  accentInk:    [0x06, 0x12, 0x0a, 0xff],
  accentBright: [0x6e, 0xe8, 0x95, 0xff],
  grey:         [0x8e, 0x92, 0x98, 0xff],
  greyInk:      [0x16, 0x18, 0x1c, 0xff],
  warn:         [0xe8, 0xc9, 0x6b, 0xff],
  bg:           [0x0b, 0x0c, 0x0e, 0xff],
  transparent:  [0, 0, 0, 0],
};

const STATES = {
  default:    { base: C.accent, inner: C.accentInk, badge: null },
  'just-acted': { base: C.accent, inner: C.accentInk, badge: { color: C.accentBright, glyph: 'check', ink: C.accentInk } },
  failed:     { base: C.accent, inner: C.accentInk, badge: { color: C.warn,        glyph: 'q',     ink: C.greyInk } },
  paused:     { base: C.grey,   inner: C.greyInk,   badge: { color: C.grey,        glyph: 'pause', ink: C.greyInk } },
};

const SIZES = [16, 32, 48, 128];

// ─────────────────────────── Rasteriser ───────────────────────────
function makeFB(w, h) { return { w, h, data: new Uint8Array(w * h * 4) }; }

function setPx(fb, x, y, rgba) {
  if (x < 0 || y < 0 || x >= fb.w || y >= fb.h) return;
  const i = (y * fb.w + x) * 4;
  // Source-over composite onto existing pixel.
  const sa = rgba[3] / 255;
  const da = fb.data[i+3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa === 0) return;
  for (let k = 0; k < 3; k++) {
    fb.data[i + k] = Math.round((rgba[k] * sa + fb.data[i + k] * da * (1 - sa)) / oa);
  }
  fb.data[i + 3] = Math.round(oa * 255);
}

// Anti-aliased coverage for a circle: integrate over 4×4 subpixel grid.
function circleCov(cx, cy, r, x, y) {
  if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 > (r + 1) ** 2) {
    // far enough to skip subsampling
    return ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) ? 1 : 0;
  }
  if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 < (r - 1) ** 2) return 1;
  let hits = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
    const px = x + (sx + 0.5) / 4;
    const py = y + (sy + 0.5) / 4;
    if ((px - cx) ** 2 + (py - cy) ** 2 <= r * r) hits++;
  }
  return hits / 16;
}

// Coverage for a rounded rectangle.
function roundedRectCov(x0, y0, w, h, r, x, y) {
  const px = x + 0.5, py = y + 0.5;
  // Quick reject / accept.
  if (px < x0 - 1 || px > x0 + w + 1 || py < y0 - 1 || py > y0 + h + 1) return 0;
  if (px >= x0 + r && px <= x0 + w - r && py >= y0 && py <= y0 + h) return 1;
  if (py >= y0 + r && py <= y0 + h - r && px >= x0 && px <= x0 + w) return 1;
  // Subsample corners + edges.
  let hits = 0;
  for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
    const spx = x + (sx + 0.5) / 4;
    const spy = y + (sy + 0.5) / 4;
    if (spx < x0 || spx > x0 + w || spy < y0 || spy > y0 + h) continue;
    // distance from nearest corner centre, if inside corner box
    let inside = true;
    const corners = [
      [x0 + r,       y0 + r,       spx < x0 + r       && spy < y0 + r],
      [x0 + w - r,   y0 + r,       spx > x0 + w - r   && spy < y0 + r],
      [x0 + r,       y0 + h - r,   spx < x0 + r       && spy > y0 + h - r],
      [x0 + w - r,   y0 + h - r,   spx > x0 + w - r   && spy > y0 + h - r],
    ];
    for (const [cx, cy, hit] of corners) {
      if (hit && (spx - cx) ** 2 + (spy - cy) ** 2 > r * r) { inside = false; break; }
    }
    if (inside) hits++;
  }
  return hits / 16;
}

function rasterise(size, state) {
  const fb = makeFB(size, size);
  // Use a higher-resolution synthetic coordinate space (24-unit viewBox).
  const u = size / 24;
  // Rounded square fill (rx=6).
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const cov = roundedRectCov(0, 0, 24, 24, 6, x / u, y / u);
    if (cov > 0) {
      const px = [...state.base];
      px[3] = Math.round(cov * 255);
      setPx(fb, x, y, px);
    }
  }
  // Bite-mark cutouts — composite "destination-out" by lowering alpha.
  const bites = [
    { cx: 19,  cy: 6,    r: 4.2 },
    { cx: 6.5, cy: 18,   r: 1.6 },
    { cx: 16,  cy: 18.5, r: 1.1 },
  ];
  for (const b of bites) {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const cov = circleCov(b.cx, b.cy, b.r, x / u, y / u);
      if (cov > 0) {
        const i = (y * fb.w + x) * 4;
        const keep = 1 - cov;
        fb.data[i + 3] = Math.round(fb.data[i + 3] * keep);
      }
    }
  }
  // Inner dot (only at ≥32px).
  if (size >= 32) {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const cov = circleCov(10, 11, 1.1, x / u, y / u);
      if (cov > 0) {
        const px = [...state.inner];
        px[3] = Math.round(cov * 255 * 0.6);
        setPx(fb, x, y, px);
      }
    }
  }
  // Badge (bottom-right corner, ~42% of icon size).
  if (state.badge) {
    const bs = Math.max(8, size * 0.46);
    const bx = size - bs * 0.95;
    const by = size - bs * 0.95;
    // Filled circle with bg "stroke" via 2px-equivalent erase ring.
    const cr = bs / 2;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - (bx);
      const dy = y + 0.5 - (by);
      const d = Math.sqrt(dx * dx + dy * dy);
      // outer stroke (2px transparent ring — punch through to bg)
      if (d <= cr + 1.5 && d > cr) {
        // soft erase, but keep underlying bg-pixel alpha unchanged.
        const i = (y * fb.w + x) * 4;
        // overwrite to fully transparent
        fb.data[i + 3] = 0;
      }
      if (d <= cr) {
        const cov = Math.min(1, cr - d + 0.5);
        const px = [...state.badge.color];
        px[3] = Math.round(Math.max(0, Math.min(1, cov)) * 255);
        // overwrite (don't composite — badge should be solid).
        const i = (y * fb.w + x) * 4;
        fb.data[i+0] = px[0]; fb.data[i+1] = px[1]; fb.data[i+2] = px[2]; fb.data[i+3] = Math.max(fb.data[i+3], px[3]);
      }
    }
    // Glyph (1-3px stroke against ink color).
    drawGlyph(fb, state.badge.glyph, bx, by, bs, state.badge.ink);
  }
  return fb;
}

function lineAA(fb, x0, y0, x1, y1, color, thickness) {
  // Wu-ish AA via brute force: rasterise a thick line by stamping circles along it.
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.ceil(Math.hypot(dx, dy) * 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x0 + dx * t;
    const py = y0 + dy * t;
    const r = thickness / 2;
    const rx = Math.ceil(r + 1);
    for (let yy = Math.floor(py - rx); yy <= Math.ceil(py + rx); yy++) {
      for (let xx = Math.floor(px - rx); xx <= Math.ceil(px + rx); xx++) {
        const d = Math.hypot(xx + 0.5 - px, yy + 0.5 - py);
        const cov = Math.max(0, Math.min(1, r - d + 0.5));
        if (cov > 0) setPx(fb, xx, yy, [color[0], color[1], color[2], Math.round(cov * 255)]);
      }
    }
  }
}

function drawGlyph(fb, glyph, cx, cy, size, color) {
  const r = size / 2;
  const t = Math.max(1.2, size / 8);
  // Glyph drawn around (cx, cy) within a box of `size`.
  if (glyph === 'check') {
    // Three points: left-low → mid-bottom → right-top
    const x1 = cx - r * 0.5, y1 = cy + r * 0.0;
    const x2 = cx - r * 0.1, y2 = cy + r * 0.4;
    const x3 = cx + r * 0.55, y3 = cy - r * 0.35;
    lineAA(fb, x1, y1, x2, y2, color, t);
    lineAA(fb, x2, y2, x3, y3, color, t);
  } else if (glyph === 'pause') {
    const w = Math.max(1.2, size / 7);
    const h = size * 0.55;
    for (const ox of [-size * 0.2, size * 0.2]) {
      for (let y = -h / 2; y < h / 2; y += 0.5) {
        for (let x = -w / 2; x < w / 2; x += 0.5) {
          setPx(fb, Math.round(cx + ox + x), Math.round(cy + y), color);
        }
      }
    }
  } else if (glyph === 'q') {
    // Stylised "?" — a short upper arc + a dot below.
    const dotR = Math.max(0.8, size / 12);
    for (let y = -dotR - 0.5; y <= dotR + 0.5; y += 0.5) {
      for (let x = -dotR - 0.5; x <= dotR + 0.5; x += 0.5) {
        if (x * x + y * y <= dotR * dotR) {
          setPx(fb, Math.round(cx + x), Math.round(cy + size * 0.32 + y), color);
        }
      }
    }
    // Arc: top half-circle
    const ar = size * 0.18;
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI * 1.1 + (i / steps) * Math.PI * 1.4;
      const x = cx + Math.cos(a) * ar;
      const y = cy - size * 0.04 + Math.sin(a) * ar;
      lineAA(fb, x, y, x, y, color, t);
    }
    // Vertical stroke from arc end down to dot.
    const a = Math.PI * 1.1 + Math.PI * 1.4;
    const x = cx + Math.cos(a) * ar;
    const y = cy - size * 0.04 + Math.sin(a) * ar;
    lineAA(fb, x, y, cx, cy + size * 0.18, color, t);
  }
}

// ─────────────────────────── PNG encoder ───────────────────────────
function crc32(bytes) {
  let c, table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    crc32.table = table;
  }
  c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  Buffer.from(data).copy(buf, 8);
  const crcInput = Buffer.alloc(4 + len);
  crcInput.write(type, 0, 4, 'ascii');
  Buffer.from(data).copy(crcInput, 4);
  buf.writeUInt32BE(crc32(crcInput), 8 + len);
  return buf;
}

function encodePNG(fb) {
  const { w, h, data } = fb;
  // Add scanline filter byte (0) to each row.
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    Buffer.from(data.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  const idat = deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─────────────────────────── Drive ───────────────────────────
for (const [name, state] of Object.entries(STATES)) {
  for (const size of SIZES) {
    const fb = rasterise(size, state);
    const png = encodePNG(fb);
    const out = join(OUT, `icon-${name}-${size}.png`);
    writeFileSync(out, png);
    console.log(`wrote ${out} (${png.length} bytes)`);
  }
}
