'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ClipboardList,
  Truck,
  TrendingUp,
  Bell,
  LogOut,
  Box,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useUiStore } from '@/lib/ui-store';
import { apiLogout } from '@/lib/api';
import Avatar from './Avatar';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Operations',
    items: [
      { href: '/products', label: 'Products', icon: Package },
      { href: '/suppliers', label: 'Suppliers', icon: Users },
      { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
      { href: '/deliveries', label: 'Deliveries', icon: Truck },
      { href: '/tasks', label: 'Tasks', icon: ClipboardList },
    ],
  },
  {
    title: 'Insights',
    items: [
      { href: '/forecasting', label: 'Forecasting', icon: TrendingUp },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isOpen = useUiStore((s) => s.isSidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeSidebar]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-zinc-950 text-zinc-100 flex flex-col shrink-0 border-r border-white/[0.06] transform transition-transform duration-200 lg:static lg:transform-none lg:translate-x-0 lg:min-h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 h-16 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
              <Box size={16} strokeWidth={2.4} className="text-white" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight">NGIM</h1>
          </Link>
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden p-1.5 hover:bg-white/[0.06] rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_GROUPS.map((group, idx) => (
            <div key={group.title} className={idx > 0 ? 'mt-6' : ''}>
              <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500 font-medium px-2.5 mb-2">
                {group.title}
              </p>
              <div className="space-y-px">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 h-8 rounded-md text-[13px] transition-colors ${
                        active
                          ? 'bg-white/[0.08] text-white font-medium'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <item.icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                      <span className="truncate">{item.label}</span>
                      {active && <span className="ml-auto w-1 h-1 rounded-full bg-emerald-500" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name={user?.name ?? '?'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-zinc-100 truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] text-zinc-500 capitalize leading-tight mt-0.5">
                {user?.role}
              </p>
            </div>
            <button
              onClick={async () => {
                await apiLogout();
                logout();
                window.location.href = '/login';
              }}
              className="p-1.5 hover:bg-white/[0.06] rounded-md transition-colors group"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} className="text-zinc-500 group-hover:text-zinc-300" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
