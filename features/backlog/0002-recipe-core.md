# Feature 0002: Recipe Core

## Status

**Current**: 🔵 Planning

**Started**: (pending)
**Completed**: (pending)

---

## Overview

Implement core recipe CRUD operations with support for ingredients (grouped), step-by-step instructions, images via Cloudinary, and privacy controls. This feature enables users to create, view, edit, and delete recipes - the central entity of the Social Cookbook app.

---

## User Stories

- [ ] As a user, I want to create a new recipe so that I can share my cooking knowledge
- [ ] As a user, I want to add grouped ingredients so that I can organize recipe components (e.g., "For the sauce", "For the dough")
- [ ] As a user, I want to add step-by-step instructions so that others can follow my recipe
- [ ] As a user, I want to upload recipe images so that my recipe is visually appealing
- [ ] As a user, I want to set privacy levels (public/private/friends-only) so that I can control who sees my recipes
- [ ] As a user, I want to view a recipe detail page so that I can see all recipe information
- [ ] As a user, I want to edit my recipes so that I can update them over time
- [ ] As a user, I want to delete my recipes so that I can remove recipes I no longer want to share
- [ ] As a user, I want to browse recipes so that I can discover new cooking ideas

---

## Acceptance Criteria

- [ ] User can create a recipe with title, description, servings, prep time, cook time
- [ ] User can add ingredients with optional grouping (group name + group order)
- [ ] User can add numbered instructions with optional inline images
- [ ] User can upload images to Cloudinary (recipe cover + instruction images)
- [ ] User can set recipe privacy (public, private, friends-only)
- [ ] User can view recipe detail page with all information
- [ ] User can edit their own recipes
- [ ] User can delete their own recipes
- [ ] Recipe images are deleted from Cloudinary when recipe is deleted
- [ ] Browse page shows paginated list of recipes (respecting privacy)
- [ ] Only recipe owner can edit/delete their recipes

---

## Personas Involved

- [x] 🏗️ Architect - Database schema, Cloudinary integration
- [x] 🎨 Designer - Recipe card, detail page, form UI
- [x] ⚙️ Engineer - Recipe CRUD, image upload, privacy logic
- [x] 🧪 Tester - Unit tests, E2E recipe flows
- [x] 🔍 Reviewer - Privacy checks, image handling security
- [x] 📚 Documentarian - API docs, recipe schema docs

---

## Technical Approach

### Architecture Decisions

1. **Cloudinary for Image Storage**
   - **Rationale**: Auto-optimization, free tier (25GB storage, 25GB/month bandwidth), CDN included, easy integration
   - **Implementation**: Backend upload endpoint, store `cloudinaryId` for deletion, return optimized URLs

2. **Grouped Ingredients Pattern**
   - **Rationale**: Allow optional grouping (e.g., "For the crust", "For the filling") for complex recipes
   - **Implementation**: `groupName` (nullable) + `groupOrder` fields in `recipe_ingredients` table

3. **Privacy Levels**
   - **Rationale**: Users need control over recipe visibility
   - **Implementation**: Enum column (`public`, `private`, `friends_only`), checked in service layer

4. **Separate Tables for Ingredients/Instructions**
   - **Rationale**: Maintain order, allow future extensions (ingredient notes, instruction timing)
   - **Implementation**: Foreign key to `recipes.id`, `order` column for sequencing

### Dependencies

**Backend:**
- `cloudinary` - Image upload and management
- `multer` - File upload middleware (in-memory storage)

**Frontend:**
- Existing `@tanstack/react-query` for API calls
- `react-dropzone` - File upload UI (optional)

---

## Data Model Changes

### New Tables

```typescript
// packages/db/schema/recipes.ts
export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  servings: integer('servings'),
  prepTime: integer('prep_time'), // minutes
  cookTime: integer('cook_time'), // minutes
  privacy: varchar('privacy', { length: 20 }).notNull().default('public'), // 'public', 'private', 'friends_only'
  forkedFromId: uuid('forked_from_id').references(() => recipes.id), // for future forking feature
  groupId: uuid('group_id'), // for future groups feature
  forkCount: integer('fork_count').notNull().default(0), // denormalized count
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/recipe-ingredients.ts
export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  groupName: varchar('group_name', { length: 100 }), // e.g., "For the sauce"
  groupOrder: integer('group_order').notNull().default(0), // order of groups
  ingredient: text('ingredient').notNull(), // e.g., "2 cups flour"
  order: integer('order').notNull(), // order within group
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/recipe-instructions.ts
export const recipeInstructions = pgTable('recipe_instructions', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  step: integer('step').notNull(), // step number (1, 2, 3...)
  instruction: text('instruction').notNull(),
  imageUrl: varchar('image_url', { length: 500 }), // optional inline image
  cloudinaryId: varchar('cloudinary_id', { length: 255 }), // for deletion
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/recipe-images.ts
export const recipeImages = pgTable('recipe_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  cloudinaryId: varchar('cloudinary_id', { length: 255 }).notNull(), // for deletion
  order: integer('order').notNull().default(0), // image order (cover is 0)
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Migrations Required

- [ ] Migration 1: Create `recipes` table
- [ ] Migration 2: Create `recipe_ingredients` table
- [ ] Migration 3: Create `recipe_instructions` table
- [ ] Migration 4: Create `recipe_images` table

**Run migration:**
```bash
npm run db:generate && npm run db:migrate
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/recipes` | List recipes (paginated, respects privacy) |
| POST | `/api/v1/recipes` | Create new recipe |
| GET | `/api/v1/recipes/:id` | Get recipe by ID (with privacy check) |
| PATCH | `/api/v1/recipes/:id` | Update recipe (owner only) |
| DELETE | `/api/v1/recipes/:id` | Delete recipe (owner only) |
| POST | `/api/v1/recipes/images/upload` | Upload image to Cloudinary |
| DELETE | `/api/v1/recipes/images/:cloudinaryId` | Delete image from Cloudinary |

### Request/Response Examples

```typescript
// POST /api/v1/recipes
// Request
{
  "title": "Homemade Pizza",
  "description": "Classic Neapolitan-style pizza",
  "servings": 4,
  "prepTime": 30,
  "cookTime": 15,
  "privacy": "public",
  "ingredients": [
    {
      "groupName": "For the dough",
      "groupOrder": 0,
      "items": [
        { "ingredient": "3 cups all-purpose flour", "order": 0 },
        { "ingredient": "1 cup warm water", "order": 1 }
      ]
    },
    {
      "groupName": "For the sauce",
      "groupOrder": 1,
      "items": [
        { "ingredient": "1 can crushed tomatoes", "order": 0 }
      ]
    }
  ],
  "instructions": [
    { "step": 1, "instruction": "Mix flour and water", "imageUrl": null },
    { "step": 2, "instruction": "Knead dough for 10 minutes", "imageUrl": null }
  ],
  "images": [
    { "url": "https://res.cloudinary.com/...", "cloudinaryId": "abc123", "order": 0 }
  ]
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "title": "Homemade Pizza",
    "description": "Classic Neapolitan-style pizza",
    "servings": 4,
    "prepTime": 30,
    "cookTime": 15,
    "privacy": "public",
    "ingredients": [ /* grouped ingredients */ ],
    "instructions": [ /* ordered instructions */ ],
    "images": [ /* ordered images */ ],
    "createdAt": "2025-12-05T00:00:00Z",
    "updatedAt": "2025-12-05T00:00:00Z"
  }
}
```

```typescript
// GET /api/v1/recipes?page=1&limit=20
// Response
{
  "success": true,
  "data": [
    { /* recipe object */ },
    { /* recipe object */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## UI Components

### New Components (@repo/ui or apps/web/src/components/recipe/)

| Component | Location | Description |
|-----------|----------|-------------|
| `RecipeCard` | `@repo/ui` | Card showing recipe summary (image, title, author) |
| `RecipeGrid` | `@repo/ui` | Grid layout for recipe cards |
| `IngredientList` | `@repo/ui` | Display grouped ingredients |
| `InstructionSteps` | `@repo/ui` | Display numbered instructions |
| `RecipeForm` | `apps/web/src/components/recipe/` | Multi-step form (details, ingredients, instructions, images) |
| `IngredientInput` | `apps/web/src/components/recipe/` | Dynamic input with grouping |
| `RecipeDetail` | `apps/web/src/components/recipe/` | Full recipe display |

### New Pages

| Page | Location | Description |
|------|----------|-------------|
| `RecipesPage` | `apps/web/src/pages/` | Browse recipes (grid view) |
| `RecipeDetailPage` | `apps/web/src/pages/` | Single recipe detail view |
| `CreateRecipePage` | `apps/web/src/pages/` | Create new recipe form |
| `EditRecipePage` | `apps/web/src/pages/` | Edit existing recipe form |

### New Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useRecipes` | `apps/web/src/hooks/` | TanStack Query: list, getById, create, update, delete |
| `useImageUpload` | `apps/web/src/hooks/` | Upload image to Cloudinary endpoint |

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Recipe service tests | `tests/unit/services/recipe-service.test.ts` | CRUD operations, privacy checks |
| Image service tests | `tests/unit/services/image-service.test.ts` | Upload to Cloudinary, delete |
| Validation tests | `tests/unit/schemas/recipe-schemas.test.ts` | Request validation (Zod) |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Create recipe flow | `tests/e2e/recipe.spec.ts` | Complete recipe creation with all fields |
| View recipe detail | `tests/e2e/recipe.spec.ts` | View public recipe |
| Edit recipe flow | `tests/e2e/recipe.spec.ts` | Edit recipe as owner |
| Delete recipe | `tests/e2e/recipe.spec.ts` | Delete recipe as owner |
| Privacy checks | `tests/e2e/recipe.spec.ts` | Private recipe not visible to others |
| Image upload | `tests/e2e/recipe.spec.ts` | Upload and display recipe images |

### Edge Cases to Cover

- [ ] Recipe without ingredients
- [ ] Recipe without instructions
- [ ] Recipe without images
- [ ] Non-owner trying to edit recipe (should fail)
- [ ] Non-owner trying to delete recipe (should fail)
- [ ] Viewing private recipe as non-owner (should fail)
- [ ] Image upload failure handling
- [ ] Cloudinary quota exceeded
- [ ] Large recipe with 50+ ingredients
- [ ] Large recipe with 30+ steps

---

## Tasks

### Setup
- [ ] Install Cloudinary dependencies: `npm install cloudinary multer`
- [ ] Install types: `npm install -D @types/multer`
- [ ] Add Cloudinary config to `.env.example` (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)

### Database (Architect + Engineer)
- [ ] Create `packages/db/schema/recipes.ts`
- [ ] Create `packages/db/schema/recipe-ingredients.ts`
- [ ] Create `packages/db/schema/recipe-instructions.ts`
- [ ] Create `packages/db/schema/recipe-images.ts`
- [ ] Update `packages/db/schema/index.ts` - Export new schemas
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`
- [ ] Add seed data for recipes (optional)

### API - Utilities & Config (Engineer)
- [ ] Configure Cloudinary SDK in `apps/api/src/lib/cloudinary-config.ts`
- [ ] Configure multer middleware in `apps/api/src/middleware/upload-middleware.ts`

### API - Validation Schemas (Engineer)
- [ ] Create `apps/api/src/schemas/recipe-schemas.ts` - createRecipeSchema, updateRecipeSchema

### API - Services (Engineer + Tester)
- [ ] Write unit tests for `recipe-service` (TDD)
- [ ] Create `apps/api/src/services/recipe-service.ts` - list, create, getById, update, delete, checkPrivacy
- [ ] Write unit tests for `image-service` (TDD)
- [ ] Create `apps/api/src/services/image-service.ts` - uploadToCloudinary, deleteFromCloudinary

### API - Controllers (Engineer)
- [ ] Create `apps/api/src/controllers/recipe-controller.ts` - list, create, getById, update, delete
- [ ] Create `apps/api/src/controllers/image-controller.ts` - uploadImage, deleteImage

### API - Routes (Engineer)
- [ ] Create `apps/api/src/routes/recipe-routes.ts` - Mount recipe endpoints
- [ ] Update `apps/api/src/routes/index.ts` - Add recipe routes

### Frontend - Components (@repo/ui) (Designer + Engineer + Tester)
- [ ] Create `@repo/ui/RecipeCard.tsx`
- [ ] Create `@repo/ui/RecipeGrid.tsx`
- [ ] Create `@repo/ui/IngredientList.tsx`
- [ ] Create `@repo/ui/InstructionSteps.tsx`

### Frontend - Components (apps/web) (Designer + Engineer)
- [ ] Create `apps/web/src/components/recipe/RecipeForm.tsx` - Multi-step form
- [ ] Create `apps/web/src/components/recipe/IngredientInput.tsx` - Dynamic grouping
- [ ] Create `apps/web/src/components/recipe/RecipeDetail.tsx` - Full display

### Frontend - Hooks (Engineer)
- [ ] Create `apps/web/src/hooks/useRecipes.ts` - TanStack Query hooks
- [ ] Create `apps/web/src/hooks/useImageUpload.ts` - Cloudinary upload

### Frontend - Pages (Designer + Engineer + Tester)
- [ ] Write E2E tests for recipe flows (TDD)
- [ ] Create `apps/web/src/pages/RecipesPage.tsx` - Browse recipes
- [ ] Create `apps/web/src/pages/RecipeDetailPage.tsx` - Single recipe
- [ ] Create `apps/web/src/pages/CreateRecipePage.tsx` - Create form
- [ ] Create `apps/web/src/pages/EditRecipePage.tsx` - Edit form
- [ ] Update `apps/web/src/App.tsx` - Add routes

### Review (Reviewer)
- [ ] Security review: Privacy checks, image upload validation
- [ ] Code review checklist complete
- [ ] Performance review: Pagination, image optimization
- [ ] No lint errors
- [ ] Types all correct

### Documentation (Documentarian)
- [ ] Add Swagger documentation for all endpoints
- [ ] Add inline comments for privacy logic
- [ ] Document Cloudinary integration
- [ ] Update ARCHITECTURE.md if patterns changed
- [ ] Mark all acceptance criteria complete

### Completion
- [ ] All tests passing (unit + E2E)
- [ ] Recipe CRUD working
- [ ] Image upload/delete working
- [ ] Privacy controls working
- [ ] Feature deployed to staging (if applicable)
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **Depends on Feature 0001**: Requires authentication for user ownership checks
- **Cloudinary setup**: Requires account creation and API credentials
- **Privacy**: Default to `public` but allow users to change
- **Forking references**: `forkedFromId` and `groupId` columns are placeholders for future features (0003, 0006)

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
