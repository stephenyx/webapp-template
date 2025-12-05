# Webapp Template

A comprehensive monorepo template for building modern web applications with **React 19**, **Vite**, **Express**, **Drizzle ORM**, and **PostgreSQL**. Optimized for AI-assisted (agentic) development with strict conventions, persona-based workflows, and automated testing.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- Docker & Docker Compose
- npm >= 10.0.0

### Setup

```bash
# 1. Clone and rename for your project
git clone <repo-url> my-project
cd my-project

# 2. Find/replace the package scope (in VS Code: Cmd+Shift+H)
# Find: @repo
# Replace: @myproject

# 3. Install dependencies
npm install

# 4. Start the database (Docker)
npm run docker:dev

# 5. Run database migrations
npm run db:migrate

# 6. Seed the database (optional)
npm run db:seed

# 7. Start development servers
npm run dev
```

The web app will be available at `http://localhost:5173` and the API at `http://localhost:3001`.

## 📁 Project Structure

```
├── apps/
│   ├── web/                 # React 19 + Vite frontend
│   │   └── src/
│   │       ├── components/  # React components
│   │       ├── pages/       # Page components
│   │       ├── hooks/       # Custom React hooks
│   │       └── lib/         # Utilities, env validation
│   └── api/                 # Express.js backend
│       └── src/
│           ├── routes/      # API route definitions
│           ├── controllers/ # Request handlers
│           ├── middleware/  # Express middleware
│           └── services/    # Business logic
├── packages/
│   ├── db/                  # Drizzle ORM, schemas, migrations
│   │   ├── schema/          # Database schema definitions
│   │   ├── migrations/      # Database migrations
│   │   └── seed/            # Seed data with Faker.js
│   ├── ui/                  # Shared UI components (shadcn/ui)
│   └── types/               # Shared TypeScript types
├── docker/                  # Docker configuration
├── tests/
│   ├── e2e/                 # Playwright E2E tests
│   └── unit/                # Vitest unit tests
├── features/                # Feature documentation
│   ├── backlog/             # Planned features
│   └── completed/           # Completed features
├── docs/
│   ├── AGENTS.md            # AI agent instructions
│   ├── ARCHITECTURE.md      # System architecture
│   ├── error-log.md         # Error tracking
│   └── templates/           # Feature doc templates
└── .serena/
    └── memories/            # Serena MCP context persistence
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all development servers |
| `npm run build` | Build all packages |
| `npm run test` | Run all tests |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Lint all packages |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with test data |
| `npm run db:seed:reset` | Reset and re-seed database |
| `npm run docker:dev` | Start dev containers |
| `npm run docker:prod` | Start production containers |

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 5, Tailwind CSS, shadcn/ui |
| **Backend** | Express 4, TypeScript, Pino (logging), Swagger (API docs) |
| **Database** | PostgreSQL 16, Drizzle ORM, Faker.js (seeding) |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **DevOps** | Docker, Turborepo, GitHub Actions, Dependabot |
| **DX** | ESLint, Prettier, Husky, lint-staged |

## 🤖 Agentic Development

This template is optimized for AI-assisted development. See [docs/AGENTS.md](docs/AGENTS.md) for:

- **7 Personas**: Architect, Designer, Engineer, Tester, Reviewer, Documentarian, Debugger
- **Feature Workflow**: Planning → Implementation → Testing → Review
- **Serena MCP Integration**: Context persistence across sessions
- **Test-First Development**: Write tests before implementation
- **Error Handling**: 5-retry auto-resolution with structured logging

### Creating a New Feature

1. Copy the template: `cp docs/templates/FEATURE_TEMPLATE.md features/0001-my-feature.md`
2. Fill out the planning sections with an agent
3. Work through tasks, marking them complete as you go
4. Move to `features/completed/` when done

## 🏗 Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for:

- Folder conventions and file naming rules
- Import patterns and constraints
- API endpoint conventions
- Database schema patterns

## 🐳 Docker

### Local Development

```bash
# Start PostgreSQL
npm run docker:dev

# Stop containers
npm run docker:dev:down
```

### Production (Separate Droplets)

The production setup assumes:
- **Droplet 1**: Application container
- **Droplet 2**: PostgreSQL container

See `docker/docker-compose.prod.yml` for configuration.

## 📝 License

MIT - See LICENSE file for details.
