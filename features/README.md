# Feature Management System

## Overview

This project uses a **feature-driven development** approach where each major capability is documented, tracked, and implemented as a standalone feature. Features progress through a defined lifecycle from planning to completion, ensuring organized development and clear progress tracking.

All features follow a standardized template that includes technical specifications, user stories, acceptance criteria, implementation tasks, and test plans.

## File Naming Convention

Features use **4-digit sequential identifiers** followed by a descriptive name:

```
XXXX-feature-name.md
```

**Examples:**
- `0001-authentication-user-management.md`
- `0002-recipe-core.md`
- `0003-recipe-forking-system.md`

**Numbering Rules:**
- Start at `0001` for the first feature
- Increment sequentially for each new feature
- Leading zeros ensure proper alphabetical sorting
- Use lowercase kebab-case for the descriptive name

## Feature Lifecycle

Features move through the following stages:

```
backlog/ → (in progress) → completed/
```

### Directory Structure

```
features/
├── backlog/           # 📋 Features not yet complete
│   ├── 0001-authentication-user-management.md
│   ├── 0002-recipe-core.md
│   └── ...
└── completed/         # ✅ Finished features
    └── (moved here when complete)
```

### Status Workflow

1. **Create** feature file in `features/backlog/` using the template
2. **Update status** as development progresses
3. **Mark complete** when all acceptance criteria are met
4. **Move** to `features/completed/` directory

## Status Definitions

Each feature file tracks its current state using status emojis:

| Status | Emoji | Meaning | When to Use |
|--------|-------|---------|-------------|
| **Planning** | 🔵 | Feature documented, not started | Initial state, requirements gathering |
| **In Progress** | 🟡 | Active development underway | Implementation has begun |
| **Testing** | 🟢 | Implementation complete, testing | Code complete, running tests |
| **Complete** | ✅ | All criteria met, feature shipped | Moved to `completed/` directory |

## Using the Feature Template

All features must follow the standardized template located at:

```
docs/templates/FEATURE_TEMPLATE.md
```

### Template Sections

| Section | Purpose |
|---------|---------|
| **Status** | Current status, start/completion dates |
| **Overview** | 2-3 sentence description of the feature |
| **User Stories** | User-centric stories (As a... I want... so that...) |
| **Acceptance Criteria** | Checklist of requirements for completion |
| **Personas Involved** | Which agent personas work on this feature |
| **Technical Approach** | Architecture decisions, dependencies, rationale |
| **Data Model Changes** | Database schema changes, migrations |
| **API Endpoints** | Backend routes, request/response formats |
| **UI Components** | Frontend components, pages, hooks |
| **Test Plan** | Unit tests, E2E tests, edge cases |
| **Tasks** | Granular implementation checklist |
| **Notes** | Additional context, decisions |
| **Error Log** | Track errors encountered during development |

### Creating a New Feature

1. **Copy the template:**
   ```bash
   cp docs/templates/FEATURE_TEMPLATE.md features/backlog/XXXX-feature-name.md
   ```

2. **Fill out all sections:**
   - Set initial status to 🔵 Planning
   - Write 2-3 user stories
   - Define acceptance criteria
   - Document technical approach
   - Break down into tasks

3. **Track progress:**
   - Update status as work progresses
   - Check off tasks and acceptance criteria
   - Log errors in the Error Log section

4. **Complete the feature:**
   - Ensure all acceptance criteria are met
   - Set status to ✅ Complete
   - Move file to `features/completed/`

## Agent Workflow

This project follows a **7-persona workflow** defined in `docs/AGENTS.md`:

| Persona | Role | Responsibility |
|---------|------|----------------|
| 🏗️ **Architect** | System Design | Schema, folder structure, architecture |
| 🎨 **Designer** | UI/UX | Component design, styling, accessibility |
| ⚙️ **Engineer** | Implementation | Business logic, API endpoints, database |
| 🧪 **Tester** | Quality Assurance | Unit tests, E2E tests, edge cases |
| 🔍 **Reviewer** | Code Quality | Security, performance, best practices |
| 📚 **Documentarian** | Documentation | Inline comments, API docs, README |
| 🚨 **Debugger** | Deep Debugging | Error reproduction, retry patterns |

### Feature Development Flow

1. **🏗️ Architect** designs the technical approach
2. **🎨 Designer** plans UI/UX components (if frontend work)
3. **⚙️ Engineer** implements the solution
4. **🧪 Tester** writes/runs tests after each step
5. **🔍 Reviewer** validates before marking complete
6. **📚 Documentarian** ensures everything is documented

## Current Features

### In Progress

- **0001: Authentication & User Management** 🟡 - Custom JWT auth, OAuth, magic links, profile management

### Planned

- **0002: Recipe Core** 🔵 - CRUD operations, ingredients, instructions, images
- **0003: Recipe Forking System** 🔵 - Git-like lineage tracking, closure table
- **0004: Tags, Ratings, Comments** 🔵 - Categorization, ratings, nested comments
- **0005: Cookbooks** 🔵 - Personal and group recipe collections
- **0006: Groups** 🔵 - Create groups, invite members, group recipes
- **0007: Social Features** 🔵 - Friends system, activity feeds, discovery
- **0008: Polish & Testing** 🔵 - Design system, performance, comprehensive testing

## Architecture Constraints

All features must adhere to the project's architecture constraints defined in `docs/ARCHITECTURE.md`:

- ✅ Test-first development (Vitest + Playwright)
- ✅ Zod validation on all API boundaries
- ✅ Named exports (no defaults)
- ✅ Explicit typing (no `any`)
- ✅ Migrations for schema changes
- ✅ Business logic in services, not controllers
- ✅ Drizzle ORM only (no raw SQL)
- ✅ Shared components in `@repo/ui`
- ✅ Conventional commits

## Resources

- **AGENTS.md** - 7-persona workflow and development guidelines
- **ARCHITECTURE.md** - Tech stack, conventions, constraints
- **FEATURE_TEMPLATE.md** - Template for creating new features
- **.serena/memories/** - Serena MCP context for AI agents

## Tips for Success

1. **Start with Feature 0001** - Authentication is the foundation for all other features
2. **Follow dependencies** - Check `.serena/memories/implementation-roadmap.md` for feature order
3. **Use the template** - Don't skip sections, they ensure completeness
4. **Track granularly** - Break tasks into small, checkable items
5. **Document decisions** - Use the Notes section to explain why, not just what
6. **Log errors** - Help future developers by tracking solutions
7. **Test continuously** - Write tests as you implement, not after
