# Saved Results CRUD (Phase 4B) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add DELETE /api/results/:id, delete button per row with custom confirm modal, and server-side sort to Saved Results.

**Architecture:** Backend: new DELETE route; extend GET with sort/order params. Frontend: ConfirmModal component; SavedResults with delete button and sortable headers.

**Tech Stack:** Hono, Drizzle, React, Vitest, React Testing Library

---

## Task 1: Backend — DELETE /api/results/:id

**Files:**
- Modify: `apps/api/src/results/routes.ts`
- Test: `apps/api/src/results/routes.test.ts` (create if missing)

**Step 1: Write the failing test**

Add or create test file with:

```typescript
it('DELETE /api/results/:id returns 204 when record exists', async () => { ... })
it('DELETE /api/results/:id returns 404 when record does not exist', async () => { ... })
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && bun test`
Expected: FAIL (route not implemented)

**Step 3: Implement DELETE route**

```typescript
results.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)
  const deleted = await db.delete(schema.savedResults).where(eq(schema.savedResults.id, id)).returning({ id: schema.savedResults.id })
  if (deleted.length === 0) return c.body(null, 404)
  return c.body(null, 204)
})
```

**Step 4: Run test to verify it passes**

Run: `cd apps/api && bun test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/results/routes.ts apps/api/src/results/routes.test.ts
git commit -m "feat: add DELETE /api/results/:id"
```

---

## Task 2: Backend — GET /api/results sort params

**Files:**
- Modify: `apps/api/src/results/routes.ts`
- Test: `apps/api/src/results/routes.test.ts`

**Step 1: Write the failing test**

```typescript
it('GET /api/results accepts sort and order params', async () => { ... })
```

**Step 2: Run test to verify it fails**

Run: `cd apps/api && bun test`
Expected: FAIL or test not asserting sort behavior

**Step 3: Implement sort params**

Parse `sort` (id|type|value|vm_name|created_at) and `order` (asc|desc). Default sort=created_at, order=desc. Use Drizzle `asc()`/`desc()` with dynamic column. Note: `value` and `vm_name` may need join; `vm_name` comes from vms.name. Map sort param to schema column or join alias.

**Step 4: Run test to verify it passes**

Run: `cd apps/api && bun test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/results/routes.ts apps/api/src/results/routes.test.ts
git commit -m "feat: add sort and order params to GET /api/results"
```

---

## Task 3: Frontend — ConfirmModal component

**Files:**
- Create: `apps/web/src/components/ConfirmModal.tsx`
- Create: `apps/web/src/components/ConfirmModal.test.tsx`
- Modify: `apps/web/src/index.css` (add modal styles if needed)

**Step 1: Write the failing test**

```typescript
it('renders when open', () => { ... })
it('calls onConfirm when Confirm clicked', () => { ... })
it('calls onCancel when Cancel clicked', () => { ... })
```

**Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test`
Expected: FAIL (component not found)

**Step 3: Implement ConfirmModal**

Props: open, title, message, onConfirm, onCancel, confirmLabel. Overlay + card. Cancel and Confirm buttons. Escape to cancel.

**Step 4: Run test to verify it passes**

Run: `cd apps/web && bun test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/components/ConfirmModal.tsx apps/web/src/components/ConfirmModal.test.tsx apps/web/src/index.css
git commit -m "feat: add ConfirmModal component"
```

---

## Task 4: Frontend — SavedResults delete button and modal

**Files:**
- Modify: `apps/web/src/pages/SavedResults.tsx`
- Modify: `apps/web/src/pages/SavedResults.test.tsx`

**Step 1: Write the failing test**

```typescript
it('shows delete button per row', () => { ... })
it('opens confirm modal when delete clicked', () => { ... })
it('calls DELETE on confirm', () => { ... })
```

**Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test`
Expected: FAIL (delete button not found)

**Step 3: Implement delete flow**

Add delete button per row. State: `deleteTarget: null | SavedResult`. On click set deleteTarget. ConfirmModal: onConfirm call DELETE, on 204 refetch, clear deleteTarget; onCancel clear deleteTarget.

**Step 4: Run test to verify it passes**

Run: `cd apps/web && bun test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/pages/SavedResults.tsx apps/web/src/pages/SavedResults.test.tsx
git commit -m "feat: add delete button and confirm modal to SavedResults"
```

---

## Task 5: Frontend — SavedResults sortable headers

**Files:**
- Modify: `apps/web/src/pages/SavedResults.tsx`
- Modify: `apps/web/src/pages/SavedResults.test.tsx`

**Step 1: Write the failing test**

```typescript
it('passes sort and order params to fetch', () => { ... })
it('clicking column header updates sort', () => { ... })
```

**Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test`
Expected: FAIL

**Step 3: Implement sort**

State: sort, order. Add sort/order to useEffect deps and fetch URL. Make headers clickable; on click toggle order if same column, else set new sort and order=asc. Add visual indicator (arrow) on active column.

**Step 4: Run test to verify it passes**

Run: `cd apps/web && bun test`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/pages/SavedResults.tsx apps/web/src/pages/SavedResults.test.tsx
git commit -m "feat: add sortable column headers to SavedResults"
```

---

## Task 6: Documentation and versioning

**Files:**
- Modify: `README.md` — add Saved Results section for delete and sort
- Modify: `CHANGELOG.md` — add Phase 4B entry (do not bump version until user approves)
- Modify: `TODOs.md` — mark Phase 4B complete

**Step 1: Update README**

Add usage for delete and sort in Saved Results section.

**Step 2: Update CHANGELOG**

Add entry under Unreleased or new version.

**Step 3: Update TODOs**

Mark Phase 4B items complete.

**Step 4: Commit**

```bash
git add README.md CHANGELOG.md TODOs.md
git commit -m "docs: update README, CHANGELOG, TODOs for Phase 4B"
```

---

## Verification

Run full test suite:

```bash
# From repo root
bun run test
```

Run app for manual testing:

```bash
bun run dev
```

Navigate to Saved Results, test delete (confirm modal, 204), sort (click headers).
