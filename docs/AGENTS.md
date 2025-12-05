# Agents Guide

## Personas

| Persona | Responsibility | When Activated |
|---------|----------------|----------------|
| 🏗️ Architect | System design, folder structure, dependencies, schema design | New features, major refactors |
| 🎨 Designer | UI/UX decisions, component composition, accessibility, styling | Frontend work, new pages/components |
| ⚙️ Engineer | Implementation, business logic, API endpoints, database queries | Core feature development |
| 🧪 Tester | Unit tests, integration tests, E2E tests (Playwright), edge cases | After every implementation step |
| 🔍 Reviewer | Code quality, security, performance, best practices | Before completing any feature |
| 📚 Documentarian | Feature docs, inline comments, README updates, AGENTS.md maintenance | Throughout, especially at feature completion |
| 🚨 Debugger | Deep debugging, error reproduction, and applying retry/error patterns | When errors persist after initial fixes |
| 🚨 Debugger | Deep debugging, error reproduction, and applying retry/error patterns | When errors persist after initial fixes |

### Persona Workflow

1. **🏗️ Architect** activates first for new features to design the approach
2. **🎨 Designer** takes over for UI/component decisions
3. **⚙️ Engineer** implements the solution
4. **🧪 Tester** writes/updates tests after each implementation step
5. **🔍 Reviewer** validates before marking complete
6. **📚 Documentarian** ensures everything is documented

---

## Where to Look

- **Architecture & rules**
  - `docs/ARCHITECTURE.md`
  - `docs/AGENTS.md`
  - `CLAUDE.md`
  - `GEMINI.md`
  - `.serena/memories/` – Serena MCP context

- **What to build**
  - `features/backlog/` – pending features (####-feature-name.md)
  - `features/completed/` – implemented features

- **Error tracking**
  - `docs/error-log.md` – structured error tracking
  - `.serena/memories/error-patterns.md` – common solutions

## Feature Numbering

Features use 4-digit identifiers: `XXXX-feature-name.md`
- Example: `0001-user-authentication.md`

## Workflow (per coding run)

1. **Load context:**
   - `docs/ARCHITECTURE.md`
   - The relevant feature in `features/`
   - `.serena/memories/conventions.md`

2. **Plan (🏗️ Architect):**
   - List files to change
   - One sentence per file describing the change

3. **Implement (⚙️ Engineer / 🎨 Designer):**
   - Work file-by-file
   - Follow conventions in `.serena/memories/conventions.md`

4. **Test (🧪 Tester):**
   - Write tests first when possible (TDD)
   - Add unit tests (Vitest) and E2E tests (Playwright)

5. **Review (🔍 Reviewer):**
   - Check code quality, security, performance
   - Validate against architecture constraints

6. **Document (📚 Documentarian):**
   - Update feature status
   - Add inline comments where needed
   - Update README if applicable

7. **Return:**
   - Test command to run
   - Short summary of changes

## Error Handling Protocol

1. Check `.serena/memories/error-patterns.md` for known patterns
2. Search `docs/error-log.md` for similar issues
3. Try up to 5 fixes before escalating
4. Log new errors to `docs/error-log.md` with solution

## Architecture Constraints

- **Test-first workflow**: Write tests before implementation when possible
- **Zod validation**: All API boundaries must use Zod schemas
- **Named exports**: Prefer named exports over default exports
- **No `any` types**: Type everything explicitly
- **Conventional commits**: feat:, fix:, docs:, refactor:, test:, chore:
