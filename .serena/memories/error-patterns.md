# Common Error Patterns

## Database Errors

### Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running (`docker:dev` or local PostgreSQL)

### Migration Conflicts
```
Error: relation "xxx" already exists
```
**Solution**: Reset database or fix migration order in `packages/db/migrations`

## Build Errors

### TypeScript Path Resolution
```
Cannot find module '@repo/types'
```
**Solution**: Run `npm install` at root, check `tsconfig.json` paths

### Turbo Cache Issues
```
Unexpected build output
```
**Solution**: Run `npm run clean` then rebuild

## Runtime Errors

### Environment Variables
```
Error: Missing required env var: DATABASE_URL
```
**Solution**: Copy `.env.example` to `.env` and fill values

### CORS Errors
```
Access-Control-Allow-Origin header missing
```
**Solution**: Check API CORS config in `apps/api/src/middleware/cors.ts`

## Test Errors

### Playwright Browser Not Found
```
browserType.launch: Executable doesn't exist
```
**Solution**: Run `npx playwright install`

### Vitest Module Resolution
```
Failed to resolve import
```
**Solution**: Check vitest.config.ts alias configuration

---

## Error Handling Protocol

1. Check this file for known patterns
2. Search docs/error-log.md for similar issues
3. Try up to 5 fixes before escalating
4. Log new errors to docs/error-log.md with solution
