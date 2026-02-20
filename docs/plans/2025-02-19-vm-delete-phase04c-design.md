# VM Delete (Phase 4C) — Design

**Date:** 2025-02-19

**Source:** PROMPT-next-session-vm-delete-phase04c.md, US-059, US-060

---

## Goal

Implement VM delete with cascade/orphan options: DELETE /api/vms/:id, VM page at /vms with list and delete, custom warning modal when VM has associated results.

---

## Design Decisions (Approved)

| Item | Decision |
|------|----------|
| Delete options | Orphan + Cascade + Cancel (US-059 updated) |
| Modal | VmDeleteModal (separate component, DRY small sections) |
| Per-VM count | `associated_count` in GET /api/vms — number of saved_results linked to each VM |
| Default behavior | Orphan (keep results, set vm_id=null) |
| Cascade | Optional query param `?cascade=true` on DELETE |

---

## Backend

### DELETE /api/vms/:id

- **Params:** `id` (path), `cascade` (query, optional)
- **Behavior:**
  - `cascade=true`: Delete saved_results where vm_id=id, then delete VM
  - `cascade=false` or omitted: Update saved_results set vm_id=null where vm_id=id, then delete VM
- **Responses:** 204 on success, 404 if VM not found, 400 if id invalid

### GET /api/vms (enhanced)

- Add `associated_count` to each VM — count of saved_results where vm_id = vm.id
- Response shape: `{ id, name, created_at, associated_count }`

---

## Frontend

### VM Page (/vms)

- Route: `/vms`
- Nav: Add "VMs" link in header
- Content: Table with columns id, name, created_at, actions (Delete per row)
- Data: GET /api/vms

### Delete Flow

| Scenario | Modal | Actions |
|---------|-------|---------|
| VM has no results (associated_count === 0) | ConfirmModal | Cancel, Delete |
| VM has results (associated_count > 0) | VmDeleteModal | Cancel, Keep results (orphan), Delete all (cascade) |

### VmDeleteModal

- Props: open, vmName, associatedCount, onOrphan, onCascade, onCancel
- Renders warning text with count, three buttons
- Reuses confirm-modal-overlay styles where possible

---

## Files to Create/Modify

| File | Action |
|------|--------|
| apps/api/src/vms/routes.ts | Add DELETE handler, add associated_count to GET |
| apps/web/src/pages/Vms.tsx | Create VM page |
| apps/web/src/components/VmDeleteModal.tsx | Create modal |
| apps/web/src/App.tsx | Add /vms route and VMs nav link |
| .local/userstories/UserStories.md | Update US-059 for cascade option |

---

## Security (senior-secops)

- Input validation: id must be numeric; cascade is boolean
- No SQL injection: use parameterized queries (Drizzle)
- Idempotent: 404 on delete of non-existent VM
