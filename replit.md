# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── feedback-app/       # User-facing ASTON bank landing page with feedback modals
│   └── admin-panel/        # Admin panel for managing feedback & callback submissions
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `src/routes/health.ts` — `GET /health`
  - `src/routes/feedbacks.ts` — `POST /v1/feedbacks`, `GET /v1/feedbacks`, `GET /v1/feedbacks/stats`
  - `src/routes/callbacks.ts` — `POST /v1/callbacks`, `GET /v1/callbacks`, `PATCH /v1/callbacks/:id`, `GET /v1/callbacks/stats`
- Rate limiting: in-memory per-IP, 1 request per 3 minutes for POST endpoints
- Response serialization: plain JSON (not Zod `.parse()`) to avoid date type mismatches
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)

### `artifacts/feedback-app` (`@workspace/feedback-app`)

User-facing ASTON bank landing page at `/`. React + Vite app with:

- Color scheme: white/black/gray/#77E80C (lime green) throughout
- Hero section with green gradient "АСТОН" title and CTA button
- Features section (4 advantage cards with hover effects)
- Products section (3 product cards with black hover state)
- Dark CTA section with callback button
- Footer with license info and "Сообщить о проблеме" button
- Header: clean nav with anchor links (Преимущества, Продукты, Поддержка) — no non-working buttons
- FeedbackModal: "Сообщить о проблеме" — triggered from footer button
  - Fields: ФИО (optional), category buttons, message textarea (20–400 chars)
- CallbackModal: "Заказать звонок" — triggered from floating phone button and hero/CTA sections
  - Fields: Имя (required), phone (+7 prefix + 10 digits), date (business days, 30 days ahead), time slots
- Client-side rate limiting (3 min cooldown) via localStorage in both modals
- All UI in Russian

### `artifacts/admin-panel` (`@workspace/admin-panel`)

Admin panel at `/admin/`. React + Vite app with:

- Color scheme: white/black/gray/#77E80C (lime green) matching user-facing app
- Sidebar navigation with spring-animated active indicator (layoutId animation)
- Desktop sidebar with admin profile at bottom, mobile sidebar with overlay backdrop
- Notification system:
  - Bell icon with unread count badge in top bar
  - Dropdown panel showing new feedbacks/callbacks with timestamps
  - Browser push notifications (Notification API) for new submissions
  - Polls every 15s for new entries, tracks seen IDs via localStorage
  - Mark as read / clear all controls
- Stats cards showing totals, today count, top category/status
- Searchable/filterable tables with pagination and date range filters
- Status management for callbacks (Новая/В обработке/Завершена/Отклонена)
- Admin auth via x-admin-token header (fetch interceptor in main.tsx, sourced from VITE_ADMIN_TOKEN env var)

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/feedbacks.ts` — feedbacks table (id, name, category, message, timestamp, createdAt)
- `src/schema/callbacks.ts` — callbacks table (id, name, phoneNumber, callDate, callTime, status, createdAt)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec. Used by `api-server` for request validation. Note: response schemas use `zod.date()` for datetime fields due to `useDates: true` in Orval config — backend should NOT use `.parse()` on responses (use plain JSON instead).

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec. Used by both `feedback-app` and `admin-panel`.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

## Known Considerations

- Zod generated schemas use `useDates: true`, so datetime fields come back as `Date` objects. Backend must pre-convert string timestamps to `Date` before `.safeParse()` on request bodies, and serialize responses as plain JSON to avoid date type errors.
- Stats routes (`/v1/feedbacks/stats`, `/v1/callbacks/stats`) must be defined before parameterized routes in Express to avoid route conflicts.
- Admin panel has no authentication by design (per project specification).
