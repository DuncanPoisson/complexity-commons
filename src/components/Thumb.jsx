import { current } from "../lib/format.js";
import { hashCode, mulberry32 } from "../lib/random.js";
import { ACCENT, FORMAT_COLORS } from "../lib/theme.js";

/* Each material gets a unique little "growing network", drawn in its
   format color — nearest-neighbor attachment, in the spirit of the
   subject matter. Replace with real OpenGraph thumbnails in production
   and keep this as the fallback. */
export function Thumb({ r, h = 72 }) {
  const d = current(r);
  const c = FORMAT_COLORS[d.format] || ACCENT;
  const rng = mulberry32(hashCode(r.id + d.title));
  const n = 9 + Math.floor(rng() * 5);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push({ x: 8 + rng() * 184, y: 8 + rng() * 44, r: 1.4 + rng() * 3.2, ring: rng() < 0.3 });
  const edges = [];
  for (let i = 1; i < n; i++) {
    let best = 0, bd = Infinity;
    for (let j = 0; j < i; j++) {
      const dd = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2;
      if (dd < bd) { bd = dd; best = j; }
    }
    edges.push([i, best]);
  }
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      style={{ width: "100%", height: h, display: "block", background: c + "12", borderRadius: 2 }}>
      {edges.map(([a, b], i) => <line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke={c} strokeOpacity="0.45" strokeWidth="1" />)}
      {pts.map((p, i) => p.ring
        ? <circle key={i} cx={p.x} cy={p.y} r={p.r + 1.2} fill="none" stroke={c} strokeOpacity="0.85" strokeWidth="1.2" />
        : <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={c} fillOpacity="0.9" />)}
    </svg>
  );
}
