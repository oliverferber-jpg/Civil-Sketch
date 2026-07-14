# Bridge Inspection App

## Project Overview

An app for bridge inspectors to use in the field, replacing paper-based defect marking. Inspectors upload bridge face diagrams in advance, then draw directly on top of them during inspection to mark measurements, features, and defects. The app must work fully offline in the field and sync to the cloud when connectivity returns. We are working on this as a team.

## Tech Stack

- **Frontend:** React + TypeScript, built with Vite, styled with Tailwind CSS
- **Backend:** Node.js API server (REST) — sits between the frontend and the database, since PostgreSQL (unlike Firestore) can't be reached directly from client code. **As of 2026-07-14**, the real Express 5 + Prisma backend from `origin/backendData` (`server/index.ts` mounting a `projects` router, Prisma-backed service layer) has been merged onto `integration/merge-backend-data` alongside `main`'s frontend work. See [Backend Scaffold](#backend-scaffold) for what's implemented and what's still needed before it's runnable (local Postgres + first migration).
- **Database:** PostgreSQL, via Prisma. Schema exists (`prisma/schema.prisma`, `Project`/`Drawing` models) but has never been migrated — no `prisma/migrations/` directory, no DB provisioned yet. **Decided 2026-07-14:** local/dev Postgres is a hosted **Neon** free-tier project, not Docker Compose, a native install, or Supabase — production will use a managed Postgres regardless, so this matches dev to the real deployment target from day one. See the "Get the backend running" roadmap for the full rationale and provisioning steps. everyone has the link to my neon account
- **File storage:** Local disk for now (early development). PostgreSQL isn't well suited to storing binary files directly. Must be swapped for persistent cloud object storage (e.g. Cloudflare R2 or AWS S3) before deploying anywhere with ephemeral disks — most hosting platforms (Render, Fly, Railway, Heroku, etc.) don't persist local disk across redeploys. Keep local-disk file access isolated behind a small storage interface so this swap is cheap later.
- **Version Control:** GitHub

An ORM is needed for the backend to talk to PostgreSQL, for type-safe queries and migrations. **Decided: Prisma** (confirmed 2026-07-12) — now an actual dependency (`@prisma/client`, `@prisma/adapter-pg`, `prisma`, all `^7.8.0`) wired into `server/prisma.ts`, merged in from `backendData`. Still ask before running the first real migration against a database, per the guardrails below.

A routing library is needed once the [Navigation & Auth Flow](#8-navigation--auth-flow-planned) below is built, since the app currently has no URL-based routing at all. **Planned: `react-router-dom`**, not yet installed — same as Prisma, this records the choice without authorizing the install; ask first per the guardrails below.

## Branch / Team Status (as of 2026-07-14)

`origin/backendData` (Oliver Ferber, 5 commits) has been merged into `main`'s frontend work via `integration/merge-backend-data`, resolving the divergence described below. Kept for context on what each side contributed and how conflicts were resolved.

- **`main`** (pre-merge) had the drawing canvas, defect panel (two-tap placement + undo), a Projects/drawing-tile grid UI, and a Vitest test suite, all running on **mock in-memory data** — no live backend calls. Also had the unwired `server/index.ts` scaffold.
- **`origin/backendData`** (pre-merge) had the real backend: Express 5 + Prisma 7 (`server/prisma.ts`, `@prisma/adapter-pg`), `server/routes/projects.ts`, `server/services/projectService.ts`, a two-model Prisma schema (`Project`/`Drawing`), and a frontend wired to call it for real. It forked from `main` at commit `7726659`, **before** `main`'s undo, two-tap defect placement, project-grid redesign, and Vitest work existed — so it never had `useUndoHistory.ts`, `ConfirmDialog`/`Button`/`Card`, or the Vitest setup. (An earlier version of this doc read that absence as `backendData` having "removed" or "deleted" those — confirmed via the shared fork point that's inaccurate: they simply didn't exist yet at the point of divergence, so merging brought them in with zero conflict.)
- **Merge resolution:** kept `main`'s newer UI shells (`StartPage`/`ProjectPage` icon-tile grids) and threaded in `backendData`'s real async data flow/API calls; kept `backendData`'s `HomePage.tsx` (exports `App`) as the base since it already had the real fetch/create logic `main`'s mock version lacked.
- **Deliberately deferred in the merge** (kept as-is to minimize the diff, flagged for a later cleanup pass): dead `server/db.ts` (unused raw `pg.Pool`), stale `server/server.env` (unused `DB_*` vars, committed to git), orphaned `server/data/*.json` fixtures, the `src/types/project.ts`/`src/types/projects.ts` duplication, `ApiTestPage.tsx` always visible in nav, and the redundant `server`/`dev:server` npm scripts (`ts-node` vs `tsx`) plus the unused `nodemon` devDependency.
- **`origin/Server`** (previously attributed to Ariella here) **no longer exists** — that thread is resolved. Her `server/` scaffold was merged straight into `main` instead (as the minimal Express placeholder mentioned above).
- **The Project/Drawings vs. `inspections`/`faces` naming mismatch is not a merge blocker.** Both sides already independently used the same Project→Drawings shape (`Project { id, name, description?, folder?, drawingCount?, lastUpdated?, drawings[] }` / `Drawing { id, projectId, title, angle?, status?, updatedAt?, notes?, createdAt?, project }`), so there was no decision needed to complete this merge. Whether to eventually migrate toward the `inspections`/`faces` naming in [Data Model](#data-model-starting-point--refine-as-needed) remains a separate, open question for the team.

## Core Features

### 1. Diagram Upload & Drawing Canvas
- Inspectors can upload diagrams in advance, one per bridge face
- Main screen is a drawing canvas overlaid on the diagram image
- Three drawing colors, each with a distinct purpose:
  - **Black** — general bridge features
  - **Blue** — measurements
  - **Red** — defects
- Drawings must be saved as vector data (not just a flattened image) so they can be edited/exported cleanly

### 2. Defect Panel
- A panel of preloaded common defects (e.g. Crack, Chipping, Spalling, Corrosion, etc.)
- Tapping a defect places an icon at the tapped location on the diagram, plus a leader line/arrow pointing outward to a text label with the defect name
- Defect list should be editable (add/remove/rename defect types), likely managed as a master list

### 3. Defect Photos
- After placing a defect, prompt the inspector to take a photo
- Assign each photo a sequential number, displayed next to the defect's label on the diagram
- Tapping the photo number opens a preview/pop-up of that photo
- Photos are stored in the file storage solution (see Tech Stack), organized per inspection, with a row in PostgreSQL linking each photo to its inspection, defect, and sequence number

### 4. Reminders
- In-app reminders for commonly forgotten items:
  - General overview photos (not just defect photos)
  - Personal reminders (e.g. drink water)
- These should surface at logical points in the workflow (e.g. start of inspection, before wrapping up)

### 5. Pre-Inspection Checklist
- A checklist of items to bring (e.g. measuring tool, water, hat)
- Master checklist is set by an engineer/admin and reused for every inspection
- Editable master list, but defaults to the last saved version each time

### 6. Export
- Ability to export completed diagram drawings (with defect markups) in a shareable format (e.g. PDF or image export per bridge face)

### 7. Offline-First Sync
- All editing (drawing, defect placement, photos, checklists) must work fully offline
- Unlike Firestore, PostgreSQL has no built-in client-side offline persistence, so this requires custom sync logic:
  - Frontend writes to local storage first (e.g. IndexedDB) so the app is usable with no connection
  - A sync layer pushes queued local changes to the backend API once connectivity returns, and resolves conflicts (e.g. last-write-wins, or flag for manual review)
- This is a significant piece of backend/frontend design work in its own right — plan it deliberately rather than bolting it on late

### 8. Navigation & Auth Flow (planned)

**Target design captured from a 2026-07-12 whiteboard session — describes the intended screen flow end-to-end. None of this is implemented yet; see Current Status.**

Screens, in navigation order:

1. **Marketing Page** (`/`) — public landing page, unauthenticated.
2. **Google Auth** — the existing `SignInCard` flow, eventually backed by real server-side ID token verification (see Current Status).
3. **Subscription check** (backend call right after auth):
   - Not subscribed → **Pay** page → on success, POST a subscription record to the DB → **Preference Page** (first-run onboarding) → Projects.
   - Subscribed → GET the user/subscription record from the DB → straight to **Projects**.
4. **Projects** (`/projects`) — list of the signed-in inspector's inspections.
   - **Create New** → POST a new `inspections` row → opens it as a File.
   - Open existing → GET an `inspections` row → opens it as a File.
   - Either path also POSTs updated file info (name/metadata) back to the DB as it changes.
5. **File** (`/projects/:inspectionId`) — the existing `DrawingPadPage`/`DrawingPadCanvas` workspace, opened for one inspection ("File" = a whole inspection, not a single bridge face). Edits autosave: local-first write (per the Offline-First Sync design above), debounced push to the backend when online. This is continuous autosave, not a manual save keybinding.

Not yet decided/built, flagged here rather than assumed:
- Billing/subscription is out of scope to build right now — this only documents the intended shape so future work fits the target architecture.
- The Pay/Preference flow implies eventual new tables (see Data Model) beyond today's sketch — proposed, not confirmed.
- Real routing requires adding a routing library (see Tech Stack) — a new dependency, ask first per Guardrails.
- The `Project`/`Drawing` shape actually implemented on this branch (see Branch Status and Backend Scaffold) doesn't yet cover Projects/File in `inspections`/`faces` terms — reconciling the two is part of the open naming decision.

## Data Model (starting point — refine as needed)

**⚠ Naming mismatch, still open as a design question (not a merge blocker):** this sketch uses `inspections`/`faces`. What's actually implemented — both the frontend types (`src/types/project.ts`/`src/types/projects.ts`) and the Prisma schema — uses a **Project → Drawings** shape instead (see [Backend Scaffold](#backend-scaffold) for exact fields). Both branches already agreed on Project/Drawings independently, so this didn't block reconciling them; what's still open is whether the team wants to eventually rename toward `inspections`/`faces` to match this sketch, or update this sketch to match Project/Drawings. Don't silently pick one when building new features on top — flag it and confirm with the team first.

Relational tables (PostgreSQL), replacing the earlier Firestore-collection sketch:

- `inspections` — id, bridge name, date, inspector, status
- `faces` — id, inspection_id (FK), diagram image reference, canvas/vector drawing data (e.g. JSON column)
- `defects` — id, inspection_id (FK), face_id (FK), defect_type_id (FK), position (x/y relative to diagram), notes
- `photos` — id, inspection_id (FK), defect_id (FK, nullable for general overview photos), storage reference, sequence number
- `defect_types` — id, name, icon — master list of preloaded defect types
- `checklist_templates` — id, name — master pre-inspection checklist
- `checklist_items` — id, checklist_template_id (FK), label, order
- `users` — **built, 2026-07-14** (migration `20260713235640_add_users_table`). Not in the original sketch, added once Google sign-in went real: `id, email (unique), name, picture?, googleSub (unique, mapped to google_sub — Google's stable per-account id, more reliable than email as the join key), createdAt`. Table is `users`, model is `server`'s Prisma `User`. `inspections.inspector`/any future inspector field still isn't wired as a FK to this table yet — that's a follow-up, not done as part of adding the table.
- `subscriptions` — **proposed, not confirmed.** Needed for the planned [Navigation & Auth Flow](#8-navigation--auth-flow-planned) subscription check: likely id, user_id (FK), status, plan, created_at. Not built, no schema/migration exists.
- `user_preferences` — **proposed, not confirmed.** Needed for the planned Preference Page in the same flow: likely id, user_id (FK), plus whatever preference fields that page collects (undefined so far). Not built, no schema/migration exists.

## Backend Scaffold

**Implemented and now actually runnable, as of 2026-07-14 (branch `chore/backend-neon-setup`).** The gaps listed in "What's missing to actually run this" below have all been closed: a real Neon Postgres database is provisioned, the initial migration (`prisma/migrations/20260713223526_init/`) has been created and applied, `server/index.ts` loads `DATABASE_URL` from a real `.env` via `npm run dev:server`'s `--env-file` flag, and the full create/list-project flow has been verified end-to-end (curl + through the actual UI) against the live database. Each developer still needs their **own** `DATABASE_URL` in their local `.env` (gitignored, never committed) — either their own Neon project/branch or one shared by the team.

### What's implemented

- **Framework:** Express 5, TypeScript, run via `tsx` in dev (`npm run dev:server` → `tsx server/index.ts`).
- **`server/index.ts`:** `express.json()` middleware, `GET /api/health`, mounts a `projects` router at `/api/projects`, listens on `process.env.PORT ?? 3000`.
- **Routes** (`server/routes/projects.ts`), all delegating to the service layer below:
  - `GET /api/projects` — list project summaries
  - `POST /api/projects` — create a project (`{ name, folder, description }`, `name` required)
  - `GET /api/projects/:projectId` — get one project + its drawings, 404 if missing
  - `POST /api/projects/:projectId/drawings` — create a drawing under a project (`{ title, angle, status, notes }`, `title` required), 404 if project missing
- **Service layer** (`server/services/projectService.ts`): `getProjectSummaries`, `getProjectById`, `createProject`, `createDrawing` — all real Prisma queries, IDs generated app-side via `crypto.randomUUID()`.
- **Prisma client** (`server/prisma.ts`): `PrismaClient` + the `@prisma/adapter-pg` driver adapter, singleton-cached on `globalThis` outside production. Throws at import time if `DATABASE_URL` isn't set.
- **Prisma schema** (`prisma/schema.prisma`) — two models, matching the Project/Drawing shape flagged in Data Model above:
  - `Project { id, name, description?, folder?, drawingCount? (default 0), lastUpdated?, drawings[] }` → table `projects`
  - `Drawing { id, projectId, title, angle?, status?, updatedAt?, notes?, createdAt? (default now), project }` → table `drawings`, FK to `Project`
  - IDs are plain `String @id` (no DB default — always app-generated). `lastUpdated`/`updatedAt` are free-text display strings (e.g. `"just now"`), not real timestamps; `createdAt` is a real `DateTime` but isn't surfaced anywhere in the API responses yet.
- **Frontend wiring:** `src/api/projects.ts` (plain `fetch`, no axios client) calls all four routes above. `HomePage`/`StartPage`/`ProjectPage` do real data fetching with loading/error states, keeping `main`'s newer UI shells. A new `ApiTestPage.tsx` debug view (reachable via a 4th `"api-test"` state in `HomePage`'s hand-rolled view switch) exists purely to manually exercise `GET /api/projects` and `GET /api/projects/:id` during development.
- **Dev wiring:** Vite proxies `/api` → `http://localhost:3000` (`vite.config.ts`), so the frontend can call relative `/api/...` paths with no `cors` package needed, same as originally planned.

### What was missing to run this (resolved 2026-07-14)

All of the following are now done — kept here as a record of what each step required:

- **Migrations:** `prisma/migrations/20260713223526_init/` created via `npm run prisma:migrate -- --name init` and applied to a real Neon database, after explicit user go-ahead per the migration guardrail.
- **Prisma Client:** generated via `npm run prisma:generate` against the real `DATABASE_URL`.
- **Local Postgres:** provisioned as a hosted Neon free-tier project rather than Docker Compose/native install (see the Tech Stack decision above for why).
- **Env loading:** `server/index.ts` still doesn't import `dotenv` directly, but `dev:server`'s script (`package.json`) now runs `tsx --env-file=.env server/index.ts`, using Node's native env-file support (v20.6+) instead. `DATABASE_URL` lives in a plain `.env` (not `.env.local`) because `prisma.config.ts`'s `dotenv/config` only reads `.env` by default — see the `.env.example` split above.

**Still true / worth knowing:** each developer needs their own `DATABASE_URL` in a local `.env`; there's still no Docker Compose file for local Postgres (see the Neon decision above for why that's fine here). **Resolved 2026-07-14:** added `npm run dev:all` (via a new `concurrently` devDependency, approved by the user) to run frontend + backend together in one terminal with labeled/colored output — added directly in response to a real incident where the Vite dev server silently died between sessions while Express stayed up, producing a confusing "Could not load projects from the backend." error. `npm run dev`/`npm run dev:server` still work individually too.

### Other things worth flagging (deliberately not fixed in the merge — see Branch/Team Status; Guardrails say ask first)

- **`server/db.ts`** is dead code — a raw `pg.Pool` query helper, unused anywhere; only `server/prisma.ts` is actually wired into routes/services. Looks like leftover from before the "Convert from raw SQL queries to Prisma" commit.
- **`server/data/projects.json` and `server/data/projectDetails.json`** are orphaned fixtures — no code reads them, no seed script references them.
- **`server/server.env`** is committed directly to git with placeholder DB credentials (`PORT`, `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`) instead of following the `.env`/`.env.example` + `.gitignore` pattern the frontend already uses. Worth cleaning up before real credentials ever land there.
- **Two competing ways to start the server:** `npm run dev:server` (`tsx`, matches the intended setup) vs. `npm run server` (`node --loader ts-node/esm`, a deprecated/experimental flag). Both `ts-node` and `tsx` remain installed as devDependencies — the original plan said to drop `ts-node`/`nodemon` in favor of `tsx`, but neither was actually removed.
- **`src/types/project.ts` (singular, `main`) and `src/types/projects.ts` (plural, `backendData`)** both still exist post-merge, defining the same shape — left unconsolidated deliberately to keep the merge diff small.
- ~~**No `dev:all` script / no `concurrently` dependency**~~ — resolved 2026-07-14, see Backend Scaffold above.
- **No `postinstall` hook runs `prisma generate`.** After `npm install`, the Prisma client isn't regenerated automatically — `npm run prisma:generate` has to be run manually (documented in README's Getting Started, added 2026-07-14, but easy to still miss after future schema changes).

## Conventions

- Use functional React components with hooks (no class components)
- TypeScript throughout — define shared types for `Inspection`, `Defect`, `ChecklistItem`, etc. in a shared `types/` folder
- Keep drawing/canvas logic isolated in its own module so it can be tested independently of backend/API logic
- Prefer small, focused components over large ones — especially for the canvas/drawing UI

## Suggested Folder Structure

```
src/                # frontend (React)
  components/       # UI components
  features/
    canvas/         # drawing canvas logic
    defects/        # defect panel, defect placement logic
    photos/         # photo capture & preview
    checklist/       # pre-inspection checklist
  api/              # client for calling the backend REST API
  types/            # shared TypeScript types
  hooks/            # custom React hooks

server/             # backend (Node.js API)
  routes/           # REST endpoints (inspections, faces, defects, photos, checklists)
  db/               # PostgreSQL connection, schema/migrations, ORM models
```

## Current Status (as of 2026-07-14, `integration/merge-backend-data`)

**Backend:** see [Backend Scaffold](#backend-scaffold) above for the full picture — real Express + Prisma routes/service layer exist for `Project`/`Drawing`, merged in from `backendData`, **and it's now actually runnable**: a Neon Postgres database is provisioned and migrated, and the create/list-project flow has been verified end-to-end (`chore/backend-neon-setup` branch).

**Frontend:**

- **Drawing canvas:** `DrawingPadPage`/`DrawingPadCanvas.tsx` (Konva-based), pen/eraser, all three drawing colors implemented. Drawing state (Konva lines) still lives only in component `useState` — nothing persists across refresh yet, and there's no diagram-image upload/background, just a blank canvas.
- **Defect panel:** `src/features/defects/` (`DefectPanel.tsx`, `DefectMarkerLayer.tsx`, `useDefectPlacement.ts`, `useDefectTypes.ts`, `defectTypeSeed.ts`) — 4 preloaded defect types (Crack, Chipping, Spalling, Corrosion), editable master list (add/rename/remove, guarded against removing a type that's in use). Placement is **two-tap**: first tap arms a marker at that position, second tap sets the label position and draws the leader line; re-tapping the armed type or pressing Escape cancels it.
- **Undo and clear-confirmation are intact.** `useUndoHistory.ts` (+ test) and `ConfirmDialog`/`Button`/`Card` merged in cleanly from `main` with no conflict — `backendData` never touched these (it forked before they existed; see the corrected note in Branch/Team Status). Undo button, undo-only (no redo), `ConfirmDialog` still guards "clear canvas".
- **Projects UI is wired to the real backend**, not mock data: `StartPage.tsx` and `ProjectPage.tsx` keep `main`'s icon-tile grid UI, now calling `src/api/projects.ts` for real create/fetch (async `onCreateProject`/`onStartNewDrawing`, loading/error state) instead of local mock state. `HomePage.tsx` (exports `App`) carries the real data-fetching logic (`loadProjects`, `loadProjectDetail`, etc.) from `backendData`. A new `ApiTestPage.tsx` debug view is also merged in, reachable via a 4th `"api-test"` state in `HomePage`'s hand-rolled view switch — still always visible in nav, not dev-gated (deferred cleanup).
- **Test infra is intact.** Vitest, `@testing-library/*`, `vitest.config.ts`, and the `useUndoHistory`/`useDefectPlacement` test files all merged in cleanly from `main`; `npm test` still works.

**Still missing** (unchanged from before, confirmed still true): photo capture/preview, reminders, pre-inspection checklist, export, offline-first sync (IndexedDB/queue), and most of the [Navigation & Auth Flow](#8-navigation--auth-flow-planned) — no real URL routing, no Marketing/Pay/Preference pages, no autosave. Projects/drawings now hit a real, runnable, migrated backend (Neon Postgres) — see Backend Scaffold.

- **Google sign-in is now real, end-to-end, as of 2026-07-14** (`feature/google-auth-verification`, merged via PR #21). `src/components/auth/ui/SignInCard.tsx` still renders Google's real sign-in button (via `google.accounts.id.renderButton`) when `VITE_GOOGLE_CLIENT_ID` is set, and falls back to a "Continue as demo user" button when it isn't. Ambient types for `window.google` live at `src/types/google-identity.d.ts`.
  - **No longer client-side only.** The frontend (`src/api/auth.ts`) POSTs the raw Google credential to `POST /api/auth/google` instead of decoding it itself. The backend (`server/auth/googleVerify.ts`) verifies the ID token's signature and `aud` claim via `google-auth-library`'s `OAuth2Client`, checks `email_verified`, then `server/services/userService.ts` upserts a row in the new `users` table (see Data Model) keyed on `googleSub`. On success, `server/auth/session.ts` signs a JWT (`AUTH_JWT_SECRET`) and `server/routes/auth.ts` sets it as an httpOnly `session` cookie; `GET /api/auth/me` and other authenticated routes read it back via `server/middleware/requireAuth.ts`. `POST /api/auth/logout` clears the cookie.
  - **New required backend env vars:** `GOOGLE_CLIENT_ID` (must match `VITE_GOOGLE_CLIENT_ID` — used to check the token's `aud` claim) and `AUTH_JWT_SECRET` (signs the session cookie; generate locally, e.g. `openssl rand -hex 32`, never commit a real one). Both throw at import time if unset, same pattern as `DATABASE_URL` in `server/prisma.ts` — the server won't boot without them.
  - `.env.example` documents the full split, confirmed 2026-07-14: `VITE_*` vars (`VITE_GOOGLE_CLIENT_ID`, `VITE_API_BASE_URL` — currently unused, `src/api/projects.ts`/`src/api/auth.ts` call relative `/api/...` paths via the Vite proxy) go in `.env.local`; `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `AUTH_JWT_SECRET` go in a plain `.env` — `prisma.config.ts`'s `dotenv/config` only reads `.env` by default, and `dev:server` loads it via Node's native `--env-file=.env` flag (`package.json`). `.gitignore` excludes both. **See [README.md](./README.md) for the full step-by-step setup a new teammate needs** (install → `prisma:generate` → env files → `prisma:migrate` → `dev:all`) — that walkthrough didn't exist before 2026-07-14 and its absence was the main blocker to a fresh clone actually running.
- **No routing exists yet.** `HomePage.tsx` still does manual `useState`-based view switching (`"start" | "project" | "drawing" | "api-test"`) instead of URL-based routes.

## Notes for Claude Code

- This is being built incrementally
- Ask before assuming defect type icons/assets — placeholder icons are fine until real ones are provided.
- Offline behavior should be tested deliberately (e.g. simulate offline mode) since it's a core requirement, not an afterthought.

## Guardrails
- Do not modify database schema/migrations or backend auth/access-control logic without asking first
- Do not delete files unless explicitly told to
- Ask before adding new dependencies/packages

## Git Workflow
- Always create a new branch before starting a new feature or fix
- Never commit directly to main
- Commit frequently, after each small working piece
- Use clear, descriptive commit messages
- Push the branch and note that a PR should be opened, don't push to main directly
