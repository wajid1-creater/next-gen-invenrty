import { type CSSProperties } from 'react';

/**
 * Tailwind-styled shimmer block.
 *
 * Composition is preferred over a kitchen-sink "Skeleton" with 20 props:
 * build the shape of your real UI out of these primitives. See
 * `TableSkeleton`, `CardGridSkeleton`, `StatsGridSkeleton` below.
 */
export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}) {
  const radius =
    rounded === 'none' ? '' : rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;
  const style: CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;
  return <div className={`animate-shimmer ${radius} ${className}`} style={style} />;
}

/** Generic page skeleton: header bar + content area. Used in loading.tsx files. */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width={200} height={28} />
          <Skeleton width={320} height={14} />
        </div>
        <Skeleton width={140} height={40} rounded="xl" />
      </div>
      <CardGridSkeleton count={4} />
      <TableSkeleton rows={6} />
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton width={80} height={12} />
            <Skeleton width={36} height={36} rounded="xl" />
          </div>
          <Skeleton width={100} height={28} />
          <Skeleton width={60} height={10} />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6, cols = 3 }: { count?: number; cols?: 2 | 3 | 4 }) {
  const colClass =
    cols === 2
      ? 'md:grid-cols-2'
      : cols === 4
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid ${colClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton width={40} height={40} rounded="xl" />
            <div className="flex-1 space-y-2">
              <Skeleton width="70%" height={14} />
              <Skeleton width="40%" height={10} />
            </div>
          </div>
          <Skeleton width="90%" height={10} />
          <Skeleton width="60%" height={10} />
          <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
            <Skeleton width={60} height={20} rounded="full" />
            <Skeleton width={40} height={20} rounded="full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="grid bg-gray-50/80 border-b border-gray-100 px-5 py-3.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width="60%" height={10} />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid px-5 py-4 items-center"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                width={c === 0 ? '80%' : c === cols - 1 ? '40%' : '60%'}
                height={c === 0 ? 16 : 12}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <Skeleton width={44} height={44} rounded="xl" />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" height={14} />
            <Skeleton width="60%" height={10} />
          </div>
          <Skeleton width={80} height={28} rounded="xl" />
        </div>
      ))}
    </div>
  );
}
