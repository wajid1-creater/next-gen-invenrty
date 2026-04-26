'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { loginSchema, formatZodErrors } from '@/lib/schemas';
import type { AuthResponse } from '@/lib/types';
import { toast } from '@/lib/toast';
import { Box, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(formatZodErrors(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', parsed.data);
      setUser(data.user);
      const next = new URLSearchParams(window.location.search).get('next');
      const dest = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
      router.push(dest);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-[family-name:var(--font-geist-sans)]">
      {/* ─── Left: solid emerald brand panel ────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-between bg-emerald-700 text-white p-14 relative overflow-hidden">
        {/* Single drifting halo for soft depth */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-emerald-500/35 blur-3xl pointer-events-none animate-halo-drift" />

        <div
          className="relative flex items-center gap-2.5 reveal"
          style={{ animationDelay: '0ms' }}
        >
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <Box size={18} strokeWidth={2.4} className="text-emerald-700" />
          </div>
          <span className="text-base font-semibold tracking-tight">NGIM</span>
        </div>

        <h2
          className="relative max-w-[420px] text-[64px] leading-[0.95] font-semibold tracking-[-0.035em] reveal"
          style={{ animationDelay: '160ms' }}
        >
          Smart inventory.{' '}
          <span className="font-[family-name:var(--font-display-serif)] italic font-normal text-emerald-200">
            Smarter
          </span>{' '}
          decisions.
        </h2>

        <span className="hidden" />
      </aside>

      {/* ─── Right: form ────────────────────────────────────────────────── */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[380px]">
          <div
            className="lg:hidden flex items-center gap-2.5 mb-12 reveal"
            style={{ animationDelay: '0ms' }}
          >
            <div className="w-9 h-9 bg-emerald-700 rounded-lg flex items-center justify-center">
              <Box size={18} strokeWidth={2.4} className="text-white" />
            </div>
            <span className="text-base font-semibold text-zinc-900 tracking-tight">NGIM</span>
          </div>

          <h1
            className="text-[40px] leading-[1.05] font-semibold text-zinc-900 tracking-[-0.03em] reveal"
            style={{ animationDelay: '80ms' }}
          >
            Welcome{' '}
            <span className="font-[family-name:var(--font-display-serif)] italic font-normal text-emerald-700">
              back
            </span>
          </h1>
          <p className="text-[15px] text-zinc-500 mt-2 reveal" style={{ animationDelay: '180ms' }}>
            Sign in to your console.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-4">
            <div className="reveal" style={{ animationDelay: '280ms' }}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-11 px-3.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition"
              />
              {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
            </div>

            <div className="reveal" style={{ animationDelay: '360ms' }}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-11 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="reveal group w-full h-11 mt-3 rounded-lg bg-zinc-950 text-white text-[14px] font-medium hover:bg-zinc-800 active:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ animationDelay: '440ms' }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <p className="text-[13px] text-zinc-500 mt-8 reveal" style={{ animationDelay: '520ms' }}>
            New here?{' '}
            <Link
              href="/register"
              className="text-emerald-700 font-medium hover:text-emerald-800 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <style jsx global>{`
        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .reveal {
          opacity: 0;
          animation: reveal 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes haloDrift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-30px, 28px);
          }
        }
        .animate-halo-drift {
          animation: haloDrift 18s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .animate-halo-drift {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[12px] font-medium text-zinc-700 mb-1.5">
      {children}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[12px] text-red-600">{children}</p>;
}
