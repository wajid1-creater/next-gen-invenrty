'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { loginSchema, formatZodErrors } from '@/lib/schemas';
import type { AuthResponse } from '@/lib/types';
import { toast } from '@/lib/toast';
import Button from '@/components/Button';
import { Box, ArrowRight, Eye, EyeOff, Info } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDemo, setShowDemo] = useState(false);
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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      {/* Subtle grid background — implies "data product" without being decorative */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 [background:radial-gradient(circle_at_50%_-20%,rgba(5,150,105,0.06),transparent_50%),linear-gradient(to_right,rgba(9,9,11,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(9,9,11,0.025)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]"
      />

      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-zinc-950 rounded-md flex items-center justify-center">
            <Box size={16} strokeWidth={2.4} className="text-white" />
          </div>
          <span className="text-base font-semibold text-zinc-900 tracking-tight">NGIM</span>
        </div>

        <h1 className="text-[26px] font-semibold text-zinc-900 tracking-tight leading-tight">
          Sign in to your account
        </h1>
        <p className="text-[14px] text-zinc-500 mt-1.5">
          Continue to the inventory management console.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-zinc-700 mb-1.5">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-md text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
              placeholder="you@company.com"
            />
            {fieldErrors.email && (
              <p id="login-email-error" className="mt-1.5 text-[12px] text-red-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-[12px] font-medium text-zinc-700">
                Password
              </label>
              <button
                type="button"
                className="text-[12px] text-zinc-500 hover:text-zinc-900"
                tabIndex={-1}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                className="w-full h-10 pl-3 pr-10 bg-white border border-zinc-200 rounded-md text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-700 rounded"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="login-password-error" className="mt-1.5 text-[12px] text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            trailingIcon={!loading && <ArrowRight size={14} />}
          >
            Sign in
          </Button>
        </form>

        <p className="text-center text-[13px] text-zinc-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-zinc-900 font-medium hover:text-emerald-700 underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>

        {/* Demo creds disclosed deliberately, never exposed by default. */}
        <div className="mt-10 pt-6 border-t border-zinc-200/70">
          <button
            type="button"
            onClick={() => setShowDemo((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-900"
          >
            <Info size={12} />
            {showDemo ? 'Hide' : 'View'} demo credentials
          </button>
          {showDemo && (
            <div className="mt-3 grid gap-1.5 text-[12px] text-zinc-600 font-mono bg-zinc-100/70 border border-zinc-200/70 rounded-md p-3 animate-fade-in">
              <DemoRow role="admin" />
              <DemoRow role="manager" />
              <DemoRow role="supplier" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoRow({ role }: { role: 'admin' | 'manager' | 'supplier' }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>
        <span className="text-zinc-400">{role}</span>
        <span className="mx-1.5 text-zinc-300">·</span>
        {role}@ngim.com
      </span>
      <span className="text-zinc-400">password123</span>
    </div>
  );
}
