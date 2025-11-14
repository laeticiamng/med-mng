import React, { useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useComponentOptimization';

/**
 * High-performance virtualized list component
 * Only renders visible items, suitable for large lists
 *
 * Usage:
 * <VirtualizedList
 *   items={1000 items}
 *   itemSize={50}
 *   renderItem={(item, index) => <div>{item.name}</div>}
 *   containerHeight={600}
 * />
 */

interface VirtualizedListProps<T> {
  items: T[];
  itemSize: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  containerClassName?: string;
  itemClassName?: string;
  overscan?: number; // Render extra items above/below viewport
  gap?: number; // Space between items
}

export const VirtualizedList = React.memo(
  function VirtualizedList<T>({
    items,
    itemSize,
    renderItem,
    containerHeight,
    containerClassName = '',
    itemClassName = '',
    overscan = 3,
    gap = 0,
  }: VirtualizedListProps<T>) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = React.useState(0);

    // Calculate visible range with overscan
    const { startIndex, endIndex } = useMemo(() => {
      const start = Math.max(0, Math.floor(scrollTop / (itemSize + gap)) - overscan);
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / (itemSize + gap)) + overscan
      );
      return { startIndex: start, endIndex: end };
    }, [scrollTop, itemSize, containerHeight, items.length, gap, overscan]);

    // Debounce scroll to reduce calculations
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop((e.target as HTMLDivElement).scrollTop);
    }, []);

    const visibleItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);
    const offsetY = startIndex * (itemSize + gap);
    const totalHeight = items.length * (itemSize + gap);

    return (
      <div
        ref={scrollRef}
        className={`overflow-y-auto ${containerClassName}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Spacer for scrolled content */}
        <div style={{ height: offsetY }} />

        {/* Visible items */}
        {visibleItems.map((item, idx) => (
          <div
            key={startIndex + idx}
            className={itemClassName}
            style={{ height: itemSize, marginBottom: gap }}
          >
            {renderItem(item, startIndex + idx)}
          </div>
        ))}

        {/* Spacer for remaining content */}
        <div style={{ height: Math.max(0, totalHeight - offsetY - containerHeight) }} />
      </div>
    );
  }
);

/**
 * Infinite scroll wrapper component
 * Automatically loads more items as user scrolls
 */

interface InfiniteScrollProps<T> {
  items: T[];
  itemSize: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  onLoadMore: () => void | Promise<void>;
  isLoading?: boolean;
  hasMore?: boolean;
  loadingComponent?: React.ReactNode;
}

export const InfiniteScrollList = React.memo(
  function InfiniteScrollList<T>({
    items,
    itemSize,
    renderItem,
    containerHeight,
    onLoadMore,
    isLoading = false,
    hasMore = true,
    loadingComponent = <div className="p-4 text-center">Loading...</div>,
  }: InfiniteScrollProps<T>) {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!scrollRef.current || isLoading || !hasMore) return;

      const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        // Load more when user is 200px from bottom
        if (scrollHeight - (scrollTop + clientHeight) < 200) {
          onLoadMore();
        }
      };

      const scrollElement = scrollRef.current;
      scrollElement.addEventListener('scroll', handleScroll);

      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [isLoading, hasMore, onLoadMore]);

    return (
      <VirtualizedList
        items={items}
        itemSize={itemSize}
        renderItem={renderItem}
        containerHeight={containerHeight}
        containerClassName="border rounded-lg"
        ref={scrollRef}
      />
    );
  }
);

/**
 * Grid component with virtualization
 * For 2D layouts like photo galleries
 */

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns: number;
  itemSize: number;
  containerHeight: number;
  gap?: number;
}

export const VirtualizedGrid = React.memo(
  function VirtualizedGrid<T>({
    items,
    renderItem,
    columns,
    itemSize,
    containerHeight,
    gap = 8,
  }: VirtualizedGridProps<T>) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = React.useState(0);

    const rowHeight = itemSize + gap;
    const visibleRows = Math.ceil(containerHeight / rowHeight) + 1; // +1 for overscan

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const endRow = startRow + visibleRows;

    const visibleItems = useMemo(() => {
      const startIdx = startRow * columns;
      const endIdx = Math.min(items.length, endRow * columns);
      return items.slice(startIdx, endIdx);
    }, [items, startRow, endRow, columns]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop((e.target as HTMLDivElement).scrollTop);
    };

    const offsetY = startRow * rowHeight;
    const totalRows = Math.ceil(items.length / columns);
    const totalHeight = totalRows * rowHeight;

    return (
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Top spacer */}
        <div style={{ height: offsetY }} />

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap,
            padding: gap,
          }}
        >
          {visibleItems.map((item, idx) => (
            <div key={startRow * columns + idx}>{renderItem(item, startRow * columns + idx)}</div>
          ))}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: Math.max(0, totalHeight - offsetY - containerHeight) }} />
      </div>
    );
  }
);

export default VirtualizedList;
