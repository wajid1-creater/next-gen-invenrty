'use client';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Single Button primitive used everywhere. No gradients, no colour-tinted
 * shadows. Solid surfaces with disciplined hover states.
 *
 * Variants:
 *   primary   — accent-coloured, the page's main action (one per page)
 *   secondary — neutral fill, default for "ok-but-not-the-point" actions
 *   ghost     — text-only with hover background, for inline/toolbar use
 *   danger    — destructive actions (delete, revoke)
 *   outline   — bordered, transparent fill — alternative to secondary
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/60',
  secondary: 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 disabled:bg-zinc-900/60',
  ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 disabled:text-zinc-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-600/60',
  outline:
    'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-60',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    className = '',
    disabled,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-100 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});

export default Button;
