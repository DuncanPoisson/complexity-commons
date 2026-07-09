// src/supabaseClient.js
// Creates the one Supabase client the app shares. Reads credentials from
// environment variables so they never get hard-coded into the source.
//
// Vite only exposes vars prefixed with VITE_ to the browser. Put these in a
// file called `.env.local` in the project root (NOT in src/):
//
//   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
//
// Supabase now issues "publishable" keys for client-side use; older projects
// call the equivalent key "anon". We accept either name below.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase env vars. Create a .env.local file with VITE_SUPABASE_URL " +
    "and VITE_SUPABASE_PUBLISHABLE_KEY, then restart `npm run dev`."
  );
}

export const supabase = createClient(url, key);
