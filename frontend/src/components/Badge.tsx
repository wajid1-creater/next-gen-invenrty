const variants: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
  red: 'bg-red-50 text-red-700 ring-red-500/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-500/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-500/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-500/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-500/20',
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
};

const dotColors: Record<string, string> = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-amber-500',
  orange: 'bg-orange-500',
  purple: 'bg-violet-500',
  gray: 'bg-gray-400',
  emerald: 'bg-emerald-500',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'gray', dot, size = 'sm' }: BadgeProps) {
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-semibold ring-1 ring-inset ${variants[variant] || variants.gray} whitespace-nowrap`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.gray} animate-pulse-soft`} />}
      {children}
    </span>
  );
}
