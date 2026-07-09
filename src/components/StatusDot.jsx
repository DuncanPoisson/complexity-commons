export function StatusDot({ status }) {
  const color = status === "open" || status === "pending" ? "#d15a2a" : "#51661a";
  return <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: color }} />;
}
