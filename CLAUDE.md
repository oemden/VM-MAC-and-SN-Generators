# Project Description

This project is a full-stack Serial Number and MAC address Generator for Virtual machines with a React frontend and Node.js/Express backend:

- Read the README.md to understand the project purpose

## GOAL

- Provide a web page to call the scripts and generate SN or MAC addresses.
- Self-host the Project  in a Docker compose file.

## Core Architecture

The full-stack Architecture is to be defined.

- Frontend: simple page to call scripts
- Prefer `bun` over `npm`
- Scripts: 2 bash scripts to generate mac addresses and Custom Serial Numbers
- Use SQLite for basic settings, Plan migrations to be able to switch to SQL in future development.

## Code Style Guidelines

- Syntax: Use ES Modules (`import`/`export`) rather than CommonJS. Use modern ES6+ features (arrow functions, etc.) where appropriate.
- Formatting: 2 spaces for indentation. Use single quotes for strings. No trailing semicolons (we run Prettier) – except where necessary in TypeScript (enums, interfaces).
- Naming: Use `camelCase` for variables/functions, `PascalCase` for React components and classes. Constants in `UPPER_SNAKE_CASE`.
- Patterns: Prefer functional components with hooks over class components in React. Avoid using any deprecated APIs.
- Comments and documentation:
  - Add consice comments on complex functions
  - Do not over-document obvious or explicit code.
  - Do not write in comments or documentation that you added comment or updated documentation
  - git commits: use add: fix: feat: describing the modifications/addons

## Testing Instructions

### Testing Mantra

Think test-first.
Ensure that for every feature or bugfix, either writes or updates tests as part of your workflow.

- Always include tests for new features” and specifics like “Use Jest and React Testing Library for UI tests.“
- Always follow TDD mindset: for any bug fix or new feature, consider writing tests first or immediately after coding.
- Use Jest for unit tests. For React components, use @testing-library/react for rendering and assertions.
- Aim for high coverage on core logic (services, reducers, etc.).
  - Edge Case: If time allows, generate additional tests for edge cases and potential regressions. Include edge cases (invalid inputs, error states) in tests.
- Test Naming: use `describe` blocks for modules and `it(‘should …’)` for behaviors. Keep tests clear and focused.
- Run tests with `npm run test` and ensure all pass before considering a task done.

## Error Handling & Debugging

### Error Handling Mantra

Set of guidelines to approach bugs and exceptions methodically, rather than slapping on band-aid fixes.
debug and handle errors like a seasoned engineer.

- Diagnose, Don’t Guess: When encountering a bug or failing test, first explain possible causes step-by-step. Check assumptions, inputs, and relevant code paths.
  - When an error occurs, analyze the root cause step-by-step before proposing a fix.
- Graceful Handling: Code should handle errors gracefully. For example, use try/catch around async calls, and return user-friendly error messages or fallback values when appropriate.
- Logging: Include helpful console logs or error logs for critical failures (but avoid log spam in production code).
- No Silent Failures: Do not swallow exceptions silently. Always surface errors either by throwing or logging them.
- On critical bugs, consider binary search through git history or add temporary console.debug statements to isolate the issue.

## Clean Code Guidelines

### Clean code Mantra

Limit function length; refactor large functions into smaller helpers with clear names.
Name functions clearly, e.g. calculateInvoiceTotal, not handleData

- Function Size: Aim for functions ≤ 50 lines. If a function is doing too much, break it into smaller helper functions.
- Single Responsibility: Each function/module should have one clear purpose. Don’t lump unrelated logic together.
- Naming: Use descriptive names. Avoid generic names like `tmp`, `data`, `handleStuff`. For example, prefer `calculateInvoiceTotal` over `doCalc`.
- DRY Principle: Do not duplicate code. If similar logic exists in two places, refactor into a shared function (or clarify why both need their own implementation).
- Comments: Explain non-obvious logic, but don’t over-comment self-explanatory code. Remove any leftover debug or commented-out code.

## Security Guidelines

### Security Guidelines Mantra

Always Keep an eye on vulnerabilities and safe practices

- Input Validation: Validate all inputs (especially from users or external APIs). Never trust user input – e.g., check for valid email format, string length limits, etc.
- Authentication: Never store passwords in plain text. Use bcrypt with a salt for hashing passwords. Implement account lockout or rate limiting on repeated failed logins.
- Database Safety: Use parameterized queries or an ORM to prevent SQL injection. Do not concatenate user input in SQL queries directly.
- XSS & CSRF: Sanitize any HTML or user-generated content before rendering (consider using a library like DOMPurify). Use CSRF tokens for state-changing form submissions.
- Dependencies: Be cautious of eval or executing dynamic code. Avoid introducing packages with known vulnerabilities (Claude should prefer built-in solutions if external libs are risky).
- Password handling: password handling: Always hash passwords with bcrypt, never store plain text; validate email format; apply rate limiting on login attempts.

## Collaboration & Workflow

### Workflow Mantra

- Git Branches: Follow GitFlow lite – create feature branches off `dev` (e.g., `feature/login-form`), merge via Pull Request. Do **not** commit directly to `main`.
- Commit Messages: Use conventional commits (e.g., `feat:`, `fix:`, `docs:` prefixes). Include JIRA ticket ID in commit if available. Keep message concise (one line summary, optional details after).
- Pull Requests: When a task is done, have Claude open a PR with a brief description of changes and tag the relevant reviewers (e.g., `@frontend-team` for UI changes).
- Documentation: If code changes affect user-facing behavior or APIs, update the relevant Markdown docs in the `docs/` folder as part of the same PR.
- Code Reviews: Claude should assist in code reviews if asked (e.g., static analysis for bugs, ensure style guide adherence) and only approve when all checks pass.

## Edge Case Considerations

Always consider edge and corner cases for any logic:

- Empty or null inputs (e.g., an empty list, missing fields, zero values).
- Max/min values and overflow (e.g., extremely large numbers, very long text).
- Invalid states (e.g., end date before start date, negative quantities).
- Concurrency issues (e.g., two users editing the same data simultaneously).
- If an edge case is identified, handle it in code or at least flag it with a comment/TODO.
- Prefer to fail fast on bad input (throw an error or return a safe default) rather than proceeding with wrong assumptions.
- Articulate edge cases in planning mode.

## Workflow & Planning Guidelines

### Workflow & Planning Mantra

Propose -> get feedback -> implement -> review
For large tasks, follow a 3-step approach – Analysis → Plan → Implement. Always propose a plan first for approval.
If I say ‘Let’s brainstorm’, enter Plan Mode.

- For any complex or multi-step task, Claude should first output a clear plan (E.g., list the steps or modules needed).
- Incremental Development: Implement in logical chunks. After each chunk, verify it aligns with the plan and passes tests before moving on.
- Think Aloud: Use extended reasoning (“think harder or ultrathink”) for complex decisions. It’s okay to spend more tokens to ensure a solid approach rather than rushing coding.
- User Approval: Pause for confirmation after providing a plan or major design decision. Only proceed once the user/developer confirms.
- Error Recovery: If a solution isn’t working, Claude should backtrack and rethink rather than stubbornly persisting. Consider alternative approaches if tests fail or constraints are hit.
