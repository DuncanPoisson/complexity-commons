import { useState } from "react";
import { Btn } from "../components/Btn.jsx";
import { Field } from "../components/Field.jsx";
import { Pill } from "../components/Pill.jsx";
import { StatusDot } from "../components/StatusDot.jsx";
import { current, fmtDate, userName } from "../lib/format.js";
import { ROLES } from "../lib/vocab.js";
import { ACCENT, HEAD, INK, MONO, inputCls, inputStyle } from "../lib/theme.js";

export function Dashboard({ db, user, nav, actions }) {
  const isAdmin = user.role === "admin";
  const tabs = isAdmin ? ["Issue log", "Review assignments", "Users", "My materials"] : ["My materials", "Review assignments"];
  const [tab, setTab] = useState(tabs[0]);
  const [flagFilter, setFlagFilter] = useState("open");
  const [aRes, setARes] = useState("");
  const [aWho, setAWho] = useState("");
  const [aNote, setANote] = useState("");
  const [completeNotes, setCompleteNotes] = useState({});

  const myMaterials = db.resources.filter((r) => r.createdBy === user.username);
  const contributors = db.users.filter((u) => u.role === "contributor" || u.role === "admin");
  const rTitle = (id) => { const r = db.resources.find((x) => x.id === id); return r ? current(r).title : "(deleted material)"; };

  const flags = db.flags
    .filter((f) => flagFilter === "all" || f.status === flagFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const myAssignments = db.assignments.filter((a) => a.assignedTo === user.username).sort((a, b) => b.date.localeCompare(a.date));
  const allAssignments = [...db.assignments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <h1 className="text-2xl pt-8 pb-4" style={{ ...HEAD, color: INK }}>Dashboard</h1>
      <div className="flex gap-2 flex-wrap border-b pb-3" style={{ borderColor: "#e4e4e0" }}>
        {tabs.map((t) => <Pill key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Pill>)}
      </div>

      {/* ── issue log (admin) ── */}
      {tab === "Issue log" && isAdmin && (
        <div className="pt-6">
          <div className="flex gap-2 mb-4">
            {["open", "resolved", "all"].map((f) => <Pill key={f} active={flagFilter === f} onClick={() => setFlagFilter(f)}>{f}</Pill>)}
          </div>
          {flags.length === 0 && <div className="text-sm" style={{ color: "#7e828a" }}>No {flagFilter !== "all" ? flagFilter : ""} issues. The commons is in good shape.</div>}
          <div className="flex flex-col gap-3">
            {flags.map((f) => (
              <div key={f.id} className="rounded border bg-white p-4" style={{ borderColor: "#e4e4e0" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm">
                    <StatusDot status={f.status} />
                    <span className="font-semibold" style={{ color: INK }}>{f.type}</span>
                    <span style={{ color: "#7e828a" }}> on </span>
                    <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "detail", id: f.resourceId })}>{rTitle(f.resourceId)}</button>
                  </div>
                  {f.status === "open"
                    ? <Btn small kind="ghost" onClick={() => actions.resolveFlag(f.id)}>Mark resolved</Btn>
                    : <span className="text-xs" style={{ color: "#51661a" }}>resolved by {userName(db, f.resolvedBy)} · {fmtDate(f.resolvedAt)}</span>}
                </div>
                <div className="text-sm mt-2" style={{ color: INK }}>{f.note}</div>
                <div className="text-xs mt-1" style={{ color: "#7e828a" }}>reported by {userName(db, f.by)} · {fmtDate(f.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── review assignments ── */}
      {tab === "Review assignments" && (
        <div className="pt-6">
          {isAdmin && (
            <div className="rounded border bg-white p-4 mb-6" style={{ borderColor: "#e4e4e0" }}>
              <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Assign a material for review</div>
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Field label="Material">
                  <select className={inputCls} style={inputStyle} value={aRes} onChange={(e) => setARes(e.target.value)}>
                    <option value="">Choose a material…</option>
                    {db.resources.map((r) => <option key={r.id} value={r.id}>{current(r).title}</option>)}
                  </select>
                </Field>
                <Field label="Assign to">
                  <select className={inputCls} style={inputStyle} value={aWho} onChange={(e) => setAWho(e.target.value)}>
                    <option value="">Choose a contributor…</option>
                    {contributors.map((u) => <option key={u.username} value={u.username}>{u.name} ({u.username})</option>)}
                  </select>
                </Field>
              </div>
              <Field label="What should they check?">
                <input className={inputCls} style={inputStyle} value={aNote} onChange={(e) => setANote(e.target.value)} placeholder="e.g. Verify the link and update the citation to the 2026 edition" />
              </Field>
              <Btn small disabled={!aRes || !aWho || !aNote.trim()} onClick={() => { actions.createAssignment(aRes, aWho, aNote.trim()); setARes(""); setAWho(""); setANote(""); }}>Assign review</Btn>
            </div>
          )}

          {(isAdmin ? allAssignments : myAssignments).length === 0 && (
            <div className="text-sm" style={{ color: "#7e828a" }}>{isAdmin ? "No reviews assigned yet." : "Nothing assigned to you right now."}</div>
          )}
          <div className="flex flex-col gap-3">
            {(isAdmin ? allAssignments : myAssignments).map((a) => (
              <div key={a.id} className="rounded border bg-white p-4" style={{ borderColor: "#e4e4e0" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap text-sm">
                  <div>
                    <StatusDot status={a.status} />
                    <button className="underline font-semibold" style={{ color: ACCENT }} onClick={() => nav({ page: "detail", id: a.resourceId })}>{rTitle(a.resourceId)}</button>
                    <span style={{ color: "#7e828a" }}> → {userName(db, a.assignedTo)}</span>
                  </div>
                  <span className="text-xs" style={{ color: "#7e828a" }}>assigned by {userName(db, a.assignedBy)} · {fmtDate(a.date)}</span>
                </div>
                <div className="text-sm mt-2" style={{ color: INK }}>{a.note}</div>
                {a.status === "completed" && (
                  <div className="text-sm mt-2 px-3 py-2 rounded" style={{ background: "#eef2e6", color: "#51661a" }}>
                    Completed {fmtDate(a.completedAt)}{a.completionNote ? ` — ${a.completionNote}` : ""}
                  </div>
                )}
                {a.status === "pending" && a.assignedTo === user.username && (
                  <div className="mt-3 flex gap-2 items-start">
                    <input
                      className={inputCls} style={inputStyle} placeholder="Optional note on what you found / fixed"
                      value={completeNotes[a.id] || ""}
                      onChange={(e) => setCompleteNotes({ ...completeNotes, [a.id]: e.target.value })}
                    />
                    <Btn small onClick={() => actions.completeAssignment(a.id, (completeNotes[a.id] || "").trim())}>Mark complete</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── users (admin) ── */}
      {tab === "Users" && isAdmin && (
        <div className="pt-6">
          <div className="text-sm mb-4" style={{ color: "#7e828a" }}>Change a user's role with the dropdown. New sign-ups arrive as viewers.</div>
          <div className="flex flex-col">
            {db.users.map((u) => (
              <div key={u.username} className="flex items-center gap-4 py-2 border-b text-sm flex-wrap" style={{ borderColor: "#ececea" }}>
                <span className="font-semibold w-40" style={{ color: INK }}>{u.name}</span>
                <span style={{ ...MONO, color: "#7e828a" }} className="w-28">{u.username}</span>
                <span className="text-xs" style={{ color: "#7e828a" }}>joined {fmtDate(u.createdAt)}</span>
                <div className="flex-1" />
                <select
                  className="px-2 py-1 rounded border bg-white text-sm" style={inputStyle}
                  value={u.role}
                  disabled={u.username === user.username}
                  onChange={(e) => actions.setRole(u.username, e.target.value)}
                >
                  {ROLES.map((rr) => <option key={rr}>{rr}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── my materials ── */}
      {tab === "My materials" && (
        <div className="pt-6">
          {myMaterials.length === 0 && (
            <div className="text-sm" style={{ color: "#7e828a" }}>
              You haven't contributed anything yet. <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "submit" })}>Submit your first material</button>.
            </div>
          )}
          <div className="flex flex-col">
            {myMaterials.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b text-sm flex-wrap" style={{ borderColor: "#ececea" }}>
                <button className="underline font-semibold" style={{ color: ACCENT }} onClick={() => nav({ page: "detail", id: r.id })}>{current(r).title}</button>
                <span style={{ ...MONO, color: "#7e828a" }}>v{r.versions.length}</span>
                <span className="text-xs" style={{ color: "#7e828a" }}>added {fmtDate(r.createdAt)}</span>
                <div className="flex-1" />
                <Btn small kind="ghost" onClick={() => nav({ page: "edit", id: r.id })}>Edit</Btn>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
