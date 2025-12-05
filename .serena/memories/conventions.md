# Coding Conventions

## File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities/hooks**: camelCase (e.g., `useAuth.ts`, `formatDate.ts`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)
- **Tests**: Same name with `.test.ts` or `.spec.ts` suffix

## Directory Structure

### Frontend (apps/web)
```
src/
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── pages/            # Route components
├── stores/           # State management
└── styles/           # Global styles
```

### Backend (apps/api)
```
src/
├── routes/           # Express route handlers
├── middleware/       # Express middleware
├── services/         # Business logic
├── lib/              # Utilities
└── types/            # API-specific types
```

## Code Style

1. **Prefer named exports** over default exports
2. **Use async/await** instead of .then() chains
3. **Validate inputs** with Zod at API boundaries
4. **Type everything** - avoid `any` types
5. **Write tests first** (TDD approach for features)

## Feature Numbering

Features use 4-digit identifiers: `XXXX-feature-name.md`
- Example: `0001-user-authentication.md`

## Git Commits

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance
