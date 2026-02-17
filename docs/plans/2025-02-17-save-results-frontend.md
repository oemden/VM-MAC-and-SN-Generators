# Save Results Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Save UI (SaveResultsForm, two-column layout) and Saved Results page with routing.

**Architecture:** Two-column layout (Options left, Results right) per mockups. Shared SaveResultsForm with VM combobox and Comment. react-router-dom for / and /saved. Minimal custom combobox (no Radix).

**Tech Stack:** React, Vite, react-router-dom, Vitest, @testing-library/react

---

## Prerequisites

- Create worktree: `git worktree add .worktrees/feature/save-results-frontend -b feature/save-results-frontend`
- Run `bun install` from repo root
- Verify: `bun run build` passes

---

## Task 1: Add routing and test setup

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.config.ts`
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/App.tsx`

**Step 1:** Add dependencies and test script

In `apps/web/package.json`, add:
```json
"dependencies": {
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.1.0"
},
"devDependencies": {
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.6.0",
  "jsdom": "^25.0.0",
  "vitest": "^3.0.0"
},
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

**Step 2:** Create `apps/web/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  }
})
```

**Step 3:** Create `apps/web/src/test/setup.ts`

```ts
import '@testing-library/jest-dom'
```

**Step 4:** Install deps and verify

Run: `bun install`
Run: `bun run --cwd apps/web test` (may pass with 0 tests)

**Step 5:** Add BrowserRouter and routes to App

Modify `apps/web/src/main.tsx` to wrap with `BrowserRouter`.
Modify `apps/web/src/App.tsx` to use `Routes`, `Route`, `Link`, `Outlet` or `useRoutes`. Home at `/`, placeholder for `/saved`.

**Step 6:** Add nav link to Saved in header

Add `<Link to="/saved">Saved</Link>` in header.

**Step 7:** Commit

```bash
git add apps/web/package.json apps/web/vitest.config.ts apps/web/src/test/setup.ts apps/web/src/main.tsx apps/web/src/App.tsx
git commit -m "feat: add react-router-dom and vitest setup"
```

---

## Task 2: Create VmCombobox component

**Files:**
- Create: `apps/web/src/components/VmCombobox.tsx`
- Create: `apps/web/src/components/VmCombobox.test.tsx`

**Step 1:** Write failing test

Test that VmCombobox renders, fetches VMs, filters on input, and allows selecting or typing new value.

```tsx
// VmCombobox.test.tsx - basic render and fetch mock
import { render, screen } from '@testing-library/react'
import { VmCombobox } from './VmCombobox'

it('should render VM combobox with placeholder', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ success: true, vms: [] }) })
  render(<VmCombobox value="" onChange={() => {}} placeholder="Select VM" />)
  expect(screen.getByPlaceholderText(/select vm/i)).toBeInTheDocument()
})
```

**Step 2:** Run test to verify it fails

Run: `bun run --cwd apps/web test`
Expected: FAIL (VmCombobox not found)

**Step 3:** Implement VmCombobox

- Controlled input: `value`, `onChange`
- `useEffect` to fetch GET /api/vms on mount
- Filter vms by input value (case-insensitive)
- Dropdown list with filtered results; show "Create {input}" when input doesn't match any
- Click outside to close
- Keyboard: ArrowDown/Up, Enter to select

**Step 4:** Run test to verify it passes

Run: `bun run --cwd apps/web test`
Expected: PASS

**Step 5:** Commit

```bash
git add apps/web/src/components/VmCombobox.tsx apps/web/src/components/VmCombobox.test.tsx
git commit -m "feat: add VmCombobox component"
```

---

## Task 3: Create SaveResultsForm component

**Files:**
- Create: `apps/web/src/components/SaveResultsForm.tsx`
- Create: `apps/web/src/components/SaveResultsForm.test.tsx`

**Step 1:** Write failing test

Test that SaveResultsForm renders VM combobox, comment field, Save button; calls POST with correct data on save.

**Step 2:** Run test to verify it fails

**Step 3:** Implement SaveResultsForm

Props: `type: 'sn' | 'mac'`, `values: string[]`, `onSaved?: () => void`
- VmCombobox (required for save)
- Comment input (optional, max 500)
- Save button: disabled when no VM selected or no values
- POST /api/results with vm_id (if selected from list) or vm_name (if typed new)
- Handle 409: show "This VM already has a Serial Number"
- On success: call onSaved, show brief feedback

**Step 4:** Run test to verify it passes

**Step 5:** Commit

```bash
git add apps/web/src/components/SaveResultsForm.tsx apps/web/src/components/SaveResultsForm.test.tsx
git commit -m "feat: add SaveResultsForm component"
```

---

## Task 4: Refactor MacGenerator to two-column layout

**Files:**
- Modify: `apps/web/src/components/MacGenerator.tsx`
- Modify: `apps/web/src/index.css`

**Step 1:** Add two-column layout

- Left: `.generator-options` (Options toggle + options panel + VM combobox + Comment + Generate button)
- Right: `.generator-results` (Generated list + Copy All + Save to Virtual Machine button)
- Use CSS grid or flex: `display: grid; grid-template-columns: 1fr 1fr;` on card content

**Step 2:** Add SaveResultsForm to MacGenerator

- In Results panel: when `results.length > 0`, show SaveResultsForm with `type="mac"`, `values={results.map(r => r.mac)}`
- Save button label: "Save to Virtual Machine"

**Step 3:** Add CSS for `.generator-layout`, `.generator-options`, `.generator-results`

**Step 4:** Verify manually

Run: `bun run dev:web`, generate MACs, click Save (mock API or use running API)

**Step 5:** Commit

```bash
git add apps/web/src/components/MacGenerator.tsx apps/web/src/index.css
git commit -m "feat: add two-column layout and Save to MacGenerator"
```

---

## Task 5: Refactor SnGenerator to two-column layout

**Files:**
- Modify: `apps/web/src/components/SnGenerator.tsx`

**Step 1:** Mirror MacGenerator layout

- Same two-column structure
- SaveResultsForm with `type="sn"`, `values={results.map(r => r.sn)}`

**Step 2:** Verify manually

**Step 3:** Commit

```bash
git add apps/web/src/components/SnGenerator.tsx
git commit -m "feat: add two-column layout and Save to SnGenerator"
```

---

## Task 6: Create Saved Results page

**Files:**
- Create: `apps/web/src/pages/SavedResults.tsx`
- Create: `apps/web/src/pages/SavedResults.test.tsx`

**Step 1:** Write failing test

Test that SavedResults fetches GET /api/results and renders list.

**Step 2:** Run test to verify it fails

**Step 3:** Implement SavedResults page

- GET /api/results?type=sn|mac|&limit=50&offset=0
- Type filter: All / SN / MAC (dropdown or tabs)
- Table/list: id, type, value, vm_name, comment, created_at
- Optional: "Load more" if results.length === limit

**Step 4:** Wire route in App

Add `<Route path="/saved" element={<SavedResults />} />`

**Step 5:** Run test to verify it passes

**Step 6:** Commit

```bash
git add apps/web/src/pages/SavedResults.tsx apps/web/src/pages/SavedResults.test.tsx apps/web/src/App.tsx
git commit -m "feat: add Saved Results page"
```

---

## Task 7: API base URL and final verification

**Files:**
- Create or modify: `apps/web/src/lib/api.ts`

**Step 1:** Add API_URL constant

```ts
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
```

**Step 2:** Use in VmCombobox, SaveResultsForm, SavedResults

**Step 3:** Run full test suite

Run: `bun run test`
Expected: All pass

**Step 4:** Run build

Run: `bun run build`
Expected: Success

**Step 5:** Commit

```bash
git add apps/web/src/lib/api.ts
git commit -m "feat: centralize API base URL"
```

---

## Task 8: Update docs and version (after user approval)

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `apps/web/package.json` (version)

**Note:** Defer until user approval per project rules. Do not bump version in implementation plan commits.

---

## Execution Handoff

Plan complete and saved to `docs/plans/2025-02-17-save-results-frontend.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration.

2. **Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints.

**Which approach?**
