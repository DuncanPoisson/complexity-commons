import { ACCENT, INK } from "../lib/theme.js";

export function SectionHead({ children, right }) {
  return (
    <div className="flex items-center mt-12 mb-5 gap-3">
      <span className="w-6 h-1 shrink-0" style={{ background: ACCENT }} />
      <h2 className="text-sm uppercase shrink-0" style={{ fontWeight: 800, letterSpacing: "0.16em", color: INK }}>{children}</h2>
      <div className="flex-1 border-t" style={{ borderColor: "#e4e4e0" }} />
      {right}
    </div>
  );
}
