/**
 * Initials avatar with deterministic background based on the name.
 *
 * Restraint: solid neutral surfaces only — colour-coded gradient avatars feel
 * decorative. Mature products use a single muted ring + initials.
 */

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
} as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export default function Avatar({
  name,
  size = 'md',
  className = '',
}: {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const initials = initialsOf(name);
  return (
    <div
      className={`shrink-0 inline-flex items-center justify-center rounded-full bg-zinc-800 text-zinc-100 font-medium ring-1 ring-white/[0.06] ${sizeMap[size]} ${className}`}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
}
