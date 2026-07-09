import { current } from "./format.js";
import { hashCode, mulberry32 } from "./random.js";
import { ACCENT, FORMAT_COLORS } from "./theme.js";

/* ───────────────────────── network view ─────────────────────────
   An alternate, optional rendering of the SAME filtered set the grid
   shows. Nodes = materials (colored by format); edges = shared topics,
   weighted by how many topics two materials have in common. Weak
   (1-topic) links are faint and thin; strong (2+) links are darker and
   thicker, so the strong pedagogical relationships read out of the
   denser background without any extra filtering control.

   The layout is a tiny dependency-free force simulation. It's seeded
   deterministically from material ids (reusing mulberry32/hashCode) so
   the graph settles to a stable shape instead of jumping every render. */

export function buildGraph(resources) {
  const nodes = resources.map((r) => {
    const d = current(r);
    return { id: r.id, r, d, topics: d.topics, format: d.format, color: FORMAT_COLORS[d.format] || ACCENT, degree: 0 };
  });
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].topics.filter((t) => nodes[j].topics.includes(t));
      if (shared.length > 0) {
        edges.push({ a: nodes[i].id, b: nodes[j].id, w: shared.length, shared });
        nodes[i].degree += shared.length;
        nodes[j].degree += shared.length;
      }
    }
  }
  return { nodes, edges };
}

/* deterministic force-directed layout; runs a fixed number of ticks in
   a useMemo so there's no animation loop and no jitter on re-render */
export function layoutGraph(nodes, edges, W, H) {
  const idx = {};
  const seed = mulberry32(hashCode(nodes.map((n) => n.id).join("|")) || 1);
  const P = nodes.map((n, i) => {
    idx[n.id] = i;
    // seed on a ring so disconnected components don't overlap the center
    const ang = (i / Math.max(1, nodes.length)) * Math.PI * 2;
    const rad = 60 + seed() * Math.min(W, H) * 0.32;
    return { x: W / 2 + Math.cos(ang) * rad, y: H / 2 + Math.sin(ang) * rad, vx: 0, vy: 0 };
  });
  const E = edges.map((e) => ({ s: idx[e.a], t: idx[e.b], w: e.w }));
  const n = nodes.length;
  const k = Math.sqrt((W * H) / Math.max(1, n)) * 0.55; // ideal spacing
  const ITER = 320;
  for (let it = 0; it < ITER; it++) {
    const cooling = 1 - it / ITER;
    // repulsion (all pairs — n is small enough)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = P[i].x - P[j].x, dy = P[i].y - P[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const rep = (k * k) / dist;
        const fx = (dx / dist) * rep, fy = (dy / dist) * rep;
        P[i].vx += fx; P[i].vy += fy;
        P[j].vx -= fx; P[j].vy -= fy;
      }
    }
    // attraction along edges (stronger for higher shared-topic weight)
    for (const e of E) {
      let dx = P[e.s].x - P[e.t].x, dy = P[e.s].y - P[e.t].y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const att = (dist * dist) / k * (0.5 + 0.5 * e.w);
      const fx = (dx / dist) * att, fy = (dy / dist) * att;
      P[e.s].vx -= fx; P[e.s].vy -= fy;
      P[e.t].vx += fx; P[e.t].vy += fy;
    }
    // gentle pull to center + integrate with cooling
    for (let i = 0; i < n; i++) {
      P[i].vx += (W / 2 - P[i].x) * 0.012;
      P[i].vy += (H / 2 - P[i].y) * 0.012;
      const max = 18 * cooling + 1;
      let sp = Math.sqrt(P[i].vx * P[i].vx + P[i].vy * P[i].vy) || 0.01;
      const lim = Math.min(sp, max) / sp;
      P[i].x += P[i].vx * lim; P[i].y += P[i].vy * lim;
      P[i].vx *= 0.85; P[i].vy *= 0.85;
    }
  }
  // fit into viewport with padding
  const pad = 34;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  P.forEach((p) => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
  const sx = (W - pad * 2) / Math.max(1, maxX - minX);
  const sy = (H - pad * 2) / Math.max(1, maxY - minY);
  const s = Math.min(sx, sy);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  P.forEach((p) => { p.x = W / 2 + (p.x - cx) * s; p.y = H / 2 + (p.y - cy) * s; });
  const pos = {};
  nodes.forEach((nd, i) => { pos[nd.id] = { x: P[i].x, y: P[i].y }; });
  return pos;
}
