# Feature 0007: Social Features

## Status

**Current**: 🔵 Planning

**Started**: (pending)
**Completed**: (pending)

---

## Overview

Implement social features including friends system, activity feeds, and discovery. Users can send/accept friend requests, view activity from friends, discover new recipes and users, and follow social interactions within the platform.

---

## User Stories

- [ ] As a user, I want to send friend requests so that I can connect with others
- [ ] As a user, I want to accept/decline friend requests so that I control my connections
- [ ] As a user, I want to view my friends list so that I can see my connections
- [ ] As a user, I want to see an activity feed so that I can discover what my friends are cooking
- [ ] As a user, I want to see a public feed so that I can discover popular recipes
- [ ] As a user, I want to search for users so that I can find people to connect with
- [ ] As a user, I want to search for recipes so that I can discover new cooking ideas

---

## Acceptance Criteria

- [ ] User can send a friend request to another user
- [ ] User receives notifications for friend requests
- [ ] User can accept or decline friend requests
- [ ] User can view their friends list
- [ ] User can remove a friend
- [ ] User can view personalized activity feed (friends' activities)
- [ ] User can view public activity feed (all public activities)
- [ ] Group members can view group activity feed
- [ ] Activity feed shows: new recipes, recipe forks, comments, ratings
- [ ] User can search for other users by username or name
- [ ] User can search for recipes by title, tags, or ingredients
- [ ] Search supports pagination and filtering

---

## Personas Involved

- [x] 🏗️ Architect - Friendship model, activity feed aggregation, search indexing
- [x] 🎨 Designer - Friend list UI, activity feed cards, search interface
- [x] ⚙️ Engineer - Friendship logic, activity tracking, search implementation
- [x] 🧪 Tester - Unit tests for friendship, E2E social flows
- [x] 🔍 Reviewer - Privacy in activity feeds, search performance
- [x] 📚 Documentarian - API docs for social features

---

## Technical Approach

### Architecture Decisions

1. **Bidirectional Friendship Model**
   - **Rationale**: Friendships are symmetric (mutual)
   - **Implementation**: `friendships` table with `status` (pending, accepted, rejected), create both directions on accept

2. **Activity Feed Table**
   - **Rationale**: Denormalize activities for efficient feed queries
   - **Implementation**: `activity_feed` table captures events (recipe created, comment added, etc.)

3. **Search Strategy**
   - **Rationale**: Start with database ILIKE queries, upgrade to full-text search later
   - **Implementation**: PostgreSQL `ILIKE` on title/tags/ingredients, consider pg_trgm extension

### Dependencies

- Existing `users`, `recipes`, `comments`, `ratings` tables
- Future: Consider Elasticsearch/Algolia for advanced search

---

## Data Model Changes

### New Tables

```typescript
// packages/db/schema/friendships.ts
export const friendships = pgTable('friendships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  friendId: uuid('friend_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserFriend: unique().on(table.userId, table.friendId),
}));
```

```typescript
// packages/db/schema/activity-feed.ts
export const activityFeed = pgTable('activity_feed', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  activityType: varchar('activity_type', { length: 50 }).notNull(), // 'recipe_created', 'recipe_forked', 'comment_added', 'rating_added'
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'recipe', 'comment', 'rating'
  entityId: uuid('entity_id').notNull(),
  metadata: jsonb('metadata'), // additional context (recipe title, comment text preview, etc.)
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Migrations Required

- [ ] Migration 1: Create `friendships` table
- [ ] Migration 2: Create `activity_feed` table

**Run migration:**
```bash
npm run db:generate && npm run db:migrate
```

---

## API Endpoints

### Friendships

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/friendships` | Send friend request |
| GET | `/api/v1/friendships` | List friends (accepted) |
| GET | `/api/v1/friendships/requests` | List pending requests |
| PATCH | `/api/v1/friendships/:id` | Accept/reject request |
| DELETE | `/api/v1/friendships/:id` | Remove friend |

### Activity Feeds

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/feed` | Personal feed (friends' activities) |
| GET | `/api/v1/feed/public` | Public feed (all public activities) |
| GET | `/api/v1/feed/group/:groupId` | Group activity feed |

### Search

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/search` | Universal search (recipes + users) |
| GET | `/api/v1/search/recipes` | Search recipes only |
| GET | `/api/v1/search/users` | Search users only |

### Request/Response Examples

```typescript
// POST /api/v1/friendships
// Request
{
  "friendId": "user-uuid"
}

// Response
{
  "success": true,
  "data": {
    "id": "friendship-uuid",
    "userId": "current-user-uuid",
    "friendId": "user-uuid",
    "status": "pending",
    "createdAt": "2025-12-05T00:00:00Z"
  }
}
```

```typescript
// GET /api/v1/feed?page=1&limit=20
// Response
{
  "success": true,
  "data": [
    {
      "id": "activity-uuid",
      "userId": "friend-uuid",
      "user": { "username": "jane", "name": "Jane Doe" },
      "activityType": "recipe_created",
      "entityType": "recipe",
      "entityId": "recipe-uuid",
      "metadata": {
        "recipeTitle": "Chocolate Chip Cookies",
        "recipeImageUrl": "https://..."
      },
      "createdAt": "2025-12-05T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

```typescript
// GET /api/v1/search?q=pizza&type=recipes&page=1&limit=20
// Response
{
  "success": true,
  "data": {
    "recipes": [ /* recipe objects */ ],
    "users": [] // empty if type=recipes
  },
  "pagination": { /* ... */ }
}
```

---

## UI Components

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ActivityFeedItem` | `@repo/ui` | Single activity card |
| `ActivityFeed` | `apps/web/src/components/social/` | Feed container |
| `UserCard` | `@repo/ui` | User summary card |
| `FriendList` | `apps/web/src/components/social/` | List of friends |
| `FriendRequest` | `apps/web/src/components/social/` | Friend request card (accept/decline) |
| `SearchBar` | `apps/web/src/components/layout/` | Global search input |

### New Pages

| Page | Location | Description |
|------|----------|-------------|
| `FeedPage` | `apps/web/src/pages/` | Personal activity feed |
| `FriendsPage` | `apps/web/src/pages/` | Friends list + pending requests |
| `SearchPage` | `apps/web/src/pages/` | Search results (recipes + users) |

### New Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useFriends` | `apps/web/src/hooks/` | TanStack Query: send, accept, reject, list |
| `useActivityFeed` | `apps/web/src/hooks/` | TanStack Query: fetch feed with pagination |
| `useSearch` | `apps/web/src/hooks/` | TanStack Query: search recipes/users |

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Friendship service tests | `tests/unit/services/friendship-service.test.ts` | sendRequest, acceptRequest, rejectRequest, removeFriend |
| Activity service tests | `tests/unit/services/activity-service.test.ts` | createActivity, getFeed (personal, public, group) |
| Search service tests | `tests/unit/services/search-service.test.ts` | searchRecipes, searchUsers |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Send friend request | `tests/e2e/friendship.spec.ts` | Send request, verify pending status |
| Accept friend request | `tests/e2e/friendship.spec.ts` | Accept request, verify friends list |
| View activity feed | `tests/e2e/feed.spec.ts` | View personal feed, verify activities |
| Search recipes | `tests/e2e/search.spec.ts` | Search by keyword, verify results |
| Search users | `tests/e2e/search.spec.ts` | Search by username, verify results |

### Edge Cases to Cover

- [ ] Send friend request to same user twice (should fail)
- [ ] Accept already-accepted request (idempotent)
- [ ] Activity feed pagination
- [ ] Search with no results
- [ ] Search with special characters

---

## Tasks

### Database (Architect + Engineer)
- [ ] Create `packages/db/schema/friendships.ts`
- [ ] Create `packages/db/schema/activity-feed.ts`
- [ ] Update `packages/db/schema/index.ts`
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`

### API (Engineer + Tester)
- [ ] Create `apps/api/src/services/friendship-service.ts`
- [ ] Create `apps/api/src/services/activity-service.ts`
- [ ] Create `apps/api/src/services/search-service.ts`
- [ ] Create `apps/api/src/controllers/friendship-controller.ts`
- [ ] Create `apps/api/src/controllers/feed-controller.ts`
- [ ] Create `apps/api/src/controllers/search-controller.ts`
- [ ] Create `apps/api/src/routes/friendship-routes.ts`
- [ ] Create `apps/api/src/routes/feed-routes.ts`
- [ ] Create `apps/api/src/routes/search-routes.ts`

### Frontend (Designer + Engineer + Tester)
- [ ] Create `@repo/ui/ActivityFeedItem.tsx`
- [ ] Create `@repo/ui/UserCard.tsx`
- [ ] Create `apps/web/src/components/social/ActivityFeed.tsx`
- [ ] Create `apps/web/src/components/social/FriendList.tsx`
- [ ] Create `apps/web/src/components/social/FriendRequest.tsx`
- [ ] Create `apps/web/src/components/layout/SearchBar.tsx`
- [ ] Create `apps/web/src/hooks/useFriends.ts`
- [ ] Create `apps/web/src/hooks/useActivityFeed.ts`
- [ ] Create `apps/web/src/hooks/useSearch.ts`
- [ ] Create `apps/web/src/pages/FeedPage.tsx`
- [ ] Create `apps/web/src/pages/FriendsPage.tsx`
- [ ] Create `apps/web/src/pages/SearchPage.tsx`

### Completion
- [ ] All tests passing
- [ ] Friendship system working
- [ ] Activity feeds working
- [ ] Search working
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **Depends on Features 0001, 0002**: Requires users and recipes
- **Activity tracking**: Trigger activity creation on recipe/comment/rating events
- **Future**: Real-time updates via WebSockets for live feed

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
