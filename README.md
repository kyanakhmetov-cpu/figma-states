# Figma States Library

A production-ready app to document UI copy states (errors, warnings, a11y notes, helper text, empty states, and more) for a specific Figma element. Fast, minimal steps, and shareable read-only views.

## Features
- One-screen element creation: Figma link + image upload + optional title.
- Autosaving state editor with keyboard shortcut (Ctrl/Cmd + Enter).
- Read-only viewer mode with copy buttons and JSON export (`/e/:id?view=1`).
- Image storage via Vercel Blob and Postgres persistence.
- Project switcher for organizing elements.

## Tech stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui (Radix)
- Prisma ORM + Postgres
- lucide-react icons
- pnpm

## Setup
```bash
pnpm install
cp .env.example .env
pnpm prisma:migrate
pnpm seed
pnpm dev
```

Open http://localhost:3000

## Environment variables
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
BLOB_READ_WRITE_TOKEN=""
UPLOAD_MAX_SIZE_MB=4
```

## Scripts
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm start` — start production server
- `pnpm prisma:migrate` — apply migrations
- `pnpm prisma:deploy` — apply existing migrations (CI/test)
- `pnpm prisma:studio` — open Prisma Studio
- `pnpm seed` — seed sample project/element
- `pnpm test` — run unit tests (Vitest)
- `pnpm test:e2e` — run Playwright E2E

## Tests
Unit tests cover:
- Figma URL parsing
- Copy serialization helpers

E2E test covers:
- Create element -> add state -> reload -> persists

To run Playwright locally:
```bash
pnpm dlx playwright install
pnpm test:e2e
```

## Upload storage
Images are stored in Vercel Blob. Set `BLOB_READ_WRITE_TOKEN` in your environment.

## Deploy to Vercel
1) Create a Postgres database in Vercel Storage and set `DATABASE_URL` to the `postgres://...` connection string.
2) Create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`.
3) Add `UPLOAD_MAX_SIZE_MB` (recommended `4`).
4) Deploy. Vercel uses `vercel-build` to run migrations and build.

If `DATABASE_URL` is set to a `prisma+postgres://` Accelerate URL, migrations are skipped during build. Use a direct
`postgres://` connection string for migrations.

## Notes on pnpm builds
If pnpm blocks dependency build scripts (e.g., Prisma or esbuild), run:
```bash
pnpm approve-builds
```
and allow `prisma`, `@prisma/engines`, and `esbuild`.
