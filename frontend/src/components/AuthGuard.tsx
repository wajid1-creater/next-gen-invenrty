'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, hydrate } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (ready && !user) {
      const token = localStorage.getItem('token');
      if (!token) router.push('/login');
    }
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
