# VM–SN–MAC Business Rules Assessment

**Date:** 2026-02-17  
**Status:** BLOCKING — Do not proceed with Save/Saved Results frontend or VM page until schema and API are aligned.

---

## 1. Business Rules (Mandatory)

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **1 SN per VM** | A VM can have at most one Serial Number. Assigning a second SN to the same VM is invalid. | DB constraint + API validation |
| **Multiple MACs per VM** | A VM can have zero, one, or many MAC addresses (e.g. multiple NICs). | No uniqueness constraint |

These rules were not explicitly documented in UserStories or mockups but are core to the domain. They must be reflected in schema, API, and UI before implementation continues.

---

## 2. Current State vs Required State

### Current Schema (`saved_results`)

| Column | Type | Issue |
|--------|------|-------|
| `vm_name` | text, nullable | Free-form string. No VM entity. Cannot enforce 1 SN per VM. No referential integrity. |

**Gap:** `vm_name` as string cannot support:

- Uniqueness check (1 SN per VM)
- VM list / picker backed by real data
- Future Pro features (VM → project, hypervisor)

**Refactoring risk:** Building on `vm_name` now would require a later migration to `vm_id` + `vms` table, data backfill, and API changes. User explicitly wants to avoid this.

---

### Required Schema

Introduce a **`vms`** table and use **`vm_id`** (FK) in `saved_results`:

```
vms
  id          INTEGER PRIMARY KEY
  name        TEXT NOT NULL UNIQUE
  created_at  INTEGER NOT NULL

saved_results
  ...existing columns...
  vm_id       INTEGER REFERENCES vms(id)  -- replaces or supplements vm_name
```

**Constraint for 1 SN per VM:**

- Unique index on `(vm_id, type)` where `type = 'sn'` — but SQLite does not support partial unique indexes in all versions. Alternative: **application-level check** before insert: `SELECT 1 FROM saved_results WHERE vm_id = ? AND type = 'sn'`; if exists, return 409 Conflict.
- Or: **unique index** on `(vm_id, type)` — but that would also restrict MACs to 1 per VM. So we need a **partial unique index** (SQLite 3.8+): `CREATE UNIQUE INDEX idx_saved_results_vm_sn ON saved_results(vm_id) WHERE type = 'sn'`.

**SQLite partial unique index:** Supported. Use:

```sql
CREATE UNIQUE INDEX saved_results_vm_id_type_sn_unique
  ON saved_results(vm_id) WHERE type = 'sn';
```

---

## 3. API Changes Required

### New: VMs API (Standard)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vms` | List VMs (for picker) |
| POST | `/api/vms` | Create VM (name required) |

### Modified: POST /api/results

**Current:** `{ type, values[], comment?, vm_name? }`

**Proposed:** `{ type, values[], comment?, vm_id?: number, vm_name?: string }`

- **vm_id** — preferred. FK to `vms.id`. Use when VM exists.
- **vm_name** — optional. When provided without vm_id: create VM on the fly if not exists, then use its id. Enables "create new VM" flow without pre-navigation.

**Validation:**

- For `type: 'sn'` and `vm_id` provided: check no existing SN for that VM. If exists → **409 Conflict** `{ error: "VM already has a Serial Number" }`.
- For `type: 'mac'`: no uniqueness check.

### Backward Compatibility

- **Migration:** Add `vm_id` nullable. Keep `vm_name` for now (for display, or for create-on-fly). Rows with only `vm_name` (no vm_id) remain valid during transition.
- **Phase-out:** Once all clients use vm_id, deprecate vm_name in request body. Keep vm_name in response for display if desired.

---

## 4. Frontend Impact

| Feature | Impact |
|---------|--------|
| Save button (SN/MAC generators) | Must pass vm_id (from picker) or vm_name (create-on-fly). For SN: handle 409 if VM already has SN. |
| VM page | Needs VM list from GET /api/vms. Create VM via POST /api/vms. |
| Saved Results page | Display vm_name from joined/denormalized data. Filter by VM when supported. |

---

## 5. Implementation Order

1. **Schema migration:** Add `vms` table. Add `vm_id` to `saved_results`. Add partial unique index for SN. Migrate existing `vm_name` to `vms` + `vm_id` where feasible (or leave legacy rows as-is).
2. **VMs API:** GET /api/vms, POST /api/vms.
3. **POST /api/results:** Accept vm_id, vm_name (create-on-fly). Enforce 1 SN per VM (409 on violation).
4. **Frontend:** Save UI, Saved Results page, VM page — all using vm_id/vm_name per above.

---

## 6. UserStories Update

Add to Standard Features (explicit):

- As a user I want the system to enforce that each VM has at most one Serial Number.
- As a user I want to be able to assign multiple MAC addresses to a single VM (e.g. multiple NICs).

---

## 7. Checklist Before Proceeding

- [ ] Schema migration designed and approved
- [ ] VMs API contract defined
- [ ] POST /api/results changes defined (vm_id, 409 for SN)
- [ ] UserStories updated
- [ ] Save-results-backend-design.md updated
- [ ] Implementation plan created (backend first, then frontend)

---

## References

- [2026-02-16-save-results-backend-design.md](2026-02-16-save-results-backend-design.md)
- [UserStories.md](../UserStories.md)
