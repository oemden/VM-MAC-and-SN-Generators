# Save results backend — design

Design for the first Standard feature: save generated SN/MAC with optional comment (and optional VM), list saved results. Backend only (API + SQLite); Drizzle ORM.

**Important:** See [2026-02-17-VM-SN-MAC-business-rules-assessment.md](2026-02-17-VM-SN-MAC-business-rules-assessment.md) for mandatory business rules (1 SN per VM, multiple MACs per VM) and required schema/API changes before frontend implementation.

---

## 1. Architecture and data model

**Placement**

- SQLite and Drizzle live in `apps/api`. DB file e.g. `apps/api/data/vmgen.db` (path via env `DATABASE_PATH`). Migrations in `apps/api/drizzle/` (or `apps/api/migrations/`), run on startup or via `bun run db:migrate`.

**Schema**

- **Table:** `saved_results`
  - `id` — integer primary key, auto-increment
  - `type` — text, one of `'sn'` | `'mac'`
  - `value` — text, the generated value (one SN or one MAC per row)
  - `comment` — text, nullable
  - `vm_name` — text, nullable (optional VM association)
  - `created_at` — text or integer (ISO timestamp or Unix ms)
  - `user_id` — integer, nullable (reserved for Pro; unused in Standard)
  - `project_id` — integer, nullable (reserved for Pro; unused in Standard)
- One row per value; no `user_id`/`project_id` in Standard (single-tenant). Index on `(type, created_at)` for list/filter.

**Done (2026-02-17):** `vms` table and `vm_id` FK added to `saved_results`. Partial unique index enforces 1 SN per VM. VMs API (GET/POST /api/vms). POST /api/results accepts vm_id, vm_name (create-on-fly); 409 when VM already has SN. See [2026-02-17-VM-SN-MAC-business-rules-assessment.md](2026-02-17-VM-SN-MAC-business-rules-assessment.md).

**Dependencies**

- Add `drizzle-orm`, `drizzle-kit`, and SQLite driver (e.g. `better-sqlite3` or Bun built-in as used by Drizzle).

---

## 2. Licence strategy

Reference: [OpenCore-ProFeaturesLicencing.md](../OpenCore-ProFeaturesLicencing.md).

1. **Open-core approach**
   - Single repo, single Docker image; Pro code in `ee/` (or `apps/api/ee/`, `apps/web/ee/`). Runtime gating via license key; no separate Pro codebase.

2. **Gating**
   - **LicenseManager** in API: validate `LICENSE_KEY` (env or file) on startup; signed payload (e.g. plan, features, expiration). Public key embedded; no phone-home required for MVP.
   - **API:** Pro routes/actions check `licenseManager.isFeatureEnabled('projects')` (or similar); return 403 when unlicensed.
   - **Frontend:** e.g. `GET /api/license/features` (or bundled config); hide/disable Pro UI when feature off. Server is source of truth.

3. **Licenses**
   - **Core (Standard):** AGPL-3.0 (or MIT if preferred); document the choice.
   - **Pro (`ee/`):** Proprietary or ELv2-style with anti-circumvention clause.

4. **When to implement**
   - **Now:** No license check, no `ee/` code; Standard only, DB with nullable `user_id` / `project_id`.
   - **When adding Pro:** Introduce `ee/`, LicenseManager, signed key; gate only Pro features. No refactor of existing schema or Standard API.

5. **Client licence management (Phase 3)**
   - One license payload per deployment (or per tenant); "manage client licences" = generate/issue keys with plan and feature entitlements. Implement when shipping Pro.

---

## 3. API contract

**POST /api/results** — Save one or more results.

- **Request body:** `{ type: 'sn' | 'mac', values: string[], comment?: string, vm_name?: string }`. One row per entry in `values`; same `comment` and `vm_name` applied to all in the batch (or define per-value later).
- **Response 201:** `{ success: true, count: number, ids: number[] }` (created row ids).
- **Validation:** `type` required, enum; `values` required, non-empty array of non-empty strings; `comment` and `vm_name` optional, max length (e.g. 500 / 255). Reject invalid with 400.

**GET /api/results** — List saved results.

- **Query:** `?type=sn|mac` (optional), `?limit=50` (optional, default 50, max 200), `?offset=0` (optional).
- **Response 200:** `{ success: true, results: Array<{ id, type, value, comment, vm_name, created_at }>, total?: number }`. Order: `created_at` desc. In Standard, no `user_id`/`project_id` in response (or omit from payload).
- **Pagination:** `total` optional for now; include if cheap (count query).

Existing **POST /api/mac/generate** and **POST /api/sn/generate** unchanged. Frontend calls generate then POST /api/results to persist.

---

## 4. Error handling

- **400** — Validation failure (missing/invalid type, empty values, length limits). Body: `{ error: string, details?: Array<{ field, message }> }`.
- **500** — DB or unexpected error. Body: `{ error: 'Internal server error' }`. Log full error server-side; do not expose stack or details to client.
- Use try/catch in route handlers; validate input before DB (e.g. Zod or existing core validators). Drizzle failures (constraint, etc.) map to 400 when identifiable, else 500.

---

## 5. Testing

- **Unit:** Drizzle schema and migration (smoke). Validation logic for POST body (type, values, lengths) — test valid payloads and invalid cases (wrong type, empty values, oversized comment).
- **Integration:** API tests (e.g. Bun test or Vitest + supertest/hono test client): POST /api/results with valid payload → 201 and correct rows in DB; GET /api/results → 200 and list; invalid POST → 400; optional: GET with type/limit/offset. Use in-memory SQLite or temp file for isolation.
- **No frontend tests** in this backend-only slice; add when wiring UI.

---

## 6. Pro features (future plan)

From [UserStories.md](../../UserStories.md) Pro section. Implemented later; documented here so schema and roadmap stay aligned.

### 6.1 Projects, Teams, Users (already reflected in schema)

- Projects, Teams, RBAC, SSO/OAuth/OTP, Manager toggles. CSV import: Projects, Teams, Groups, Users, **Sites**, **Hypervisors** (Manager stories). Export as per roadmap 6.5. See Licence strategy and nullable `user_id` / `project_id` on `saved_results`.

### 6.2 Sites and Hypervisors (new)

Manager stories added for physical/logical placement and assignment:

| Story | Summary |
|-------|--------|
| Manage/assign VMs to Sites | VMs can be assigned to a Site (e.g. On Premise, Cloud). |
| Manage/assign VMs to Hypervisor(s) | VMs can be assigned to one or more Hypervisors (On Premise or Cloud). |
| Manage/assign Hypervisor(s) to Sites | Hypervisors can be assigned to a Site. |
| Manage/assign Site(s) to Projects | Sites can be assigned to Projects. |
| Manage/assign Hypervisor(s) to Projects and/or Teams | Hypervisors can be assigned to Projects and/or Teams. |
| Export all settings, Users, teams, projects, etc. | Export individually or globally (includes Sites, Hypervisors, VMs when Pro is on). |

**Model (for future Pro implementation):**

- **Sites** — e.g. On Premise, Cloud; assignable to Projects.
- **Hypervisors** — assignable to Sites; assignable to Projects and/or Teams.
- **VMs** — assignable to a Site; assignable to one or more Hypervisors.
- **Relations:** `VM → site_id`, `VM → hypervisor(s)` (e.g. junction table), `Hypervisor → site_id`, `Site → project_id` (or junction), `Hypervisor → project_id` and/or `team_id` (or junction).

When adding Pro: introduce `sites`, `hypervisors`, and junction/assignment tables; optionally add nullable `site_id` (and hypervisor link) to `saved_results` or to the VM entity if results are reached via VM. No change to Standard behaviour.

### 6.3 Security Officer (Pro)

- **Login page** — required for Pro (auth). Wireframe exists (VM-gen-login.png). Implement with Pro auth (SSO/OAuth/OTP or local users).
- **Session timeout** — inactivity and/or absolute session lifetime; configurable. Enforce server-side (e.g. token/session expiry) and optionally warn in UI before timeout.

### 6.4 Dashboard (Standard vs Pro)

User stories (Standard section) ask for a **landing Dashboard** with greeting and summary of Projects, VM, SN, MACs, hypervisor (text and charts), and filter/search VM, Projects, Sites with charts reflecting the filter.

- **Scope:** Projects, Sites, Hypervisors are Pro concepts. Recommend:
  - **Standard:** Dashboard shows greeting + summary of **VM count, SN count, MAC count** (text, optionally simple charts). No Projects/Sites/Hypervisors until Pro.
  - **Pro:** Dashboard adds Projects, Sites, Hypervisors to the summary and to filter/search; charts reflect Pro data and filters.
- **Implementation:** Single Dashboard route; content and filters depend on license (Standard vs Pro). No schema change; frontend and API respond to `licenseManager.isFeatureEnabled(...)` for dashboard scope.

### 6.5 Roadmap order (Pro)

1. Projects, Teams, Users, RBAC, Auth (including **login page**, **session timeout**).
2. CSV import: Projects, Teams, Groups, Users, **Sites**, **Hypervisors**.
3. Sites and Hypervisors: entities, CRUD, then VM → Site, VM → Hypervisor, Hypervisor → Site, Site → Project, Hypervisor → Project/Team assignments.
4. Export all (settings, users, teams, projects, sites, hypervisors, VMs) individually or globally.
5. Dashboard Pro expansion (Projects, Sites, Hypervisors in summary and filters).
