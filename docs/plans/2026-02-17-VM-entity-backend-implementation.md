# VM Entity Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `vms` table, `vm_id` FK to `saved_results`, VMs API (GET/POST), and update POST /api/results to accept vm_id/vm_name with 1 SN per VM enforcement (409 on violation).

**Architecture:** SQLite + Drizzle. New `vms` table. `saved_results` gets nullable `vm_id` FK. Partial unique index enforces 1 SN per VM. VMs API for list/create. POST /api/results supports vm_id (preferred) or vm_name (create-on-fly). GET /api/results joins vm_name for display.

**Tech Stack:** Bun, Drizzle ORM, Hono, Zod, SQLite (bun:sqlite)

**Reference:** [2026-02-17-VM-SN-MAC-business-rules-assessment.md](2026-02-17-VM-SN-MAC-business-rules-assessment.md)

---

## Prerequisites

- Use @using-git-worktrees to create worktree `feature/vm-entity-backend` before starting.
- Run `bun run test` (core + api) before and after changes. All tests must pass.

---

## Task 1: Schema — Add vms table and vm_id to saved_results

**Files:**
- Create: `apps/api/drizzle/0001_add_vms_and_vm_id.sql`
- Modify: `apps/api/src/db/schema.ts`

**Step 1: Create migration SQL**

Create `apps/api/drizzle/0001_add_vms_and_vm_id.sql`:

```sql
-- VMs table (design: docs/plans/2026-02-17-VM-SN-MAC-business-rules-assessment.md)
CREATE TABLE IF NOT EXISTS `vms` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `vms_name_unique` ON `vms` (`name`);

-- Add vm_id to saved_results
ALTER TABLE `saved_results` ADD COLUMN `vm_id` integer REFERENCES `vms`(`id`);

-- Enforce 1 SN per VM (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS `saved_results_vm_id_type_sn_unique`
  ON `saved_results` (`vm_id`) WHERE `type` = 'sn';
```

**Step 2: Update Drizzle schema**

In `apps/api/src/db/schema.ts`:
- Add `vms` table definition (id, name, createdAt)
- Add `vmId` column to `savedResults` (integer, nullable, references vms.id)

```ts
// Add vms table
export const vms = sqliteTable('vms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
})

// In savedResults, add:
vmId: integer('vm_id').references(() => vms.id),
```

**Step 3: Run migration**

```bash
cd apps/api && bun run db:migrate
```

Expected: `Ran 0001_add_vms_and_vm_id.sql`

**Step 4: Verify**

```bash
cd apps/api && bun -e "
const { Database } = require('bun:sqlite');
const db = new Database(process.env.DATABASE_PATH ?? './data/vmgen.db');
const tables = db.query('SELECT name FROM sqlite_master WHERE type=\"table\"').all();
console.log(tables);
const cols = db.query('PRAGMA table_info(saved_results)').all();
console.log(cols.map(c => c.name));
"
```

Expected: `vms` in tables, `vm_id` in saved_results columns.

**Step 5: Commit**

```bash
git add apps/api/drizzle/0001_add_vms_and_vm_id.sql apps/api/src/db/schema.ts
git commit -m "feat: add vms table and vm_id to saved_results"
```

---

## Task 2: VMs API — GET /api/vms and POST /api/vms

**Files:**
- Create: `apps/api/src/vms/routes.ts`
- Create: `apps/api/src/vms/validation.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: Create VMs validation**

Create `apps/api/src/vms/validation.ts`:

```ts
import { z } from 'zod'

export const VM_NAME_MAX_LENGTH = 255

export const createVmBodySchema = z.object({
  name: z.string().min(1, 'name is required').max(VM_NAME_MAX_LENGTH, `name must be at most ${VM_NAME_MAX_LENGTH} characters`)
})

export type CreateVmBody = z.infer<typeof createVmBodySchema>
```

**Step 2: Create VMs routes**

Create `apps/api/src/vms/routes.ts`:

```ts
import { Hono } from 'hono'
import { asc } from 'drizzle-orm'
import { db, schema } from '../db'
import { createVmBodySchema } from './validation'

const vms = new Hono()

vms.get('/', async (c) => {
  try {
    const list = await db
      .select()
      .from(schema.vms)
      .orderBy(asc(schema.vms.name))
    return c.json({ success: true, vms: list.map((v) => ({ id: v.id, name: v.name, created_at: v.createdAt })) })
  } catch (error) {
    console.error('List VMs error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

vms.post('/', async (c) => {
  try {
    const body = await c.req.json().catch(() => null)
    if (body === null) {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }
    const result = createVmBodySchema.safeParse(body)
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Validation failed'
      return c.json({ error: msg }, 400)
    }
    const [row] = await db.insert(schema.vms).values({ name: result.data.name, createdAt: new Date() }).returning()
    if (!row) throw new Error('Insert failed')
    return c.json({ success: true, id: row.id, name: row.name, created_at: row.createdAt }, 201)
  } catch (error) {
    console.error('Create VM error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default vms
```

**Step 3: Wire routes in index.ts**

In `apps/api/src/index.ts`:
- Add: `import vmsRoutes from './vms/routes'`
- Add: `app.route('/api/vms', vmsRoutes)`
- Add to root endpoints: `vms: '/api/vms'`

**Step 4: Verify**

```bash
curl -s -X POST http://localhost:3000/api/vms -H "Content-Type: application/json" -d '{"name":"test-vm-01"}' | head -1
curl -s http://localhost:3000/api/vms | head -1
```

Expected: 201 with id, 200 with vms array.

**Step 5: Commit**

```bash
git add apps/api/src/vms/ apps/api/src/index.ts
git commit -m "feat: add VMs API (GET/POST /api/vms)"
```

---

## Task 3: POST /api/results — Accept vm_id, vm_name (create-on-fly), enforce 1 SN per VM

**Files:**
- Modify: `apps/api/src/results/validation.ts`
- Modify: `apps/api/src/results/routes.ts`

**Step 1: Update validation schema**

In `apps/api/src/results/validation.ts`, add to `saveResultsBodySchema`:
- `vm_id: z.number().int().positive().optional()`
- Keep `vm_name` optional. Add refinement: require at least one of vm_id or vm_name if associating with VM (or allow both optional for unassociated saves). Per assessment: vm_id preferred, vm_name for create-on-fly. Allow both to be omitted (save without VM).

**Step 2: Update POST /api/results handler**

Logic:
1. If `vm_name` provided without `vm_id`: find or create VM by name, get vm_id.
2. If `vm_id` provided: verify VM exists (optional, or let FK handle).
3. For `type === 'sn'` and `vm_id` set: check `SELECT 1 FROM saved_results WHERE vm_id = ? AND type = 'sn'`. If exists → 409 `{ error: "VM already has a Serial Number" }`.
4. Insert with vm_id (and keep vm_name for display if desired; or derive from vms join).
5. GET /api/results: join vms to include vm_name in response when vm_id is set.

**Step 3: Implement create-or-get VM helper**

In `apps/api/src/results/routes.ts` or a shared helper:

```ts
async function getOrCreateVmId(vmName: string): Promise<number> {
  const existing = await db.select().from(schema.vms).where(eq(schema.vms.name, vmName)).limit(1)
  if (existing[0]) return existing[0].id
  const [row] = await db.insert(schema.vms).values({ name: vmName, createdAt: new Date() }).returning({ id: schema.vms.id })
  if (!row) throw new Error('Failed to create VM')
  return row.id
}
```

**Step 4: Add 1 SN per VM check**

Before insert, when type is 'sn' and vm_id is set. Import `and` from `drizzle-orm`:

```ts
import { and, eq } from 'drizzle-orm'

if (type === 'sn' && vmId) {
  const existing = await db.select({ id: schema.savedResults.id }).from(schema.savedResults).where(and(eq(schema.savedResults.vmId, vmId), eq(schema.savedResults.type, 'sn'))).limit(1)
  if (existing.length > 0) {
    return c.json({ error: 'VM already has a Serial Number' }, 409)
  }
}
```

**Step 5: Update GET /api/results to include vm_name**

Use left join on vms when vm_id is present, or keep vm_name from saved_results for legacy rows. For new rows with vm_id, join vms to get name.

**Step 6: Run tests**

```bash
bun run test
```

Expected: All pass. Add new tests for 409 if time permits.

**Step 7: Commit**

```bash
git add apps/api/src/results/
git commit -m "feat: POST /api/results accepts vm_id/vm_name, enforces 1 SN per VM (409)"
```

---

## Task 4: Handle duplicate VM name in POST /api/vms

**Files:**
- Modify: `apps/api/src/vms/routes.ts`

**Step 1: Return 409 on duplicate name**

If insert fails due to unique constraint on name, return 409 `{ error: "VM with this name already exists" }`.

**Step 2: Commit**

```bash
git add apps/api/src/vms/routes.ts
git commit -m "fix: return 409 when creating VM with duplicate name"
```

---

## Task 5: Tests for VMs API and 1 SN per VM

**Files:**
- Create: `apps/api/src/vms/routes.test.ts`
- Modify: `apps/api/src/results/api.test.ts`

**Step 1: Add VMs API integration tests**

Create `apps/api/src/vms/routes.test.ts` with temp DB setup (same pattern as results/api.test.ts):
- POST /api/vms with valid name → 201
- POST /api/vms with duplicate name → 409
- GET /api/vms → 200 with list

**Step 2: Add 1 SN per VM test to results**

In `apps/api/src/results/api.test.ts`:
- Save SN with vm_id for VM A → 201
- Save SN with same vm_id again → 409
- Save MAC with same vm_id → 201 (multiple MACs allowed)

**Step 3: Run tests**

```bash
bun run test
```

Expected: All pass.

**Step 4: Commit**

```bash
git add apps/api/src/vms/routes.test.ts apps/api/src/results/api.test.ts
git commit -m "test: VMs API and 1 SN per VM enforcement"
```

---

## Task 6: Update docs and root endpoint

**Files:**
- Modify: `docs/plans/2026-02-16-save-results-backend-design.md` (mark VM entity done)
- Modify: `docs/plans/NEXT-STEPS-save-results-and-VM.md` (check off backend tasks)

**Step 1: Update design doc**

- Remove or update "Planned change" note to reflect completion.

**Step 2: Update NEXT-STEPS**

- Mark backend tasks 1.1–1.5 complete.

**Step 3: Commit**

```bash
git add docs/plans/
git commit -m "docs: update plans after VM entity backend"
```

---

## Verification Checklist

Before finishing:
- [ ] `bun run test` passes (core + api)
- [ ] `bun run build` succeeds for apps/api
- [ ] Manual: POST /api/vms, GET /api/vms, POST /api/results with vm_id, POST /api/results with vm_name (create-on-fly). For SN: second save → 409.

---

## Completion

After all tasks complete:
- **REQUIRED:** Use @finishing-a-development-branch to merge or create PR.
