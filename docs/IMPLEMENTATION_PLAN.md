'# Social Cookbook App - Implementation Plan

## Overview

Building a full-featured social cookbook app with recipe forking (Git-like lineage), groups, cookbooks, and social features. Using the existing monorepo template with React/Vite, Express, PostgreSQL/Drizzle ORM.

## Key Features

1. **Authentication** - Email/password, OAuth (Google/GitHub), passwordless magic links
2. **Recipes** - CRUD with ingredients (grouped), instructions, images, tags, ratings, comments
3. **Recipe Forking** - Full lineage tree tracking, bidirectional navigation, fork metrics
4. **Cookbooks** - Personal and group collections with privacy controls
5. **Groups** - Create/join groups, group recipes/cookbooks, member management
6. **Social** - Friends system, activity feeds, discovery

## Technical Decisions

### Authentication
- **Approach**: Build custom auth with JWT (don't use Auth.js to maintain full control)
- **Rationale**: Simpler stack, fewer dependencies, direct integration with our Drizzle schema
- **Strategy**: Three auth methods in parallel (email/password, OAuth via Passport.js, magic links)

### Image Storage
- **Service**: Cloudinary
- **Rationale**: Auto-optimization, free tier, easy integration, CDN included
- **Implementation**: Backend upload endpoint, store cloudinary_id for deletion

### Recipe Forking
- **Pattern**: Closure table (`recipe_forks`) for efficient tree queries
- **Rationale**: Query all ancestors/descendants efficiently, track depth and paths
- **Denormalization**: Cache `fork_count` on recipes table

### State Management
- **Server state**: TanStack Query (React Query) for API data caching
- **Client state**: Zustand for auth, UI state (modals, toasts)

### Design System
- **Colors**: Sage (#617061) and Terracotta (#d4674d) as primary/accent
- **Typography**: Playfair Display (serif headings) + Inter (sans-serif body)
- **Style**: Airy, nostalgic, elegant, modern with generous whitespace

## Database Schema

### Authentication Tables
- `users` (extend existing) - add username, bio, emailVerified
- `user_passwords` - password hashes (bcrypt)
- `user_sessions` - JWT session tracking
- `oauth_accounts` - OAuth provider data
- `magic_links` - passwordless auth tokens

### Recipe Tables
- `recipes` - core recipe data with privacy, forking references
- `recipe_ingredients` - ingredients with optional grouping
- `recipe_instructions` - step-by-step instructions
- `recipe_images` - Cloudinary URLs and metadata
- `recipe_forks` - closure table for lineage tracking
- `recipe_ratings` - user ratings (1-5 stars)
- `recipe_comments` - nested comments

### Organization Tables
- `tags` - recipe categorization
- `recipe_tags` - junction table
- `cookbooks` - personal and group cookbooks
- `cookbook_recipes` - junction table with order/notes

### Social Tables
- `groups` - group metadata
- `group_members` - membership with roles
- `group_invites` - invitation tokens
- `friendships` - bidirectional friend relationships
- `activity_feed` - social activity stream

## API Structure

All endpoints under `/api/v1`:

- `/auth/*` - Registration, login, logout, magic links, OAuth callbacks, session management
- `/users/:id/*` - User profiles, recipes, cookbooks, friends, activity
- `/recipes/*` - Recipe CRUD, forking, lineage, ratings, comments, images
- `/cookbooks/*` - Cookbook CRUD, add/remove recipes
- `/groups/*` - Group CRUD, members, join/leave, invites, recipes, cookbooks
- `/tags/*` - Tag listing and filtering
- `/friendships/*` - Friend requests, accept/reject
- `/feed` - Activity feeds (personal, public, group)
- `/search` - Universal search

## Implementation Phases

### Phase 1: Authentication & User Management (START HERE)

**Goal**: Users can register, login (3 methods), view/edit profiles

#### Database (packages/db/schema/)
1. **users.ts** (MODIFY) - Add username, bio, emailVerified fields
2. **user-passwords.ts** (NEW) - Password hashes table
3. **user-sessions.ts** (NEW) - Session tracking
4. **oauth-accounts.ts** (NEW) - OAuth provider links
5. **magic-links.ts** (NEW) - Magic link tokens
6. **index.ts** (UPDATE) - Export new schemas

#### Backend (apps/api/src/)

**Utilities & Config**
- `lib/auth.ts` (NEW) - hashPassword, verifyPassword, generateJWT, verifyJWT
- `lib/email.ts` (NEW) - sendMagicLink, sendWelcomeEmail (Nodemailer/Resend)
- `.env.example` (UPDATE) - Add JWT_SECRET, EMAIL_*, OAUTH_* vars

**Services**
- `services/auth-service.ts` (NEW) - register, login, createMagicLink, verifyMagicLink, createSession, refreshSession
- `services/user-service.ts` (NEW) - getById, getByEmail, getByUsername, update, delete
- `services/oauth-service.ts` (NEW) - handleOAuthCallback, linkOAuthAccount

**Middleware**
- `middleware/auth-middleware.ts` (NEW) - requireAuth, optionalAuth (JWT verification)

**Validation Schemas**
- `schemas/auth-schemas.ts` (NEW) - registerSchema, loginSchema, magicLinkSchema, updateProfileSchema

**Controllers**
- `controllers/auth-controller.ts` (NEW) - register, login, logout, requestMagicLink, verifyMagicLink, getSession, refreshToken
- `controllers/user-controller.ts` (NEW) - getProfile, updateProfile, getUserRecipes, getUserCookbooks

**Routes**
- `routes/auth-routes.ts` (NEW) - Mount auth endpoints
- `routes/user-routes.ts` (NEW) - Mount user endpoints
- `routes/index.ts` (UPDATE) - Add auth and user routes

#### Frontend (apps/web/src/)

**State & API**
- `stores/auth-store.ts` (NEW) - Zustand: user, token, setUser, setToken, logout (persist to localStorage)
- `lib/api-client.ts` (NEW) - Axios instance with baseURL, token interceptor, error handling
- `hooks/useAuth.ts` (NEW) - login, register, logout, requestMagicLink, getSession

**Components**
- `components/auth/LoginForm.tsx` (NEW) - Email/password login
- `components/auth/RegisterForm.tsx` (NEW) - Registration form
- `components/auth/MagicLinkForm.tsx` (NEW) - Magic link request
- `components/auth/OAuthButtons.tsx` (NEW) - Google/GitHub OAuth buttons
- `components/layout/NavigationBar.tsx` (NEW) - Main nav with auth state

**Pages**
- `pages/LoginPage.tsx` (NEW) - Tabbed auth (email/password, magic link, OAuth)
- `pages/RegisterPage.tsx` (NEW) - Registration
- `pages/ProfilePage.tsx` (NEW) - View user profile (fetch by username)
- `pages/SettingsPage.tsx` (NEW) - Edit profile form
- `App.tsx` (UPDATE) - Add routes, TanStack Query provider
- `main.tsx` (UPDATE) - Set up TanStack Query client

#### Testing (tests/)
- `unit/auth-service.test.ts` (NEW) - Test auth service methods
- `unit/user-service.test.ts` (NEW) - Test user service
- `e2e/auth.spec.ts` (NEW) - Registration, login, magic link, OAuth flows

#### Dependencies
- Backend: `jsonwebtoken`, `bcrypt`, `nodemailer` (or `resend`), `passport`, `passport-google-oauth20`, `passport-github2`
- Frontend: `@tanstack/react-query`, `zustand`, `axios`

**Migration**: Run `npm run db:generate && npm run db:migrate` after schema changes

---

### Phase 2: Recipe Core

**Goal**: Users can create, view, edit, delete recipes with ingredients (grouped), instructions, images

#### Database
- `recipes.ts` - Core recipe table (title, description, privacy, times, servings, forkedFromId, groupId)
- `recipe-ingredients.ts` - Ingredients with groupName, groupOrder
- `recipe-instructions.ts` - Numbered steps with optional images
- `recipe-images.ts` - Cloudinary URLs with cloudinaryId

#### Backend
- Configure Cloudinary SDK
- `services/recipe-service.ts` - CRUD, privacy checks
- `services/image-service.ts` - Upload to Cloudinary, delete
- `controllers/recipe-controller.ts` - list, create, getById, update, delete
- `controllers/image-controller.ts` - uploadImage, deleteImage
- `routes/recipe-routes.ts` - Mount endpoints
- `schemas/recipe-schemas.ts` - Zod validation

#### Frontend
- `@repo/ui`: RecipeCard, RecipeGrid, IngredientList, InstructionSteps
- `components/recipe/RecipeForm.tsx` - Multi-step form (details, ingredients, instructions, images)
- `components/recipe/IngredientInput.tsx` - Dynamic input with grouping
- `components/recipe/RecipeDetail.tsx` - Display full recipe
- `hooks/useRecipes.ts` - TanStack Query hooks
- `hooks/useImageUpload.ts` - Cloudinary upload
- `pages/RecipesPage.tsx` - Browse recipes
- `pages/RecipeDetailPage.tsx` - Single recipe
- `pages/CreateRecipePage.tsx` - Create new
- `pages/EditRecipePage.tsx` - Edit existing

---

### Phase 3: Recipe Forking System

**Goal**: Users can fork recipes, view lineage trees, see fork metrics

#### Database
- `recipe-forks.ts` - Closure table (ancestorId, descendantId, depth, pathIds)

#### Backend
- `services/fork-service.ts` - createFork, getAncestors, getDescendants, getForkTree
- Update `recipe-service.ts` - Increment forkCount on parent
- `controllers/fork-controller.ts` - fork, getForks, getLineage, getAncestors
- Update `routes/recipe-routes.ts` - Add fork endpoints

#### Frontend
- `@repo/ui`: ForkTree component (SVG tree visualization)
- `components/recipe/ForkButton.tsx` - Fork action
- `pages/ForkRecipePage.tsx` - Pre-fill form with parent recipe
- Update RecipeDetail to show lineage

---

### Phase 4: Tags, Ratings, Comments

**Goal**: Users can tag recipes, rate, comment

#### Database
- `tags.ts` - Tag definitions (name, slug, type, usageCount)
- `recipe-tags.ts` - Junction table
- `recipe-ratings.ts` - User ratings (1-5 stars, unique per user/recipe)
- `recipe-comments.ts` - Nested comments (parentCommentId)

#### Backend
- `services/tag-service.ts` - list, create, associate
- `services/rating-service.ts` - upsert rating, recalculate averages
- `services/comment-service.ts` - create, list (nested), update, delete
- Controllers + routes for each

#### Frontend
- `@repo/ui`: TagPill, RatingStars, CommentThread
- `components/recipe/TagSelector.tsx` - Autocomplete tag input
- `components/recipe/RatingInput.tsx` - Star rating widget
- `components/recipe/CommentSection.tsx` - Display and add comments
- Update RecipeForm to include tags
- Update RecipeDetail to show ratings/comments

---

### Phase 5: Cookbooks

**Goal**: Users can create cookbooks, add recipes, set privacy

#### Database
- `cookbooks.ts` - Cookbook metadata (userId, groupId, title, description, privacy)
- `cookbook-recipes.ts` - Junction with order, notes

#### Backend
- `services/cookbook-service.ts` - CRUD, privacy checks, add/remove recipes
- `controllers/cookbook-controller.ts`
- `routes/cookbook-routes.ts`
- `schemas/cookbook-schemas.ts`

#### Frontend
- `@repo/ui`: CookbookCard
- `components/cookbook/CookbookForm.tsx`
- `components/cookbook/CookbookDetail.tsx`
- `components/cookbook/AddRecipeToCookbook.tsx` - Modal to select cookbook
- `hooks/useCookbooks.ts`
- `pages/CookbooksPage.tsx`
- `pages/CookbookDetailPage.tsx`

---

### Phase 6: Groups

**Goal**: Users can create groups, invite members, create group recipes/cookbooks

#### Database
- `groups.ts` - Group metadata (name, slug, description, privacy)
- `group-members.ts` - Membership with roles (owner, admin, member)
- `group-invites.ts` - Invitation tokens

#### Backend
- `services/group-service.ts` - CRUD, join/leave, invite, role management
- `controllers/group-controller.ts`
- `routes/group-routes.ts`
- `schemas/group-schemas.ts`

#### Frontend
- `components/group/GroupCard.tsx`
- `components/group/GroupForm.tsx`
- `components/group/GroupDetail.tsx`
- `components/group/MemberList.tsx`
- `components/group/GroupInvite.tsx`
- `hooks/useGroups.ts`
- `pages/GroupsPage.tsx`
- `pages/GroupDetailPage.tsx`
- Update RecipeForm/CookbookForm to support group context

---

### Phase 7: Social Features

**Goal**: Friends system, activity feeds, discovery

#### Database
- `friendships.ts` - Bidirectional relationships (userId, friendId, status)
- `activity-feed.ts` - Activity stream (userId, activityType, entityType, entityId, metadata)

#### Backend
- `services/friendship-service.ts` - sendRequest, acceptRequest, rejectRequest, removeFriend
- `services/activity-service.ts` - createActivity, getFeed (personal, public, group)
- Controllers + routes

#### Frontend
- `@repo/ui`: ActivityFeedItem, UserCard
- `components/social/ActivityFeed.tsx`
- `components/social/FriendList.tsx`
- `components/social/FriendRequest.tsx`
- `hooks/useFriends.ts`
- `hooks/useActivityFeed.ts`
- `pages/FeedPage.tsx`
- `pages/FriendsPage.tsx`
- `pages/SearchPage.tsx`

---

### Phase 8: Polish & Testing

**Goal**: Production-ready app

- Design system refinement (sage/terracotta colors, Playfair Display + Inter fonts)
- Update Tailwind config with custom colors
- Performance optimization (indexes, caching, pagination)
- Comprehensive E2E test suite (Playwright)
- Security audit (permissions, input validation, rate limiting)
- Error handling and user feedback
- SEO and meta tags
- Accessibility audit

---

## Critical Files (Phase 1 - Start Here)

### Must Create (Backend)
1. `/Users/stephenxia/repos/social-cookbook4/packages/db/schema/user-passwords.ts`
2. `/Users/stephenxia/repos/social-cookbook4/packages/db/schema/user-sessions.ts`
3. `/Users/stephenxia/repos/social-cookbook4/packages/db/schema/oauth-accounts.ts`
4. `/Users/stephenxia/repos/social-cookbook4/packages/db/schema/magic-links.ts`
5. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/lib/auth.ts`
6. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/lib/email.ts`
7. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/services/auth-service.ts`
8. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/services/user-service.ts`
9. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/middleware/auth-middleware.ts`
10. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/controllers/auth-controller.ts`
11. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/routes/auth-routes.ts`

### Must Modify (Backend)
1. `/Users/stephenxia/repos/social-cookbook4/packages/db/schema/users.ts` - Add username, bio, emailVerified
2. `/Users/stephenxia/repos/social-cookbook4/packages/db/schema/index.ts` - Export new schemas
3. `/Users/stephenxia/repos/social-cookbook4/apps/api/src/routes/index.ts` - Mount auth/user routes

### Must Create (Frontend)
1. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/stores/auth-store.ts`
2. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/lib/api-client.ts`
3. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/hooks/useAuth.ts`
4. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/components/auth/LoginForm.tsx`
5. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/components/layout/NavigationBar.tsx`
6. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/pages/LoginPage.tsx`

### Must Modify (Frontend)
1. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/App.tsx` - Add routes
2. `/Users/stephenxia/repos/social-cookbook4/apps/web/src/main.tsx` - TanStack Query setup

---

## Architectural Constraints (From ARCHITECTURE.md)

- ✅ Test-first development (Vitest + Playwright)
- ✅ Zod validation on all API boundaries
- ✅ Named exports (no defaults)
- ✅ Explicit typing (no `any`)
- ✅ Migrations for schema changes
- ✅ Business logic in services, not controllers
- ✅ Drizzle ORM only (no raw SQL)
- ✅ Shared components in @repo/ui
- ✅ Conventional commits

---

## Design System Quick Reference

**Colors**:
- Primary (Sage): `#617061` (sage-500)
- Accent (Terracotta): `#d4674d` (terracotta-500)

**Fonts**:
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)
- Monospace: JetBrains Mono

**Style Keywords**: Airy, nostalgic, elegant, modern, generous whitespace, soft shadows, rounded corners (6-8px)

---

## Next Steps

1. Install dependencies (jsonwebtoken, bcrypt, nodemailer, passport, @tanstack/react-query, zustand, axios)
2. Create Phase 1 database schemas
3. Generate and run migration
4. Implement backend auth services
5. Build frontend auth UI
6. Test all 3 auth flows
7. Move to Phase 2 (Recipes)
