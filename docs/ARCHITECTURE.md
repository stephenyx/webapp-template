# Architecture

This document defines the system architecture, conventions, and constraints that ALL agents and developers must follow.

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 19.x |
| **Build Tool** | Vite | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **UI Components** | shadcn/ui | latest |
| **Backend** | Express.js | 4.x |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL | 16.x |
| **ORM** | Drizzle ORM | latest |
| **Logging** | Pino | latest |
| **API Docs** | Swagger/OpenAPI | 3.x |
| **Unit Testing** | Vitest | 1.x |
| **E2E Testing** | Playwright | latest |
| **Seeding** | Faker.js | latest |
| **Monorepo** | Turborepo | 2.x |
| **Containerization** | Docker | latest |

---

## 📁 Folder Structure

```
webapp-template/
├── apps/
│   ├── web/                      # Frontend application
│   │   ├── public/               # Static assets
│   │   └── src/
│   │       ├── components/       # React components
│   │       │   ├── ui/           # shadcn/ui primitives (local)
│   │       │   └── [feature]/    # Feature-specific components
│   │       ├── pages/            # Page components (route-level)
│   │       ├── hooks/            # Custom React hooks
│   │       ├── lib/              # Utilities, env validation
│   │       ├── styles/           # Global styles, Tailwind
│   │       └── types/            # Frontend-specific types
│   │
│   └── api/                      # Backend application
│       └── src/
│           ├── routes/           # Express route definitions
│           ├── controllers/      # Request handlers
│           ├── middleware/       # Express middleware
│           ├── services/         # Business logic
│           ├── lib/              # Utilities, logger, env
│           └── types/            # Backend-specific types
│
├── packages/
│   ├── db/                       # Database package
│   │   ├── schema/               # Drizzle schema definitions
│   │   ├── migrations/           # Database migrations
│   │   ├── seed/                 # Seeding with Faker.js
│   │   │   ├── seeders/          # Individual seed files
│   │   │   └── data/             # Static seed data (optional)
│   │   └── src/                  # Exports: client, schema, types
│   │
│   ├── ui/                       # Shared UI components
│   │   └── src/
│   │       ├── components/       # Reusable components
│   │       └── index.ts          # Public exports
│   │
│   └── types/                    # Shared TypeScript types
│       └── src/
│           ├── api/              # API request/response types
│           ├── models/           # Domain model types
│           └── index.ts          # Public exports
│
├── docker/                       # Docker configuration
├── tests/
│   ├── e2e/                      # Playwright E2E tests
│   └── unit/                     # Vitest unit tests
├── features/                     # Feature documentation
│   ├── backlog/                  # Planned features
│   └── completed/                # Completed features
├── docs/                         # Documentation
│   ├── AGENTS.md                 # AI agent instructions
│   ├── ARCHITECTURE.md           # This file
│   ├── error-log.md              # Error tracking
│   └── templates/                # Templates
└── .serena/
    └── memories/                 # Serena MCP context
```

---

## 🎯 Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `UserProfile.tsx` |
| React Hooks | camelCase with `use` | `useAuth.ts` |
| Utility Functions | kebab-case | `format-date.ts` |
| Type Definitions | kebab-case | `user-types.ts` |
| Constants | kebab-case | `api-constants.ts` |
| Test Files | `*.test.ts(x)` or `*.spec.ts(x)` | `UserProfile.test.tsx` |
| API Routes | kebab-case | `user-routes.ts` |
| Controllers | kebab-case | `user-controller.ts` |
| Services | kebab-case | `user-service.ts` |
| Middleware | kebab-case | `auth-middleware.ts` |
| Database Schema | kebab-case | `users-table.ts` |
| Migrations | timestamp prefix | `0001_create_users.ts` |
| Seeders | number prefix | `001-users.ts` |

### Folder Naming

- All lowercase with hyphens: `user-management/`
- Singular for types: `type/`, `model/`
- Plural for collections: `components/`, `routes/`, `services/`

### Import Order

```typescript
// 1. Node/external imports
import { useState } from 'react';
import { z } from 'zod';

// 2. Internal package imports (@repo/*)
import { Button } from '@repo/ui';
import { User } from '@repo/types';

// 3. Relative imports (parent first, then siblings)
import { useAuth } from '../hooks/useAuth';
import { formatDate } from './utils';

// 4. Type imports
import type { UserProps } from './types';
```

---

## 🔌 API Conventions

### RESTful Endpoints

| Action | Method | Path | Example |
|--------|--------|------|---------|
| List | GET | `/resources` | `GET /api/users` |
| Get One | GET | `/resources/:id` | `GET /api/users/123` |
| Create | POST | `/resources` | `POST /api/users` |
| Update | PATCH | `/resources/:id` | `PATCH /api/users/123` |
| Replace | PUT | `/resources/:id` | `PUT /api/users/123` |
| Delete | DELETE | `/resources/:id` | `DELETE /api/users/123` |

### API Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { ... }  // Optional, for validation errors
  }
}

// Paginated response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Route Structure

```typescript
// apps/api/src/routes/user-routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user-controller';
import { validateRequest } from '../middleware/validate-request';
import { createUserSchema, updateUserSchema } from '../schemas/user-schemas';

const router = Router();

router.get('/', UserController.list);
router.get('/:id', UserController.getById);
router.post('/', validateRequest(createUserSchema), UserController.create);
router.patch('/:id', validateRequest(updateUserSchema), UserController.update);
router.delete('/:id', UserController.delete);

export { router as userRoutes };
```

### Controller Structure

```typescript
// apps/api/src/controllers/user-controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user-service';

export class UserController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.list(req.query);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Structure

```typescript
// apps/api/src/services/user-service.ts
import { db } from '@repo/db';
import { users } from '@repo/db/schema';
import { eq } from 'drizzle-orm';

export class UserService {
  static async list(query: ListQuery) {
    return db.select().from(users);
  }

  static async getById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
```

---

## 💾 Database Conventions

### Schema Definition

```typescript
// packages/db/schema/users-table.ts
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Naming Rules

- Tables: plural, snake_case (`users`, `blog_posts`)
- Columns: snake_case (`created_at`, `is_active`)
- Primary keys: `id` (uuid by default)
- Foreign keys: `{table}_id` (`user_id`, `post_id`)
- Timestamps: `created_at`, `updated_at`

### Migrations

- **NEVER** modify schema files and expect auto-sync
- **ALWAYS** create migrations for schema changes
- Run `npm run db:generate` to generate migration from schema changes
- Run `npm run db:migrate` to apply migrations

---

## 🎨 Frontend Conventions

### Component Structure

```typescript
// apps/web/src/components/user/UserCard.tsx
import { type FC } from 'react';
import { Card, CardHeader, CardContent } from '@repo/ui';
import type { User } from '@repo/types';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <CardHeader>{user.name}</CardHeader>
      <CardContent>
        <p>{user.email}</p>
        {onEdit && (
          <button onClick={() => onEdit(user)}>Edit</button>
        )}
      </CardContent>
    </Card>
  );
};
```

### Hook Structure

```typescript
// apps/web/src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import type { User } from '@repo/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { users, isLoading, error };
}
```

### Page Structure

```typescript
// apps/web/src/pages/UsersPage.tsx
import { useUsers } from '../hooks/useUsers';
import { UserCard } from '../components/user/UserCard';
import { PageHeader } from '../components/layout/PageHeader';

export function UsersPage() {
  const { users, isLoading, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <PageHeader title="Users" />
      <div className="grid gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔒 Security Constraints

1. **Environment Variables**: Never commit secrets, use `.env` files
2. **Input Validation**: Always validate with zod before processing
3. **SQL Injection**: Use Drizzle ORM, never raw string interpolation
4. **CORS**: Configure allowed origins per environment
5. **Rate Limiting**: Enabled by default (1000 req/15min dev, 100 req/15min prod)
6. **Error Messages**: Never expose stack traces in production
7. **Logging**: Never log sensitive data (passwords, tokens)

---

## 🚀 Performance Guidelines

1. **Database**: Use indexes for frequently queried columns
2. **API**: Implement pagination for list endpoints
3. **Frontend**: Lazy load routes and heavy components
4. **Images**: Use optimized formats (WebP) and lazy loading
5. **Caching**: Leverage Turborepo caching for builds

---

## 🐳 Docker Architecture

### Local Development

```
┌─────────────────────────────────────────┐
│  docker-compose.yml                     │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐      │
│  │   app       │  │  postgres   │      │
│  │  (Node.js)  │◄─┤  (database) │      │
│  │  port 3001  │  │  port 5432  │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

### Production (Separate Droplets)

```
┌──────────────────┐      ┌──────────────────┐
│  App Server      │      │  DB Server       │
│  (Droplet 1)     │      │  (Droplet 2)     │
├──────────────────┤      ├──────────────────┤
│  ┌────────────┐  │      │  ┌────────────┐  │
│  │    app     │  │◄─────┤  │  postgres  │  │
│  │ container  │  │      │  │ container  │  │
│  └────────────┘  │      │  └────────────┘  │
└──────────────────┘      └──────────────────┘
```

---

## ⚠️ Constraints (MUST FOLLOW)

1. **No direct schema modifications**: Always use migrations
2. **No business logic in controllers**: Use services
3. **No raw SQL**: Use Drizzle ORM query builder
4. **No untyped APIs**: Define types in `@repo/types`
5. **No shared components in apps**: Put in `@repo/ui`
6. **No skipping tests**: Test-first development required
7. **No ignoring lint errors**: Fix or explicitly disable with comment
8. **No committing .env files**: Use .env.example as template
9. **No hardcoded URLs/ports**: Use environment variables
10. **No console.log in production code**: Use Pino logger
