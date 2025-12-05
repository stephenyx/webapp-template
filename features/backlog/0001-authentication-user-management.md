# Feature 0001: Authentication & User Management

## Status

**Current**: 🟡 In Progress

**Started**: 2025-12-05
**Completed**: (pending)

---

## Overview

Enable user registration, authentication (email/password, OAuth, magic links), and profile management. This feature provides the foundation for all user-related functionality in the Social Cookbook app, supporting three authentication methods for maximum flexibility.

---

## User Stories

- [ ] As a new user, I want to register with email/password so that I can create an account quickly
- [ ] As a user, I want to login with Google/GitHub OAuth so that I can skip password management
- [ ] As a user, I want to receive a magic link via email so that I can login without remembering my password
- [ ] As a user, I want to view my profile so that I can see my account information
- [ ] As a user, I want to edit my profile (username, bio) so that I can personalize my account
- [ ] As a user, I want my session to persist so that I don't have to login repeatedly

---

## Acceptance Criteria

- [ ] User can register with email and password
- [ ] User can login with email and password
- [ ] User can login with Google OAuth
- [ ] User can login with GitHub OAuth
- [ ] User can request a magic link via email
- [ ] User can login using a magic link token
- [ ] User can view their profile page (by username)
- [ ] User can edit their profile (username, bio)
- [ ] User sessions are managed with JWT tokens
- [ ] JWT tokens can be refreshed
- [ ] Passwords are hashed with bcrypt
- [ ] Email addresses are verified
- [ ] Protected routes require authentication
- [ ] Logout clears user session

---

## Personas Involved

- [x] 🏗️ Architect - Database schema design, auth strategy
- [x] 🎨 Designer - Auth UI/UX, profile pages
- [x] ⚙️ Engineer - Auth services, middleware, controllers
- [x] 🧪 Tester - Unit tests, E2E auth flows
- [x] 🔍 Reviewer - Security review, token handling
- [x] 📚 Documentarian - API docs, Swagger specs

---

## Technical Approach

### Architecture Decisions

1. **Custom JWT Authentication** (not Auth.js)
   - **Rationale**: Simpler stack, fewer dependencies, direct integration with Drizzle schema, full control over token lifecycle
   - **Implementation**: JWT tokens stored in localStorage (frontend), verified via middleware (backend)

2. **Passport.js for OAuth**
   - **Rationale**: Industry-standard, well-maintained, supports Google/GitHub strategies
   - **Implementation**: OAuth callbacks create user accounts or link to existing accounts

3. **Bcrypt for Password Hashing**
   - **Rationale**: Battle-tested, secure, recommended for password storage
   - **Implementation**: 10 rounds of salting, stored in separate `user_passwords` table

4. **Nodemailer/Resend for Magic Links**
   - **Rationale**: Email verification and passwordless authentication
   - **Implementation**: Time-limited tokens (15 minutes), one-time use

### Dependencies

**Backend:**
- `jsonwebtoken` - JWT creation and verification
- `bcrypt` - Password hashing
- `nodemailer` or `resend` - Email sending
- `passport` - OAuth framework
- `passport-google-oauth20` - Google OAuth strategy
- `passport-github2` - GitHub OAuth strategy

**Frontend:**
- `@tanstack/react-query` - Server state management, API caching
- `zustand` - Client state (auth user, token)
- `axios` - HTTP client with interceptors

---

## Data Model Changes

### New Tables

```typescript
// packages/db/schema/user-passwords.ts
export const userPasswords = pgTable('user_passwords', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/user-sessions.ts
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

```typescript
// packages/db/schema/oauth-accounts.ts
export const oauthAccounts = pgTable('oauth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // 'google', 'github'
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: varchar('access_token', { length: 500 }),
  refreshToken: varchar('refresh_token', { length: 500 }),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueProviderAccount: unique().on(table.provider, table.providerAccountId),
}));
```

```typescript
// packages/db/schema/magic-links.ts
export const magicLinks = pgTable('magic_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Schema Modifications

```typescript
// packages/db/schema/users.ts (MODIFY EXISTING)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).notNull().unique(), // NEW
  bio: text('bio'), // NEW
  emailVerified: timestamp('email_verified'), // NEW
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Migrations Required

- [x] Migration 1: Add `username`, `bio`, `emailVerified` to `users` table
- [x] Migration 2: Create `user_passwords` table
- [x] Migration 3: Create `user_sessions` table
- [x] Migration 4: Create `oauth_accounts` table
- [x] Migration 5: Create `magic_links` table

**Run migration:**
```bash
npm run db:generate && npm run db:migrate
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register with email/password |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/logout` | Logout and invalidate session |
| POST | `/api/v1/auth/magic-link` | Request magic link via email |
| POST | `/api/v1/auth/verify-magic-link` | Verify magic link token and login |
| GET | `/api/v1/auth/session` | Get current session info |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| GET | `/api/v1/auth/google` | Initiate Google OAuth flow |
| GET | `/api/v1/auth/google/callback` | Google OAuth callback |
| GET | `/api/v1/auth/github` | Initiate GitHub OAuth flow |
| GET | `/api/v1/auth/github/callback` | GitHub OAuth callback |
| GET | `/api/v1/users/:username` | Get user profile by username |
| PATCH | `/api/v1/users/:username` | Update user profile |

### Request/Response Examples

```typescript
// POST /api/v1/auth/register
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "username": "johndoe"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "createdAt": "2025-12-05T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

```typescript
// POST /api/v1/auth/login
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## UI Components

### New Components

| Component | Location | Description |
|-----------|----------|-------------|
| `LoginForm` | `apps/web/src/components/auth/` | Email/password login form |
| `RegisterForm` | `apps/web/src/components/auth/` | Registration form |
| `MagicLinkForm` | `apps/web/src/components/auth/` | Magic link request form |
| `OAuthButtons` | `apps/web/src/components/auth/` | Google/GitHub OAuth buttons |
| `NavigationBar` | `apps/web/src/components/layout/` | Main navigation with auth state |
| `ProtectedRoute` | `apps/web/src/components/auth/` | Route wrapper requiring auth |

### New Pages

| Page | Location | Description |
|------|----------|-------------|
| `LoginPage` | `apps/web/src/pages/` | Tabbed auth (email/password, magic link, OAuth) |
| `RegisterPage` | `apps/web/src/pages/` | User registration |
| `ProfilePage` | `apps/web/src/pages/` | View user profile (by username) |
| `SettingsPage` | `apps/web/src/pages/` | Edit profile form |

### New Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useAuth` | `apps/web/src/hooks/` | Login, register, logout, magic link |
| `useUser` | `apps/web/src/hooks/` | Fetch user data, update profile |

### State Management

```typescript
// apps/web/src/stores/auth-store.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}
```

---

## Test Plan

### Unit Tests

| Test | File | Description |
|------|------|-------------|
| Auth service tests | `tests/unit/services/auth-service.test.ts` | register, login, createMagicLink, verifyMagicLink |
| User service tests | `tests/unit/services/user-service.test.ts` | getById, getByEmail, getByUsername, update |
| OAuth service tests | `tests/unit/services/oauth-service.test.ts` | handleOAuthCallback, linkOAuthAccount |
| Password hashing | `tests/unit/lib/auth.test.ts` | hashPassword, verifyPassword |
| JWT generation | `tests/unit/lib/auth.test.ts` | generateJWT, verifyJWT |

### E2E Tests

| Test | File | Description |
|------|------|-------------|
| Email/password registration | `tests/e2e/auth.spec.ts` | Complete registration flow |
| Email/password login | `tests/e2e/auth.spec.ts` | Complete login flow |
| Magic link flow | `tests/e2e/auth.spec.ts` | Request and verify magic link |
| OAuth flow (mocked) | `tests/e2e/auth.spec.ts` | OAuth callback handling |
| Protected routes | `tests/e2e/auth.spec.ts` | Redirect to login when unauthenticated |
| Profile view/edit | `tests/e2e/profile.spec.ts` | View and edit user profile |

### Edge Cases to Cover

- [ ] Registration with duplicate email
- [ ] Registration with duplicate username
- [ ] Login with incorrect password
- [ ] Login with non-existent email
- [ ] Magic link expiration (15 minutes)
- [ ] Magic link used twice
- [ ] JWT token expiration
- [ ] JWT token refresh
- [ ] OAuth account linking to existing user
- [ ] OAuth provider account ID collision

---

## Tasks

### Setup
- [x] Create feature branch: `feature/0001-authentication`
- [ ] Create Serena memory file: `.serena/memories/feature-0001.md`

### Install Dependencies
- [ ] Backend: `npm install jsonwebtoken bcrypt nodemailer passport passport-google-oauth20 passport-github2`
- [ ] Backend types: `npm install -D @types/jsonwebtoken @types/bcrypt @types/nodemailer @types/passport @types/passport-google-oauth20 @types/passport-github2`
- [ ] Frontend: `npm install @tanstack/react-query zustand axios`
- [ ] Add environment variables to `.env.example`

### Database (Architect + Engineer)
- [ ] Modify `packages/db/schema/users.ts` - Add username, bio, emailVerified
- [ ] Create `packages/db/schema/user-passwords.ts`
- [ ] Create `packages/db/schema/user-sessions.ts`
- [ ] Create `packages/db/schema/oauth-accounts.ts`
- [ ] Create `packages/db/schema/magic-links.ts`
- [ ] Update `packages/db/schema/index.ts` - Export new schemas
- [ ] Generate migration: `npm run db:generate`
- [ ] Test migration: `npm run db:migrate`

### API - Utilities & Config (Engineer)
- [ ] Create `apps/api/src/lib/auth.ts` - hashPassword, verifyPassword, generateJWT, verifyJWT
- [ ] Create `apps/api/src/lib/email.ts` - sendMagicLink, sendWelcomeEmail
- [ ] Update `apps/api/.env.example` - Add JWT_SECRET, EMAIL_*, OAUTH_* vars
- [ ] Configure Passport.js strategies in `apps/api/src/lib/passport-config.ts`

### API - Validation Schemas (Engineer)
- [ ] Create `apps/api/src/schemas/auth-schemas.ts` - registerSchema, loginSchema, magicLinkSchema, updateProfileSchema

### API - Services (Engineer + Tester)
- [ ] Write unit tests for `auth-service` (TDD)
- [ ] Create `apps/api/src/services/auth-service.ts` - register, login, createMagicLink, verifyMagicLink, createSession, refreshSession
- [ ] Write unit tests for `user-service` (TDD)
- [ ] Create `apps/api/src/services/user-service.ts` - getById, getByEmail, getByUsername, update, delete
- [ ] Write unit tests for `oauth-service` (TDD)
- [ ] Create `apps/api/src/services/oauth-service.ts` - handleOAuthCallback, linkOAuthAccount

### API - Middleware (Engineer + Tester)
- [ ] Write unit tests for auth middleware
- [ ] Create `apps/api/src/middleware/auth-middleware.ts` - requireAuth, optionalAuth

### API - Controllers (Engineer)
- [ ] Create `apps/api/src/controllers/auth-controller.ts` - register, login, logout, requestMagicLink, verifyMagicLink, getSession, refreshToken
- [ ] Create `apps/api/src/controllers/user-controller.ts` - getProfile, updateProfile

### API - Routes (Engineer)
- [ ] Create `apps/api/src/routes/auth-routes.ts` - Mount auth endpoints
- [ ] Create `apps/api/src/routes/user-routes.ts` - Mount user endpoints
- [ ] Update `apps/api/src/routes/index.ts` - Add auth and user routes

### Frontend - State & API (Designer + Engineer)
- [ ] Create `apps/web/src/stores/auth-store.ts` - Zustand store (user, token, setUser, setToken, logout)
- [ ] Create `apps/web/src/lib/api-client.ts` - Axios instance with baseURL, token interceptor, error handling
- [ ] Create `apps/web/src/hooks/useAuth.ts` - login, register, logout, requestMagicLink
- [ ] Create `apps/web/src/hooks/useUser.ts` - getUser, updateUser

### Frontend - Components (Designer + Engineer + Tester)
- [ ] Write E2E tests for auth flows (TDD)
- [ ] Create `apps/web/src/components/auth/LoginForm.tsx`
- [ ] Create `apps/web/src/components/auth/RegisterForm.tsx`
- [ ] Create `apps/web/src/components/auth/MagicLinkForm.tsx`
- [ ] Create `apps/web/src/components/auth/OAuthButtons.tsx`
- [ ] Create `apps/web/src/components/auth/ProtectedRoute.tsx`
- [ ] Create `apps/web/src/components/layout/NavigationBar.tsx`

### Frontend - Pages (Designer + Engineer)
- [ ] Create `apps/web/src/pages/LoginPage.tsx` - Tabbed auth interface
- [ ] Create `apps/web/src/pages/RegisterPage.tsx`
- [ ] Create `apps/web/src/pages/ProfilePage.tsx` - View profile by username
- [ ] Create `apps/web/src/pages/SettingsPage.tsx` - Edit profile form
- [ ] Update `apps/web/src/App.tsx` - Add routes, ProtectedRoute wrapper
- [ ] Update `apps/web/src/main.tsx` - Set up TanStack Query client

### Review (Reviewer)
- [ ] Security review: JWT handling, password hashing, OAuth flow
- [ ] Code review checklist complete
- [ ] Performance review: query optimization, token refresh logic
- [ ] No lint errors
- [ ] Types all correct

### Documentation (Documentarian)
- [ ] Add Swagger documentation for all endpoints
- [ ] Add inline comments where needed
- [ ] Update API docs with auth flow diagrams
- [ ] Create/update Serena memory file
- [ ] Mark all acceptance criteria complete

### Completion
- [ ] All tests passing (unit + E2E)
- [ ] All 3 auth methods working (email/password, OAuth, magic links)
- [ ] Profile view/edit working
- [ ] Feature deployed to staging (if applicable)
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **START HERE**: This is the first feature to implement - all other features depend on user authentication
- **Security**: Ensure all tokens (JWT, magic link) have expiration times
- **Email provider**: Use Resend for production (has generous free tier) or Nodemailer for local dev
- **OAuth setup**: Requires Google Cloud Console and GitHub OAuth app configuration
- **Username validation**: Must be unique, alphanumeric + underscores/hyphens, 3-30 characters

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
