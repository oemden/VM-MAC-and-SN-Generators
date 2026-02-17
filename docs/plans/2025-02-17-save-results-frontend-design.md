# Save Results Frontend — Design Document

**Date:** 2025-02-17

**Goal:** Implement Save UI and Saved Results page for MAC/SN generators. VM entity backend is done.

---

## 1. Layout (per mockups)

Two-column layout for MacGenerator and SnGenerator:

| Left column | Right column |
|-------------|--------------|
| Options (collapsible) | Generated (N) |
| Count, Case, Type, Delimiter, etc. | Results list (Copy per item) |
| VM combobox + Comment | Copy All, Clear |
| Generate MAC/SN button | Save to Virtual Machine button |

**Rationale:** Results stay visible on the right when Options expand/collapse; no vertical push-down.

---

## 2. SaveResultsForm

**Placement:** VM picker and Comment in Options panel (left). Save button in Results panel (right).

**VM picker (combobox):**
- Fetches `GET /api/vms`
- Type to filter existing VMs
- Type new name to create-on-fly (sends `vm_name`; backend creates VM)
- Minimal custom implementation (no Radix for now; can migrate later)

**Comment:** Optional text input, max 500 chars (validation.ts: `COMMENT_MAX_LENGTH`).

**Save button:** In Results panel. On click: `POST /api/results` with `{ type, values, comment?, vm_id? | vm_name? }`.

**Error handling:**
- 409: "This VM already has a Serial Number" (SN only)
- 400: Show validation error
- Other: Generic error message

**Success:** Brief feedback; form resets or stays for another save.

---

## 3. Saved Results page

**Route:** `/saved`

**Data:** `GET /api/results?type=sn|mac|&limit=50&offset=0`

**Filters:** Type (All / SN / MAC)

**Display:** Table or list: id, type, value, vm_name, comment, created_at

**Pagination:** Optional "Load more" (limit 50 per page)

---

## 4. Routing and navigation

- Add `react-router-dom`
- Routes: `/` (home with generators), `/saved` (Saved Results)
- Header nav: "Generate" (or "Home") and "Saved"

---

## 5. Out of scope (this phase)

- VM toggle (Assign to VM ON/OFF) — process later
- Project / Pro feature
- Export format, Download All
- Radix UI (use minimal custom combobox)

---

## 6. API contract (reference)

| Endpoint | Method | Body / Params | Response |
|----------|--------|---------------|----------|
| /api/vms | GET | — | `{ success, vms: [{ id, name, created_at }] }` |
| /api/vms | POST | `{ name }` | 201 or 409 duplicate |
| /api/results | POST | `{ type, values, comment?, vm_id?, vm_name? }` | 201 or 409 "VM already has a Serial Number" |
| /api/results | GET | `?type=sn\|mac&limit=50&offset=0` | `{ success, results: [...] }` |

---

## 7. Data mapping

- Mac results: `data.results` → `[{ mac }]` → `values = results.map(r => r.mac)`
- SN results: `data.results` → `[{ sn }]` → `values = results.map(r => r.sn)`
