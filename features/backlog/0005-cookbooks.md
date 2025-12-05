# Feature 0005: Cookbooks

## Status

**Current**: 🔵 Planning

**Started**: (pending)
**Completed**: (pending)

---

## Overview

Enable users to create personal and group cookbooks as curated collections of recipes. Cookbooks support privacy controls, custom ordering, and recipe-specific notes, allowing users to organize recipes for different purposes (meal planning, favorites, gift ideas, etc.).

---

## User Stories

- [ ] As a user, I want to create a cookbook so that I can organize my favorite recipes
- [ ] As a user, I want to add recipes to my cookbook so that I can build a collection
- [ ] As a user, I want to reorder recipes in my cookbook so that I can customize the organization
- [ ] As a user, I want to add notes to recipes in my cookbook so that I can remember why I saved them
- [ ] As a user, I want to set cookbook privacy so that I can control who sees my collections
- [ ] As a user, I want to view others' public cookbooks so that I can discover new recipes
- [ ] As a group member, I want to create a group cookbook so that we can collaboratively collect recipes

---

## Acceptance Criteria

- [ ] User can create a personal cookbook with title, description, and privacy setting
- [ ] User can add recipes to their cookbook
- [ ] User can remove recipes from their cookbook
- [ ] User can reorder recipes within a cookbook
- [ ] User can add notes to individual recipes in a cookbook
- [ ] User can set cookbook privacy (public, private, friends-only)
- [ ] Group members can create group-level cookbooks
- [ ] Cookbook detail page shows all recipes in order
- [ ] User can view others' public cookbooks
- [ ] User can browse cookbooks (filtered by user or group)

---

## Personas Involved

- [x] 🏗️ Architect - Cookbook schema, junction table design
- [x] 🎨 Designer - Cookbook card, detail page, add recipe modal
- [x] ⚙️ Engineer - Cookbook CRUD, privacy checks
- [x] 🧪 Tester - Unit tests for cookbook service, E2E cookbook flows
- [x] 🔍 Reviewer - Privacy enforcement, ordering logic
- [x] 📚 Documentarian - API docs for cookbooks

---

## Technical Approach

### Architecture Decisions

1. **Junction Table with Metadata**
   - **Rationale**: Enable custom ordering and per-recipe notes
   - **Implementation**: `cookbook_recipes` junction table with `order` and `notes` columns

2. **Privacy Levels**
   - **Rationale**: Same as recipes (public, private, friends-only)
   - **Implementation**: Enum column on `cookbooks` table

3. **Group vs Personal Cookbooks**
   - **Rationale**: Single table supports both use cases
   - **Implementation**: `groupId` nullable foreign key

### Dependencies

- Existing `recipes` table (Feature 0002)
- Existing `groups` table (Feature 0006) - for group cookbooks

---

## Data Model Changes

### New Tables

```typescript
// packages/db/schema/cookbooks.ts
export const cookbooks = pgTable('cookbooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id')
    .references(() => groups.id, { onDelete: 'cascade' }), // nullable for personal cookbooks
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  privacy: varchar('privacy', { length: 20 }).notNull().default('private'), // 'public', 'private', 'friends_only'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/cookbook-recipes.ts
export const cookbookRecipes = pgTable('cookbook_recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  cookbookId: uuid('cookbook_id')
    .notNull()
    .references(() => cookbooks.id, { onDelete: 'cascade' }),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0),
  notes: text('notes'), // optional user notes about why they saved this recipe
  addedAt: timestamp('added_at').notNull().defaultNow(),
}, (table) => ({
  uniqueCookbookRecipe: unique().on(table.cookbookId, table.recipeId),
}));
```

### Migrations Required

- [ ] Migration 1: Create `cookbooks` table
- [ ] Migration 2: Create `cookbook_recipes` junction table

**Run migration:**
```bash
npm run db:generate && npm run db:migrate
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/cookbooks` | List cookbooks (user or group, respects privacy) |
| POST | `/api/v1/cookbooks` | Create new cookbook |
| GET | `/api/v1/cookbooks/:id` | Get cookbook by ID (with recipes) |
| PATCH | `/api/v1/cookbooks/:id` | Update cookbook (owner only) |
| DELETE | `/api/v1/cookbooks/:id` | Delete cookbook (owner only) |
| POST | `/api/v1/cookbooks/:id/recipes` | Add recipe to cookbook |
| DELETE | `/api/v1/cookbooks/:id/recipes/:recipeId` | Remove recipe from cookbook |
| PATCH | `/api/v1/cookbooks/:id/recipes/:recipeId` | Update recipe order/notes |

### Request/Response Examples

```typescript
// POST /api/v1/cookbooks
// Request
{
  "title": "Weeknight Dinners",
  "description": "Quick recipes for busy nights",
  "privacy": "private",
  "groupId": null // or group UUID for group cookbooks
}

// Response
{
  "success": true,
  "data": {
    "id": "cookbook-uuid",
    "userId": "user-uuid",
    "groupId": null,
    "title": "Weeknight Dinners",
    "description": "Quick recipes for busy nights",
    "privacy": "private",
    "createdAt": "2025-12-05T00:00:00Z"
  }
}
```

```typescript
// POST /api/v1/cookbooks/:id/recipes
// Request
{
  "recipeId": "recipe-uuid",
  "order": 0,
  "notes": "Kids love this one!"
}

// Response
{
  "success": true,
  "data": {
    "id": "junction-uuid",
    "cookbookId": "cookbook-uuid",
    "recipeId": "recipe-uuid",
    "order": 0,
    "notes": "Kids love this one!",
    "addedAt": "2025-12-05T00:00:00Z"
  }
}
```

---

## UI Components

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `CookbookCard` | `@repo/ui` | Display cookbook summary |
| `CookbookForm` | `apps/web/src/components/cookbook/` | Create/edit cookbook form |
| `CookbookDetail` | `apps/web/src/components/cookbook/` | Full cookbook display with recipes |
| `AddRecipeToCookbook` | `apps/web/src/components/cookbook/` | Modal to select cookbook |

### New Pages

| Page | Location | Description |
|------|----------|-------------|
| `CookbooksPage` | `apps/web/src/pages/` | Browse user's cookbooks |
| `CookbookDetailPage` | `apps/web/src/pages/` | Single cookbook view |

### New Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useCookbooks` | `apps/web/src/hooks/` | TanStack Query: list, create, update, delete |

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Cookbook service tests | `tests/unit/services/cookbook-service.test.ts` | CRUD, privacy checks, add/remove recipes |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Create cookbook | `tests/e2e/cookbook.spec.ts` | Create and view cookbook |
| Add recipe to cookbook | `tests/e2e/cookbook.spec.ts` | Add recipe, verify order |
| Reorder recipes | `tests/e2e/cookbook.spec.ts` | Drag-and-drop reordering |
| Privacy checks | `tests/e2e/cookbook.spec.ts` | Private cookbook not visible |

### Edge Cases to Cover

- [ ] Add same recipe twice (should fail due to unique constraint)
- [ ] Non-owner trying to edit cookbook (should fail)
- [ ] Delete cookbook with recipes (recipes remain, junction entries deleted)
- [ ] Group cookbook permissions (group members can edit)

---

## Tasks

### Database (Architect + Engineer)
- [ ] Create `packages/db/schema/cookbooks.ts`
- [ ] Create `packages/db/schema/cookbook-recipes.ts`
- [ ] Update `packages/db/schema/index.ts`
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`

### API (Engineer + Tester)
- [ ] Create `apps/api/src/services/cookbook-service.ts`
- [ ] Create `apps/api/src/controllers/cookbook-controller.ts`
- [ ] Create `apps/api/src/routes/cookbook-routes.ts`
- [ ] Create `apps/api/src/schemas/cookbook-schemas.ts`

### Frontend (Designer + Engineer + Tester)
- [ ] Create `@repo/ui/CookbookCard.tsx`
- [ ] Create `apps/web/src/components/cookbook/CookbookForm.tsx`
- [ ] Create `apps/web/src/components/cookbook/CookbookDetail.tsx`
- [ ] Create `apps/web/src/components/cookbook/AddRecipeToCookbook.tsx`
- [ ] Create `apps/web/src/hooks/useCookbooks.ts`
- [ ] Create `apps/web/src/pages/CookbooksPage.tsx`
- [ ] Create `apps/web/src/pages/CookbookDetailPage.tsx`

### Completion
- [ ] All tests passing
- [ ] Cookbook CRUD working
- [ ] Add/remove recipes working
- [ ] Privacy controls working
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **Depends on Feature 0002**: Requires recipes
- **Optional dependency on Feature 0006**: Group cookbooks require groups table
- **Future**: Collaborative editing for group cookbooks

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
