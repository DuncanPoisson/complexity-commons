import { useState } from "react";
import { Btn } from "../components/Btn.jsx";
import { Field } from "../components/Field.jsx";
import { MetaItem } from "../components/MetaItem.jsx";
import { SectionHead } from "../components/SectionHead.jsx";
import { Tag } from "../components/Tag.jsx";
import { Thumb } from "../components/Thumb.jsx";
import { fmtDate, userName } from "../lib/format.js";
import { FLAG_TYPES } from "../lib/vocab.js";
import { ACCENT, HEAD, INK, MONO, STAR, inputCls, inputStyle } from "../lib/theme.js";

export function DetailPage({ db, id, user, nav, actions }) {
  const r = db.resources.find((x) => x.id === id);
  const [viewV, setViewV] = useState(null); // null = current
  const [commentText, setCommentText] = useState("");
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagType, setFlagType] = useState(FLAG_TYPES[0]);
  const [flagNote, setFlagNote] = useState("");
  const [flagDone, setFlagDone] = useState(false);

  if (!r) return <div className="max-w-3xl mx-auto px-4 py-16 text-sm" style={{ color: "#7e828a" }}>This material no longer exists. <button className="underline" onClick={() => nav({ page: "home" })}>Back to the commons</button></div>;

  const latest = r.versions[r.versions.length - 1];
  const shown = viewV ? r.versions.find((v) => v.v === viewV) : latest;
  const d = shown.data;
  const comments = db.comments.filter((c) => c.resourceId === r.id).sort((a, b) => a.date.localeCompare(b.date));
  const openFlags = db.flags.filter((f) => f.resourceId === r.id && f.status === "open");
  const canEdit = user && (user.role === "admin" || (user.role === "contributor" && r.createdBy === user.username));
  const isAdmin = user && user.role === "admin";

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <div className="pt-6 pb-4">
        <button className="text-sm underline" style={{ color: ACCENT }} onClick={() => nav({ page: "home" })}>← Back to the commons</button>
      </div>

      <div className="mb-5"><Thumb r={r} h={104} /></div>

      {viewV && viewV !== latest.v && (
        <div className="mb-4 px-4 py-3 rounded border text-sm flex items-center justify-between gap-3" style={{ background: "#f8f3e7", borderColor: "#decea1", color: "#a27635" }}>
          <span>Viewing <span style={MONO}>v{viewV}</span> ({fmtDate(shown.date)}). The current version is <span style={MONO}>v{latest.v}</span>.</span>
          <button className="underline shrink-0" onClick={() => setViewV(null)}>View current</button>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-3xl leading-tight" style={{ ...HEAD, color: INK }}>
          {r.featured && <span style={{ color: STAR }}>★ </span>}{d.title}
        </h1>
        <div className="flex gap-2 pt-1">
          {canEdit && <Btn small kind="ghost" onClick={() => nav({ page: "edit", id: r.id })}>Edit (new version)</Btn>}
          {isAdmin && <Btn small kind="ghost" onClick={() => actions.toggleFeatured(r.id)}>{r.featured ? "Unfeature" : "Feature"}</Btn>}
        </div>
      </div>

      <div className="mt-2 text-sm" style={{ color: "#4d5158" }}>{d.author}</div>
      <div className="flex flex-wrap gap-1 mt-3">
        <Tag>{d.format}</Tag><Tag>{d.level}</Tag>{d.topics.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>

      {openFlags.length > 0 && (
        <div className="mt-4 px-3 py-2 rounded border text-sm" style={{ background: "#f9ece9", borderColor: "#d68f85", color: "#af2f23" }}>
          ⚑ {openFlags.length} open issue{openFlags.length === 1 ? "" : "s"} reported on this material{isAdmin ? " — see the issue log in your dashboard." : "."}
        </div>
      )}

      <p className="mt-5 text-base leading-relaxed" style={{ color: INK }}>{d.description}</p>

      <div className="mt-5">
        <a href={d.url} target="_blank" rel="noreferrer" className="inline-block px-5 py-2.5 rounded text-sm font-medium" style={{ background: ACCENT, color: "#fff" }}>
          Open material ↗
        </a>
        <span className="ml-3 text-xs break-all" style={{ ...MONO, color: "#7e828a" }}>{d.url}</span>
      </div>

      <SectionHead>How it's used in teaching</SectionHead>
      <p className="text-sm leading-relaxed" style={{ color: INK }}>{d.usage}</p>

      <SectionHead>Details</SectionHead>
      <div className="grid gap-5 sm:grid-cols-2">
        <MetaItem label="Prerequisites">{d.prereqs}</MetaItem>
        <MetaItem label="Difficulty">{d.difficulty}</MetaItem>
        <MetaItem label="Time required">{d.time}</MetaItem>
        <MetaItem label="License / access">{d.license}</MetaItem>
        <MetaItem label="Citation" mono>{d.citation}</MetaItem>
        <MetaItem label="Contributed by">{userName(db, r.createdBy)} on {fmtDate(r.createdAt)}</MetaItem>
      </div>

      {/* version history */}
      <SectionHead right={<span className="text-xs" style={{ ...MONO, color: "#7e828a" }}>current: v{latest.v}</span>}>Version history</SectionHead>
      <div className="flex flex-col">
        {[...r.versions].reverse().map((v) => (
          <div key={v.v} className="flex items-baseline gap-3 py-2 border-b text-sm" style={{ borderColor: "#ececea" }}>
            <button
              onClick={() => setViewV(v.v === latest.v ? null : v.v)}
              className="underline shrink-0"
              style={{ ...MONO, color: v.v === (viewV || latest.v) ? "#d15a2a" : ACCENT }}
            >
              v{v.v}
            </button>
            <span className="shrink-0" style={{ color: "#7e828a" }}>{fmtDate(v.date)}</span>
            <span className="shrink-0" style={{ color: "#4d5158" }}>{userName(db, v.editedBy)}</span>
            <span style={{ color: INK }}>{v.changelog}</span>
          </div>
        ))}
      </div>

      {/* comments */}
      <SectionHead>Comments ({comments.length})</SectionHead>
      {comments.length === 0 && <div className="text-sm" style={{ color: "#7e828a" }}>No comments yet. If you've taught with this, say how it went.</div>}
      <div className="flex flex-col gap-4">
        {comments.map((c) => (
          <div key={c.id} className="rounded border bg-white p-3" style={{ borderColor: "#e4e4e0" }}>
            <div className="text-xs mb-1" style={{ color: "#7e828a" }}>
              <span style={{ color: "#4d5158", fontWeight: 600 }}>{userName(db, c.by)}</span> · {fmtDate(c.date)}
            </div>
            <div className="text-sm leading-relaxed" style={{ color: INK }}>{c.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        {user ? (
          <div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder="How did you use this material? What worked, what didn't?"
              className={inputCls}
              style={inputStyle}
            />
            <div className="mt-2">
              <Btn small disabled={!commentText.trim()} onClick={() => { actions.addComment(r.id, commentText.trim()); setCommentText(""); }}>Post comment</Btn>
            </div>
          </div>
        ) : (
          <div className="text-sm" style={{ color: "#7e828a" }}>
            <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "login" })}>Log in</button> to comment.
          </div>
        )}
      </div>

      {/* flag an issue */}
      <SectionHead>Report an issue</SectionHead>
      {flagDone ? (
        <div className="text-sm" style={{ color: "#51661a" }}>Thanks — your report was added to the issue log for the admins to review.</div>
      ) : user ? (
        flagOpen ? (
          <div className="rounded border bg-white p-4 max-w-md" style={{ borderColor: "#e4e4e0" }}>
            <Field label="Issue type">
              <select value={flagType} onChange={(e) => setFlagType(e.target.value)} className={inputCls} style={inputStyle}>
                {FLAG_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="What's wrong?">
              <textarea value={flagNote} onChange={(e) => setFlagNote(e.target.value)} rows={3} className={inputCls} style={inputStyle} placeholder="e.g. The link returns a 404 as of today." />
            </Field>
            <div className="flex gap-2">
              <Btn small disabled={!flagNote.trim()} onClick={() => { actions.addFlag(r.id, flagType, flagNote.trim()); setFlagDone(true); }}>Submit report</Btn>
              <Btn small kind="ghost" onClick={() => setFlagOpen(false)}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <Btn small kind="danger" onClick={() => setFlagOpen(true)}>⚑ Flag broken link or other issue</Btn>
        )
      ) : (
        <div className="text-sm" style={{ color: "#7e828a" }}>
          <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "login" })}>Log in</button> to report an issue.
        </div>
      )}
    </div>
  );
}
