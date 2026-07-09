import { useState } from "react";
import { Btn } from "../components/Btn.jsx";
import { Field } from "../components/Field.jsx";
import { ACCENT, HEAD, INK, inputCls, inputStyle } from "../lib/theme.js";

export function LoginPage({ nav, onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("login");

  const submit = async () => {
    setErr(""); setBusy(true);
    const res = mode === "login"
      ? await onLogin(email.trim(), p)
      : await onSignup(email.trim(), p, u.trim(), name.trim());
    setBusy(false);
    if (res) setErr(res); else nav({ page: "home" });
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <h1 className="text-2xl pt-10 pb-6" style={{ ...HEAD, color: INK }}>{mode === "login" ? "Log in" : "Create a viewer account"}</h1>

      {mode === "signup" && (
        <>
          <Field label="Display name"><input className={inputCls} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Username" hint="Your handle on the commons — shown on everything you contribute."><input className={inputCls} style={inputStyle} value={u} onChange={(e) => setU(e.target.value)} /></Field>
        </>
      )}
      <Field label="Email"><input type="email" autoComplete="email" className={inputCls} style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password"><input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputCls} style={inputStyle} value={p} onChange={(e) => setP(e.target.value)} /></Field>
      {err && <div className="text-sm mb-3" style={{ color: "#af2f23" }}>{err}</div>}

      <div className="flex gap-2 items-center">
        <Btn disabled={busy} onClick={submit}>{busy ? "Working…" : (mode === "login" ? "Log in" : "Create account")}</Btn>
        <button className="text-sm underline" style={{ color: ACCENT }} onClick={() => { setErr(""); setMode(mode === "login" ? "signup" : "login"); }}>
          {mode === "login" ? "Need an account? Sign up as a viewer" : "Have an account? Log in"}
        </button>
      </div>

      <div className="mt-10 rounded border p-4 text-sm" style={{ background: "#f1f1ee", borderColor: "#e0e0dc", color: "#4d5158" }}>
        New sign-ups arrive with the <strong>viewer</strong> role. An admin can promote you to contributor or admin from the dashboard. Sign-in is handled securely by Supabase Auth.
      </div>
    </div>
  );
}
