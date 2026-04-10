'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products & Inventory', icon: Package },
  { href: '/suppliers', label: 'Suppliers', icon: Users },
  { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { href: '/tasks', label: 'Task Management', icon: ClipboardList },
  { href: '/deliveries', label: 'Delivery Tracking', icon: Truck },
  { href: '/forecasting', label: 'Demand Forecasting', icon: TrendingUp },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-[260px] bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Box size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">NGIM</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Next-Gen Inventory</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 pt-3 pb-2">Main Menu</p>
        {navItems.slice(0, 1).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 pt-5 pb-2">Supply Chain</p>
        {navItems.slice(1, 6).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 pt-5 pb-2">Intelligence</p>
        {navItems.slice(6).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 m-3 mt-0 rounded-xl bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={16} className="text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
