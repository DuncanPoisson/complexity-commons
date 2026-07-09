/* ───────────────────────── helpers ───────────────────────── */

export const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
export const current = (r) => r.versions[r.versions.length - 1].data;
export const userName = (db, username) => (db.users.find((u) => u.username === username) || {}).name || username;
