export function Tag({ children }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs border" style={{ borderColor: "#decea1", background: "#f6f3ea", color: "#636051" }}>
      {children}
    </span>
  );
}
