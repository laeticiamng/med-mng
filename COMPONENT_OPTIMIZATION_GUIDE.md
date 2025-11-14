# 🎯 Component Optimization Guide

Practical guide for optimizing React components in the MED-MNG platform.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Optimization Hooks](#optimization-hooks)
3. [Component Patterns](#component-patterns)
4. [Performance Monitoring](#performance-monitoring)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Implementation Checklist](#implementation-checklist)

---

## Quick Start

### Identifying Slow Components

```bash
# Run Lighthouse audit
npm run build
npx lighthouse https://yoursite.com --view

# Profile in React DevTools
# Chrome DevTools → React DevTools → Profiler → Record
```

### Quick Wins (Easy 10-20% improvements)

```typescript
// 1. Memoize list items (2 minutes to implement)
const ListItem = React.memo(({ item }) => <div>{item.name}</div>);

// 2. Debounce search input (5 minutes)
const debouncedSearch = useDebounce(searchQuery, 300);

// 3. Lazy load modals (10 minutes)
const Modal = React.lazy(() => import('./Modal'));

// 4. Cache API responses (15 minutes)
useQuery(queryKeys.items.all(), fetchItems, { staleTime: 5 * 60 * 1000 });
```

---

## Optimization Hooks

### useDebounce - Reduce function calls

**Problem:** Search input triggers API call on every keystroke = 100+ requests

**Solution:** Debounce value for 300ms before processing

```typescript
import { useDebounce } from '@/hooks/useComponentOptimization';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // Only called once every 300ms instead of on every keystroke
      searchAPI.get(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input onChange={(e) => setQuery(e.target.value)} />;
}
```

**Impact:** 90% fewer API calls

---

### useThrottle - Limit frequency

**Problem:** Scroll event fires 100+ times/second

**Solution:** Throttle to once per 100ms

```typescript
import { useThrottle } from '@/hooks/useComponentOptimization';

function ScrollTracker() {
  const handleScroll = useThrottle(() => {
    console.log('User scrolled');
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}
```

**Impact:** 90% fewer event handler calls

---

### useLazyLoad - Load below-the-fold content

**Problem:** Loading all images/components at once = slower initial load

**Solution:** Load only when visible

```typescript
import { useLazyLoad } from '@/hooks/useComponentOptimization';

function HeavySection() {
  const ref = useLazyLoad(() => {
    console.log('This section is now visible');
    // Load data here
  });

  return (
    <section ref={ref}>
      <h2>Below the fold content</h2>
      <ExpensiveChart />
    </section>
  );
}
```

**Impact:** 50% faster initial page load

---

### useMemoCompare - Prevent unnecessary updates

**Problem:** Passing new object reference every render even if values are same

**Solution:** Memoize with custom comparison

```typescript
import { useMemoCompare } from '@/hooks/useComponentOptimization';

function FilteredList({ filters }) {
  // Only updates if filter values actually change, not reference
  const memoizedFilters = useMemoCompare(filters, (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  });

  // Use memoizedFilters
  return <List filters={memoizedFilters} />;
}
```

**Impact:** 30-50% fewer re-renders

---

### useAbortSignal - Clean up requests

**Problem:** Component unmounts but API request still pending = memory leak

**Solution:** Abort pending requests on unmount

```typescript
import { useAbortSignal } from '@/hooks/useComponentOptimization';

function DataFetcher() {
  const signal = useAbortSignal();

  useEffect(() => {
    // Request is automatically cancelled on unmount
    fetch('/api/data', { signal });
  }, [signal]);
}
```

**Impact:** Prevent memory leaks

---

### useLocalStorage - Persist user preferences

**Problem:** User preferences lost on refresh

**Solution:** Persist to localStorage with React state sync

```typescript
import { useLocalStorage } from '@/hooks/useComponentOptimization';

function UserSettings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  // Auto-persists on every change
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle theme
    </button>
  );
}
```

**Impact:** Better UX, no data loss

---

## Component Patterns

### Pattern 1: Virtualized Lists

**Problem:** Rendering 1000 items = slow UI (each item = div + text + styles)

**Solution:** Virtual scrolling - render only visible items

```typescript
import { VirtualizedList } from '@/components/optimization/VirtualizedList';

function LargeList({ items }) {
  return (
    <VirtualizedList
      items={items}
      itemSize={50}  // height of each item in pixels
      renderItem={(item, index) => (
        <div className="p-4 border-b">{item.name}</div>
      )}
      containerHeight={600}  // visible height
      gap={0}
    />
  );
}
```

**Before:** 1000 DOM nodes, janky scroll
**After:** 12 DOM nodes, 60fps scroll

---

### Pattern 2: Infinite Scroll

**Problem:** Load all items at once = memory + performance issues

**Solution:** Load more as user scrolls

```typescript
import { InfiniteScrollList } from '@/components/optimization/VirtualizedList';

function PaginatedFeed() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    const newItems = await fetchItems(page);
    setItems((prev) => [...prev, ...newItems]);
    setPage((prev) => prev + 1);
    setIsLoading(false);
  }, [page]);

  return (
    <InfiniteScrollList
      items={items}
      itemSize={100}
      renderItem={(item) => <PostCard post={item} />}
      containerHeight={800}
      onLoadMore={handleLoadMore}
      isLoading={isLoading}
    />
  );
}
```

**Before:** Load 10,000 items = 50MB memory
**After:** Load 50 at a time = 5MB memory

---

### Pattern 3: Memoized List Items

**Problem:** Parent re-render causes all list items to re-render

**Solution:** Memoize each item

```typescript
// ❌ Bad - All items re-render when parent changes
function ItemList({ items, onSelect }) {
  return items.map((item) => (
    <div onClick={() => onSelect(item)}>{item.name}</div>
  ));
}

// ✅ Good - Only selected item re-renders
const ListItem = React.memo(({ item, onSelect }) => (
  <div onClick={() => onSelect(item)}>{item.name}</div>
));

function ItemList({ items, onSelect }) {
  return items.map((item) => (
    <ListItem key={item.id} item={item} onSelect={onSelect} />
  ));
}
```

**Impact:** 90% fewer item re-renders

---

### Pattern 4: Code Splitting with Lazy Routes

**Problem:** All code loaded upfront = slow initial load

**Solution:** Load route code on demand

```typescript
// In routeConfig.tsx
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export const heavyRoutes: RouteObject[] = [
  {
    path: '/heavy',
    element: wrapRoute(HeavyComponent),
  },
];

// Browser loads this chunk only when user navigates to /heavy
```

**Before:** Main bundle 300KB
**After:** Main bundle 180KB, HeavyComponent 120KB (loaded on demand)

---

### Pattern 5: Query Caching

**Problem:** Same data fetched multiple times

**Solution:** Cache with React Query

```typescript
// In hooks/useEdnItems.ts
export function useEdnItems(page: number) {
  return useQuery(
    queryKeys.ednItems.unified(page),  // Unique key per page
    () => fetchEdnItems(page),
    {
      staleTime: 5 * 60 * 1000,        // Fresh for 5 minutes
      cacheTime: 24 * 60 * 60 * 1000,  // Keep in memory for 24h
      notifyOnChangeProps: 'tracked',   // Only notify if needed
    }
  );
}

// Usage
function EdnPage({ page }) {
  const { data, isLoading } = useEdnItems(page);
  // Automatic caching, refetch on focus, etc.
}
```

**Impact:** 80% fewer network requests

---

## Performance Monitoring

### 1. Render Time Profiling

```typescript
import { useRenderTime } from '@/hooks/useComponentOptimization';

function HeavyComponent() {
  useRenderTime('HeavyComponent');
  // Logs time to render to console
  return <div>Content</div>;
}
```

**What to look for:**
- Renders > 16ms = drops frames (target 60fps)
- Renders > 100ms = user noticeable lag

---

### 2. Bundle Size Monitoring

```bash
# Analyze bundle
npm run build && npm run analyze

# Check for large files
ls -lh dist/
```

**Targets:**
- Main chunk: < 150KB
- Total: < 800KB (gzipped < 240KB)

---

### 3. Lighthouse Audit

```bash
# Run audit
npx lighthouse https://yoursite.com --view

# Key metrics:
# - First Contentful Paint < 2s
# - Largest Contentful Paint < 3s
# - Time to Interactive < 2.8s
# - Cumulative Layout Shift < 0.1
```

---

## Common Issues & Solutions

### Issue 1: Memory Leaks

**Symptom:** Memory usage keeps increasing

```typescript
// ❌ Bad - event listener not removed
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  // Missing cleanup!
});

// ✅ Good - cleanup function
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [handleScroll]);
```

---

### Issue 2: Stale Closures

**Symptom:** Event handler uses old state value

```typescript
// ❌ Bad - uses stale count
function Counter() {
  const [count, setCount] = useState(0);
  const handleClick = () => console.log(count); // Always 0!

  useEffect(() => {
    setInterval(handleClick, 1000);
  }, []);
}

// ✅ Good - updates closure
function Counter() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => console.log(count), [count]);

  useEffect(() => {
    const id = setInterval(handleClick, 1000);
    return () => clearInterval(id);
  }, [handleClick]);
}
```

---

### Issue 3: Unnecessary Re-renders

**Symptom:** Component blinks/flickers

```typescript
// ❌ Bad - new function every render
function List({ items, onSelect }) {
  return items.map(item => (
    <Item key={item.id} onClick={() => onSelect(item)} />
  ));
}

// ✅ Good - stable callback
function List({ items, onSelect }) {
  const handleSelect = useCallback(onSelect, [onSelect]);
  return items.map(item => (
    <Item key={item.id} onClick={() => handleSelect(item)} />
  ));
}
```

---

### Issue 4: N+1 Queries

**Symptom:** Many API calls for same data

```typescript
// ❌ Bad - fetch in render
function UserList({ userIds }) {
  return userIds.map(id => <User userId={id} />); // Each renders fetches
}

function User({ userId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${userId}`).then(setData);
  }, [userId]);
}

// ✅ Good - batch fetch
function UserList({ userIds }) {
  const { data: users } = useQuery(
    ['users', userIds],
    () => fetch(`/api/users?ids=${userIds.join(',')}`)
  );
  return users?.map(u => <User user={u} />);
}
```

---

## Implementation Checklist

### Phase 1: Low-Hanging Fruit (1-2 days)

- [ ] Memoize list item components
- [ ] Add debounce to search/filter inputs
- [ ] Add useCallback to event handlers
- [ ] Lazy load modals and tabs
- [ ] Add error boundaries
- [ ] Remove console logs from production

### Phase 2: Medium Effort (3-5 days)

- [ ] Implement virtual scrolling for large lists
- [ ] Code split heavy routes
- [ ] Optimize images (lazy load, WebP)
- [ ] Cache API responses
- [ ] Implement prefetching
- [ ] Add performance monitoring

### Phase 3: Advanced (1-2 weeks)

- [ ] Implement service worker precaching
- [ ] Set up CDN with cache headers
- [ ] Monitor Core Web Vitals
- [ ] Profile with DevTools
- [ ] Optimize database queries
- [ ] Implement request deduplication

---

## Performance Budgets

**JavaScript:**
- Critical pages: < 50KB
- Medium pages: < 100KB
- Heavy pages: < 150KB

**Rendering:**
- Page load: < 3s
- Interaction: < 100ms
- Scroll: 60fps (16ms per frame)

**Network:**
- API response: < 500ms
- Image load: < 1s
- Total bundle: < 800KB (240KB gzipped)

---

## Resources

- [React DevTools Profiler](https://react.dev/learn/react-dev-tools)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse](https://web.dev/lighthouse/)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [React Optimization Docs](https://react.dev/reference/react/memo)

---

## Next Steps

1. **Audit your components**: Use React DevTools Profiler to find slow components
2. **Prioritize**: Focus on components used on critical paths
3. **Implement**: Follow patterns above to optimize
4. **Measure**: Use Lighthouse and performance budgets to track progress
5. **Monitor**: Set up alerts for performance regressions

Good luck optimizing! 🚀
