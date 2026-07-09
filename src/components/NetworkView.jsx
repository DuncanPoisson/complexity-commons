import { useMemo, useState } from "react";
import { Tag } from "./Tag.jsx";
import { buildGraph, layoutGraph } from "../lib/graph.js";
import { starPoints } from "../lib/random.js";
import { FORMATS } from "../lib/vocab.js";
import { ACCENT, FORMAT_COLORS, HEAD, INK, MONO, STAR, clamp3 } from "../lib/theme.js";

export function NetworkView({ resources, db, nav }) {
  const W = 920, H = 560;
  const { nodes, edges } = useMemo(() => buildGraph(resources), [resources]);
  const pos = useMemo(() => layoutGraph(nodes, edges, W, H), [nodes, edges]);
  const [hover, setHover] = useState(null);   // node id under the cursor
  const [selected, setSelected] = useState(null); // node id with open preview card

  // node degree → radius (hubs read as hubs)
  const maxDeg = Math.max(1, ...nodes.map((n) => n.degree));
  const radius = (nd) => 7 + (nd.degree / maxDeg) * 11;

  // adjacency for hover highlighting
  const neighbors = useMemo(() => {
    const m = {};
    nodes.forEach((n) => (m[n.id] = new Set()));
    edges.forEach((e) => { m[e.a].add(e.b); m[e.b].add(e.a); });
    return m;
  }, [nodes, edges]);

  const active = hover || selected;
  const isLit = (id) => !active || id === active || neighbors[active]?.has(id);
  const edgeLit = (e) => !active || e.a === active || e.b === active;

  const formatsPresent = useMemo(() => {
    const set = new Set(nodes.map((n) => n.format));
    return FORMATS.filter((f) => set.has(f));
  }, [nodes]);

  const sel = selected ? nodes.find((n) => n.id === selected) : null;

  if (nodes.length === 0) {
    return <div className="py-16 text-center text-sm" style={{ color: "#7e828a" }}>No materials to map. Try clearing a filter.</div>;
  }

  return (
    <div className="relative border bg-white" style={{ borderColor: "#e4e3df", borderRadius: 3 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block", background: "#fbfaf7", borderRadius: 3 }}
        onClick={() => setSelected(null)}
      >
        {/* edges */}
        {edges.map((e, i) => {
          const pa = pos[e.a], pb = pos[e.b];
          const strong = e.w >= 2;
          const lit = edgeLit(e);
          return (
            <line
              key={i}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={strong ? "#7e6f87" : "#c7c2cc"}
              strokeWidth={strong ? 1 + e.w * 0.8 : 0.8}
              strokeOpacity={lit ? (strong ? 0.72 : 0.28) : 0.06}
              style={{ transition: "stroke-opacity 0.15s" }}
            />
          );
        })}
        {/* nodes */}
        {nodes.map((nd) => {
          const p = pos[nd.id];
          const lit = isLit(nd.id);
          const rr = radius(nd);
          const isSel = nd.id === selected;
          return (
            <g
              key={nd.id}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              opacity={lit ? 1 : 0.18}
              onMouseEnter={() => setHover(nd.id)}
              onMouseLeave={() => setHover(null)}
              onClick={(ev) => { ev.stopPropagation(); setSelected(isSel ? null : nd.id); }}
            >
              {nd.r.featured ? (
                <polygon
                  points={starPoints(p.x, p.y, (rr + (isSel ? 4 : 0)) * 1.35)}
                  fill={nd.color} fillOpacity={0.92}
                  stroke={isSel ? INK : "#fff"} strokeWidth={isSel ? 2 : 1.5}
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx={p.x} cy={p.y} r={rr + (isSel ? 4 : 0)} fill={nd.color} fillOpacity={0.9}
                  stroke={isSel ? INK : "#fff"} strokeWidth={isSel ? 2 : 1.5} />
              )}
              {(active === nd.id || isSel) && (
                <text x={p.x} y={p.y - rr - 6} textAnchor="middle"
                  style={{ ...HEAD, fontSize: 12, fill: INK, pointerEvents: "none" }}>
                  {nd.d.title.length > 34 ? nd.d.title.slice(0, 33) + "…" : nd.d.title}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* legend (click a format to filter the home set) */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 px-3 py-2 rounded border text-xs"
        style={{ background: "rgba(255,255,255,0.92)", borderColor: "#e4e3df", maxWidth: 200 }}>
        <div className="uppercase tracking-widest mb-1" style={{ ...MONO, color: "#7e828a", fontSize: 10 }}>format</div>
        {formatsPresent.map((f) => (
          <button key={f} className="flex items-center gap-2 text-left hover:opacity-70"
            onClick={() => nav({ page: "home", format: f })}>
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: FORMAT_COLORS[f] }} />
            <span style={{ color: INK }}>{f}</span>
          </button>
        ))}
        <div className="mt-2 pt-2 border-t" style={{ borderColor: "#ececea", color: "#7e828a" }}>
          <div className="flex items-center gap-2"><span className="inline-block" style={{ width: 18, height: 0, borderTop: "3px solid #7e6f87" }} /> 2+ shared topics</div>
          <div className="flex items-center gap-2 mt-1"><span className="inline-block" style={{ width: 18, height: 0, borderTop: "1px solid #c7c2cc" }} /> 1 shared topic</div>
          <div className="flex items-center gap-2 mt-1"><span style={{ color: STAR, width: 18, textAlign: "center", fontSize: 13 }}>★</span> featured (star node)</div>
        </div>
      </div>

      {/* hint */}
      <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded" style={{ ...MONO, color: "#9a9ea4", background: "rgba(255,255,255,0.7)" }}>
        hover to trace links · click a node for details
      </div>

      {/* preview card on click */}
      {sel && (
        <div className="absolute top-3 right-3 w-72 border bg-white shadow-lg p-4 flex flex-col gap-2"
          style={{ borderColor: "#e4e3df", borderTopColor: sel.color, borderTopWidth: 3, borderRadius: 3 }}>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base leading-snug" style={{ ...HEAD, color: INK }}>{sel.r.featured && <span style={{ color: STAR }}>★ </span>}{sel.d.title}</h4>
            <button onClick={() => setSelected(null)} style={{ color: "#9a9ea4" }} aria-label="close">✕</button>
          </div>
          <div className="text-sm" style={{ color: "#4d5158" }}>{sel.d.author}</div>
          <div className="flex flex-wrap gap-1">
            <Tag>{sel.d.format}</Tag><Tag>{sel.d.level}</Tag>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#5f636b", ...clamp3 }}>{sel.d.description}</p>
          <div className="text-xs" style={{ color: "#7e828a" }}>
            {neighbors[sel.id].size} related material{neighbors[sel.id].size === 1 ? "" : "s"} · topics: {sel.d.topics.join(", ")}
          </div>
          <button className="mt-1 self-start text-sm font-medium underline" style={{ color: ACCENT }}
            onClick={() => nav({ page: "detail", id: sel.id })}>
            View details →
          </button>
        </div>
      )}
    </div>
  );
}
