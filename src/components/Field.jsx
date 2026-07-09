export function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#5f636b" }}>{label}</div>
      {children}
      {hint && <div className="text-xs mt-1" style={{ color: "#7e828a" }}>{hint}</div>}
    </label>
  );
}
