# Feature XXXX: Feature Name

> Copy this template to `features/XXXX-feature-name.md` and fill out each section.
> Replace XXXX with the next sequential 4-digit number.

## Status

**Current**: 🔵 Planning | 🟡 In Progress | 🟢 Testing | ✅ Complete

**Started**: YYYY-MM-DD  
**Completed**: YYYY-MM-DD

---

## Overview

_Brief description of the feature (2-3 sentences). What problem does it solve?_

---

## User Stories

_Who is this for and what do they need?_

- [ ] As a [user type], I want to [action] so that [benefit]
- [ ] As a [user type], I want to [action] so that [benefit]

---

## Acceptance Criteria

_How do we know this feature is complete?_

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Personas Involved

_Check the personas needed for this feature. See `docs/AGENTS.md` for persona details._

- [ ] 🏗️ Architect - System design, schema changes
- [ ] 🎨 Designer - UI/UX, components, styling
- [ ] ⚙️ Engineer - Implementation, business logic
- [ ] 🧪 Tester - Unit tests, E2E tests
- [ ] 🔍 Reviewer - Code quality, security review
- [ ] 📚 Documentarian - Docs, comments, Swagger
- [ ] 🚨 Debugger - If issues arise

---

## Technical Approach

_High-level technical design. How will this be implemented?_

### Architecture Decisions

_Key decisions and rationale_

1. Decision 1: Rationale
2. Decision 2: Rationale

### Dependencies

_What existing code/packages does this depend on?_

- `@repo/db` - Database operations
- `@repo/types` - Type definitions
- Other dependencies...

---

## Data Model Changes

_Database schema changes required (if any)_

### New Tables

```typescript
// Example schema
export const exampleTable = pgTable('example', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... fields
});
```

### Schema Modifications

_Changes to existing tables_

### Migrations Required

- [ ] Migration 1: Description
- [ ] Migration 2: Description

---

## API Endpoints

_New or modified API endpoints_

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/resource` | List resources |
| POST | `/api/resource` | Create resource |
| GET | `/api/resource/:id` | Get resource by ID |
| PATCH | `/api/resource/:id` | Update resource |
| DELETE | `/api/resource/:id` | Delete resource |

### Request/Response Examples

```typescript
// POST /api/resource
// Request
{
  "name": "Example",
  "value": 123
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Example",
    "value": 123,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## UI Components

_Frontend components to create or modify_

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `FeaturePage` | `apps/web/src/pages/` | Main feature page |
| `FeatureCard` | `apps/web/src/components/feature/` | Display card |

### Modified Components

| Component | Changes |
|-----------|---------|
| `Navigation` | Add link to new feature |

### Wireframe/Mockup

_Link to design or ASCII wireframe_

```
┌─────────────────────────────┐
│  Header                     │
├─────────────────────────────┤
│                             │
│  Feature Content            │
│                             │
└─────────────────────────────┘
```

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Service tests | `tests/unit/services/feature-service.test.ts` | Business logic |
| Validation tests | `tests/unit/schemas/feature-schemas.test.ts` | Request validation |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Happy path | `tests/e2e/feature.spec.ts` | Main user flow |
| Error cases | `tests/e2e/feature.spec.ts` | Error handling |

### Edge Cases to Cover

- [ ] Edge case 1
- [ ] Edge case 2
- [ ] Edge case 3

---

## Tasks

_Mark tasks as complete as you work through them. Update status at top of doc._

### Setup
- [ ] Create feature branch: `feature/XXXX-feature-name`
- [ ] Create Serena memory file: `.serena/memories/feature-XXXX.md`

### Database (Architect + Engineer)
- [ ] Define schema in `packages/db/schema/`
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`
- [ ] Add seed data if needed

### API (Engineer + Tester)
- [ ] Write unit tests for service (TDD)
- [ ] Implement service in `apps/api/src/services/`
- [ ] Write request validation schemas
- [ ] Implement controller in `apps/api/src/controllers/`
- [ ] Add routes in `apps/api/src/routes/`
- [ ] Add Swagger documentation
- [ ] Verify all tests pass

### Frontend (Designer + Engineer + Tester)
- [ ] Write E2E tests for main flows (TDD)
- [ ] Create/update types in `@repo/types`
- [ ] Implement components
- [ ] Implement page
- [ ] Add route
- [ ] Style with Tailwind
- [ ] Test accessibility
- [ ] Verify E2E tests pass

### Review (Reviewer)
- [ ] Code review checklist complete
- [ ] Security review
- [ ] Performance review
- [ ] No lint errors
- [ ] Types all correct

### Documentation (Documentarian)
- [ ] Update API docs (Swagger)
- [ ] Add inline comments where needed
- [ ] Update ARCHITECTURE.md if patterns changed
- [ ] Create/update Serena memory file
- [ ] Mark all acceptance criteria complete

### Completion
- [ ] All tests passing
- [ ] Feature deployed to staging (if applicable)
- [ ] Move this doc to `features/completed/`
- [ ] Update feature status to ✅ Complete

---

## Notes

_Additional notes, decisions, or context_

---

## Error Log

_Track any errors encountered during development_

| Date | Error | Resolution |
|------|-------|------------|
| | | |
