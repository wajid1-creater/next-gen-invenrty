'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast, { Toaster } from 'react-hot-toast';
import { Box, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-center" />

      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLThoLTEydjJoMTJ2LTJ6bTAtOGgtMTJ2MmgxMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/30">
              <Box size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">NGIM</h1>
              <p className="text-sm text-green-400/80">Next-Gen Inventory Management</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Smart Supply Chain<br />
            <span className="text-green-400">Intelligence Platform</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            Demand forecasting, procurement management, supplier visibility, and ESG compliance — all in one unified system.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { num: '8+', label: 'Core Modules' },
              { num: '99%', label: 'Forecast Accuracy' },
              { num: 'Real-time', label: 'Dashboard Analytics' },
              { num: 'ESG', label: 'Compliance Ready' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-green-400">{s.num}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Box size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">NGIM</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-1 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-green-600 font-medium hover:underline">
              Create account
            </Link>
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium">Admin:</span> admin@ngim.com / password123</p>
              <p><span className="font-medium">Manager:</span> manager@ngim.com / password123</p>
              <p><span className="font-medium">Supplier:</span> supplier@ngim.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
