# Saved Results CRUD and VM Delete — Assessment

**Date:** 2025-02-17

**Source:** UserStories.md lines 54-61

---

## User Stories (paraphrased)

1. **Sort results** — Sort table in Saved Results page (by column)
2. **Delete SN records** — Delete records in table view of SN saved results
3. **Delete MAC records** — Delete records in table view of MAC saved results
4. **Delete VMs** — With warning if VM has associated results (SN and/or MAC); option to keep existing SN/MAC and assign to "NO VM"
5. **Delete records (general)** — Delete records per record in general

---

## Assessment

### Backend

| Story | API needed | Status |
|-------|------------|--------|
| Sort | Client-side or server `?sort=created_at&order=desc` | GET /api/results supports limit/offset; add sort params |
| Delete SN/MAC record | DELETE /api/results/:id | Not implemented |
| Delete VM | DELETE /api/vms/:id | Not implemented; needs cascade/orphan handling |
| Assign to NO VM | PATCH /api/results/:id with vm_id=null | Or separate "unlink" endpoint |

### Frontend

| Story | Component | Notes |
|-------|-----------|-------|
| Sort | SavedResults table | Click column header to sort; persist sort state |
| Delete record | SavedResults table row | Delete button per row; confirm dialog |
| Delete VM | VM page (future) or VM management | Warning modal; option "Keep results, assign to NO VM" |
| Delete records general | Same as 2–3 | Per-record delete in Saved Results table |

### Dependencies

- **VM page** — UserStory 57 (delete VMs) implies a VM management page. Current app has no dedicated VM page; VMs are created/selected via combobox. A VM page would list VMs and allow delete.
- **Orphan handling** — When deleting a VM: either cascade-delete results, or set vm_id=null (orphan). UserStory 58 specifies: "Option to keep existing SN or MAC and assign to NO VM".

---

## Recommended order

1. **DELETE /api/results/:id** — Backend for deleting a saved result
2. **Delete button in Saved Results table** — Per-row delete with confirm
3. **Sort in Saved Results** — Column sort (client or server)
4. **DELETE /api/vms/:id** — Backend with options: cascade vs orphan
5. **VM page** — List VMs, delete with warning modal
6. **VM toggle** — (Separate) Assign to VM ON/OFF in generators

---

## Out of scope (this assessment)

- VM toggle (UserStories 19–24) — Separate feature
- VM page full CRUD — May start with list + delete only
