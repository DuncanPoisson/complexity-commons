import { useEffect, useState } from "react";
import { store } from "./store.js";
import { Header } from "./components/Header.jsx";
import { NodeGlyph } from "./components/NodeGlyph.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { DetailPage } from "./pages/DetailPage.jsx";
import { ResourceForm } from "./pages/ResourceForm.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { GRAD, HEAD, INK, PAPER } from "./lib/theme.js";

/* ════════════════════════════════════════════════════════════════════
   COMPLEXITY TEACHING COMMONS
   ────────────────────────────────────────────────────────────────────
   Persistence + auth now live in ./store.js (Supabase). This file is the
   UI layer only — it never talks to the database directly; it goes
   through `store`.
   ════════════════════════════════════════════════════════════════════ */

/* ───────────────────────── app shell ───────────────────────── */

export default function ComplexityCommons() {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState({ page: "home" });

  // Pull the whole catalog from Supabase into the shape the UI expects.
  // We re-run this after every write so the screen always reflects the DB.
  const refresh = async () => setDb(await store.loadDb());

  useEffect(() => {
    (async () => {
      await refresh();
      setUser(await store.currentUser());
    })();
    // Re-check the session and reload data whenever auth changes (login/logout).
    const { data: sub } = store.onAuthChange(async () => {
      setUser(await store.currentUser());
      await refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const nav = (r) => { setRoute(r); window.scrollTo(0, 0); };

  // Each action performs its specific Supabase write, then refreshes local state.
  const actions = {
    async createResource(data) {
      const id = await store.createResource(user.username, data);
      await refresh();
      return id;
    },
    async updateResource(id, data, changelog) {
      const r = db.resources.find((x) => x.id === id);
      const nextV = (r ? r.versions.length : 0) + 1;
      await store.addVersion(id, nextV, user.username, changelog, data);
      await refresh();
    },
    async toggleFeatured(id) {
      const r = db.resources.find((x) => x.id === id);
      await store.toggleFeatured(id, !(r && r.featured));
      await refresh();
    },
    async addComment(resourceId, text) {
      await store.addComment(resourceId, user.username, text);
      await refresh();
    },
    async addFlag(resourceId, type, note) {
      await store.addFlag(resourceId, type, note, user.username);
      await refresh();
    },
    async resolveFlag(flagId) {
      await store.resolveFlag(flagId, user.username);
      await refresh();
    },
    async createAssignment(resourceId, assignedTo, note) {
      await store.createAssignment(resourceId, assignedTo, user.username, note);
      await refresh();
    },
    async completeAssignment(id, completionNote) {
      await store.completeAssignment(id, completionNote);
      await refresh();
    },
    async setRole(username, role) {
      await store.setRole(username, role);
      await refresh();
    },
  };

  // Auth is delegated to Supabase. signIn/signUp return null on success or an
  // error string on failure; the onAuthChange listener above sets `user`.
  const onLogin = async (email, password) => {
    return await store.signIn(email, password);
  };
  const onSignup = async (email, password, username, name) => {
    if (!email || !password || !username || !name) return "All fields are required.";
    if (db.users.some((x) => x.username === username)) return "That username is already taken.";
    return await store.signUp(email, password, username, name);
  };
  const onLogout = async () => { await store.signOut(); setRoute({ page: "home" }); };

  if (!db) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: PAPER, color: "#7e828a" }}>
        Loading the commons…
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
      <Header user={user} nav={nav} onLogout={onLogout} />
      {route.page === "home" && <HomePage db={db} nav={nav} initialFormat={route.format} key={route.format || "all"} />}
      {route.page === "detail" && <DetailPage db={db} id={route.id} user={user} nav={nav} actions={actions} />}
      {route.page === "submit" && <ResourceForm db={db} user={user} nav={nav} actions={actions} />}
      {route.page === "edit" && <ResourceForm db={db} user={user} nav={nav} actions={actions} editId={route.id} />}
      {route.page === "login" && <LoginPage nav={nav} onLogin={onLogin} onSignup={onSignup} />}
      {route.page === "dashboard" && user && user.role !== "viewer" && <Dashboard db={db} user={user} nav={nav} actions={actions} />}
      <footer className="mt-10 py-10 text-center text-xs" style={{ background: GRAD, color: "#cccec8" }}>
        <div className="flex items-center justify-center mb-3"><NodeGlyph /></div>
        <div className="text-sm text-white mb-1" style={HEAD}>Complexity Commons</div>
        <div className="mb-2">
          A project of the <a href="https://www.santafe.edu/" target="_blank" rel="noreferrer" className="underline" style={{ color: "#decea1" }}>Santa Fe Institute</a>'s <a href="https://www.complexityexplorer.org/" target="_blank" rel="noreferrer" className="underline" style={{ color: "#decea1" }}>Complexity Explorer</a>
        </div>
        Prototype. Materials are linked, not hosted; rights remain with their creators.
      </footer>
    </div>
  );
}
