import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Card primitive. Hairline border, subtle shadow, white surface.
 * Use this everywhere instead of repeating "bg-white rounded-2xl shadow-sm border border-gray-100".
 */
export function Card({
  className = '',
  padded = true,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      className={`bg-white border border-zinc-200/80 rounded-lg shadow-[0_1px_2px_rgba(9,9,11,0.04)] ${padded ? 'p-5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
