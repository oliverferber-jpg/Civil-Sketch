# Bridge Inspection App

## Project Overview

An app for bridge inspectors to use in the field, replacing paper-based defect marking. Inspectors upload bridge face diagrams in advance, then draw directly on top of them during inspection to mark measurements, features, and defects. The app must work fully offline in the field and sync to the cloud when connectivity returns.

## Tech Stack

- **Frontend:** React + TypeScript, built with Vite, styled with Tailwind CSS
- **Backend:** Node.js API server (REST) — sits between the frontend and the database, since PostgreSQL (unlike Firestore) can't be reached directly from client code. **Implemented on this branch (`backendData`) as of 2026-07-14:** Express 5 (`server/index.ts`) with a `projects` router and a Prisma-backed service layer — see [Backend Scaffold](#backend-scaffold) for what's actually there and what's still missing before it's runnable. `main` itself still only has the earlier unwired `server/index.ts` "Hello World" stub — this branch hasn't merged back yet.
- **Database:** PostgreSQL, via Prisma. Schema exists (`prisma/schema.prisma`) but has never been migrated — no `prisma/migrations/` directory, no DB actually provisioned yet.
- **File storage:** Local disk for now (early development). PostgreSQL isn't well suited to storing binary files directly. Must be swapped for persistent cloud object storage (e.g. Cloudflare R2 or AWS S3) before deploying anywhere with ephemeral disks — most hosting platforms (Render, Fly, Railway, Heroku, etc.) don't persist local disk across redeploys. Keep local-disk file access isolated behind a small storage interface so this swap is cheap later.
- **Version Control:** GitHub

An ORM is needed for the backend to talk to PostgreSQL, for type-safe queries and migrations. **Decided: Prisma** — and on this branch it's no longer just a decision, it's an actual dependency (`@prisma/client`, `@prisma/adapter-pg`, `prisma`, all `^7.8.0`) wired into `server/prisma.ts` and the service layer. Still ask before running real migrations against a live database, per the guardrails below.

A routing library is needed once the [Navigation & Auth Flow](#8-navigation--auth-flow-planned) below is built, since the app currently has no URL-based routing at all. **Planned: `react-router-dom`**, still not installed — same as before, this records the choice without authorizing the install; ask first per the guardrails below.

## Branch Status (as of 2026-07-14)

This is the `backendData` branch (5 commits by Oliver Ferber, on top of an older point in `main`'s history). It has the real backend progress described throughout this doc, but **diverged from `main` before `main`'s more recent frontend work** — undo, two-tap defect placement, the project-grid redesign, and the Vitest test infra all landed on `main` after the split and are **not present here**. Notably, this branch's own commits also **removed** undo (`useUndoHistory.ts` + test), the clear-canvas confirmation dialog (`ConfirmDialog`), and the entire Vitest setup (`vitest.config.ts`, `@testing-library/*`, both remaining `.test.ts` files) — nothing in the commit messages explains these removals (two of the five commits are literally titled "I have no idea what this does but what the hell" and "Smore more commits that really confused me"), so treat them as likely-accidental regressions to review, not intentional decisions. Merging this branch back into `main` will need a deliberate reconciliation, not a fast-forward — both branches have real independent work the other is missing.

**Open decision blocking a clean merge:** this branch's Prisma schema (and its own frontend types, `src/types/projects.ts`) model the domain as **Project → Drawings** (`createProject({name, folder, description})`, `createDrawing`). This doesn't match the `inspections`/`faces` shape documented below in [Data Model](#data-model-starting-point--refine-as-needed). Someone needs to decide which naming/shape the team is actually building toward before backend work continues — see the callout in that section.

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

**⚠ Naming mismatch, unresolved as of 2026-07-14:** this sketch uses `inspections`/`faces`. What's actually implemented on this branch is a **Project → Drawings** shape instead — see [Backend Scaffold](#backend-scaffold) for the exact Prisma models. Don't silently pick one when implementing — flag it and confirm with the team which naming/shape is intended (see [Branch Status](#branch-status-as-of-2026-07-14)).

Relational tables (PostgreSQL), replacing the earlier Firestore-collection sketch:

- `inspections` — id, bridge name, date, inspector, status
- `faces` — id, inspection_id (FK), diagram image reference, canvas/vector drawing data (e.g. JSON column)
- `defects` — id, inspection_id (FK), face_id (FK), defect_type_id (FK), position (x/y relative to diagram), notes
- `photos` — id, inspection_id (FK), defect_id (FK, nullable for general overview photos), storage reference, sequence number
- `defect_types` — id, name, icon — master list of preloaded defect types
- `checklist_templates` — id, name — master pre-inspection checklist
- `checklist_items` — id, checklist_template_id (FK), label, order
- `users` — **missing, needs adding.** Not in the original sketch, but needed once Google sign-in is real: id, email (unique), name, picture, google_sub (Google's stable per-account id — more reliable than email as the join key), created_at. `inspections.inspector` likely becomes a FK to this table instead of a free-text field.
- `subscriptions` — **proposed, not confirmed.** Needed for the planned [Navigation & Auth Flow](#8-navigation--auth-flow-planned) subscription check: likely id, user_id (FK), status, plan, created_at. Not built, no schema/migration exists.
- `user_preferences` — **proposed, not confirmed.** Needed for the planned Preference Page in the same flow: likely id, user_id (FK), plus whatever preference fields that page collects (undefined so far). Not built, no schema/migration exists.

## Backend Scaffold

**Implemented on this branch (`backendData`) as of 2026-07-14, but not runnable out of the box — see "What's missing to actually run this" below.** This replaces the earlier "planned, not started" version of this section, which is out of date now that real code exists.

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
- **Frontend wiring:** `src/api/projects.ts` (plain `fetch`, no axios client) calls all four routes above. `src/types/projects.ts` (plural — replaces the deleted singular `src/types/project.ts`) mirrors the backend response shapes by hand. `HomePage`/`StartPage`/`ProjectPage` now do real data fetching with loading/error states instead of the old hardcoded mock data. A new `ApiTestPage.tsx` debug view (reachable via a 4th `"api-test"` state in `HomePage`'s hand-rolled view switch) exists purely to manually exercise `GET /api/projects` and `GET /api/projects/:id` during development.
- **Dev wiring:** Vite proxies `/api` → `http://localhost:3000` (`vite.config.ts`), so the frontend can call relative `/api/...` paths with no `cors` package needed, same as originally planned.

### What's missing to actually run this

- **No migrations exist.** `prisma/migrations/` doesn't exist — the schema has never been migrated against a real database. First run needs `prisma migrate dev` to generate an initial migration.
- **Prisma Client isn't generated locally** — `node_modules/@prisma` isn't present in this checkout. Needs `npm install && npm run prisma:generate` before the server can start at all.
- **No local Postgres setup exists.** No Docker Compose file anywhere in the repo, despite that being the original plan for local dev Postgres. A developer has to stand up Postgres by hand right now.
- **The running server doesn't load `.env`.** Nothing in `server/` imports `dotenv`; only `prisma.config.ts` does (for the Prisma CLI). So `DATABASE_URL`/`PORT` in `.env`/`.env.local` reach `prisma generate`/`prisma migrate` but **not** `server/index.ts` — the server only sees real OS environment variables as committed today.

### Other things worth flagging (not fixed — Guardrails say ask first)

- **`server/db.ts`** is dead code — a raw `pg.Pool` query helper, unused anywhere; only `server/prisma.ts` is actually wired into routes/services. Looks like leftover from before the "Convert from raw SQL queries to Prisma" commit.
- **`server/data/projects.json` and `server/data/projectDetails.json`** are orphaned fixtures — no code reads them, no seed script references them.
- **`server/server.env`** is committed directly to git with placeholder DB credentials (`PORT`, `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`) instead of following the `.env`/`.env.example` + `.gitignore` pattern the frontend already uses. Worth cleaning up before real credentials ever land there.
- **Two competing ways to start the server:** `npm run dev:server` (`tsx`, matches the intended setup) vs. `npm run server` (`node --loader ts-node/esm`, a deprecated/experimental flag). Both `ts-node` and `tsx` remain installed as devDependencies — the original plan said to drop `ts-node`/`nodemon` in favor of `tsx`, but neither was actually removed.
- **No `dev:all` script / no `concurrently` dependency** — running frontend + backend together still means two terminals (`npm run dev` and `npm run dev:server`).

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

## Current Status (as of 2026-07-14, this branch)

**Backend:** see [Backend Scaffold](#backend-scaffold) above for the full picture — real Express + Prisma routes/service layer exist for `Project`/`Drawing`, but the setup isn't runnable without manual DB provisioning, migrations, and a Prisma Client install first.

**Frontend:**

- **Drawing canvas:** `DrawingPadPage`/`DrawingPadCanvas.tsx` (Konva-based), pen/eraser, all three drawing colors implemented. Drawing state (Konva lines) still lives only in component `useState` — nothing persists across refresh yet, and there's no diagram-image upload/background, just a blank canvas.
- **Defect panel:** `src/features/defects/` (`DefectPanel.tsx`, `DefectMarkerLayer.tsx`, `useDefectPlacement.ts`, `useDefectTypes.ts`, `defectTypeSeed.ts`) — 4 preloaded defect types (Crack, Chipping, Spalling, Corrosion), editable master list (add/rename/remove, guarded against removing a type that's in use). Placement is **two-tap**: first tap arms a marker at that position, second tap sets the label position and draws the leader line; re-tapping the armed type or pressing Escape cancels it.
- **Undo and clear-confirmation are gone on this branch.** `useUndoHistory.ts` (+ its test) and `ConfirmDialog`/`Button`/`Card`/`src/components/ui/index.ts` were all deleted here and nothing replaces them — the toolbar's "Clear" button now wipes the canvas immediately with no confirm step, and there's no Undo button at all. `main` still has both; see [Branch Status](#branch-status-as-of-2026-07-14). Treat this as a regression to review, not an intentional removal.
- **Projects UI is now wired to the real backend**, not mock data: `StartPage.tsx` (folder-icon grid, "+" tile POSTs a real project via `src/api/projects.ts`) and `ProjectPage.tsx` (grid of drawing tiles, POSTs new drawings) both fetch/create through the API with loading and error states. A new `ApiTestPage.tsx` debug view exists alongside them (see Backend Scaffold). Still no URL routing — `HomePage.tsx` switches between `"start" | "project" | "drawing" | "api-test"` via `useState`, same mechanism as before, just one more case.
- **Test infra is gone on this branch.** Vitest, `@testing-library/*`, `vitest.config.ts`, and the `useUndoHistory`/`useDefectPlacement` test files are all deleted, and there's no `test` script in `package.json`. `main` still has all of this. Nothing in the commit history explains the removal — likely accidental, worth restoring or confirming intentional before merging back.

**Still missing** (unchanged from before, confirmed still true): photo capture/preview, reminders, pre-inspection checklist, export, offline-first sync (IndexedDB/queue), and most of the [Navigation & Auth Flow](#8-navigation--auth-flow-planned) — no real URL routing, no Marketing/Pay/Preference pages, no autosave. Projects/drawings now do hit a real (if not-yet-runnable) backend, which is the one piece of that flow that's moved.

- **Google sign-in (frontend half) fixed 2026-07-12, still accurate.** `src/components/auth/ui/SignInCard.tsx` renders Google's real sign-in button (via `google.accounts.id.renderButton`) when `VITE_GOOGLE_CLIENT_ID` is set, and falls back to a "Continue as demo user" button when it isn't. Ambient types for `window.google` live at `src/types/google-identity.d.ts`.
  - **Still client-side only.** The callback decodes the Google-issued JWT directly in the browser (`atob(...)`) and trusts it as-is — no backend verifies the token's signature yet. Fine for previewing the UI, but **not real authentication**: anyone could forge a similarly-shaped payload. Needs the server-side verification step (see Tech Stack/Data Model) — the backend now exists to build this on, but it isn't done yet.
  - `.env.example` documents `VITE_GOOGLE_CLIENT_ID`, `VITE_API_BASE_URL` (currently unused — `src/api/projects.ts` calls relative `/api/...` paths via the Vite proxy instead), and `DATABASE_URL`. Copy it to `.env.local` and fill in real values. `.gitignore` excludes `.env`.

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
