# Implementation Roadmap - Social Cookbook App

## Feature Overview

This document provides a high-level roadmap for implementing the Social Cookbook app, tracking feature dependencies, implementation order, and completion status.

## Feature List

| ID | Feature | Status | Dependencies | Location |
|----|---------|--------|--------------|----------|
| 0001 | Authentication & User Management | 🟡 In Progress | None (START HERE) | `features/backlog/0001-authentication-user-management.md` |
| 0002 | Recipe Core | 🔵 Planning | 0001 | `features/backlog/0002-recipe-core.md` |
| 0003 | Recipe Forking System | 🔵 Planning | 0002 | `features/backlog/0003-recipe-forking-system.md` |
| 0004 | Tags, Ratings, Comments | 🔵 Planning | 0002 | `features/backlog/0004-tags-ratings-comments.md` |
| 0005 | Cookbooks | 🔵 Planning | 0002, (0006 optional) | `features/backlog/0005-cookbooks.md` |
| 0006 | Groups | 🔵 Planning | 0001 | `features/backlog/0006-groups.md` |
| 0007 | Social Features | 🔵 Planning | 0001, 0002 | `features/backlog/0007-social-features.md` |
| 0008 | Polish & Testing | 🔵 Planning | All (0001-0007) | `features/backlog/0008-polish-testing.md` |

## Feature Dependency Graph

```
0001 (Auth) ─────┬──────────────────┐
                 │                  │
                 ▼                  ▼
            0002 (Recipes)      0006 (Groups)
                 │                  │
       ┌─────────┼─────────┬────────┤
       ▼         ▼         ▼        ▼
   0003 (Fork) 0004 (Tags) 0005 (Cookbooks)
                            │
                            ▼
                      0007 (Social)
                            │
                            ▼
                      0008 (Polish)
```

## Implementation Order (Critical Path)

### Phase 1: Foundation (MUST COMPLETE FIRST)
**Feature 0001: Authentication & User Management**
- Status: 🟡 In Progress (started 2025-12-05)
- Why first: All features depend on users and authentication
- Key deliverables: JWT auth, OAuth (Google/GitHub), magic links, user profiles
- Blocking: ALL other features

### Phase 2: Core Recipe System (SECOND PRIORITY)
**Feature 0002: Recipe Core**
- Status: 🔵 Planning
- Depends on: 0001
- Why second: Central entity of the app, required for most features
- Key deliverables: Recipe CRUD, ingredients (grouped), instructions, Cloudinary images
- Blocking: 0003, 0004, 0005, 0007

### Phase 3: Recipe Extensions (CAN RUN IN PARALLEL)

**Feature 0003: Recipe Forking System**
- Status: 🔵 Planning
- Depends on: 0002
- Parallel with: 0004
- Key deliverables: Closure table, lineage tree, fork metrics

**Feature 0004: Tags, Ratings, Comments**
- Status: 🔵 Planning
- Depends on: 0002
- Parallel with: 0003
- Key deliverables: Tag autocomplete, star ratings, nested comments

### Phase 4: Organization & Collaboration (CAN RUN IN PARALLEL)

**Feature 0005: Cookbooks**
- Status: 🔵 Planning
- Depends on: 0002
- Optional: 0006 (for group cookbooks)
- Parallel with: 0006
- Key deliverables: Personal/group cookbooks, recipe collections

**Feature 0006: Groups**
- Status: 🔵 Planning
- Depends on: 0001
- Parallel with: 0005
- Key deliverables: Group CRUD, invitations, role-based permissions

### Phase 5: Social Layer
**Feature 0007: Social Features**
- Status: 🔵 Planning
- Depends on: 0001, 0002
- Key deliverables: Friendships, activity feeds, search

### Phase 6: Production Ready
**Feature 0008: Polish & Testing**
- Status: 🔵 Planning
- Depends on: ALL (0001-0007)
- Key deliverables: Design system, performance, security, accessibility, SEO

## Key Architectural Decisions (Cross-Feature)

### Authentication Strategy (Feature 0001)
- Custom JWT (not Auth.js) for full control
- Passport.js for OAuth (Google/GitHub)
- Bcrypt for password hashing
- Magic links via Nodemailer/Resend

### Image Storage (Features 0002, 0008)
- Cloudinary for all images (auto-optimization, CDN)
- Store `cloudinaryId` for deletion
- WebP format with fallback (Feature 0008)

### Recipe Forking (Feature 0003)
- Closure table pattern for efficient lineage queries
- Denormalized `forkCount` on recipes table

### State Management (All Frontend)
- TanStack Query for server state (API caching)
- Zustand for client state (auth, UI state)

### Database Patterns
- Drizzle ORM only (no raw SQL)
- Migrations for all schema changes
- Indexes on frequently queried columns (Feature 0008)
- Pagination on all list endpoints

## Completion Tracker

### Completed Features
(None yet - move completed features here)

### In Progress
- 0001: Authentication & User Management (started 2025-12-05)

### Blocked/Waiting
- 0002: Waiting on 0001
- 0003: Waiting on 0002
- 0004: Waiting on 0002
- 0005: Waiting on 0002
- 0006: Waiting on 0001
- 0007: Waiting on 0001, 0002
- 0008: Waiting on 0001-0007

## Parallel Work Opportunities

### After Feature 0001 Completes:
- ✅ Can start 0002 (Recipes) AND 0006 (Groups) in parallel

### After Feature 0002 Completes:
- ✅ Can start 0003 (Forking), 0004 (Tags), AND 0005 (Cookbooks) in parallel
- ✅ If 0001 complete, can also work on 0007 (Social)

### After Features 0001-0007 Complete:
- ✅ Start 0008 (Polish) - final phase

## Migration Strategy

All features require database migrations. Run after creating each feature's schema:

```bash
npm run db:generate
npm run db:migrate
```

## Testing Strategy

Each feature includes:
- Unit tests (TDD for services)
- E2E tests (Playwright for user flows)
- Feature 0008 adds comprehensive test coverage audit (>80%)

## Deployment Strategy

Features can be deployed incrementally:
- 0001: Enables user accounts (usable on its own)
- 0002: Enables recipe creation (core value)
- 0003-0007: Enhance core experience
- 0008: Production polish (design, performance, SEO)

## Resources

- **Feature Templates**: `docs/templates/FEATURE_TEMPLATE.md`
- **Architecture Docs**: `docs/ARCHITECTURE.md`
- **Agent Workflow**: `docs/AGENTS.md`
- **Feature Backlog**: `features/backlog/`
