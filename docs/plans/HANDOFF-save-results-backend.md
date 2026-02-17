# Handoff: Save results backend — continue from Phase 2

**For the next agent:** Phase 1 (Database) is complete. Continue with Phase 2 (Validation and API routes), then Phase 3 and Phase 4 per the implementation plan.

---

## What is done (Phase 1)

- **Dependencies:** `apps/api` uses `drizzle-orm` and **Bun's built-in SQLite** (`bun:sqlite`). `better-sqlite3` was removed because Bun does not support it.
- **Config:** [apps/api/drizzle.config.ts](../../apps/api/drizzle.config.ts) — dialect sqlite, schema `./src/db/schema.ts`, out `./drizzle`.
- **Schema:** [apps/api/src/db/schema.ts](../../apps/api/src/db/schema.ts) — table `saved_results` (id, type, value, comment, vm_name, createdAt, userId, projectId). Index on (type, createdAt).
- **Migration:** [apps/api/drizzle/0000_init_saved_results.sql](../../apps/api/drizzle/0000_init_saved_results.sql) — CREATE TABLE + index. Run with `bun run db:migrate` (executes [apps/api/scripts/migrate.ts](../../apps/api/scripts/migrate.ts) using `bun:sqlite`).
- **DB client:** [apps/api/src/db/index.ts](../../apps/api/src/db/index.ts) — exports `db` (Drizzle) and `schema`; uses `DATABASE_PATH` or default `./data/vmgen.db`.
- **Scripts:** `db:generate` (bunx drizzle-kit generate), `db:migrate` (bun run scripts/migrate.ts).
- **Env:** `.env.example` documents optional `DATABASE_PATH`. Root `.gitignore` includes `apps/api/data/`.
- **TypeScript:** `apps/api/tsconfig.json` added with `"types": ["bun", "node"]` so IDE recognizes `bun:sqlite` and `process`. `@types/node` added in `apps/api` for `process` if needed.

**Tests:** No test scripts were added in Phase 1. Tests are planned in **Phase 4** (unit: validation; integration: POST/GET with in-memory SQLite). Existing tests: `bun run test` runs `packages/core` tests only. API tests will be added when implementing Phase 4.

---

## What to do next (Phase 2–4)

1. **Phase 2** — Implement POST /api/results and GET /api/results:
   - Add request validation (type, values[], comment?, vm_name?; max lengths 500/255). Use Zod or inline validation; return 400 with `{ error, details? }`.
   - POST: insert one row per value; return 201 `{ success: true, count, ids }`.
   - GET: query params type?, limit (default 50, max 200), offset (default 0); order by created_at desc; response `{ success: true, results, total? }`; omit user_id/project_id in payload.
   - Design: [2026-02-16-save-results-backend-design.md](2026-02-16-save-results-backend-design.md) sections 3 (API contract) and 4 (Error handling).

2. **Phase 3** — Wire routes in [apps/api/src/index.ts](../../apps/api/src/index.ts): mount POST and GET under `/api/results`; update root `/` endpoint list.

3. **Phase 4** — Tests: unit tests for validation; integration tests for API (in-memory or temp SQLite); ensure tests pass.

---

## References

- **Design:** [docs/plans/2026-02-16-save-results-backend-design.md](2026-02-16-save-results-backend-design.md)
- **Implementation plan:** [docs/plans/2026-02-16-save-results-backend-implementation.md](2026-02-16-save-results-backend-implementation.md) — mark Phase 1 checklist done; continue from Phase 2.

---

## DB usage example (for Phase 2)

```ts
import { db, schema } from './db'

// Insert (one row per value)
const now = new Date()
const ids = await db.insert(schema.savedResults).values(
  values.map((value) => ({
    type,
    value,
    comment: comment ?? null,
    vmName: vm_name ?? null,
    createdAt: now,
    userId: null,
    projectId: null
  }))
).returning({ id: schema.savedResults.id })

// Select (list)
const results = await db.select({
  id: schema.savedResults.id,
  type: schema.savedResults.type,
  value: schema.savedResults.value,
  comment: schema.savedResults.comment,
  vmName: schema.savedResults.vmName,
  createdAt: schema.savedResults.createdAt
}).from(schema.savedResults).orderBy(desc(schema.savedResults.createdAt)).limit(limit).offset(offset)
```

Schema column names are camelCase in code (vmName, createdAt); DB columns are snake_case (vm_name, created_at) via Drizzle mapping.
