import { DARK, INK } from "../lib/theme.js";

export function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-sm border transition-colors whitespace-nowrap"
      style={active
        ? { background: DARK, color: "#fff", borderColor: DARK }
        : { background: "#fff", color: INK, borderColor: "#dcdcd8" }}
    >
      {children}
    </button>
  );
}
