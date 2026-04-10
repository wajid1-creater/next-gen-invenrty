'use client';
import { useEffect, useState } from 'react';
import { Bell, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function TopBar() {
  const { user, logout } = useAuthStore();
  const [unread, setUnread] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    api.get('/notifications/unread-count').then((r) => setUnread(r.data)).catch(() => {});
  }, []);

  return (
    <header className="h-16 glass border-b border-gray-200/60 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-lg w-full group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Search products, suppliers, orders..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 focus:bg-white transition-all duration-200 placeholder-gray-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded-md font-mono hidden md:inline">
            /
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a href="/notifications" className="relative p-2.5 hover:bg-gray-100 rounded-2xl transition-all duration-200 group">
          <Bell size={19} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse-soft shadow-lg shadow-red-500/30">
              {unread}
            </span>
          )}
        </a>

        <div className="w-px h-8 bg-gray-200 mx-1" />

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-2xl px-3 py-2 transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-green-500/20">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize font-medium">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={15} className="text-gray-400" /> Dashboard
                </a>
                <a href="/notifications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Bell size={15} className="text-gray-400" /> Notifications
                  {unread > 0 && <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{unread}</span>}
                </a>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => { logout(); window.location.href = '/login'; }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
