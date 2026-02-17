# Prompt for Next Agent Session: VM Entity Backend

Copy and paste this prompt to start a new session. The agent will implement the VM entity backend per the plan.

---

## Prompt

I need you to implement the VM entity backend changes. Use the following skills and follow the implementation plan exactly.

**Required skills to invoke (in order):**

1. **@using-superpowers** — Check and use applicable skills before any action.
2. **@using-git-worktrees** — Create an isolated worktree for branch `feature/vm-entity-backend` before touching code.
3. **@executing-plans** — Execute the implementation plan task-by-task with verification between batches.

**Context files to read:**

- `docs/plans/2026-02-17-VM-entity-backend-implementation.md` — the implementation plan
- `docs/plans/2026-02-17-VM-SN-MAC-business-rules-assessment.md` — business rules and design rationale

**Task:** Implement the VM entity backend:

- Schema migration: add `vms` table, add `vm_id` to `saved_results`, partial unique index for 1 SN per VM
- VMs API: GET /api/vms, POST /api/vms
- POST /api/results: accept vm_id and vm_name (create-on-fly), enforce 1 SN per VM (return 409 when VM already has SN)
- GET /api/results: include vm_name in response (join vms when vm_id is set)
- Tests for VMs API and 1 SN per VM enforcement

**When complete:** Use **@finishing-a-development-branch** to verify tests, then merge or create PR.

---

## Skills Reference

| Skill | When to use |
|-------|-------------|
| using-superpowers | At start — establish how to find and use skills |
| using-git-worktrees | Before coding — create isolated worktree |
| executing-plans | During implementation — follow plan task-by-task |
| finishing-a-development-branch | After all tasks — merge or PR |
