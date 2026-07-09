# Complexity Commons

An open teaching repository of materials for teaching complex systems — videos, notebooks, interactive simulations, courses, papers, and more, contributed and annotated by the people who teach with them. A prototype project of the [Santa Fe Institute](https://www.santafe.edu/)'s [Complexity Explorer](https://www.complexityexplorer.org/).

Materials are linked, not hosted — rights remain with their creators.

## What it does

- **Browse & search** the catalog by topic, format (video, notebook, simulation, course, paper, etc.), and level, or explore it as a network graph of materials linked by shared topics.
- **Submit & version materials** — contributors add resources with metadata (description, usage notes, prerequisites, difficulty, license, citation) and can revise them; every edit is kept as a numbered version with a changelog.
- **Discuss & flag** — anyone can comment on a resource; anyone can flag issues (broken link, outdated content, factual error, metadata problem).
- **Dashboard** — contributors manage their own submissions and review assignments; admins triage the flag/issue log, assign materials to contributors for review, and manage user roles.
- **Roles**: `viewer` (browse only) → `contributor` (submit/edit) → `admin` (moderation + user management).

## Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) for auth, database, and row-level security
- [Oxlint](https://oxc.rs/) for linting

## Project structure

```text
src/
  App.jsx            # app shell: routing, auth state, wires actions to store
  store.js            # the only file that talks to Supabase — read model + write model
  supabaseClient.js    # Supabase client setup (reads env vars)
  pages/              # HomePage, DetailPage, ResourceForm, LoginPage, Dashboard
  components/         # presentational pieces (cards, filters, network view, etc.)
  lib/                # vocab.js (topics/formats/levels/roles), theme.js, format.js, graph.js
```

`store.js` is the single boundary between the UI and Supabase: the rest of the app never queries the database directly, it always goes through `store`.

## Getting started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a Supabase project, then add a `.env.local` file in the project root with:

   ```sh
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
   ```

   (`.env.local` is gitignored — never commit real credentials. I will place this on a 1Password.)

3. Run the dev server:

   ```sh
   npm run dev
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Notes

- Row-Level Security in Supabase governs who can read/write what — if `loadDb()` in `store.js` returns empty data with no error, check that RLS policies are set up correctly on the project's Supabase instance.
- This is a prototype; treat data model and UI as subject to change.
