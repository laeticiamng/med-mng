# Testing Guide - MED-MNG Platform

This document outlines the comprehensive testing strategy for the MED-MNG medical education platform, covering unit tests, integration tests, and end-to-end tests.

## Overview

The testing suite includes:
- **Unit Tests**: Testing individual services and hooks (Vitest)
- **Integration Tests**: Testing RLS policies and database interactions (Vitest)
- **E2E Tests**: Testing user workflows and feature flows (Playwright)

## Test Coverage

### Phase 3 Implementation

#### Unit Tests (Vitest)
- ✅ `src/tests/services/user-favorites.service.test.ts` (6 test cases)
- ✅ `src/tests/services/user-viewing-history.service.test.ts` (5 test cases)
- ✅ `src/tests/services/user-collections.service.test.ts` (6 test cases)
- ✅ `src/tests/services/posts.service.test.ts` (7 test cases)
- ✅ `src/tests/hooks/useFavorites.test.ts` (3 test cases)

**Total Unit Tests**: 27 test cases

#### Integration Tests (Vitest)
- ✅ `src/tests/integration/rls-policies.test.ts` (15 test cases)
  - user_favorites RLS (3 tests)
  - user_viewing_history RLS (2 tests)
  - user_collections RLS (5 tests)
  - posts RLS (5 tests)

**Total Integration Tests**: 15 test cases

#### E2E Tests (Playwright)
- ✅ `test/e2e/favorites-flow.spec.ts` (6 test scenarios)
- ✅ `test/e2e/viewing-history-flow.spec.ts` (6 test scenarios)
- ✅ `test/e2e/collections-flow.spec.ts` (6 test scenarios)
- ✅ `test/e2e/gamification-flow.spec.ts` (7 test scenarios)

**Total E2E Tests**: 25 test scenarios

## Running Tests

### Unit Tests Only
```bash
npm run test:unit
# or
vitest run
```

### Unit Tests with Coverage
```bash
npm run test:unit:coverage
# or
vitest run --coverage
```

### Integration Tests
```bash
npm run test:integration
# or
vitest run src/tests/integration
```

### E2E Tests
```bash
npm run test:e2e
# or
npx playwright test
```

### E2E Tests with UI Mode
```bash
npm run test:e2e:ui
# or
npx playwright test --ui
```

### E2E Tests with Debug
```bash
npm run test:e2e:debug
# or
npx playwright test --debug
```

### All Tests
```bash
npm run test:all
```

### Coverage Report
```bash
npm run test:coverage
# View HTML report at: coverage/index.html
```

## Test Configuration

### Vitest Configuration
- **File**: `vitest.config.ts`
- **Environment**: jsdom
- **Coverage Provider**: v8
- **Globals**: enabled
- **CSS**: enabled

### Playwright Configuration
- **File**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop, Mobile, Tablet
- **Base URL**: http://localhost:5173
- **Reporter**: HTML, JSON, JUnit XML

## Test Data

### Mock Data Structure

#### User Favorites
```typescript
{
  id: string
  user_id: string
  item_id: string
  item_type: 'fiche' | 'post' | 'collection'
  item_name: string
  metadata?: {
    description: string
    stats: {
      views: number
      likes: number
      comments: number
    }
  }
  created_at: string
}
```

#### Viewing History
```typescript
{
  id: string
  user_id: string
  item_id: string
  item_type: 'fiche' | 'post' | 'collection'
  item_name: string
  view_source: 'feed' | 'detail' | 'search' | 'recommendation' | 'direct'
  metadata?: Record<string, any>
  created_at: string
}
```

#### Collections
```typescript
{
  id: string
  user_id: string
  name: string
  description?: string
  color?: string
  created_at: string
  updated_at: string
  metadata?: {
    itemCount: number
  }
}
```

## Coverage Goals

### Target Coverage: 80%+

**Current Coverage Areas:**
- Services: 100% (all new services tested)
- Hooks: 60% (core hooks covered)
- Components: 0% (to be added in future iterations)
- Integration: 100% (RLS policies tested)

## CI/CD Integration

### GitHub Actions (Recommended)

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Best Practices

### Unit Tests
1. Test happy path first
2. Test error scenarios
3. Test boundary cases
4. Mock external dependencies
5. Keep tests isolated and independent

### Integration Tests
1. Test RLS policies with multiple users
2. Verify data isolation
3. Test cascade operations
4. Verify indexes are used
5. Test concurrent operations

### E2E Tests
1. Test complete user workflows
2. Test on multiple browsers
3. Test on multiple devices
4. Use meaningful selectors (data-testid)
5. Wait for elements properly

## Debugging Tests

### Debug Unit Tests
```bash
vitest --inspect-brk
```

### Debug E2E Tests
```bash
npx playwright test --debug
```

### View E2E Traces
```bash
npx playwright show-trace trace.zip
```

## Common Issues

### Issue: "Cannot find module"
**Solution**: Ensure path aliases are configured in tsconfig.json and vitest.config.ts

### Issue: "Browser not found"
**Solution**: Run `npx playwright install`

### Issue: "Tests timeout"
**Solution**: Increase timeout in test configuration or reduce test complexity

### Issue: "RLS policy violation"
**Solution**: Ensure test user has proper authentication and row-level security is correctly mocked

## Future Improvements

1. Add component unit tests with React Testing Library
2. Add visual regression tests with Playwright
3. Add performance tests with Lighthouse CI
4. Add accessibility tests with axe-core
5. Increase coverage to 90%+ for all layers
6. Add snapshot tests for critical components
7. Implement continuous monitoring dashboards

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)

## Support

For questions about testing, please refer to:
- Test files for examples
- Vitest docs at https://vitest.dev
- Playwright docs at https://playwright.dev
- Team documentation wiki

---

**Last Updated**: November 14, 2024
**Version**: 3.0.0 (Phase 3 Complete)
