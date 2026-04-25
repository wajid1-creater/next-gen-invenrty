'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Search, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useUiStore } from '@/lib/ui-store';
import api, { apiLogout } from '@/lib/api';
import Avatar from './Avatar';

export default function TopBar() {
  const { user, logout } = useAuthStore();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [unread, setUnread] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    api
      .get<number>('/notifications/unread-count')
      .then((r) => setUnread(r.data))
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-zinc-200/70 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-1 hover:bg-zinc-100 rounded-md transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} className="text-zinc-600" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search products, suppliers, orders…"
            className="w-full h-9 pl-9 pr-12 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:bg-white placeholder-zinc-400"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 bg-white border border-zinc-200 px-1.5 py-0.5 rounded font-mono hidden md:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/notifications"
          className="relative p-2 hover:bg-zinc-100 rounded-md transition-colors group"
          aria-label="Notifications"
        >
          <Bell size={17} className="text-zinc-500 group-hover:text-zinc-900" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="relative ml-1">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 hover:bg-zinc-100 rounded-md pl-1 pr-2 py-1 transition-colors"
            aria-haspopup="menu"
            aria-expanded={showMenu}
          >
            <Avatar name={user?.name ?? '?'} size="sm" />
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-medium text-zinc-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 capitalize leading-tight">{user?.role}</p>
            </div>
            <ChevronDown
              size={13}
              className={`text-zinc-400 transition-transform hidden sm:block ${showMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-50 animate-slide-down"
                role="menu"
              >
                <div className="px-3 py-2.5 border-b border-zinc-100">
                  <p className="text-[13px] font-medium text-zinc-900 truncate">{user?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 transition-colors"
                  role="menuitem"
                >
                  <User size={14} className="text-zinc-400" /> Dashboard
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 transition-colors"
                  role="menuitem"
                >
                  <Bell size={14} className="text-zinc-400" /> Notifications
                  {unread > 0 && (
                    <span className="ml-auto text-[10px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-medium">
                      {unread}
                    </span>
                  )}
                </Link>
                <hr className="my-1 border-zinc-100" />
                <button
                  onClick={async () => {
                    await apiLogout();
                    logout();
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors w-full"
                  role="menuitem"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
