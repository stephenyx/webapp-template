# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 5, Tailwind CSS, shadcn/ui |
| Backend | Express 4, TypeScript, Pino logger, Swagger |
| Database | PostgreSQL 16, Drizzle ORM, Faker.js (seeding) |
| Testing | Vitest (unit), Playwright (e2e) |
| DevOps | Docker, Turborepo, GitHub Actions, Dependabot |
| DX | ESLint, Prettier, Husky, lint-staged |

## Monorepo Structure

```
webapp_template/
├── apps/
│   ├── web/          # React 19 + Vite frontend
│   └── api/          # Express + TypeScript backend
├── packages/
│   ├── db/           # Drizzle ORM, schemas, migrations, seeds
│   ├── ui/           # Shared React components (shadcn/ui)
│   └── types/        # Shared TypeScript interfaces
├── docker/           # Docker configs for dev and prod
├── tests/
│   ├── e2e/          # Playwright end-to-end tests
│   └── unit/         # Vitest unit tests
├── features/
│   ├── backlog/      # Pending feature specs
│   └── completed/    # Implemented feature specs
└── docs/             # Documentation
```

## Key Patterns

1. **API Routes**: RESTful with `/api/v1/` prefix
2. **Database**: Drizzle ORM with PostgreSQL, migrations in `packages/db/migrations`
3. **Validation**: Zod schemas for request/response validation
4. **Error Handling**: Centralized error handler with typed errors
5. **Logging**: Pino logger with structured JSON output
