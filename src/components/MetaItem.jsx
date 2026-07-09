import { INK, MONO } from "../lib/theme.js";

export function MetaItem({ label, children, mono }) {
  if (!children) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#7e828a" }}>{label}</div>
      <div className="text-sm leading-relaxed" style={{ color: INK, ...(mono ? MONO : {}) }}>{children}</div>
    </div>
  );
}
