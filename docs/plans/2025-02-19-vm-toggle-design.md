# VM Toggle Design (Phase 4A)

**Date:** 2025-02-19

**Scope:** Assign to VM ON/OFF toggle in MacGenerator and SnGenerator.

---

## Design

### Behavior

- **Toggle:** "Assign to VM" checkbox in Options panel (both generators)
- **Default:** ON (preserves current behavior)
- **When ON:** Show SaveResultsForm (VM combobox, Comment, Save button)
- **When OFF:** Hide SaveResultsForm; only Copy All and per-row Copy visible

### Implementation

- Add `assignToVm: boolean` to options state (default `true`)
- Add checkbox in Options panel with `aria-label="Assign to VM"`
- Conditionally render `SaveResultsForm` when `options.assignToVm` is true

### Files

- `apps/web/src/components/MacGenerator.tsx`
- `apps/web/src/components/SnGenerator.tsx`
- `apps/web/src/components/MacGenerator.test.tsx` (new)
- `apps/web/src/components/SnGenerator.test.tsx` (new)

---

## Decisions

| Item | Choice |
|------|--------|
| Default | ON |
| Location | Options panel, last row |
| Accessibility | aria-label on checkbox |
