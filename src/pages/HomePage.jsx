import { useEffect, useMemo, useRef, useState } from "react";
import { Btn } from "../components/Btn.jsx";
import { FilterRow } from "../components/FilterRow.jsx";
import { NetworkView } from "../components/NetworkView.jsx";
import { ResourceCard } from "../components/ResourceCard.jsx";
import { SectionHead } from "../components/SectionHead.jsx";
import { current } from "../lib/format.js";
import { FORMATS, LEVELS, TOPICS } from "../lib/vocab.js";
import { ACCENT, DARK, GRAD, HEAD, INK, MONO, inputStyle } from "../lib/theme.js";

export function HomePage({ db, nav, initialFormat }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState(null);
  const [format, setFormat] = useState(initialFormat || null);
  const [level, setLevel] = useState(null);
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(9);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "network"
  const sentinel = useRef(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = db.resources.filter((r) => {
      const d = current(r);
      if (topic && !d.topics.includes(topic)) return false;
      if (format && d.format !== format) return false;
      if (level && d.level !== level) return false;
      if (ql) {
        const hay = [d.title, d.description, d.author, d.usage, d.topics.join(" ")].join(" ").toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    const nC = (r) => db.comments.filter((c) => c.resourceId === r.id).length;
    if (sort === "newest") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "oldest") list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sort === "title") list = [...list].sort((a, b) => current(a).title.localeCompare(current(b).title));
    if (sort === "discussed") list = [...list].sort((a, b) => nC(b) - nC(a));
    return list;
  }, [db, q, topic, format, level, sort]);

  // continuous scroll: load more when the sentinel enters view (grid only)
  useEffect(() => {
    if (viewMode !== "grid") return;
    const el = sentinel.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => v + 9);
    }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered.length, viewMode]);

  useEffect(() => { setVisible(9); }, [q, topic, format, level, sort]);

  const anyFilter = q || topic || format || level;

  return (
    <div className="pb-20">
      {/* hero + search */}
      <section style={{ background: GRAD }}>
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-10">
          <div className="text-xs uppercase mb-3" style={{ ...MONO, color: "#decea1", letterSpacing: "0.22em" }}>an open teaching repository</div>
          <h1 className="text-3xl sm:text-4xl text-white leading-tight" style={HEAD}>Teaching materials for a complex world.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "#cccec8" }}>Videos, notebooks, simulations, and readings for teaching complex systems — contributed and annotated by the people who teach with them.</p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials, authors, topics…"
            className="mt-7 w-full max-w-2xl px-5 py-3 rounded-full text-base"
            style={{ background: "#fff", color: INK, border: "1px solid transparent" }}
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
      {/* three bandcamp-style filter rows */}
      <div className="flex flex-col gap-1 pb-2 pt-6">
        <FilterRow label="topic" options={TOPICS} value={topic} onChange={setTopic} />
        <FilterRow label="format" options={FORMATS} value={format} onChange={setFormat} />
        <FilterRow label="level" options={LEVELS} value={level} onChange={setLevel} />
      </div>

      {/* sort + clear */}
      <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "#e4e4e0" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "#4d5158" }}>
          <span style={MONO} className="text-xs uppercase tracking-widest">sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-2 py-1 rounded border bg-white text-sm" style={inputStyle}>
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
            <option value="title">title A–Z</option>
            <option value="discussed">most discussed</option>
          </select>
        </div>
        {anyFilter && (
          <button className="text-sm underline" style={{ color: ACCENT }} onClick={() => { setQ(""); setTopic(null); setFormat(null); setLevel(null); }}>
            clear all filters
          </button>
        )}
      </div>

      {/* all materials */}
      <SectionHead right={
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#7e828a" }}>{filtered.length} material{filtered.length === 1 ? "" : "s"}</span>
          <div className="flex rounded-full border overflow-hidden" style={{ borderColor: "#dcdcd8" }}>
            <button
              onClick={() => setViewMode("grid")}
              className="px-3 py-1 text-xs transition-colors"
              style={viewMode === "grid" ? { background: DARK, color: "#fff" } : { background: "#fff", color: INK }}
            >▦ Grid</button>
            <button
              onClick={() => setViewMode("network")}
              className="px-3 py-1 text-xs transition-colors"
              style={viewMode === "network" ? { background: DARK, color: "#fff" } : { background: "#fff", color: INK }}
            >⬡ Network</button>
          </div>
        </div>
      }>
        {anyFilter ? "Results" : "All materials"}
      </SectionHead>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "#7e828a" }}>
          No materials match these filters. Try clearing one of the rows above.
        </div>
      ) : viewMode === "network" ? (
        <>
          <p className="text-sm mb-4 -mt-2" style={{ color: "#7e828a" }}>
            Each material is linked to others it shares topics with. Thicker, darker links share more topics. This map reflects whatever you've searched or filtered above.
          </p>
          <NetworkView resources={filtered} db={db} nav={nav} />
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visible).map((r) => <ResourceCard key={r.id} r={r} db={db} nav={nav} />)}
        </div>
      )}

      {viewMode === "grid" && visible < filtered.length && (
        <div ref={sentinel} className="py-8 text-center">
          <Btn kind="ghost" onClick={() => setVisible((v) => v + 9)}>Load more</Btn>
        </div>
      )}
      </div>
    </div>
  );
}
