import { Pill } from "./Pill.jsx";
import { MONO } from "../lib/theme.js";

export function FilterRow({ label, options, value, onChange, color }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <span className="text-xs uppercase tracking-widest w-16 shrink-0" style={{ ...MONO, color: color || "#7e828a", fontWeight: 700 }}>{label}</span>
      <Pill active={value === null} onClick={() => onChange(null)}>all</Pill>
      {options.map((o) => (
        <Pill key={o} active={value === o} onClick={() => onChange(value === o ? null : o)}>{o.toLowerCase()}</Pill>
      ))}
    </div>
  );
}
