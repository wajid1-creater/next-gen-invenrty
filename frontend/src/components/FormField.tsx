/**
 * Form field primitives.
 *
 * NOTE: this file's `Button` is a legacy shim for pages that still import it
 * from FormField. New code should import from `@/components/Button` directly,
 * which has more variants and better behaviour.
 */
import BaseButton from './Button';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}

export default function FormField({ label, children, required, hint, error }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-zinc-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-9 px-3 bg-white border border-zinc-200 rounded-md text-[13px] text-zinc-900 placeholder-zinc-400 transition-colors hover:border-zinc-300 focus:outline-none focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400 ${className}`}
    />
  );
}

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full h-9 px-3 bg-white border border-zinc-200 rounded-md text-[13px] text-zinc-900 transition-colors hover:border-zinc-300 focus:outline-none focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400 ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 bg-white border border-zinc-200 rounded-md text-[13px] text-zinc-900 placeholder-zinc-400 transition-colors hover:border-zinc-300 focus:outline-none focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400 ${className}`}
    />
  );
}

/** Legacy shim — prefer importing Button from '@/components/Button'. */
export function Button({
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const map = {
    primary: 'primary',
    secondary: 'outline',
    danger: 'danger',
  } as const;
  return <BaseButton variant={map[variant]} {...props} />;
}
