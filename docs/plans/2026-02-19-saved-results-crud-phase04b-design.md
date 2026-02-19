# Saved Results CRUD (Phase 4B) — Design

**Date:** 2026-02-19

**Goal:** Add delete and server-side sort to Saved Results page. Custom confirm modal for delete.

---

## Design Decisions (from Phase 4A)

| Item | Decision |
|------|----------|
| Sort | Server-side (`?sort=&order=`) |
| Confirm dialog | Custom modal (modern) |
| Sort columns | id, type, value, vm_name, created_at |

---

## API Contract

### DELETE /api/results/:id

- **Method:** DELETE
- **Params:** `:id` path param (integer)
- **Response:** 204 on success, 404 if not found
- **Errors:** 500 on server error

### GET /api/results (extended)

- **Method:** GET
- **Params:** Existing `type`, `limit`, `offset` + new:
  - `sort`: `id` | `type` | `value` | `vm_name` | `created_at` (default: `created_at`)
  - `order`: `asc` | `desc` (default: `desc`)
- **Response:** 200 with `{ success, results }` (unchanged shape)

---

## Frontend Components

### ConfirmModal

- Reusable modal: title, message, Cancel, Confirm (destructive) buttons
- Props: `open`, `title`, `message`, `onConfirm`, `onCancel`, `confirmLabel` (default "Delete")
- Styled with existing CSS variables; overlay + centered card; accessible (focus trap, Escape)

### SavedResults

- **Delete:** Delete button per row; click opens ConfirmModal; on confirm, call DELETE; on 204, refetch or remove from state
- **Sort:** Clickable column headers; state `sort`, `order`; pass to fetch URL; visual indicator (arrow) on active column
- **Error handling:** Inline error for delete failure; network error message

---

## Data Flow

1. **Delete:** Row Delete click → modal opens → Confirm → `DELETE /api/results/:id` → 204: refetch; 404: show "Not found"; other: show error
2. **Sort:** Header click → update sort/order → refetch with params → render

---

## Testing

- **API:** DELETE unit test (204, 404); GET sort params integration
- **Frontend:** SavedResults: delete button visible, modal open/close, sort headers trigger refetch with correct params

---

## User Stories

- US-056 (sort), US-057 (delete SN), US-058 (delete MAC), US-060 (delete records)
