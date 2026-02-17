# Save results backend — implementation plan

Step-by-step implementation plan for the Save results feature (API + SQLite + Drizzle). Design: [2026-02-16-save-results-backend-design.md](2026-02-16-save-results-backend-design.md).

**Before coding:** Create an isolated worktree (e.g. `feature/save-results-backend`) via the using-git-worktrees skill so work is on a branch and tests run clean before/after.

---

## Phase 1 — Database

| # | Task | Details |
|---|------|--------|
| 1.1 | Add Drizzle + SQLite | In `apps/api`: add `drizzle-orm`, `drizzle-kit`; use **Bun built-in SQLite** (`bun:sqlite`), not better-sqlite3 (Bun does not support it). |
| 1.2 | Drizzle config | Add `drizzle.config.ts` (or `drizzle.config.js`) in `apps/api`: SQLite, schema path, migrations out dir `./drizzle` (or `./migrations`). |
| 1.3 | Schema file | Create `apps/api/src/db/schema.ts`: define `saved_results` table (id, type, value, comment, vm_name, created_at, user_id, project_id). Index on `(type, created_at)`. |
| 1.4 | Migration | Run `drizzle-kit generate`; add script `db:generate` and `db:migrate` in `apps/api/package.json`. Run migration (create table). |
| 1.5 | DB client | Create `apps/api/src/db/index.ts`: open SQLite (path from `DATABASE_PATH` or default `./data/vmgen.db`), export Drizzle instance and schema. Ensure `apps/api/data` is gitignored if using default path. |

**Done when:** Migration runs; table exists; app can import db and run a trivial query.

---

## Phase 2 — Validation and API routes

| # | Task | Details |
|---|------|--------|
| 2.1 | Request validation | Add validation for POST /api/results body: `type` in `['sn','mac']`, `values` non-empty array of non-empty strings, `comment`/`vm_name` optional with max length (500 / 255). Use Zod or inline checks; return structured error (field, message) for 400. |
| 2.2 | POST /api/results | Parse body, validate, insert one row per `values[]` with same comment/vm_name and `created_at = now`. Return 201 with `{ success: true, count, ids }`. On DB error return 500, log error. |
| 2.3 | GET /api/results | Query params: `type` (optional), `limit` (default 50, max 200), `offset` (default 0). Select from `saved_results` ordered by `created_at` desc; omit `user_id`/`project_id` in response. Return 200 with `{ success: true, results, total? }`. Optional: add count query for `total`. |

**Done when:** POST creates rows and returns ids; GET returns list; invalid POST returns 400 with message.

---

## Phase 3 — Integration and root

| # | Task | Details |
|---|------|--------|
| 3.1 | Wire routes | In `apps/api/src/index.ts`, mount POST and GET under `/api/results`. Ensure CORS and logger still apply. Update root `/` endpoint list to include `results: '/api/results'`. |
| 3.2 | Env | Document `DATABASE_PATH` in `.env.example` (optional; default local path). Create `data/` or ensure path is writable at runtime. |
| 3.3 | Run migration on startup (optional) | If desired, run pending migrations when API starts; otherwise keep `bun run db:migrate` as a separate step. |

**Done when:** `bun run dev` starts API; manual curl/Postman: POST then GET returns saved data.

---

## Phase 4 — Tests

| # | Task | Details |
|---|------|--------|
| 4.1 | Unit: validation | Tests for POST body validation: valid payload passes; invalid type / empty values / too-long comment or vm_name return validation errors. |
| 4.2 | Integration: API | Use Bun test (or Vitest) with test client for Hono. In-memory SQLite (or temp file): POST valid body → 201 + ids; GET → 200 + list; POST invalid → 400. Optionally GET with type/limit/offset. |
| 4.3 | CI | Ensure `bun run test` (or equivalent) runs from repo root or `apps/api`; all tests pass. |

**Done when:** All tests green; no regressions on existing MAC/SN generate endpoints.

---

## Checklist summary

- [x] Phase 1: Drizzle, schema, migration, DB client (done; see [HANDOFF-save-results-backend.md](HANDOFF-save-results-backend.md))
- [x] Phase 2: Validation, POST /api/results, GET /api/results
- [x] Phase 3: Wire routes, env, optional migrate on startup
- [x] Phase 4: Unit + integration tests, CI

**After implementation:** Merge feature branch via PR; update README/CHANGELOG per project rules. Frontend “Save” and “Saved Results” UI can be a separate slice that calls this API.
