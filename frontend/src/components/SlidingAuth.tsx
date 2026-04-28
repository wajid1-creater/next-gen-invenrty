'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { loginSchema, registerSchema } from '@/lib/schemas';
import type { AuthResponse } from '@/lib/types';
import { toast } from '@/lib/toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type Mode = 'login' | 'register';

interface Props {
  initialMode: Mode;
}

export default function SlidingAuth({ initialMode }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const router = useRouter();

  // Keep the URL bar in sync with the visible form so refresh/share lands on the right view.
  useEffect(() => {
    const target = mode === 'login' ? '/login' : '/register';
    if (typeof window !== 'undefined' && window.location.pathname !== target) {
      window.history.replaceState({}, '', target);
    }
  }, [mode]);

  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-[family-name:var(--font-geist-sans)]">
      <div
        className={`sa-card relative w-full max-w-[820px] h-[520px] bg-white rounded-2xl shadow-[0_18px_50px_-12px_rgba(9,9,11,0.18)] overflow-hidden ${
          isRegister ? 'is-register' : ''
        }`}
      >
        <div className="sa-form sa-signin">
          <SignInForm router={router} />
        </div>

        <div className="sa-form sa-signup">
          <SignUpForm router={router} />
        </div>

        <div className="sa-overlay">
          <div className="sa-overlay-bg">
            {/* Login state: prompt on right inviting "Sign Up" */}
            <div className="sa-panel sa-panel-right">
              <h2 className="text-[34px] font-semibold tracking-tight">Hello, Friend!</h2>
              <p className="mt-4 max-w-[260px] text-[13px] leading-relaxed text-emerald-50/90">
                Enter your details and start your journey with us.
              </p>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="sa-ghost-btn mt-8"
              >
                SIGN UP
              </button>
            </div>

            {/* Register state: prompt on left inviting "Sign In" */}
            <div className="sa-panel sa-panel-left">
              <h2 className="text-[34px] font-semibold tracking-tight">Welcome Back!</h2>
              <p className="mt-4 max-w-[260px] text-[13px] leading-relaxed text-emerald-50/90">
                Stay connected by logging in with your credentials and continue your experience.
              </p>
              <button type="button" onClick={() => setMode('login')} className="sa-ghost-btn mt-8">
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Forms ─────────────────────────── */

interface FormProps {
  router: ReturnType<typeof useRouter>;
}

function SignInForm({ router }: FormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check your inputs.');
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
    <form onSubmit={handleSubmit} className="w-full max-w-[320px] mx-auto">
      <h1 className="text-[28px] font-semibold text-zinc-900 tracking-tight text-center">
        Sign in
      </h1>
      <p className="text-center text-[12px] text-zinc-400 mt-3 mb-4">
        Use your account credentials
      </p>

      <Field
        id="login-email"
        type="email"
        autoComplete="email"
        placeholder="Email Address"
        value={email}
        onChange={(v) => setEmail(v)}
      />

      <PasswordField
        id="login-password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(v) => setPassword(v)}
        show={showPassword}
        onToggle={() => setShowPassword((s) => !s)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[12px] font-semibold tracking-[0.12em] py-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> SIGNING IN…
          </>
        ) : (
          <>SIGN IN</>
        )}
      </button>
    </form>
  );
}

function SignUpForm({ router }: FormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check your inputs.');
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
    <form onSubmit={handleSubmit} className="w-full max-w-[320px] mx-auto">
      <h1 className="text-[28px] font-semibold text-zinc-900 tracking-tight text-center">
        Create Account
      </h1>
      <p className="text-center text-[12px] text-zinc-400 mt-3 mb-4">Use your email to register</p>

      <Field
        id="register-name"
        type="text"
        autoComplete="name"
        placeholder="Full Name"
        value={name}
        onChange={(v) => setName(v)}
      />

      <Field
        id="register-email"
        type="email"
        autoComplete="email"
        placeholder="Email Address"
        value={email}
        onChange={(v) => setEmail(v)}
      />

      <PasswordField
        id="register-password"
        autoComplete="new-password"
        placeholder="Password"
        value={password}
        onChange={(v) => setPassword(v)}
        show={showPassword}
        onToggle={() => setShowPassword((s) => !s)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[12px] font-semibold tracking-[0.12em] py-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> CREATING…
          </>
        ) : (
          <>SIGN UP</>
        )}
      </button>
    </form>
  );
}

/* ─────────────────────────── Bits ─────────────────────────── */

interface FieldShared {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}

function Field({ type, ...rest }: FieldShared & { type: string }) {
  return (
    <div className="mt-3">
      <input
        id={rest.id}
        type={type}
        autoComplete={rest.autoComplete}
        placeholder={rest.placeholder}
        value={rest.value}
        onChange={(e) => rest.onChange(e.target.value)}
        className="w-full h-11 px-4 bg-zinc-100 border border-transparent rounded-md text-[13px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
      />
    </div>
  );
}

function PasswordField({
  show,
  onToggle,
  ...rest
}: FieldShared & { show: boolean; onToggle: () => void }) {
  return (
    <div className="mt-3">
      <div className="relative">
        <input
          id={rest.id}
          type={show ? 'text' : 'password'}
          autoComplete={rest.autoComplete}
          placeholder={rest.placeholder}
          value={rest.value}
          onChange={(e) => rest.onChange(e.target.value)}
          className="w-full h-11 pl-4 pr-11 bg-zinc-100 border border-transparent rounded-md text-[13px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
