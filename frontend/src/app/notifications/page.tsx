'use client';
import { useEffect, useState, type ComponentType } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { Card } from '@/components/Card';
import Button from '@/components/Button';
import type { Notification, NotificationType } from '@/lib/types';
import { formatRelativeTime, formatFullDateTime } from '@/lib/datetime';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Truck,
  Leaf,
  ClipboardList,
  ShoppingCart,
  Info,
  type LucideProps,
} from 'lucide-react';

type SemVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: ComponentType<LucideProps>; variant: SemVariant; label: string }
> = {
  low_stock: { icon: AlertTriangle, variant: 'danger', label: 'Low stock' },
  delivery_delay: { icon: Truck, variant: 'warning', label: 'Delivery delay' },
  esg_non_compliance: { icon: Leaf, variant: 'warning', label: 'ESG' },
  task_assigned: { icon: ClipboardList, variant: 'info', label: 'Task' },
  order_status: { icon: ShoppingCart, variant: 'info', label: 'Order' },
  general: { icon: Info, variant: 'neutral', label: 'General' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get<Notification[]>('/notifications').then((r) => {
      setNotifications(r.data);
      setLoading(false);
    });
  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    toast.success('All marked as read');
    load();
  };

  if (loading)
    return (
      <AuthGuard>
        <LoadingSpinner />
      </AuthGuard>
    );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread of ${notifications.length}`}
          action={
            unreadCount > 0 ? (
              <Button
                variant="outline"
                size="md"
                leadingIcon={<CheckCheck size={14} />}
                onClick={markAllRead}
              >
                Mark all read
              </Button>
            ) : undefined
          }
        />

        {notifications.length === 0 ? (
          <EmptyState
            variant="card"
            icon={Bell}
            title="You're all caught up"
            description="Notifications for low stock, delays, and ESG alerts will appear here."
          />
        ) : (
          <Card padded={false}>
            <div className="divide-y divide-zinc-100">
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markRead(n.id)}
                    className={`flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer ${
                      !n.isRead ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        config.variant === 'danger'
                          ? 'bg-red-50 text-red-600'
                          : config.variant === 'warning'
                            ? 'bg-amber-50 text-amber-600'
                            : config.variant === 'info'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-[13px] ${
                            !n.isRead ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-700'
                          }`}
                        >
                          {n.title}
                        </h4>
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                      </div>
                      <p className="text-[13px] text-zinc-600 mt-0.5">{n.message}</p>
                    </div>
                    <span
                      className="text-[11px] text-zinc-400 whitespace-nowrap shrink-0 tabular-nums"
                      title={formatFullDateTime(n.createdAt)}
                    >
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
