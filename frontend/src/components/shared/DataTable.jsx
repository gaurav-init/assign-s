import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../lib/cn.js';
import { STATUS_COLORS, FRIENDLY_STATUS } from '../../constants/crm.js';

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 34;
const NUM_WIDTH = 52;
const MIN_COL = 96;
const MAX_COL = 320;

/**
 * Skeuomorphic-Clean data grid.
 *
 * - Columns are content-estimated with a MIN_COL floor and MAX_COL ceiling.
 * - When their total fits inside the viewport, we expand each column
 *   proportionally so the table fills the available width — **no forced
 *   horizontal scroll**.
 * - When they don't fit, the container scrolls horizontally and edge-fades
 *   plus a "scroll →" chip surface only in that case.
 * - Sticky header. Sticky row-# column. Hairline dividers.
 */
export function DataTable({
  columns,
  rows,
  highlightStatus = false,
  height = '520px',
  emptyState = null,
}) {
  const scrollRef = useRef(null);
  const [scroll, setScroll] = useState({ x: 0, maxX: 0 });
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () =>
      setScroll({ x: el.scrollLeft, maxX: el.scrollWidth - el.clientWidth });
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
      onScroll();
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [columns, rows]);

  const v = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virt = v.getVirtualItems();
  const total = v.getTotalSize();
  const padTop = virt.length ? virt[0].start : 0;
  const padBot = virt.length ? total - virt[virt.length - 1].end : 0;

  const widths = useMemo(
    () => layoutWidths(columns, rows, containerWidth),
    [columns, rows, containerWidth]
  );
  const contentW = NUM_WIDTH + widths.reduce((a, b) => a + b, 0);
  const overflows = containerWidth > 0 && contentW > containerWidth + 1;

  if (!rows.length && emptyState) return emptyState;

  const leftOverflow = overflows && scroll.x > 4;
  const rightOverflow = overflows && scroll.maxX - scroll.x > 4;

  return (
    <div className="relative">
      {/* Edge fades — only when the table actually overflows */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-[52px] z-30 w-6 bg-gradient-to-r from-white/95 to-transparent transition-opacity dark:from-ink-900/90',
          leftOverflow ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-30 w-8 bg-gradient-to-l from-white/95 to-transparent transition-opacity dark:from-ink-900/95',
          rightOverflow ? 'opacity-100' : 'opacity-0'
        )}
      />
      {rightOverflow && (
        <div className="pointer-events-none absolute right-2 top-2 z-40 hidden animate-fade-up items-center gap-1 rounded-pill border border-ink-200/80 bg-white/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-700 sm:inline-flex dark:border-ink-700/60 dark:bg-ink-950/85 dark:text-ink-100">
          scroll →
        </div>
      )}

      <div
        ref={scrollRef}
        className={cn(
          'relative rounded-card border border-ink-200/80 bg-white/70 dark:border-ink-700/60 dark:bg-ink-900/60',
          overflows ? 'overflow-auto' : 'overflow-hidden'
        )}
        style={{ height }}
      >
        <div className="relative" style={{ width: contentW, minWidth: '100%' }}>
          {/* Sticky header */}
          <div
            className="sticky top-0 z-20 flex border-b border-ink-200/80 bg-ink-50/95 backdrop-blur dark:border-ink-700/60 dark:bg-ink-950/95"
            style={{ height: HEADER_HEIGHT }}
          >
            <HeadCell
              width={NUM_WIDTH}
              className="sticky left-0 z-30 justify-center bg-ink-50/95 dark:bg-ink-950/95"
            >
              #
            </HeadCell>
            {columns.map((c, i) => (
              <HeadCell key={c + i} width={widths[i]}>
                {c}
              </HeadCell>
            ))}
          </div>

          {/* Virtualized body */}
          <div style={{ height: total, position: 'relative' }}>
            {padTop > 0 && <div style={{ height: padTop }} />}
            {virt.map((vi) => {
              const row = rows[vi.index];
              return (
                <div
                  key={vi.key}
                  className="group flex border-b border-ink-200/60 transition-colors hover:bg-amber-500/[0.06] dark:border-ink-800/70"
                  style={{ height: ROW_HEIGHT }}
                >
                  <div
                    className="sticky left-0 z-10 flex items-center justify-center border-r border-ink-200/60 bg-white/85 font-mono text-[10px] text-ink-500 group-hover:bg-white dark:border-ink-800/70 dark:bg-ink-900/85 dark:text-ink-400 dark:group-hover:bg-ink-900"
                    style={{ width: NUM_WIDTH, minWidth: NUM_WIDTH }}
                  >
                    {String(vi.index + 1).padStart(3, '0')}
                  </div>
                  {columns.map((c, i) => (
                    <Cell
                      key={c + i}
                      value={row?.[c]}
                      column={c}
                      width={widths[i]}
                      highlightStatus={highlightStatus}
                    />
                  ))}
                </div>
              );
            })}
            {padBot > 0 && <div style={{ height: padBot }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeadCell({ children, width, className }) {
  return (
    <div
      className={cn(
        'flex items-center border-r border-ink-200/60 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500 last:border-r-0 dark:border-ink-800/70 dark:text-ink-300',
        className
      )}
      style={{ width, minWidth: width }}
    >
      <span className="truncate">{children}</span>
    </div>
  );
}

function Cell({ value, column, width, highlightStatus }) {
  const isStatus = highlightStatus && column === 'crm_status';
  const empty = value == null || value === '';

  return (
    <div
      className="flex items-center border-r border-ink-200/60 px-3 font-mono text-[12px] text-ink-800 last:border-r-0 dark:border-ink-800/70 dark:text-ink-100"
      style={{ width, minWidth: width }}
    >
      {isStatus && value ? (
        <span
          className={cn(
            'inline-flex items-center rounded-pill border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
            STATUS_COLORS[value] ??
              'border-ink-300/60 bg-ink-100 text-ink-500 dark:border-ink-700/60 dark:bg-ink-800/60 dark:text-ink-300'
          )}
        >
          {FRIENDLY_STATUS[value] ?? value}
        </span>
      ) : empty ? (
        <span className="text-ink-400 dark:text-ink-500">—</span>
      ) : (
        <span className="block truncate" title={String(value)}>
          {String(value)}
        </span>
      )}
    </div>
  );
}

/**
 * Content-aware widths. If they'd fit inside `containerWidth`, expand each column
 * proportionally to fill it. Otherwise keep the natural widths and let the
 * container scroll horizontally.
 */
function layoutWidths(columns, rows, containerWidth) {
  const sample = rows.slice(0, 60);
  const base = columns.map((c) => {
    let maxLen = c.length;
    for (const r of sample) {
      const v = r?.[c];
      if (v == null) continue;
      const len = String(v).length;
      if (len > maxLen) maxLen = len;
    }
    return Math.round(Math.min(MAX_COL, Math.max(MIN_COL, maxLen * 7.4 + 32)));
  });

  if (!containerWidth) return base;

  const available = containerWidth - NUM_WIDTH - 1;
  const sum = base.reduce((a, b) => a + b, 0);

  if (sum >= available) return base;

  const extra = available - sum;
  const scaled = base.map((w) => w + (w / sum) * extra);
  const rounded = scaled.map((w) => Math.floor(w));

  // Absorb any rounding drift into the last column.
  const drift = available - rounded.reduce((a, b) => a + b, 0);
  if (rounded.length > 0) rounded[rounded.length - 1] += drift;

  return rounded;
}
