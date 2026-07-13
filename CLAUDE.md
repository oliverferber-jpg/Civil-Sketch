# Bridge Inspection App

## Project Overview

An app for bridge inspectors to use in the field, replacing paper-based defect marking. Inspectors upload bridge face diagrams in advance, then draw directly on top of them during inspection to mark measurements, features, and defects. The app must work fully offline in the field and sync to the cloud when connectivity returns.

## Tech Stack

- **Frontend:** React + TypeScript, built with Vite, styled with Tailwind CSS
- **Backend:** Node.js API server (REST) — sits between the frontend and the database, since PostgreSQL (unlike Firestore) can't be reached directly from client code. **Two tiers as of 2026-07-14:** a minimal, unwired Express scaffold (`server/index.ts`, health-check only) exists on `main`. Real progress — Prisma, routes, a service layer — lives on the unmerged `origin/backendData` branch and has not been reconciled with `main`. See [Branch / Team Status](#branch--team-status-as-of-2026-07-14).
- **Database:** PostgreSQL. Not yet provisioned or connected on `main` — no schema/migrations exist here yet (a Prisma schema does exist on `backendData`, see Branch Status).
- **File storage:** Local disk for now (early development). PostgreSQL isn't well suited to storing binary files directly. Must be swapped for persistent cloud object storage (e.g. Cloudflare R2 or AWS S3) before deploying anywhere with ephemeral disks — most hosting platforms (Render, Fly, Railway, Heroku, etc.) don't persist local disk across redeploys. Keep local-disk file access isolated behind a small storage interface so this swap is cheap later.
- **Version Control:** GitHub

An ORM is needed for the backend to talk to PostgreSQL, for type-safe queries and migrations. **Decided: Prisma** (confirmed 2026-07-12) — not installed on `main` yet. It's already an actual dependency on `backendData` (`@prisma/client`, `@prisma/adapter-pg`, `prisma`, all `^7.8.0`), just not merged here. Ask before installing it on `main`, per the guardrails below.

A routing library is needed once the [Navigation & Auth Flow](#8-navigation--auth-flow-planned) below is built, since the app currently has no URL-based routing at all. **Planned: `react-router-dom`**, not yet installed on either branch — same as Prisma, this records the choice without authorizing the install; ask first per the guardrails below.

## Branch / Team Status (as of 2026-07-14)

The team is working in parallel across a couple of branches; this section exists so nobody has to re-derive who's doing what from `git log`. Update it as branches merge or new ones start.

- **`main`** — current default branch, frontend-heavy. Has the drawing canvas, defect panel (two-tap placement + undo), a Projects/drawing-tile grid UI, and a Vitest test suite, all still running on **mock in-memory data** — no live backend calls. Also has the unwired `server/index.ts` scaffold (see Tech Stack).
- **`origin/backendData`** (Oliver Ferber, 5 commits) — real backend work: Express 5 + Prisma 7 (`server/prisma.ts`, `@prisma/adapter-pg`), `server/routes/projects.ts`, `server/services/projectService.ts`, a two-model Prisma schema (`Project`/`Drawing`), and a frontend wired to call it for real (`src/api/projects.ts`, loading/error states in `StartPage`/`ProjectPage`/`HomePage`). It diverged from `main` before `main`'s more recent frontend work, so it's **missing** undo, two-tap defect placement refinements, the project-grid redesign, and the whole Vitest test setup. It also **removed** things `main` still has: `useUndoHistory.ts` (+ test), `ConfirmDialog`/`Button`/`Card`, and the entire `vitest`/`@testing-library` setup — none of the branch's commit messages explain these removals (two of the five are literally "I have no idea what this does but what the hell" and "Smore more commits that really confused me"), so treat them as likely-accidental regressions to review, not intentional decisions, before merging. It's also **not runnable as committed**: no `prisma/migrations/` directory, `@prisma/client` isn't generated locally, no Docker Compose for local Postgres exists anywhere, and the Express server itself never loads `.env` (only the Prisma CLI does, via `prisma.config.ts`) — so `DATABASE_URL`/`PORT` need to be real OS env vars to reach `server/index.ts` today. There's also leftover dead code (`server/db.ts`, a raw `pg.Pool` helper, unused now that everything goes through Prisma), orphaned fixture files (`server/data/projects.json`, `server/data/projectDetails.json`, read by nothing), and a `server/server.env` with placeholder DB credentials committed directly to git instead of following the `.env`/`.gitignore` pattern. Needs a deliberate merge/rebase, not a fast-forward, and someone should decide whether to restore the deleted undo/confirm/test code or confirm dropping it was intentional.
- **`origin/Server`** (previously attributed to Ariella here) **no longer exists** — that thread is resolved. Her `server/` scaffold was merged straight into `main` instead (as the minimal Express placeholder mentioned above).
- **Open decision blocking a clean backend merge:** `origin/backendData`'s schema (`Project { id, name, description?, folder?, drawingCount?, lastUpdated?, drawings[] }` / `Drawing { id, projectId, title, angle?, status?, updatedAt?, notes?, createdAt?, project }`) and the current frontend's own types in `src/types/project.ts` model the domain as **Project → Drawings** (`createProject({name, folder, description})`, `createDrawing`). This doesn't match the `inspections`/`faces` shape documented below in [Data Model](#data-model-starting-point--refine-as-needed). Someone needs to decide which naming/shape the team is actually building toward before backend work resumes — see the callout in that section.

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

## Data Model (starting point — refine as needed)

**⚠ Naming mismatch, unresolved as of 2026-07-14:** this sketch uses `inspections`/`faces`. Both the current frontend (`src/types/project.ts`: `ProjectSummary`/`ProjectDetail`/`DrawingSummary`) and the `origin/backendData` branch's Prisma schema (`Project`/`Drawing` models — see [Branch / Team Status](#branch--team-status-as-of-2026-07-14) for exact fields) instead use a **Project → Drawings** shape. Don't silently pick one when implementing — flag it and confirm with the team which naming/shape is intended.

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

**Not built on `main`. Real, partial progress exists on the unmerged `origin/backendData` branch — see [Branch / Team Status](#branch--team-status-as-of-2026-07-14) for what's actually there.** This replaces the earlier "planned, not started" version of this section now that real (if unmerged and not-yet-runnable) code exists somewhere in the repo.

What `backendData` actually has, for when this gets merged or rebuilt on `main`:

- **Framework:** Express 5, TypeScript, run via `tsx` in dev.
- **Routes** (`server/routes/projects.ts`): `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:projectId`, `POST /api/projects/:projectId/drawings` — all delegating to a Prisma-backed service layer (`server/services/projectService.ts`).
- **ORM wiring:** `server/prisma.ts` (`PrismaClient` + `@prisma/adapter-pg`), schema at `prisma/schema.prisma` (two models, `Project`/`Drawing` — see Branch Status for exact fields).
- **Dev wiring:** Vite proxy for `/api` → `localhost:3000` (avoids a `cors` dependency), `dev:server` npm script (`tsx server/index.ts`).
- **What's still missing even on that branch:** no migrations (`prisma/migrations/` doesn't exist), Prisma Client isn't generated locally, no Docker Compose for local Postgres, and the server doesn't load `.env` at runtime (only the Prisma CLI does). None of this reaches `main` until the branch is reconciled and those gaps are closed.
- **Explicitly out of scope even once merged:** real Google ID-token verification, offline sync, the `subscriptions`/`user_preferences` tables, the file/photo storage interface, and reconciling the `Project`/`Drawing` vs. `inspections`/`faces` naming mismatch (see Data Model) — none of that exists on either branch yet.

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

## Current Status (as of 2026-07-14)

**What's built on `main`:**

- **Drawing canvas:** `DrawingPadPage`/`DrawingPadCanvas.tsx` (Konva-based), pen/eraser, all three drawing colors implemented. Drawing state (Konva lines) still lives only in component `useState` — nothing persists across refresh yet, and there's no diagram-image upload/background, just a blank canvas.
- **Defect panel:** `src/features/defects/` (`DefectPanel.tsx`, `DefectMarkerLayer.tsx`, `useDefectPlacement.ts`, `useDefectTypes.ts`, `defectTypeSeed.ts`) — 4 preloaded defect types (Crack, Chipping, Spalling, Corrosion), editable master list (add/rename/remove, guarded against removing a type that's in use). Placement is **two-tap**: first tap arms a marker at that position, second tap sets the label position and draws the leader line; re-tapping the armed type or pressing Escape cancels it.
- **Undo:** `src/features/canvas/useUndoHistory.ts` tracks a shared stroke/defect stack; wired into `DrawingPadPage` via an Undo button (`undoLastLine`, `removeLastDefect`). Undo only, no redo. `ConfirmDialog` guards the separate "clear canvas" action. (`origin/backendData` has since deleted both of these with no replacement — see Branch Status.)
- **Projects UI:** `StartPage.tsx` (flat folder-icon grid, "+" tile creates a mock project) and `ProjectPage.tsx` (grid of drawing tiles within a project) — both still running on hardcoded/mock in-memory data in `HomePage.tsx`, no routing, no backend calls yet. (`origin/backendData` has since wired these to a real, if not-yet-runnable, backend — see Branch Status.)
- **Test infra:** Vitest + Testing Library added (`npm test`); `useUndoHistory` and `useDefectPlacement` have unit tests. (`origin/backendData` has since deleted this entire setup — see Branch Status.)
- **`server/` scaffold exists** but is minimal and unwired — see [Tech Stack](#tech-stack) and [Branch / Team Status](#branch--team-status-as-of-2026-07-14) for the fuller (unmerged) backend picture.

**Still missing** (unchanged from before, confirmed still true): photo capture/preview, reminders, pre-inspection checklist, export, offline-first sync (IndexedDB/queue), and all of the [Navigation & Auth Flow](#8-navigation--auth-flow-planned) — no real URL routing, no Marketing/Pay/Preference pages, no Projects/inspections list backed by the DB, no autosave.

- **Google sign-in (frontend half) fixed 2026-07-12, still accurate.** `src/components/auth/ui/SignInCard.tsx` renders Google's real sign-in button (via `google.accounts.id.renderButton`) when `VITE_GOOGLE_CLIENT_ID` is set, and falls back to a "Continue as demo user" button when it isn't. Ambient types for `window.google` live at `src/types/google-identity.d.ts`.
  - **Still client-side only.** The callback decodes the Google-issued JWT directly in the browser (`atob(...)`) and trusts it as-is — no backend verifies the token's signature yet. Fine for previewing the UI, but **not real authentication**: anyone could forge a similarly-shaped payload. Needs the server-side verification step (see Tech Stack/Data Model) once the backend situation is sorted out.
  - `.env.example` documents `VITE_GOOGLE_CLIENT_ID`; copy it to `.env.local` and fill in a real Google OAuth Client ID to test the real button locally. `.gitignore` excludes `.env`.
- **No routing exists yet.** `src/main.tsx` renders `HomePage` directly, which does manual `useState`-based view switching (`"start" | "project" | "drawing"`) instead of URL-based routes.

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
