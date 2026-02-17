# Next Steps: Save Results + VM

**Blocking:** Do not implement Save/Saved Results frontend or VM page until backend schema and API are updated per the assessment.

---

## 1. Backend (Schema + API)

**Reference:** [2026-02-17-VM-SN-MAC-business-rules-assessment.md](2026-02-17-VM-SN-MAC-business-rules-assessment.md)

| Task | Details | Status |
|------|---------|--------|
| 1.1 | Add `vms` table (id, name, created_at). Add `vm_id` to `saved_results`. Partial unique index: 1 SN per VM. | Done |
| 1.2 | Migration: create vms, alter saved_results. Handle existing rows with vm_name (optional backfill). | Done |
| 1.3 | VMs API: GET /api/vms, POST /api/vms. | Done |
| 1.4 | POST /api/results: accept vm_id, vm_name (create-on-fly). Enforce 1 SN per VM → 409 on violation. | Done |
| 1.5 | GET /api/results: include vm_name in response (join via vm_id). | Done |

---

## 2. Frontend (after backend)

| Task | Details |
|------|---------|
| 2.1 | Save UI: shared SaveResultsForm with vm picker (create-on-fly). Handle 409 for SN. |
| 2.2 | Saved Results page: /saved, list with filters. React Router. |
| 2.3 | VM page: create/select VMs, combined SN+MAC generation. |

---

## 3. Order

1. Implement backend 1.1–1.5.
2. Update design doc and implementation plan.
3. Proceed with frontend 2.1–2.3.
