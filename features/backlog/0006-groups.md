# Feature 0006: Groups

## Status

**Current**: 🔵 Planning

**Started**: (pending)
**Completed**: (pending)

---

## Overview

Enable users to create and join groups for collaborative recipe sharing. Groups support member roles (owner, admin, member), privacy settings, invitations, and group-specific recipes and cookbooks.

---

## User Stories

- [ ] As a user, I want to create a group so that I can collaborate with others
- [ ] As a group owner, I want to invite members so that others can join
- [ ] As a user, I want to join a group via invitation so that I can participate
- [ ] As a group member, I want to share recipes with my group so that we can build a shared collection
- [ ] As a group admin, I want to manage members so that I can control group membership
- [ ] As a group owner, I want to set group privacy so that I can control discoverability

---

## Acceptance Criteria

- [ ] User can create a group with name, slug, description, and privacy
- [ ] Group owner can invite members via email or shareable link
- [ ] User can accept/decline group invitations
- [ ] Group members can create group recipes (visible to all members)
- [ ] Group members can create group cookbooks
- [ ] Group admin can promote/demote members
- [ ] Group owner can delete the group
- [ ] Group directory shows public groups for discovery
- [ ] Group detail page shows members and group recipes

---

## Personas Involved

- [x] 🏗️ Architect - Group schema, invitation system, role-based permissions
- [x] 🎨 Designer - Group card, member list, invite UI
- [x] ⚙️ Engineer - Group CRUD, invitation logic, permission checks
- [x] 🧪 Tester - Unit tests for permissions, E2E group flows
- [x] 🔍 Reviewer - Permission model security
- [x] 📚 Documentarian - API docs for groups

---

## Technical Approach

### Architecture Decisions

1. **Role-Based Permissions**
   - **Rationale**: Support hierarchical permissions (owner > admin > member)
   - **Implementation**: `role` enum column on `group_members` table

2. **Invitation Tokens**
   - **Rationale**: Support both email invites and shareable links
   - **Implementation**: `group_invites` table with UUID tokens, expiration

3. **Group Slugs**
   - **Rationale**: Human-readable URLs (/groups/family-recipes)
   - **Implementation**: Unique slug column, auto-generated from name

### Dependencies

- Existing `users` table (Feature 0001)
- Existing `recipes` table (Feature 0002) - for group recipes

---

## Data Model Changes

### New Tables

```typescript
// packages/db/schema/groups.ts
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  privacy: varchar('privacy', { length: 20 }).notNull().default('private'), // 'public', 'private'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/group-members.ts
export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'owner', 'admin', 'member'
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => ({
  uniqueGroupUser: unique().on(table.groupId, table.userId),
}));
```

```typescript
// packages/db/schema/group-invites.ts
export const groupInvites = pgTable('group_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  inviterUserId: uuid('inviter_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }), // nullable for shareable link invites
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Migrations Required

- [ ] Migration 1: Create `groups` table
- [ ] Migration 2: Create `group_members` table
- [ ] Migration 3: Create `group_invites` table

**Run migration:**
```bash
npm run db:generate && npm run db:migrate
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/groups` | List groups (public + user's groups) |
| POST | `/api/v1/groups` | Create new group |
| GET | `/api/v1/groups/:slug` | Get group by slug |
| PATCH | `/api/v1/groups/:slug` | Update group (admin+) |
| DELETE | `/api/v1/groups/:slug` | Delete group (owner only) |
| POST | `/api/v1/groups/:slug/invite` | Invite member |
| POST | `/api/v1/groups/:slug/join/:token` | Join group via invite token |
| GET | `/api/v1/groups/:slug/members` | List group members |
| PATCH | `/api/v1/groups/:slug/members/:userId` | Update member role (admin+) |
| DELETE | `/api/v1/groups/:slug/members/:userId` | Remove member (admin+) |
| GET | `/api/v1/groups/:slug/recipes` | List group recipes |
| GET | `/api/v1/groups/:slug/cookbooks` | List group cookbooks |

### Request/Response Examples

```typescript
// POST /api/v1/groups
// Request
{
  "name": "Family Recipes",
  "description": "Recipes passed down through generations",
  "privacy": "private"
}

// Response
{
  "success": true,
  "data": {
    "id": "group-uuid",
    "name": "Family Recipes",
    "slug": "family-recipes",
    "description": "Recipes passed down through generations",
    "privacy": "private",
    "createdAt": "2025-12-05T00:00:00Z"
  }
}
```

```typescript
// POST /api/v1/groups/:slug/invite
// Request
{
  "email": "friend@example.com" // or null for shareable link
}

// Response
{
  "success": true,
  "data": {
    "id": "invite-uuid",
    "groupId": "group-uuid",
    "email": "friend@example.com",
    "token": "invite-token-uuid",
    "expiresAt": "2025-12-12T00:00:00Z",
    "inviteUrl": "https://app.com/groups/family-recipes/join/invite-token-uuid"
  }
}
```

---

## UI Components

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `GroupCard` | `@repo/ui` | Display group summary |
| `GroupForm` | `apps/web/src/components/group/` | Create/edit group form |
| `GroupDetail` | `apps/web/src/components/group/` | Full group display |
| `MemberList` | `apps/web/src/components/group/` | List group members with roles |
| `GroupInvite` | `apps/web/src/components/group/` | Invite member form |

### New Pages

| Page | Location | Description |
|------|----------|-------------|
| `GroupsPage` | `apps/web/src/pages/` | Browse groups (user's + public) |
| `GroupDetailPage` | `apps/web/src/pages/` | Single group view |

### New Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useGroups` | `apps/web/src/hooks/` | TanStack Query: list, create, update, delete |

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Group service tests | `tests/unit/services/group-service.test.ts` | CRUD, join/leave, invite, role management |
| Permission checks | `tests/unit/services/group-service.test.ts` | Verify role-based permissions |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Create group | `tests/e2e/group.spec.ts` | Create group, verify slug generation |
| Invite member | `tests/e2e/group.spec.ts` | Send invite, accept invite |
| Join via link | `tests/e2e/group.spec.ts` | Use shareable link to join |
| Manage members | `tests/e2e/group.spec.ts` | Promote/demote/remove members |

### Edge Cases to Cover

- [ ] Duplicate group names (different slugs via numeric suffix)
- [ ] Non-admin trying to invite members (should fail)
- [ ] Expired invite token (should fail)
- [ ] Owner leaving group (should fail or transfer ownership)

---

## Tasks

### Database (Architect + Engineer)
- [ ] Create `packages/db/schema/groups.ts`
- [ ] Create `packages/db/schema/group-members.ts`
- [ ] Create `packages/db/schema/group-invites.ts`
- [ ] Update `packages/db/schema/index.ts`
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`

### API (Engineer + Tester)
- [ ] Create `apps/api/src/services/group-service.ts`
- [ ] Create `apps/api/src/controllers/group-controller.ts`
- [ ] Create `apps/api/src/routes/group-routes.ts`
- [ ] Create `apps/api/src/schemas/group-schemas.ts`

### Frontend (Designer + Engineer + Tester)
- [ ] Create `apps/web/src/components/group/GroupCard.tsx`
- [ ] Create `apps/web/src/components/group/GroupForm.tsx`
- [ ] Create `apps/web/src/components/group/GroupDetail.tsx`
- [ ] Create `apps/web/src/components/group/MemberList.tsx`
- [ ] Create `apps/web/src/components/group/GroupInvite.tsx`
- [ ] Create `apps/web/src/hooks/useGroups.ts`
- [ ] Create `apps/web/src/pages/GroupsPage.tsx`
- [ ] Create `apps/web/src/pages/GroupDetailPage.tsx`
- [ ] Update RecipeForm/CookbookForm to support group context

### Completion
- [ ] All tests passing
- [ ] Group CRUD working
- [ ] Invite system working
- [ ] Permission checks working
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **Depends on Feature 0001**: Requires users
- **Can run parallel with Feature 0005**: Both extend recipes/cookbooks
- **Group recipes**: Update Recipe Core to support groupId

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
