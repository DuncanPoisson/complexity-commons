export function NodeGlyph() {
  // a little "complexity burst": one white hub, colorful satellites, two second-degree sparks
  const edges = [[16,16,16,5],[16,16,27,10],[16,16,28,22],[16,16,19,28],[16,16,6,25],[16,16,4,11],[27,10,31,4],[6,25,2,30]];
  const dots = [
    { x: 16, y: 5, r: 2.6, c: "#d49a34" },
    { x: 27, y: 10, r: 3.2, c: "#af2f23" },
    { x: 31, y: 4, r: 1.6, c: "#af2f23" },
    { x: 28, y: 22, r: 2.2, c: "#008e94" },
    { x: 19, y: 28, r: 2.8, c: "#d68f85" },
    { x: 6, y: 25, r: 2.4, c: "#decea1" },
    { x: 2, y: 30, r: 1.4, c: "#decea1" },
    { x: 4, y: 11, r: 2.0, c: "#008e94" },
  ];
  return (
    <svg width="30" height="30" viewBox="0 0 34 34" aria-hidden="true">
      {edges.map((e, i) => <line key={i} x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]} stroke="#cccec8" strokeWidth="1.2" />)}
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />)}
      <circle cx="16" cy="16" r="3.6" fill="#fff" />
    </svg>
  );
}
