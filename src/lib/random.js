/* deterministic per-material art: seeded PRNG */
export function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* points for a 5-pointed star centered at (cx,cy). outerR sets the tip
   radius; the area is tuned to roughly match a disc of the same radius so
   featured (star) and non-featured (circle) nodes read at similar weight. */
export function starPoints(cx, cy, outerR) {
  const innerR = outerR * 0.46;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5; // first tip points up
    pts.push(`${(cx + Math.cos(ang) * r).toFixed(2)},${(cy + Math.sin(ang) * r).toFixed(2)}`);
  }
  return pts.join(" ");
}
