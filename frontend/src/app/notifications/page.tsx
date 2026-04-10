'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { Bell, CheckCheck, AlertTriangle, Truck, Leaf, ClipboardList, ShoppingCart, Info } from 'lucide-react';

const typeConfig: Record<string, { icon: any; variant: any }> = {
  low_stock: { icon: AlertTriangle, variant: 'red' },
  delivery_delay: { icon: Truck, variant: 'orange' },
  esg_non_compliance: { icon: Leaf, variant: 'yellow' },
  task_assigned: { icon: ClipboardList, variant: 'blue' },
  order_status: { icon: ShoppingCart, variant: 'purple' },
  general: { icon: Info, variant: 'gray' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/notifications').then((r) => { setNotifications(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    toast.success('All marked as read');
    load();
  };

  if (loading) return <AuthGuard><LoadingSpinner /></AuthGuard>;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="space-y-4">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread notifications`}
          action={
            unreadCount > 0 ? (
              <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors">
                <CheckCheck size={16} /> Mark all as read
              </button>
            ) : null
          }
        />

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications for low stock, delays, and ESG alerts will appear here." />
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig.general;
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                    !n.isRead ? 'border-l-4 border-l-green-500 border-gray-100' : 'border-gray-100 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      config.variant === 'red' ? 'bg-red-50' : config.variant === 'orange' ? 'bg-orange-50' : config.variant === 'yellow' ? 'bg-yellow-50' : config.variant === 'blue' ? 'bg-blue-50' : config.variant === 'purple' ? 'bg-purple-50' : 'bg-gray-50'
                    }`}>
                      <Icon size={18} className={
                        config.variant === 'red' ? 'text-red-500' : config.variant === 'orange' ? 'text-orange-500' : config.variant === 'yellow' ? 'text-yellow-600' : config.variant === 'blue' ? 'text-blue-500' : config.variant === 'purple' ? 'text-purple-500' : 'text-gray-500'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">{n.title}</h4>
                        <Badge variant={config.variant}>{n.type.replace(/_/g, ' ')}</Badge>
                        {!n.isRead && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                      </div>
                      <p className="text-sm text-gray-600">{n.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
