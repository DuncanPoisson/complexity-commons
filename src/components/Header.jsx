import { Btn } from "./Btn.jsx";
import { NodeGlyph } from "./NodeGlyph.jsx";
import { GRAD, HEAD, MONO } from "../lib/theme.js";

export function Header({ user, nav, onLogout }) {
  return (
    <header className="sticky top-0 z-20" style={{ background: GRAD, boxShadow: "0 1px 0 rgba(0,0,0,0.25)" }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
        <button onClick={() => nav({ page: "home" })} className="flex items-center gap-2.5 text-left">
          <NodeGlyph />
          <span>
            <span className="block text-lg leading-tight text-white" style={HEAD}>Complexity Commons</span>
            <span className="block text-xs" style={{ color: "#cccec8", letterSpacing: "0.06em" }}>a project of the Santa Fe Institute's Complexity Explorer</span>
          </span>
        </button>
        <div className="flex-1" />
        {user && (user.role === "contributor" || user.role === "admin") && (
          <Btn small onClick={() => nav({ page: "submit" })}>+ Submit material</Btn>
        )}
        {user && user.role !== "viewer" && (
          <Btn small kind="dark" onClick={() => nav({ page: "dashboard" })}>Dashboard</Btn>
        )}
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: "#aab2bd" }}>
              {user.name} <span className="px-1.5 py-0.5 rounded text-xs" style={{ ...MONO, background: "rgba(255,255,255,0.14)", color: "#decea1" }}>{user.role}</span>
            </span>
            <button onClick={onLogout} className="underline" style={{ color: "#cccec8" }}>Log out</button>
          </div>
        ) : (
          <Btn small kind="dark" onClick={() => nav({ page: "login" })}>Log in</Btn>
        )}
      </div>
    </header>
  );
}
