import { useState } from "react";
import { Btn } from "../components/Btn.jsx";
import { Field } from "../components/Field.jsx";
import { Pill } from "../components/Pill.jsx";
import { current } from "../lib/format.js";
import { DIFFICULTIES, EMPTY, FORMATS, LEVELS, TOPICS } from "../lib/vocab.js";
import { HEAD, INK, MONO, inputCls, inputStyle } from "../lib/theme.js";

export function ResourceForm({ db, user, nav, actions, editId }) {
  const editing = editId ? db.resources.find((x) => x.id === editId) : null;
  const [data, setData] = useState(editing ? { ...current(editing) } : { ...EMPTY });
  const [changelog, setChangelog] = useState("");
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });
  const toggleTopic = (t) => setData({ ...data, topics: data.topics.includes(t) ? data.topics.filter((x) => x !== t) : [...data.topics, t] });
  const valid = data.title.trim() && data.url.trim() && data.topics.length > 0 && (!editing || changelog.trim());

  if (!user || user.role === "viewer") {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-sm" style={{ color: "#7e828a" }}>Submitting materials requires a contributor account.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      <h1 className="text-2xl pt-8 pb-1" style={{ ...HEAD, color: INK }}>{editing ? "Edit material" : "Submit a material"}</h1>
      <p className="text-sm mb-6" style={{ color: "#7e828a" }}>
        {editing
          ? `Saving creates version v${editing.versions.length + 1}; earlier versions stay visible in the history.`
          : "Materials are linked, not hosted — paste a stable URL and describe how you've used it in teaching."}
      </p>

      <Field label="Title *"><input className={inputCls} style={inputStyle} value={data.title} onChange={set("title")} /></Field>
      <Field label="URL *" hint="Direct link to the video, notebook, simulation, or site."><input className={inputCls} style={inputStyle} value={data.url} onChange={set("url")} placeholder="https://…" /></Field>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Format">
          <select className={inputCls} style={inputStyle} value={data.format} onChange={set("format")}>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select>
        </Field>
        <Field label="Audience level">
          <select className={inputCls} style={inputStyle} value={data.level} onChange={set("level")}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        </Field>
      </div>

      <Field label="Topics * (select all that apply)">
        <div className="flex flex-wrap gap-2 pt-1">
          {TOPICS.map((t) => <Pill key={t} active={data.topics.includes(t)} onClick={() => toggleTopic(t)}>{t.toLowerCase()}</Pill>)}
        </div>
      </Field>

      <Field label="Description" hint="What is it? One or two sentences.">
        <textarea rows={3} className={inputCls} style={inputStyle} value={data.description} onChange={set("description")} />
      </Field>
      <Field label="How & why it was used in teaching" hint="The pedagogical context: where it fits in a course, what it's good at, tips for running it.">
        <textarea rows={4} className={inputCls} style={inputStyle} value={data.usage} onChange={set("usage")} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Prerequisites"><input className={inputCls} style={inputStyle} value={data.prereqs} onChange={set("prereqs")} placeholder="e.g. Basic Python" /></Field>
        <Field label="Difficulty">
          <select className={inputCls} style={inputStyle} value={data.difficulty} onChange={set("difficulty")}>{DIFFICULTIES.map((x) => <option key={x}>{x}</option>)}</select>
        </Field>
        <Field label="Time required"><input className={inputCls} style={inputStyle} value={data.time} onChange={set("time")} placeholder="e.g. One 2-hour lab" /></Field>
        <Field label="Author / creator"><input className={inputCls} style={inputStyle} value={data.author} onChange={set("author")} /></Field>
        <Field label="License / access"><input className={inputCls} style={inputStyle} value={data.license} onChange={set("license")} placeholder="e.g. CC BY 4.0, free with registration" /></Field>
      </div>
      <Field label="Citation" hint="How should others credit this material?">
        <input className={inputCls} style={{ ...inputStyle, ...MONO, fontSize: 13 }} value={data.citation} onChange={set("citation")} />
      </Field>

      {editing && (
        <Field label="Changelog *" hint="Briefly: what changed in this version, and why?">
          <input className={inputCls} style={inputStyle} value={changelog} onChange={(e) => setChangelog(e.target.value)} placeholder="e.g. Updated link to the 2026 edition" />
        </Field>
      )}

      <div className="flex gap-2 mt-2">
        <Btn disabled={!valid} onClick={async () => {
          if (editing) { await actions.updateResource(editing.id, data, changelog.trim()); nav({ page: "detail", id: editing.id }); }
          else { const id = await actions.createResource(data); nav({ page: "detail", id }); }
        }}>
          {editing ? "Save new version" : "Submit material"}
        </Btn>
        <Btn kind="ghost" onClick={() => nav(editing ? { page: "detail", id: editing.id } : { page: "home" })}>Cancel</Btn>
      </div>
      {!valid && <div className="text-xs mt-2" style={{ color: "#7e828a" }}>Required: title, URL, at least one topic{editing ? ", and a changelog" : ""}.</div>}
    </div>
  );
}
