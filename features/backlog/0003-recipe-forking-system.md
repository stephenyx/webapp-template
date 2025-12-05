# Feature 0003: Recipe Forking System

## Status

**Current**: 🔵 Planning

**Started**: (pending)
**Completed**: (pending)

---

## Overview

Enable Git-like recipe forking with full lineage tracking. Users can fork recipes to create their own variations while maintaining a traceable ancestry tree. Implements a closure table pattern for efficient tree queries and bidirectional navigation.

---

## User Stories

- [ ] As a user, I want to fork a recipe so that I can create my own variation
- [ ] As a user, I want to see the original recipe when viewing a fork so that I can compare changes
- [ ] As a user, I want to see all forks of my recipe so that I can discover variations
- [ ] As a user, I want to see the full lineage tree so that I can understand recipe evolution
- [ ] As a user, I want to navigate between parent/child recipes so that I can explore the family tree

---

## Acceptance Criteria

- [ ] User can fork any public recipe
- [ ] Forking copies all recipe data (title, ingredients, instructions) with "Forked from..." attribution
- [ ] Fork relationship is stored in database with full ancestry
- [ ] Recipe detail page shows "Forked from" link if it's a fork
- [ ] Recipe detail page shows fork count and list of direct forks
- [ ] User can view full lineage tree (ancestors + descendants)
- [ ] Fork count is denormalized and cached on recipes table
- [ ] Fork tree is visualized as SVG graph
- [ ] User can navigate bidirectionally (parent ← → children)

---

## Personas Involved

- [x] 🏗️ Architect - Closure table design, tree query optimization
- [x] 🎨 Designer - Fork button, lineage tree visualization
- [x] ⚙️ Engineer - Fork service, tree traversal logic
- [x] 🧪 Tester - Unit tests for tree queries, E2E fork flows
- [x] 🔍 Reviewer - Query performance, data consistency
- [x] 📚 Documentarian - Fork API docs, tree structure docs

---

## Technical Approach

### Architecture Decisions

1. **Closure Table for Lineage Tracking**
   - **Rationale**: Efficiently query all ancestors/descendants, supports deep trees, avoids recursive queries
   - **Implementation**: `recipe_forks` table with `ancestorId`, `descendantId`, `depth`, `pathIds`
   - **Advantage**: O(1) queries for "get all ancestors" or "get all descendants"

2. **Denormalized Fork Count**
   - **Rationale**: Avoid COUNT(*) queries on every recipe list
   - **Implementation**: Cache `forkCount` on `recipes` table, increment on fork creation
   - **Tradeoff**: Requires transaction to keep consistent

3. **Fork Button Placement**
   - **Rationale**: Make forking discoverable
   - **Implementation**: Prominent fork button on recipe detail page, shows fork count

### Dependencies

- Existing `recipes` table (Feature 0002)
- Closure table pattern (well-established database pattern)

---

## Data Model Changes

### New Tables

```typescript
// packages/db/schema/recipe-forks.ts
export const recipeForks = pgTable('recipe_forks', {
  id: uuid('id').primaryKey().defaultRandom(),
  ancestorId: uuid('ancestor_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  descendantId: uuid('descendant_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  depth: integer('depth').notNull(), // 0 = self-reference, 1 = direct child, 2+ = deeper
  pathIds: text('path_ids').notNull(), // JSON array of IDs from ancestor to descendant
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueAncestorDescendant: unique().on(table.ancestorId, table.descendantId),
}));
```

### Schema Modifications

```typescript
// packages/db/schema/recipes.ts
// Already has:
// - forkedFromId: uuid('forked_from_id').references(() => recipes.id)
// - forkCount: integer('fork_count').notNull().default(0)
```

### Migrations Required

- [ ] Migration 1: Create `recipe_forks` closure table

**Run migration:**
```bash
npm run db:generate && npm run db:migrate
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/recipes/:id/fork` | Fork a recipe |
| GET | `/api/v1/recipes/:id/forks` | Get direct forks of a recipe |
| GET | `/api/v1/recipes/:id/lineage` | Get full lineage tree (ancestors + descendants) |
| GET | `/api/v1/recipes/:id/ancestors` | Get all ancestors (parent, grandparent, ...) |

### Request/Response Examples

```typescript
// POST /api/v1/recipes/:id/fork
// Request
{
  "title": "My Variation of Pizza", // optional, defaults to "Fork of [original title]"
  "modifications": "Added extra cheese" // optional description of changes
}

// Response
{
  "success": true,
  "data": {
    "id": "new-fork-uuid",
    "title": "My Variation of Pizza",
    "forkedFromId": "original-recipe-uuid",
    "forkCount": 0,
    /* ...all copied recipe data... */
  }
}
```

```typescript
// GET /api/v1/recipes/:id/lineage
// Response
{
  "success": true,
  "data": {
    "recipe": { /* current recipe */ },
    "ancestors": [
      { "id": "grandparent-uuid", "title": "Original Pizza", "depth": 2 },
      { "id": "parent-uuid", "title": "Modified Pizza", "depth": 1 }
    ],
    "descendants": [
      { "id": "child-uuid", "title": "Child Variation", "depth": 1, "forkCount": 3 },
      { "id": "grandchild-uuid", "title": "Grandchild Variation", "depth": 2, "forkCount": 0 }
    ]
  }
}
```

---

## UI Components

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ForkButton` | `apps/web/src/components/recipe/` | Fork action button with count |
| `ForkTree` | `@repo/ui` | SVG tree visualization of lineage |
| `ForkList` | `apps/web/src/components/recipe/` | List of direct forks |
| `LineageView` | `apps/web/src/components/recipe/` | Full lineage tree display |

### Modified Components

| Component | Changes |
|-----------|---------|
| `RecipeDetail` | Add fork button, show "Forked from" link, show fork count |
| `RecipeCard` | Add fork count badge |

### New Pages

| Page | Location | Description |
|------|----------|-------------|
| `ForkRecipePage` | `apps/web/src/pages/` | Pre-fill form with parent recipe data, allow edits |

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Fork service tests | `tests/unit/services/fork-service.test.ts` | createFork, getAncestors, getDescendants, getForkTree |
| Closure table logic | `tests/unit/services/fork-service.test.ts` | Verify correct ancestry paths |
| Fork count increment | `tests/unit/services/recipe-service.test.ts` | Verify denormalized count updates |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Fork recipe flow | `tests/e2e/fork.spec.ts` | Fork a recipe, verify copy and attribution |
| View lineage tree | `tests/e2e/fork.spec.ts` | Navigate to lineage view, verify tree structure |
| Navigate parent/child | `tests/e2e/fork.spec.ts` | Click parent/child links, verify navigation |
| Fork count display | `tests/e2e/fork.spec.ts` | Verify fork count increments |

### Edge Cases to Cover

- [ ] Fork a recipe that is itself a fork (multi-level lineage)
- [ ] Fork a recipe with no parent (root recipe)
- [ ] Delete a recipe that has forks (children should remain, parent link becomes null)
- [ ] Fork a recipe with 100+ existing forks
- [ ] Deep lineage tree (10+ levels)

---

## Tasks

### Database (Architect + Engineer)
- [ ] Create `packages/db/schema/recipe-forks.ts` - Closure table
- [ ] Update `packages/db/schema/index.ts` - Export new schema
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`

### API - Services (Engineer + Tester)
- [ ] Write unit tests for `fork-service` (TDD)
- [ ] Create `apps/api/src/services/fork-service.ts` - createFork, getAncestors, getDescendants, getForkTree
- [ ] Update `recipe-service.ts` - Add incrementForkCount method

### API - Controllers (Engineer)
- [ ] Create `apps/api/src/controllers/fork-controller.ts` - fork, getForks, getLineage, getAncestors
- [ ] Update `recipe-routes.ts` - Add fork endpoints

### API - Validation (Engineer)
- [ ] Create `apps/api/src/schemas/fork-schemas.ts` - forkRecipeSchema

### Frontend - Components (@repo/ui) (Designer + Engineer)
- [ ] Create `@repo/ui/ForkTree.tsx` - SVG tree visualization

### Frontend - Components (apps/web) (Designer + Engineer + Tester)
- [ ] Write E2E tests for fork flows (TDD)
- [ ] Create `apps/web/src/components/recipe/ForkButton.tsx`
- [ ] Create `apps/web/src/components/recipe/ForkList.tsx`
- [ ] Create `apps/web/src/components/recipe/LineageView.tsx`
- [ ] Update `RecipeDetail.tsx` - Add fork button, lineage section

### Frontend - Pages (Designer + Engineer)
- [ ] Create `apps/web/src/pages/ForkRecipePage.tsx` - Pre-fill with parent data

### Frontend - Hooks (Engineer)
- [ ] Create `apps/web/src/hooks/useFork.ts` - TanStack Query hooks for fork operations

### Review (Reviewer)
- [ ] Performance review: Closure table query optimization
- [ ] Data consistency review: Fork count denormalization
- [ ] Code review checklist complete
- [ ] No lint errors
- [ ] Types all correct

### Documentation (Documentarian)
- [ ] Add Swagger documentation for fork endpoints
- [ ] Document closure table pattern
- [ ] Add inline comments for tree traversal logic
- [ ] Mark all acceptance criteria complete

### Completion
- [ ] All tests passing (unit + E2E)
- [ ] Fork creation working
- [ ] Lineage tree visualization working
- [ ] Fork count accurate
- [ ] Feature deployed to staging (if applicable)
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **Depends on Feature 0002**: Requires recipes table with `forkedFromId` and `forkCount` columns
- **Closure table**: Standard pattern for hierarchical data, well-documented
- **Privacy**: Forking respects privacy (can only fork public recipes or friends-only if friend)
- **Future**: Could add "fork attribution" to recipe detail page showing full ancestry chain

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
