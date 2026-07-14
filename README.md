# Civil Sketch — Bridge Inspection App

An app for bridge inspectors to mark up bridge face diagrams (measurements, features, defects) directly in the field. React + TypeScript frontend, Express + Prisma backend, PostgreSQL (Neon).

See [CLAUDE.md](./CLAUDE.md) for full project context, architecture decisions, and current status.

## Getting started

### Prerequisites

- Node.js 20.6+ (needed for `--env-file`, used to load backend env vars)
- A PostgreSQL database — the team uses hosted [Neon](https://neon.tech) free-tier projects for local/dev, not Docker or a native install. Ask a teammate for a connection string, or create your own free Neon project.
- A Google OAuth Client ID for sign-in — ask a teammate for the shared one, or create your own in [Google Cloud Console](https://console.cloud.google.com/) (APIs & Services > Credentials > OAuth 2.0 Client ID, type "Web application", with `http://localhost:5173` added as an authorized JavaScript origin). Without this, sign-in falls back to a demo button and the backend auth routes can't be exercised.

### 1. Install dependencies

```
npm install
```

### 2. Generate the Prisma client

```
npm run prisma:generate
```

There's no `postinstall` hook for this yet, so run it manually after every `npm install` (and again any time `prisma/schema.prisma` or the `prisma`/`@prisma/client` version changes).

### 3. Set environment variables

Two files, both gitignored — see `.env.example` for the full annotated list.

`.env.local` (frontend, read by Vite):
```
VITE_GOOGLE_CLIENT_ID=<your Google OAuth client ID>
VITE_API_BASE_URL=http://localhost:3000
```

`.env` (backend, read by `prisma.config.ts` and by `dev:server` via Node's `--env-file`):
```
DATABASE_URL=<your Neon connection string>
GOOGLE_CLIENT_ID=<same client ID as above>
AUTH_JWT_SECRET=<a random secret, e.g. `openssl rand -hex 32` — don't share this one>
```

All three backend variables are required — the server throws at startup if any is missing (`server/prisma.ts`, `server/auth/googleVerify.ts`, `server/auth/session.ts`).

### 4. Apply database migrations

```
npm run prisma:migrate
```

Applies the migrations already committed in `prisma/migrations/` to whichever database `DATABASE_URL` points at.

### 5. Run it

```
npm run dev:all
```

Runs the Vite frontend and Express backend together with labeled output. To run them separately: `npm run dev` (frontend) or `npm run dev:server` (backend).

- Frontend: http://localhost:5173
- Backend: http://localhost:3000 (Vite proxies `/api/*` to it, so the frontend calls relative paths)

### Running tests

```
npm test
```

## TO-DO
- [ ] simplify projects page/get rid of wordy chunk
- [ ] ability to name individual views in a project
- [ ] move the back button to somewhere better on projects page
- [ ] lay out the actual drawing page better (+defects)
- [ ] ability to drag defect title around after placed
- [ ] ability to switch between views from the drawing page
- [ ] ability to upload diagrams into the app
- [ ] ability to export as pdf?
- [x] 'wire project ownership'
- [ ] smth storage code
