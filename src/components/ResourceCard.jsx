import { Thumb } from "./Thumb.jsx";
import { Tag } from "./Tag.jsx";
import { current, fmtDate } from "../lib/format.js";
import { ACCENT, FORMAT_COLORS, HEAD, INK, MONO, STAR, clamp2, clamp3 } from "../lib/theme.js";

export function ResourceCard({ r, db, nav, featuredStyle }) {
  const d = current(r);
  const nComments = db.comments.filter((c) => c.resourceId === r.id).length;
  return (
    <button
      onClick={() => nav({ page: "detail", id: r.id })}
      className="relative text-left border p-4 bg-white hover:shadow-lg transition-shadow flex flex-col gap-2"
      style={{ borderColor: featuredStyle ? "#b9bcc2" : "#e4e3df", borderTopColor: FORMAT_COLORS[d.format] || ACCENT, borderTopWidth: 3, borderRadius: 3 }}
    >
      {r.featured && (
        <span
          className="absolute z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase shadow-sm"
          style={{ top: 8, right: 8, color: STAR, background: "#fffdf7", border: `1px solid ${STAR}`, letterSpacing: "0.04em" }}
        >
          <span style={{ fontSize: 10 }}>★</span> Featured
        </span>
      )}
      <Thumb r={r} h={64} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base leading-snug" style={{ ...HEAD, color: INK, ...clamp2 }}>{d.title}</h3>
      </div>
      <div className="text-sm" style={{ color: "#4d5158" }}>{d.author}</div>
      <p className="text-sm leading-relaxed" style={{ color: "#5f636b", ...clamp3 }}>{d.description}</p>
      <div className="flex flex-wrap items-center gap-1 mt-auto pt-2">
        <Tag>{d.format}</Tag>
        <Tag>{d.level}</Tag>
        {d.topics.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      <div className="flex justify-between text-xs pt-1" style={{ color: "#7e828a" }}>
        <span style={MONO}>v{r.versions.length}</span>
        <span>{nComments} comment{nComments === 1 ? "" : "s"} · {fmtDate(r.createdAt)}</span>
      </div>
    </button>
  );
}
