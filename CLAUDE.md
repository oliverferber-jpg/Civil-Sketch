# Bridge Inspection App

## Project Overview

An app for bridge inspectors to use in the field, replacing paper-based defect marking. Inspectors upload bridge face diagrams in advance, then draw directly on top of them during inspection to mark measurements, features, and defects. The app must work fully offline in the field and sync to the cloud when connectivity returns.

## Tech Stack

- **Frontend:** React + TypeScript, built with Vite, styled with Tailwind CSS
- **Backend:** Node.js API server (REST) — sits between the frontend and the database, since PostgreSQL (unlike Firestore) can't be reached directly from client code. **Not started yet — no `server/` directory exists in the repo as of 2026-07-12.**
- **Database:** PostgreSQL. Not yet provisioned or connected — no schema/migrations exist yet.
- **File storage:** Local disk for now (early development). PostgreSQL isn't well suited to storing binary files directly. Must be swapped for persistent cloud object storage (e.g. Cloudflare R2 or AWS S3) before deploying anywhere with ephemeral disks — most hosting platforms (Render, Fly, Railway, Heroku, etc.) don't persist local disk across redeploys. Keep local-disk file access isolated behind a small storage interface so this swap is cheap later.
- **Version Control:** GitHub

An ORM is needed for the backend to talk to PostgreSQL, for type-safe queries and migrations. **Decided: Prisma** (confirmed 2026-07-12). Still ask before actually adding the dependency, per the guardrails below — this records the choice, it doesn't authorize installing it yet.

A routing library is needed once the [Navigation & Auth Flow](#8-navigation--auth-flow-planned) below is built, since the app currently has no URL-based routing at all. **Planned: `react-router-dom`**, not yet installed — same as Prisma, this records the choice without authorizing the install; ask first per the guardrails below.

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

## Backend Scaffold (planned)

**Designed 2026-07-12, not started.** Captures the concrete shape of the first backend slice so it doesn't need to be re-derived later — see Current Status for why it's paused.

Minimal first slice, scoped to unblock the Projects/File flow in [Navigation & Auth Flow](#8-navigation--auth-flow-planned):

- **Framework:** Express (TypeScript), matching the "TypeScript throughout" convention.
- **Local Postgres:** Docker Compose (`postgres:16-alpine`, dev-only credentials) — no hosted dev DB.
- **ORM:** Prisma, schema at `server/db/schema.prisma`. One initial migration covering the 8 already-confirmed Data Model tables (`inspections`, `faces`, `defects`, `photos`, `defect_types`, `checklist_templates`, `checklist_items`, `users`) — excluding the proposed/unconfirmed `subscriptions`/`user_preferences`. `inspections.inspector` becomes `inspectorId` (FK to `users.id`). UUID primary keys (forward-looking for offline sync, so client-generated IDs don't collide).
- **Initial routes only:** `GET /api/health`, `GET /api/inspections`, `POST /api/inspections` — not the full `faces`/`defects`/`photos`/`checklists` set from the Suggested Folder Structure; those arrive with their own features later.
- **Dev wiring:** Vite proxy for `/api` (avoids adding a `cors` dependency), new npm scripts (`dev:server`, `dev:all`, `prisma:migrate`, `prisma:generate`, `prisma:studio`).
- **New dependencies this would require** (not installed — recorded for when this is actually built, same pattern as the Prisma/react-router-dom notes above): `express`, `@prisma/client`, `prisma`, `tsx`, `@types/express`, `concurrently`; drop the currently unused `nodemon`/`ts-node` devDependencies in favor of `tsx`.
- **Explicitly out of scope even once built:** real Google ID-token verification, offline sync, the `subscriptions`/`user_preferences` tables, the file/photo storage interface.

**Why it's paused:** an unmerged remote branch `origin/Server` (ariella.litwack@gmail.com) has a partial, broken attempt at this (raw Express + `pg`, not Prisma; `app.listen(PORT, ...)` references an undefined `PORT` and would crash as committed). The team decided not to build on that branch, and to coordinate with Ariella before starting fresh work here — that conversation, and what happens to `origin/Server`, isn't resolved by this plan.

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

## Current Status (as of 2026-07-12)

- **Frontend scaffold exists:** `HomePage` → `SignInPage`/`SignInCard` → `DrawingPadPage`/`DrawingPadCanvas` (Konva-based canvas with the three drawing colors already implemented). No defect panel, photos, checklists, export, or offline sync yet.
- **Backend does not exist.** There's no `server/` directory, no API routes, no DB connection. This needs to be scaffolded from scratch before any real GET/POST work can happen. A concrete plan for the first slice already exists — see [Backend Scaffold (planned)](#backend-scaffold-planned) — but is paused pending coordination with a teammate over an unmerged branch that attempted the same thing.
- **Google sign-in (frontend half) fixed 2026-07-12.** `src/components/auth/ui/SignInCard.tsx` previously had a broken stub (a custom button that `POST`ed a fake `{ provider: "google" }` payload to a nonexistent backend) alongside dead code for the real Google Identity Services flow. That's been cleaned up: the component now renders Google's real sign-in button (via `google.accounts.id.renderButton`) when `VITE_GOOGLE_CLIENT_ID` is set, and falls back to a "Continue as demo user" button when it isn't. Ambient types for `window.google` were added at `src/types/google-identity.d.ts` (previously untyped, would fail `tsc`).
  - **Still client-side only.** The callback decodes the Google-issued JWT directly in the browser (`atob(...)`) and trusts it as-is — there is still no backend verifying the token's signature. This is fine for previewing the UI, but is **not real authentication** yet: anyone could forge a similarly-shaped payload. Real auth still requires the backend step described earlier (verify the ID token server-side with `google-auth-library`, issue the app's own session) — not done yet, since it needs the backend to exist first.
  - `.env.example` now documents `VITE_GOOGLE_CLIENT_ID`; copy it to `.env.local` and fill in a real Google OAuth Client ID (from Google Cloud Console) to test the real button locally. `.gitignore` now excludes `.env`.
- **No routing exists yet.** `src/main.tsx` renders `HomePage` directly, which does manual `useState`-based conditional rendering (sign-in gate → hardcoded shell → `DrawingPadPage`) instead of URL-based routes. The planned [Navigation & Auth Flow](#8-navigation--auth-flow-planned) (Marketing Page, Pay, Preference Page, Projects list, per-inspection File routes) is fully unimplemented — no Projects/inspections list, no Pay or Preference pages, and no autosave in `DrawingPadCanvas.tsx` (drawing state lives only in `useState` and is lost on unmount/refresh).

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