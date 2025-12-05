# Feature 0004: Tags, Ratings, Comments

## Status

**Current**: 🔵 Planning

**Started**: (pending)
**Completed**: (pending)

---

## Overview

Add recipe categorization via tags, user ratings (1-5 stars), and nested comments. These features enable recipe discovery, quality signals, and community engagement around recipes.

---

## User Stories

- [ ] As a user, I want to tag my recipes so that others can discover them by category
- [ ] As a user, I want to browse recipes by tag so that I can find recipes of a specific type
- [ ] As a user, I want to rate recipes so that I can signal quality to others
- [ ] As a user, I want to see average ratings so that I can identify highly-rated recipes
- [ ] As a user, I want to comment on recipes so that I can provide feedback or ask questions
- [ ] As a user, I want to reply to comments so that I can have threaded discussions
- [ ] As a user, I want to see popular tags so that I can discover trending categories

---

## Acceptance Criteria

- [ ] User can add tags to their recipes (multiple tags per recipe)
- [ ] User can browse recipes by tag
- [ ] User can rate a recipe (1-5 stars, one rating per user per recipe)
- [ ] User can update their rating
- [ ] Recipe detail page shows average rating and rating count
- [ ] User can add a comment to a recipe
- [ ] User can reply to a comment (nested up to 3 levels)
- [ ] User can edit/delete their own comments
- [ ] Comments are displayed in threaded format
- [ ] Tag autocomplete suggests existing tags
- [ ] Popular tags are displayed on browse page

---

## Personas Involved

- [x] 🏗️ Architect - Tag normalization, rating aggregation, comment nesting
- [x] 🎨 Designer - Tag pills, star rating widget, comment thread UI
- [x] ⚙️ Engineer - Tag/rating/comment services, aggregation logic
- [x] 🧪 Tester - Unit tests for rating math, E2E comment flows
- [x] 🔍 Reviewer - Comment moderation considerations, rating manipulation prevention
- [x] 📚 Documentarian - API docs for tags/ratings/comments

---

## Technical Approach

### Architecture Decisions

1. **Tag Normalization**
   - **Rationale**: Prevent duplicate tags (e.g., "Italian" vs "italian"), enable autocomplete
   - **Implementation**: Separate `tags` table with unique slug, `recipe_tags` junction table

2. **Rating Aggregation**
   - **Rationale**: Avoid COUNT(*) on every recipe list query
   - **Implementation**: Denormalize `averageRating` and `ratingCount` on `recipes` table, recalculate on upsert

3. **Nested Comments (Parent-Child)**
   - **Rationale**: Enable threaded discussions
   - **Implementation**: `parentCommentId` column (nullable), limit depth to 3 levels

4. **One Rating Per User**
   - **Rationale**: Prevent rating manipulation
   - **Implementation**: Unique constraint on (userId, recipeId)

### Dependencies

- Existing `recipes` table (Feature 0002)

---

## Data Model Changes

### New Tables

```typescript
// packages/db/schema/tags.ts
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(), // lowercase, hyphenated
  type: varchar('type', { length: 50 }), // e.g., "cuisine", "diet", "difficulty", "meal-type"
  usageCount: integer('usage_count').notNull().default(0), // denormalized
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/recipe-tags.ts
export const recipeTags = pgTable('recipe_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueRecipeTag: unique().on(table.recipeId, table.tagId),
}));
```

```typescript
// packages/db/schema/recipe-ratings.ts
export const recipeRatings = pgTable('recipe_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserRecipe: unique().on(table.userId, table.recipeId),
}));
```

```typescript
// packages/db/schema/recipe-comments.ts
export const recipeComments = pgTable('recipe_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id')
    .references(() => recipeComments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Schema Modifications

```typescript
// packages/db/schema/recipes.ts (ADD to existing table)
export const recipes = pgTable('recipes', {
  // ...existing fields...
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }), // e.g., 4.52
  ratingCount: integer('rating_count').notNull().default(0),
});
```

### Migrations Required

- [ ] Migration 1: Create `tags` table
- [ ] Migration 2: Create `recipe_tags` junction table
- [ ] Migration 3: Create `recipe_ratings` table
- [ ] Migration 4: Create `recipe_comments` table
- [ ] Migration 5: Add `averageRating` and `ratingCount` to `recipes` table

**Run migration:**
```bash
npm run db:generate && npm run db:migrate
```

---

## API Endpoints

### Tags

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/tags` | List all tags (with usage count) |
| GET | `/api/v1/tags/popular` | Get popular tags (top 20 by usage) |
| GET | `/api/v1/recipes?tag=:slug` | Filter recipes by tag |

### Ratings

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/recipes/:id/ratings` | Add/update rating (upsert) |
| GET | `/api/v1/recipes/:id/ratings` | Get all ratings for a recipe |
| GET | `/api/v1/recipes/:id/ratings/me` | Get current user's rating |

### Comments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/recipes/:id/comments` | Get all comments (nested) |
| POST | `/api/v1/recipes/:id/comments` | Add a comment |
| PATCH | `/api/v1/comments/:id` | Update comment (owner only) |
| DELETE | `/api/v1/comments/:id` | Delete comment (owner only) |

### Request/Response Examples

```typescript
// POST /api/v1/recipes/:id/ratings
// Request
{
  "rating": 5
}

// Response
{
  "success": true,
  "data": {
    "id": "rating-uuid",
    "recipeId": "recipe-uuid",
    "userId": "user-uuid",
    "rating": 5,
    "createdAt": "2025-12-05T00:00:00Z"
  }
}
```

```typescript
// GET /api/v1/recipes/:id/comments
// Response
{
  "success": true,
  "data": [
    {
      "id": "comment-1",
      "userId": "user-1",
      "user": { "username": "john", "name": "John Doe" },
      "content": "Great recipe!",
      "parentCommentId": null,
      "createdAt": "2025-12-05T00:00:00Z",
      "replies": [
        {
          "id": "comment-2",
          "userId": "user-2",
          "user": { "username": "jane", "name": "Jane Smith" },
          "content": "I agree!",
          "parentCommentId": "comment-1",
          "createdAt": "2025-12-05T01:00:00Z",
          "replies": []
        }
      ]
    }
  ]
}
```

---

## UI Components

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `TagPill` | `@repo/ui` | Display tag with optional remove button |
| `TagSelector` | `apps/web/src/components/recipe/` | Autocomplete tag input |
| `RatingStars` | `@repo/ui` | Display star rating (read-only or interactive) |
| `RatingInput` | `apps/web/src/components/recipe/` | Star rating input widget |
| `CommentThread` | `@repo/ui` | Threaded comment display |
| `CommentSection` | `apps/web/src/components/recipe/` | Comments + add comment form |

### Modified Components

| Component | Changes |
|-----------|---------|
| `RecipeCard` | Add average rating display, tag pills |
| `RecipeDetail` | Add rating input, comment section |
| `RecipeForm` | Add tag selector |

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Tag service tests | `tests/unit/services/tag-service.test.ts` | list, create, associate, getBySlug |
| Rating service tests | `tests/unit/services/rating-service.test.ts` | upsert, recalculateAverages |
| Comment service tests | `tests/unit/services/comment-service.test.ts` | create, list (nested), update, delete |
| Rating aggregation | `tests/unit/services/rating-service.test.ts` | Verify average calculation |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Add tags to recipe | `tests/e2e/tags.spec.ts` | Create recipe with tags, verify display |
| Browse by tag | `tests/e2e/tags.spec.ts` | Filter recipes by tag |
| Rate recipe | `tests/e2e/ratings.spec.ts` | Add rating, verify average updates |
| Update rating | `tests/e2e/ratings.spec.ts` | Change rating, verify average recalculates |
| Add comment | `tests/e2e/comments.spec.ts` | Post comment, verify display |
| Reply to comment | `tests/e2e/comments.spec.ts` | Post reply, verify nesting |
| Edit comment | `tests/e2e/comments.spec.ts` | Edit own comment |
| Delete comment | `tests/e2e/comments.spec.ts` | Delete own comment |

### Edge Cases to Cover

- [ ] Tag with special characters (auto-slugify)
- [ ] Duplicate tag creation (should reuse existing)
- [ ] Rating out of range (1-5 validation)
- [ ] Comment depth limit (max 3 levels)
- [ ] Delete parent comment with replies (cascade or orphan?)
- [ ] Non-owner trying to edit/delete comment (should fail)

---

## Tasks

### Database (Architect + Engineer)
- [ ] Create `packages/db/schema/tags.ts`
- [ ] Create `packages/db/schema/recipe-tags.ts`
- [ ] Create `packages/db/schema/recipe-ratings.ts`
- [ ] Create `packages/db/schema/recipe-comments.ts`
- [ ] Update `packages/db/schema/recipes.ts` - Add averageRating, ratingCount
- [ ] Update `packages/db/schema/index.ts` - Export new schemas
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`

### API - Services (Engineer + Tester)
- [ ] Write unit tests for `tag-service` (TDD)
- [ ] Create `apps/api/src/services/tag-service.ts` - list, create, associate, getBySlug
- [ ] Write unit tests for `rating-service` (TDD)
- [ ] Create `apps/api/src/services/rating-service.ts` - upsert, recalculateAverages
- [ ] Write unit tests for `comment-service` (TDD)
- [ ] Create `apps/api/src/services/comment-service.ts` - create, list (nested), update, delete

### API - Controllers (Engineer)
- [ ] Create `apps/api/src/controllers/tag-controller.ts`
- [ ] Create `apps/api/src/controllers/rating-controller.ts`
- [ ] Create `apps/api/src/controllers/comment-controller.ts`

### API - Routes (Engineer)
- [ ] Create `apps/api/src/routes/tag-routes.ts`
- [ ] Update `recipe-routes.ts` - Add rating/comment endpoints
- [ ] Update `apps/api/src/routes/index.ts` - Add tag routes

### API - Validation (Engineer)
- [ ] Create `apps/api/src/schemas/tag-schemas.ts`
- [ ] Create `apps/api/src/schemas/rating-schemas.ts`
- [ ] Create `apps/api/src/schemas/comment-schemas.ts`

### Frontend - Components (@repo/ui) (Designer + Engineer)
- [ ] Create `@repo/ui/TagPill.tsx`
- [ ] Create `@repo/ui/RatingStars.tsx`
- [ ] Create `@repo/ui/CommentThread.tsx`

### Frontend - Components (apps/web) (Designer + Engineer + Tester)
- [ ] Write E2E tests for tags/ratings/comments (TDD)
- [ ] Create `apps/web/src/components/recipe/TagSelector.tsx`
- [ ] Create `apps/web/src/components/recipe/RatingInput.tsx`
- [ ] Create `apps/web/src/components/recipe/CommentSection.tsx`
- [ ] Update `RecipeForm.tsx` - Add tag selector
- [ ] Update `RecipeDetail.tsx` - Add rating input, comment section

### Frontend - Hooks (Engineer)
- [ ] Create `apps/web/src/hooks/useTags.ts`
- [ ] Create `apps/web/src/hooks/useRatings.ts`
- [ ] Create `apps/web/src/hooks/useComments.ts`

### Review (Reviewer)
- [ ] Code review checklist complete
- [ ] Performance review: Tag autocomplete, comment pagination
- [ ] Security review: Comment content sanitization
- [ ] No lint errors
- [ ] Types all correct

### Documentation (Documentarian)
- [ ] Add Swagger documentation for tag/rating/comment endpoints
- [ ] Add inline comments for rating aggregation logic
- [ ] Document comment nesting limits
- [ ] Mark all acceptance criteria complete

### Completion
- [ ] All tests passing (unit + E2E)
- [ ] Tags working with autocomplete
- [ ] Ratings working with average calculation
- [ ] Comments working with nesting
- [ ] Feature deployed to staging (if applicable)
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **Depends on Feature 0002**: Requires recipes table
- **Future moderation**: May need admin tools to remove inappropriate comments
- **Tag types**: Consider categorizing tags (cuisine, diet, difficulty, meal-type)
- **Comment pagination**: For recipes with 100+ comments, implement pagination

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
