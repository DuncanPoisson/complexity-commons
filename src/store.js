// src/store.js
// ─────────────────────────────────────────────────────────────────────────
// The data + auth layer. The UI (complexity-commons.jsx) talks ONLY to this
// object — it never imports supabase directly. That keeps the boundary the
// original prototype was designed around: swap what's in here, leave the UI
// untouched.
//
// READ MODEL:  loadDb() fetches every table and reassembles them into the exact
//              nested shape the UI expects ({ users, resources:[{versions:[…]}],
//              comments, flags, assignments }). The app calls it on mount and
//              again after every write, so the screen always mirrors the DB.
//
// WRITE MODEL: one method per user action. Each does a single targeted insert
//              or update. Row-Level Security (see schema.sql) decides whether
//              the logged-in user is actually allowed to perform it.
// ─────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabaseClient.js";

export const store = {
  // ─────────────────────────── READ ───────────────────────────
  async loadDb() {
    const [
      profiles,
      resources,
      versions,
      comments,
      flags,
      assignments,
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: true }),
      supabase.from("resources").select("*").order("created_at", { ascending: false }),
      supabase.from("resource_versions").select("*").order("v", { ascending: true }),
      supabase.from("comments").select("*").order("date", { ascending: true }),
      supabase.from("flags").select("*").order("date", { ascending: true }),
      supabase.from("assignments").select("*").order("date", { ascending: true }),
    ]);

    // Surface the first error (an empty result with no error usually means RLS
    // is blocking reads — confirm schema.sql ran in full).
    const firstError =
      profiles.error || resources.error || versions.error ||
      comments.error || flags.error || assignments.error;
    if (firstError) {
      console.error("loadDb failed:", firstError);
      throw firstError;
    }

    const users = profiles.data.map((p) => ({
      username: p.username,
      name: p.name,
      role: p.role,
      createdAt: p.created_at,
    }));

    // Group versions under their resource, preserving version order.
    const versionsByResource = {};
    for (const v of versions.data) {
      (versionsByResource[v.resource_id] ||= []).push({
        v: v.v,
        date: v.date,
        editedBy: v.edited_by,
        changelog: v.changelog,
        data: v.data,
      });
    }

    const resourcesShaped = resources.data.map((r) => ({
      id: r.id,
      createdBy: r.created_by,
      createdAt: r.created_at,
      featured: r.featured,
      versions: (versionsByResource[r.id] || []).sort((a, b) => a.v - b.v),
    }));

    const commentsShaped = comments.data.map((c) => ({
      id: c.id,
      resourceId: c.resource_id,
      by: c.by,
      date: c.date,
      text: c.text,
    }));

    const flagsShaped = flags.data.map((f) => ({
      id: f.id,
      resourceId: f.resource_id,
      type: f.type,
      note: f.note,
      by: f.by,
      date: f.date,
      status: f.status,
      resolvedBy: f.resolved_by,
      resolvedAt: f.resolved_at,
    }));

    const assignmentsShaped = assignments.data.map((a) => ({
      id: a.id,
      resourceId: a.resource_id,
      assignedTo: a.assigned_to,
      assignedBy: a.assigned_by,
      note: a.note,
      date: a.date,
      status: a.status,
      completionNote: a.completion_note,
      completedAt: a.completed_at,
    }));

    return {
      users,
      resources: resourcesShaped,
      comments: commentsShaped,
      flags: flagsShaped,
      assignments: assignmentsShaped,
    };
  },

  // ────────────────────────── WRITES ──────────────────────────
  async createResource(createdBy, data, changelog = "Initial submission") {
    const { data: r, error } = await supabase
      .from("resources")
      .insert({ created_by: createdBy })
      .select()
      .single();
    if (error) throw error;

    const { error: vErr } = await supabase.from("resource_versions").insert({
      resource_id: r.id,
      v: 1,
      edited_by: createdBy,
      changelog,
      data,
    });
    if (vErr) throw vErr;

    return r.id;
  },

  async addVersion(resourceId, nextV, editedBy, changelog, data) {
    const { error } = await supabase.from("resource_versions").insert({
      resource_id: resourceId,
      v: nextV,
      edited_by: editedBy,
      changelog,
      data,
    });
    if (error) throw error;
  },

  async toggleFeatured(resourceId, featured) {
    const { error } = await supabase
      .from("resources")
      .update({ featured })
      .eq("id", resourceId);
    if (error) throw error;
  },

  async addComment(resourceId, by, text) {
    const { error } = await supabase
      .from("comments")
      .insert({ resource_id: resourceId, by, text });
    if (error) throw error;
  },

  async addFlag(resourceId, type, note, by) {
    const { error } = await supabase
      .from("flags")
      .insert({ resource_id: resourceId, type, note, by, status: "open" });
    if (error) throw error;
  },

  async resolveFlag(flagId, resolvedBy) {
    const { error } = await supabase
      .from("flags")
      .update({
        status: "resolved",
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", flagId);
    if (error) throw error;
  },

  async createAssignment(resourceId, assignedTo, assignedBy, note) {
    const { error } = await supabase.from("assignments").insert({
      resource_id: resourceId,
      assigned_to: assignedTo,
      assigned_by: assignedBy,
      note,
      status: "pending",
    });
    if (error) throw error;
  },

  async completeAssignment(id, completionNote) {
    const { error } = await supabase
      .from("assignments")
      .update({
        status: "completed",
        completion_note: completionNote,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },

  async setRole(username, role) {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("username", username);
    if (error) throw error;
  },

  // ─────────────────────────── AUTH ───────────────────────────
  // username + name ride along as user metadata; the handle_new_user trigger
  // (schema.sql) reads them to build the profile row.
  async signUp(email, password, username, name) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, name } },
    });
    return error ? error.message : null;
  },

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  // Returns the app-level user (their profile) for the current session, or null.
  async currentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (error || !profile) return null;
    return {
      username: profile.username,
      name: profile.name,
      role: profile.role,
      createdAt: profile.created_at,
    };
  },

  // Calls cb() whenever the user logs in or out.
  onAuthChange(cb) {
    return supabase.auth.onAuthStateChange(() => cb());
  },
};
