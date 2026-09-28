import { useLayoutEffect, useMemo, useRef, useState } from 'react';

const MAX_COLS = 6;
// Phones get two narrow columns (feels like a wall, not a feed); larger screens use wider ones.
const columnsFor = (width) => Math.max(1, Math.min(MAX_COLS, Math.floor(width / (width < 640 ? 160 : 250))));

const weight = (post) => 3 + Math.ceil(post.body.length / 34) + (post.body.match(/\n/g)?.length ?? 0);

/**
 * Pinterest-style columns. Each post keeps the column it was first placed in,
 * so a new post arriving live slides in at the top of one column instead of
 * reshuffling the whole board.
 */
export function Masonry({ items, resetKey, renderItem }) {
  const ref = useRef(null);
  const [cols, setCols] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(([entry]) => setCols(columnsFor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useRef(null);
  const columns = useMemo(() => {
    if (!layout.current || layout.current.cols !== cols || layout.current.key !== resetKey) {
      layout.current = { cols, key: resetKey, placed: new Map(), heights: Array(cols).fill(0) };
    }
    const { placed, heights } = layout.current;
    const out = Array.from({ length: cols }, () => []);

    items.forEach((item, index) => {
      if (!placed.has(item.id)) {
        const shortest = heights.indexOf(Math.min(...heights));
        placed.set(item.id, shortest);
        heights[shortest] += weight(item);
      }
      out[placed.get(item.id)].push({ item, index });
    });
    return out;
  }, [items, cols, resetKey]);

  return (
    <div ref={ref} className="flex items-start gap-3.5 sm:gap-5">
      {columns.map((col, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-3.5 sm:gap-5">
          {col.map(({ item, index }) => renderItem(item, index))}
        </div>
      ))}
    </div>
  );
}
