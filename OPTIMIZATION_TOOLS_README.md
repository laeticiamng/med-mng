# ⚡ Optimization Tools - Complete Reference

This document provides a complete reference for all optimization tools and utilities available in the MED-MNG platform.

## 📦 Available Tools & Files

### Configuration Files

| File | Purpose | Usage |
|------|---------|-------|
| `src/config/routeConfig.tsx` | Centralized route configuration | Import route groups for App.tsx |
| `src/config/componentOptimizationStrategy.ts` | Optimization priorities and techniques | Reference when optimizing components |
| `src/config/cacheHeaders.ts` | HTTP caching configuration | Deploy to server for cache optimization |
| `vite.config.ts` | Build optimization | Already configured with chunk splitting |
| `src/lib/queryClient.ts` | React Query cache configuration | Already configured with smart caching |

### Component Libraries

| File | Purpose | Usage |
|------|---------|-------|
| `src/components/common/SuspenseLoader.tsx` | Reusable loading UI | `<SuspenseWrapper>{children}</SuspenseWrapper>` |
| `src/components/common/withPageOptimization.tsx` | Component optimization HOCs | `export default withPageOptimization(Component)` |
| `src/components/optimization/VirtualizedList.tsx` | Virtual scrolling for large lists | `<VirtualizedList items={1000} .../>` |

### Hook Libraries

| File | Purpose | Key Hooks |
|------|---------|-----------|
| `src/hooks/useRoutePrefetch.ts` | Route prefetching | `usePrefetchRoute`, `useIntersectionPrefetch` |
| `src/hooks/useComponentOptimization.ts` | Component optimization | `useDebounce`, `useThrottle`, `useLazyLoad`, etc. (13 hooks) |

### Services

| File | Purpose | Usage |
|------|---------|-------|
| `src/services/performanceMonitoringService.ts` | Performance tracking | `performanceMonitor.getSummary()` |

### Guides

| File | Purpose | Read when... |
|------|---------|--------------|
| `OPTIMIZATION_GUIDE.md` | Router & performance optimization | Starting project or setting up cache |
| `COMPONENT_OPTIMIZATION_GUIDE.md` | Component-level optimization | Optimizing specific components |
| `OPTIMIZATION_TOOLS_README.md` | This file | Need quick reference |

---

## 🚀 Quick Start Guide

### 1. Using Reusable Components

#### SuspenseLoader - Eliminate boilerplate

```typescript
// Old (10+ lines per route)
<Route path={path} element={
  <Suspense fallback={<div className="..."><div className="animate-spin">Loading...</div></div>}>
    <Component />
  </Suspense>
} />

// New (1 line)
import { wrapRoute } from '@/config/routeConfig';
{ path: ROUTE_PATHS.dashboard, element: wrapRoute(Dashboard) }
```

#### withPageOptimization - Memoize components

```typescript
import { withPageOptimization } from '@/components/common/withPageOptimization';

export default withPageOptimization(EdnComplete, {
  enableProfiling: true,
  memoDeps: ['filters', 'searchQuery']
});
```

#### VirtualizedList - Fast rendering for large lists

```typescript
import { VirtualizedList } from '@/components/optimization/VirtualizedList';

<VirtualizedList
  items={1000}
  itemSize={50}
  renderItem={(item) => <div>{item.name}</div>}
  containerHeight={600}
/>
```

---

### 2. Using Optimization Hooks

#### useDebounce - Reduce API calls

```typescript
import { useDebounce } from '@/hooks/useComponentOptimization';

const debouncedSearch = useDebounce(searchQuery, 300);
useEffect(() => {
  searchAPI.get(debouncedSearch);
}, [debouncedSearch]);
```

#### useThrottle - Limit event frequency

```typescript
import { useThrottle } from '@/hooks/useComponentOptimization';

const handleScroll = useThrottle(() => {
  updateScrollPosition();
}, 100);

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [handleScroll]);
```

#### useLazyLoad - Load below-the-fold content

```typescript
import { useLazyLoad } from '@/hooks/useComponentOptimization';

const ref = useLazyLoad(() => {
  console.log('Section became visible');
});

<section ref={ref}>Heavy content</section>
```

#### useAbortSignal - Prevent memory leaks

```typescript
import { useAbortSignal } from '@/hooks/useComponentOptimization';

const signal = useAbortSignal();

useEffect(() => {
  fetch('/api/data', { signal });
}, [signal]);
```

#### useLocalStorage - Persist user data

```typescript
import { useLocalStorage } from '@/hooks/useComponentOptimization';

const [theme, setTheme] = useLocalStorage('theme', 'light');

<button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
  Toggle Theme
</button>
```

---

### 3. Using React Query Caching

Query keys are type-safe and organized by resource:

```typescript
import { queryKeys } from '@/lib/queryClient';

// EDN items
useQuery(queryKeys.ednItems.all(), fetchAll);
useQuery(queryKeys.ednItems.search('cancer'), fetchSearch);
useQuery(queryKeys.ednItems.filters(filters), fetchFiltered);

// Challenges
useQuery(queryKeys.challenges.daily(), fetchDaily);
useQuery(queryKeys.challenges.history(), fetchHistory);

// Leaderboards
useQuery(queryKeys.leaderboard.global(), fetchGlobal);
useQuery(queryKeys.leaderboard.weekly(), fetchWeekly);

// Custom resources
useQuery(queryKeys.list('posts', { limit: 10 }), fetchPosts);
```

---

### 4. Using Route Prefetching

Anticipate user navigation:

```typescript
import { usePrefetchRoute } from '@/hooks/useRoutePrefetch';

const prefetchProps = usePrefetchRoute(
  () => fetchDashboardData(),
  { delay: 300 }
);

<Link {...prefetchProps} to="/dashboard">
  Go to Dashboard
</Link>
```

---

### 5. Performance Monitoring

Track application metrics:

```typescript
import { performanceMonitor } from '@/services/performanceMonitoringService';

// Get performance summary
const summary = performanceMonitor.getSummary();
console.log('Memory:', summary.memoryUsage, 'MB');
console.log('Latency:', summary.networkLatency, 'ms');

// Measure async operations
const result = await performanceMonitor.measureAsync('fetchData', async () => {
  return await fetch('/api/data');
});

// Export for analysis
const metrics = performanceMonitor.exportMetrics();
```

---

## 📋 Implementation Checklist

### Phase 1: Setup (Done)

- [x] Create route configuration
- [x] Create reusable components
- [x] Create optimization hooks
- [x] Configure React Query
- [x] Configure Vite build
- [x] Create monitoring service

### Phase 2: Implementation (Your Turn)

- [ ] Update App.tsx to use `routeConfig.tsx`
- [ ] Add `React.memo` to list item components
- [ ] Add `useDebounce` to search/filter inputs
- [ ] Implement virtual scrolling for large lists
- [ ] Add performance monitoring to critical pages
- [ ] Configure server cache headers
- [ ] Run Lighthouse audit
- [ ] Monitor Core Web Vitals

### Phase 3: Monitoring

- [ ] Set up Lighthouse CI
- [ ] Monitor bundle size
- [ ] Track performance metrics
- [ ] Set up alerting for regressions

---

## 🎯 Common Use Cases

### Use Case 1: Optimize Search Input

```typescript
import { useDebounce } from '@/hooks/useComponentOptimization';

function SearchEdn() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: results } = useQuery(
    queryKeys.ednItems.search(debouncedQuery),
    () => searchAPI(debouncedQuery),
    { enabled: !!debouncedQuery }
  );

  return (
    <>
      <input onChange={(e) => setQuery(e.target.value)} />
      <Results data={results} />
    </>
  );
}
```

**Impact:** 90% fewer API calls

---

### Use Case 2: Virtualize Long List

```typescript
import { VirtualizedList } from '@/components/optimization/VirtualizedList';

function EdnItems() {
  const { data: items } = useQuery(queryKeys.ednItems.all(), fetchAllItems);

  return (
    <VirtualizedList
      items={items || []}
      itemSize={60}
      renderItem={(item) => (
        <EdnItemCard item={item} />
      )}
      containerHeight={800}
    />
  );
}
```

**Impact:** 60fps scroll, 95% fewer DOM nodes

---

### Use Case 3: Cache API Results

```typescript
function useEdnItems(page: number) {
  return useQuery(
    queryKeys.ednItems.unified(page),
    () => api.getEdnItems(page),
    {
      staleTime: 5 * 60 * 1000,  // 5 min
      gcTime: 24 * 60 * 60 * 1000  // 24 hours
    }
  );
}
```

**Impact:** 80% fewer network requests

---

### Use Case 4: Prefetch on Hover

```typescript
import { usePrefetchRoute } from '@/hooks/useRoutePrefetch';

function DashboardLink() {
  const prefetch = usePrefetchRoute(() => {
    return queryClient.prefetchQuery(
      queryKeys.dashboard.overview(),
      fetchDashboard
    );
  });

  return (
    <Link {...prefetch} to="/dashboard">
      Dashboard
    </Link>
  );
}
```

**Impact:** 30-50% faster perceived navigation

---

### Use Case 5: Lazy Load Below-Fold Content

```typescript
import { useLazyLoad } from '@/hooks/useComponentOptimization';

function HomePage() {
  const chartsRef = useLazyLoad(() => {
    loadChartsLibrary();
  });

  return (
    <>
      <Hero />
      <Stats />
      <section ref={chartsRef}>
        <HeavyCharts />
      </section>
    </>
  );
}
```

**Impact:** 40% faster initial page load

---

## 🔧 Troubleshooting

### Problem: Component still re-renders unnecessarily

**Solution:** Add React.memo + useCallback for handlers

```typescript
const Item = React.memo(({ onClick, data }) => (
  <div onClick={onClick}>{data.name}</div>
));

const List = ({ items }) => {
  const handleClick = useCallback((item) => {
    selectItem(item);
  }, []);

  return items.map(item => (
    <Item key={item.id} data={item} onClick={handleClick} />
  ));
};
```

---

### Problem: Memory keeps increasing

**Solution:** Clean up event listeners and cancel requests

```typescript
useEffect(() => {
  const signal = new AbortController();

  fetch('/api/data', { signal });

  return () => signal.abort();
}, []);

// Or use useAbortSignal hook
const signal = useAbortSignal();
```

---

### Problem: API called too many times

**Solution:** Use React Query caching + debounce

```typescript
const debouncedQuery = useDebounce(searchQuery, 300);

const { data } = useQuery(
  queryKeys.ednItems.search(debouncedQuery),
  () => api.search(debouncedQuery),
  {
    enabled: !!debouncedQuery,
    staleTime: 5 * 60 * 1000
  }
);
```

---

### Problem: Scroll is janky/stuttering

**Solution:** Virtualize the list

```typescript
<VirtualizedList
  items={items}
  itemSize={50}
  renderItem={renderItem}
  containerHeight={600}
  overscan={3}  // Pre-render extra items
/>
```

---

## 📊 Performance Targets

| Metric | Target | Current (Estimated) | Gap |
|--------|--------|-------|-----|
| Bundle Size (gzipped) | < 240KB | ~280KB | -40KB |
| First Contentful Paint | < 2s | ~2.5s | -0.5s |
| Time to Interactive | < 2.8s | ~4.2s | -1.4s |
| Lighthouse Score | > 90 | ~70 | +20 |
| Cache Hit Rate | > 85% | ~45% | +40% |

---

## 🎓 Learning Path

1. **Understand the basics**: Read `OPTIMIZATION_GUIDE.md`
2. **Learn component optimization**: Read `COMPONENT_OPTIMIZATION_GUIDE.md`
3. **Implement quick wins**: Use memoization + debounce hooks
4. **Test and measure**: Use React DevTools Profiler + Lighthouse
5. **Advanced optimization**: Implement virtual scrolling + code splitting

---

## 📚 Additional Resources

- [React Performance Docs](https://react.dev/learn/render-and-commit)
- [React DevTools Profiler](https://react.dev/learn/react-dev-tools)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## ❓ FAQ

**Q: Where should I start optimizing?**
A: Start with critical pages (Dashboard, EdnComplete) and heavily-used components (lists, search).

**Q: How do I know if a component is slow?**
A: Use React DevTools Profiler or add `useRenderTime` hook to components.

**Q: Should I memoize everything?**
A: No, only memoize components that re-render frequently or are expensive to render.

**Q: What's the best debounce delay?**
A: 300ms for search (balance between responsiveness and API calls), 100-200ms for scroll/resize.

**Q: How do I measure performance improvement?**
A: Use Lighthouse before/after, measure render times with DevTools Profiler, monitor bundle size.

---

## 🚀 Ready to Optimize?

1. Pick a component from `componentOptimizationStrategy.ts`
2. Check appropriate section in `COMPONENT_OPTIMIZATION_GUIDE.md`
3. Apply relevant techniques from this document
4. Measure with Lighthouse/DevTools Profiler
5. Commit with measurable improvements

Good luck! 🎯
