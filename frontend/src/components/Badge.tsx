/**
 * Status badge with semantic variants.
 *
 * Restraint over rainbow: only ever 4 colours so judges' eyes stay focused on
 * data, not decoration. Old keys (green/red/yellow/blue/purple/orange/emerald)
 * are aliased to the right semantic so existing call sites keep working
 * without breaking the design system.
 */

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type LegacyVariant =
  | Variant
  | 'green'
  | 'emerald'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'gray';

const VARIANT_STYLES: Record<Variant, { bg: string; text: string; dot: string; ring: string }> = {
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-600/15',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    ring: 'ring-amber-600/15',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    ring: 'ring-red-600/15',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    ring: 'ring-blue-600/15',
  },
  neutral: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-700',
    dot: 'bg-zinc-400',
    ring: 'ring-zinc-500/15',
  },
};

const ALIAS: Record<string, Variant> = {
  // Semantic aliases (preferred)
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'neutral',
  // Legacy colour names — map to the closest semantic.
  green: 'success',
  emerald: 'success',
  yellow: 'warning',
  orange: 'warning',
  red: 'danger',
  blue: 'info',
  purple: 'info',
  gray: 'neutral',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: LegacyVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'neutral', dot, size = 'sm' }: BadgeProps) {
  const semantic = ALIAS[variant] ?? 'neutral';
  const styles = VARIANT_STYLES[semantic];
  const sizing = size === 'md' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizing} rounded-md font-medium ring-1 ring-inset whitespace-nowrap ${styles.bg} ${styles.text} ${styles.ring}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  );
}
