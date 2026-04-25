'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { registerSchema, formatZodErrors } from '@/lib/schemas';
import type { AuthResponse, UserRole } from '@/lib/types';
import { toast } from '@/lib/toast';
import Button from '@/components/Button';
import { Box, ArrowRight, Eye, EyeOff } from 'lucide-react';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'supplier', label: 'Supplier' },
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('manager');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = registerSchema.safeParse({ name, email, password, role });
    if (!parsed.success) {
      setFieldErrors(formatZodErrors(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', parsed.data);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
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
          Create your account
        </h1>
        <p className="text-[14px] text-zinc-500 mt-1.5">
          Get started with the inventory management console.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-[12px] font-medium text-zinc-700 mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!fieldErrors.name}
              className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-md text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
              placeholder="Jane Doe"
            />
            {fieldErrors.name && (
              <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-zinc-700 mb-1.5">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-md text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
              placeholder="you@company.com"
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[12px] font-medium text-zinc-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!fieldErrors.password}
                className="w-full h-10 pl-3 pr-10 bg-white border border-zinc-200 rounded-md text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                placeholder="Min. 8 chars, a letter and a number"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-700 rounded"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-1.5">
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`h-9 rounded-md text-[13px] font-medium border transition-colors ${
                      active
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            trailingIcon={!loading && <ArrowRight size={14} />}
            className="!mt-6"
          >
            Create account
          </Button>
        </form>

        <p className="text-center text-[13px] text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-zinc-900 font-medium hover:text-emerald-700 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
