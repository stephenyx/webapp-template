# Error Log

This document tracks errors encountered during development, their root causes, and resolutions. Agents use this for pattern matching during auto-resolution.

---

## How to Use This Log

### For Agents

1. **Before debugging**: Search this log for similar error patterns
2. **After resolving**: Add new entry with the format below
3. **Pattern matching**: Use error codes and messages to find solutions

### Entry Format

```markdown
## [DATE] - Brief Error Title

**Feature**: XXXX-feature-name (or "General")
**Component**: path/to/affected/file.ts
**Error Type**: TypeScript | Runtime | Test Failure | Build | Lint

### Error Message
\`\`\`
Exact error message
\`\`\`

### Attempted Solutions
1. First attempt - ❌ Did not work because...
2. Second attempt - ❌ Did not work because...
3. Third attempt - ✅ Worked

### Root Cause
Why this error occurred

### Resolution
Step-by-step how it was fixed

### Prevention
How to avoid this in future
```

---

## Common Error Patterns

### TypeScript Errors

#### TS2307: Cannot find module '@repo/*'

**Root Cause**: Package not built or path alias not configured

**Resolution**:
1. Run `npm run build` in the package
2. Check `tsconfig.json` paths configuration
3. Ensure package.json has correct exports

**Prevention**: Always build packages before importing

---

#### TS2345: Argument of type 'X' is not assignable to type 'Y'

**Root Cause**: Type mismatch, often from API response or database query

**Resolution**:
1. Check the source of the data (API, DB)
2. Ensure types in `@repo/types` match actual data
3. Use type guards or assertions if needed

**Prevention**: Keep types in sync with API contracts

---

### Runtime Errors

#### ECONNREFUSED 127.0.0.1:5432

**Root Cause**: PostgreSQL not running

**Resolution**:
1. Start Docker: `npm run docker:dev`
2. Wait for container to be healthy
3. Retry the operation

**Prevention**: Always start Docker before running API

---

#### Cannot read properties of undefined

**Root Cause**: Accessing property on null/undefined value

**Resolution**:
1. Add null checks or optional chaining
2. Verify data is loaded before accessing
3. Add proper loading states in UI

**Prevention**: Use TypeScript strict mode, add guards

---

### Test Failures

#### Playwright: Timeout waiting for selector

**Root Cause**: Element not rendered or wrong selector

**Resolution**:
1. Use `data-testid` attributes for reliable selection
2. Add `await page.waitForSelector()` before interaction
3. Check if element is conditionally rendered

**Prevention**: Use data-testid, add explicit waits

---

#### Vitest: Expected X but received Y

**Root Cause**: Test expectation doesn't match implementation

**Resolution**:
1. Verify test is correct (TDD: test first)
2. Check if implementation matches spec
3. Update test or implementation as needed

**Prevention**: Write tests before implementation

---

### Build Errors

#### Turborepo: Task failed

**Root Cause**: Dependency task failed or missing

**Resolution**:
1. Check the specific task output
2. Run `npm run clean` and rebuild
3. Verify dependencies are installed

**Prevention**: Run full build after pulling changes

---

### Docker Errors

#### Port already in use

**Root Cause**: Another process using the port

**Resolution**:
1. Find process: `lsof -i :PORT`
2. Kill process or use different port
3. Update docker-compose if needed

**Prevention**: Use consistent ports, stop containers when done

---

## Error History

_Add new errors below in reverse chronological order (newest first)_

---

<!-- 
## [YYYY-MM-DD] - Error Title

**Feature**: XXXX-feature-name
**Component**: path/to/file.ts
**Error Type**: TypeScript | Runtime | Test Failure | Build | Lint

### Error Message
```
Paste exact error
```

### Attempted Solutions
1. First attempt - result
2. Second attempt - result

### Root Cause
Analysis

### Resolution
How it was fixed

### Prevention
How to avoid
-->
