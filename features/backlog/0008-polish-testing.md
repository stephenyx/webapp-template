# Feature 0008: Polish & Testing

## Status

**Current**: 🔵 Planning

**Started**: (pending)
**Completed**: (pending)

---

## Overview

Final phase focused on production readiness: implement custom design system (sage/terracotta colors, Playfair Display + Inter fonts), comprehensive testing, performance optimization, security hardening, accessibility improvements, and SEO enhancements.

---

## User Stories

- [ ] As a user, I want a beautiful, cohesive design so that the app is pleasant to use
- [ ] As a user, I want fast page loads so that I don't wait for content
- [ ] As a user, I want accessible interfaces so that I can use the app regardless of ability
- [ ] As a developer, I want comprehensive tests so that I can refactor with confidence
- [ ] As a site owner, I want good SEO so that recipes can be discovered via search engines

---

## Acceptance Criteria

- [ ] Custom Tailwind theme with sage (#617061) and terracotta (#d4674d) colors
- [ ] Playfair Display font for headings, Inter for body text
- [ ] All components follow design system (airy, nostalgic, elegant, modern)
- [ ] Generous whitespace, soft shadows, rounded corners (6-8px)
- [ ] Unit test coverage >80% for services
- [ ] E2E test coverage for all major user flows
- [ ] All database queries use indexes for frequently queried columns
- [ ] All list endpoints support pagination
- [ ] Frontend routes are lazy-loaded
- [ ] Images use WebP format and lazy loading
- [ ] No exposed stack traces in production
- [ ] No sensitive data in logs (passwords, tokens)
- [ ] All forms have proper error messages
- [ ] All interactive elements have focus states
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] All pages have proper meta tags (title, description, OG tags)

---

## Personas Involved

- [x] 🎨 Designer - Design system implementation, component styling
- [x] ⚙️ Engineer - Performance optimization, lazy loading, indexes
- [x] 🧪 Tester - Comprehensive test suite, edge case coverage
- [x] 🔍 Reviewer - Security audit, accessibility audit
- [x] 📚 Documentarian - SEO meta tags, documentation updates

---

## Technical Approach

### Design System

**Colors:**
```typescript
// tailwind.config.js
colors: {
  sage: {
    50: '#f6f7f6',
    100: '#e3e5e3',
    200: '#c7cbc7',
    300: '#a4aba4',
    400: '#808a80',
    500: '#617061', // Primary
    600: '#4d5a4d',
    700: '#3f4a3f',
    800: '#343d34',
    900: '#2c332c',
  },
  terracotta: {
    50: '#fdf5f3',
    100: '#fbe8e4',
    200: '#f7d4cc',
    300: '#f0b5a9',
    400: '#e68b78',
    500: '#d4674d', // Accent
    600: '#c3523d',
    700: '#a34132',
    800: '#86372d',
    900: '#6e3229',
  },
}
```

**Fonts:**
```typescript
// tailwind.config.js
fontFamily: {
  serif: ['Playfair Display', 'Georgia', 'serif'], // Headings
  sans: ['Inter', 'system-ui', 'sans-serif'], // Body
  mono: ['JetBrains Mono', 'monospace'], // Code
}
```

**Style Keywords:**
- Airy (generous whitespace, breathing room)
- Nostalgic (warm colors, serif headings, handwritten feel)
- Elegant (refined typography, subtle animations)
- Modern (clean layout, responsive design)

### Performance Optimizations

1. **Database Indexes**
   - Add indexes on frequently queried columns: `users.email`, `users.username`, `recipes.userId`, `tags.slug`

2. **Pagination**
   - All list endpoints support `?page=1&limit=20`

3. **Frontend Optimizations**
   - Lazy load routes with React.lazy()
   - Lazy load images with loading="lazy"
   - Use WebP images with fallback

4. **Caching**
   - Leverage Turborepo caching for builds
   - Use TanStack Query for client-side caching

### Security Hardening

1. **Environment Variables**: Never commit secrets
2. **Input Validation**: Zod schemas on all API boundaries
3. **SQL Injection**: Only Drizzle ORM, no raw SQL
4. **CORS**: Configured allowed origins per environment
5. **Rate Limiting**: 1000 req/15min (dev), 100 req/15min (prod)
6. **Error Messages**: No stack traces in production
7. **Logging**: Never log passwords, tokens, or sensitive data

### Accessibility (WCAG AA)

1. **Semantic HTML**: Use proper heading hierarchy
2. **ARIA labels**: Add where needed for screen readers
3. **Keyboard navigation**: All interactive elements focusable
4. **Focus indicators**: Visible focus states
5. **Color contrast**: 4.5:1 for normal text, 3:1 for large text
6. **Alt text**: All images have descriptive alt attributes
7. **Form labels**: All inputs have associated labels

### SEO

1. **Meta tags**: Title, description, OG tags on all pages
2. **Semantic HTML**: Proper use of h1, h2, nav, main, article
3. **Sitemap**: Generate XML sitemap for search engines
4. **Robots.txt**: Configure crawl permissions
5. **Structured data**: JSON-LD for recipes (schema.org/Recipe)

---

## Tasks

### Design System (Designer)
- [ ] Update `tailwind.config.js` with custom sage/terracotta colors
- [ ] Add Playfair Display and Inter fonts (Google Fonts or self-hosted)
- [ ] Create design tokens file (colors, spacing, shadows, borders)
- [ ] Audit all components for design system compliance
- [ ] Apply consistent spacing, shadows, border-radius (6-8px)

### Performance (Engineer)
- [ ] Add database indexes via migration:
  - `CREATE INDEX idx_users_email ON users(email);`
  - `CREATE INDEX idx_users_username ON users(username);`
  - `CREATE INDEX idx_recipes_user_id ON recipes(user_id);`
  - `CREATE INDEX idx_tags_slug ON tags(slug);`
- [ ] Verify all list endpoints support pagination
- [ ] Implement lazy loading for routes (React.lazy)
- [ ] Implement lazy loading for images (loading="lazy")
- [ ] Convert images to WebP where possible
- [ ] Audit bundle size, code-split large dependencies

### Testing (Tester)
- [ ] Write comprehensive unit tests for all services
- [ ] Write E2E tests for all major user flows:
  - Registration, login, logout
  - Create recipe, edit recipe, delete recipe
  - Fork recipe, view lineage
  - Add tags, rate recipe, comment on recipe
  - Create cookbook, add recipes to cookbook
  - Create group, invite members, join group
  - Send friend request, accept request
  - View activity feed, search recipes/users
- [ ] Test edge cases and error scenarios
- [ ] Run tests in CI/CD pipeline
- [ ] Aim for >80% code coverage

### Security (Reviewer)
- [ ] Audit all environment variables (ensure no secrets in .env)
- [ ] Verify Zod validation on all API endpoints
- [ ] Verify no raw SQL queries (only Drizzle ORM)
- [ ] Test rate limiting (ensure it works)
- [ ] Verify error handling (no stack traces in production)
- [ ] Audit logging (ensure no sensitive data logged)
- [ ] Run security scan (npm audit, Snyk, etc.)

### Accessibility (Reviewer + Designer)
- [ ] Audit heading hierarchy (h1 → h2 → h3)
- [ ] Add ARIA labels where needed
- [ ] Test keyboard navigation (tab through all interactive elements)
- [ ] Verify focus indicators on all focusable elements
- [ ] Test color contrast with https://webaim.org/resources/contrastchecker/
- [ ] Add alt text to all images
- [ ] Verify all form inputs have labels
- [ ] Test with screen reader (VoiceOver, NVDA, JAWS)

### SEO (Documentarian + Engineer)
- [ ] Add meta tags to all pages (title, description, OG tags)
- [ ] Use semantic HTML (h1, h2, nav, main, article, section)
- [ ] Generate XML sitemap (`/sitemap.xml`)
- [ ] Create robots.txt (`/robots.txt`)
- [ ] Add JSON-LD structured data for recipes (schema.org/Recipe)
- [ ] Verify Open Graph tags work (test with https://www.opengraph.xyz/)

### Error Handling (Engineer)
- [ ] Implement global error boundary in React
- [ ] Add user-friendly error messages for all forms
- [ ] Add toast notifications for success/error feedback
- [ ] Create custom 404 page
- [ ] Create custom 500 error page

### Documentation (Documentarian)
- [ ] Update README with setup instructions
- [ ] Document environment variables in .env.example
- [ ] Update ARCHITECTURE.md if any patterns changed
- [ ] Create deployment guide
- [ ] Update all Swagger/OpenAPI docs

### Completion
- [ ] All tests passing (unit + E2E)
- [ ] Design system fully implemented
- [ ] Performance optimized (Lighthouse score >90)
- [ ] Security audit complete
- [ ] Accessibility audit complete (WCAG AA)
- [ ] SEO meta tags added
- [ ] Feature deployed to production
- [ ] Update feature status to ✅ Complete
- [ ] Move this doc to `features/completed/`

---

## Notes

- **Last phase**: All other features must be complete before starting this
- **Design system**: Set the visual identity for the entire app
- **Testing**: Critical for production confidence
- **Performance**: Ensure fast, responsive experience
- **Security**: Protect user data and prevent abuse
- **Accessibility**: Make app usable for everyone
- **SEO**: Drive organic traffic to recipes

---

## Error Log

| Date | Error | Resolution |
|------|-------|------------|
| | | |
