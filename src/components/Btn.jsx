import { ACCENT, INK } from "../lib/theme.js";

export function Btn({ children, onClick, kind = "primary", small, disabled, type }) {
  const base = small ? "px-3 py-1 text-sm" : "px-4 py-2 text-sm";
  const styles = {
    primary: { background: disabled ? "#9aa7b3" : ACCENT, color: "#fff", border: "1px solid transparent" },
    ghost: { background: "#fff", color: INK, border: "1px solid #d4d5d3" },
    dark: { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.5)" },
    danger: { background: "#fff", color: "#af2f23", border: "1px solid #d68f85" },
  };
  return (
    <button type={type || "button"} disabled={disabled} onClick={onClick} className={base + " rounded font-medium transition-opacity hover:opacity-90"} style={styles[kind]}>
      {children}
    </button>
  );
}
