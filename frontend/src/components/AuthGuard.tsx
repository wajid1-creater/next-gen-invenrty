'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import LoadingSpinner from './LoadingSpinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/login');
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <LoadingSpinner />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-5 sm:p-7 max-w-[1400px] w-full mx-auto overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
