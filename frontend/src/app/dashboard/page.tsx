'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import { Card, CardHeader } from '@/components/Card';
import type {
  DashboardOverview,
  DeliveryPerformanceRow,
  MonthlySpendRow,
  OrdersByStatusRow,
  TopSupplierRow,
} from '@/lib/types';
import {
  Package,
  Users,
  ShoppingCart,
  Truck,
  AlertTriangle,
  DollarSign,
  Leaf,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

/**
 * Restrained chart palette: one accent + 3 neutrals. No rainbow.
 *  - Primary: emerald-600  (the brand accent)
 *  - Then descending zinc shades for everything else.
 */
const CHART_PALETTE = ['#059669', '#52525b', '#a1a1aa', '#d4d4d8', '#71717a', '#3f3f46'];

const CHART_AXIS = { fontSize: 11, fill: '#a1a1aa' };
const CHART_TOOLTIP = {
  borderRadius: '8px',
  border: '1px solid rgba(9,9,11,0.08)',
  boxShadow: '0 8px 24px rgba(9,9,11,0.08)',
  fontSize: '12px',
  padding: '8px 10px',
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatusRow[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<MonthlySpendRow[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplierRow[]>([]);
  const [deliveryPerf, setDeliveryPerf] = useState<DeliveryPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardOverview>('/dashboard/overview'),
      api.get<OrdersByStatusRow[]>('/dashboard/orders-by-status'),
      api.get<MonthlySpendRow[]>('/dashboard/monthly-spend'),
      api.get<TopSupplierRow[]>('/dashboard/top-suppliers'),
      api.get<DeliveryPerformanceRow[]>('/dashboard/delivery-performance'),
    ])
      .then(([ov, os, ms, ts, dp]) => {
        setOverview(ov.data);
        setOrdersByStatus(os.data);
        setMonthlySpend(ms.data);
        setTopSuppliers(ts.data);
        setDeliveryPerf(dp.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <AuthGuard>
        <LoadingSpinner text="Loading dashboard…" />
      </AuthGuard>
    );

  const stats = overview
    ? [
        {
          label: 'Products',
          value: overview.totalProducts,
          icon: Package,
          iconClass: 'text-zinc-700',
        },
        {
          label: 'Suppliers',
          value: overview.totalSuppliers,
          icon: Users,
          iconClass: 'text-zinc-700',
        },
        {
          label: 'Open POs',
          value: overview.totalOrders,
          icon: ShoppingCart,
          iconClass: 'text-zinc-700',
        },
        {
          label: 'Order Value',
          value: `$${Math.round(overview.totalOrderValue || 0).toLocaleString()}`,
          icon: DollarSign,
          iconClass: 'text-emerald-600',
        },
        {
          label: 'Low Stock',
          value: overview.lowStockProducts,
          icon: AlertTriangle,
          iconClass: overview.lowStockProducts > 0 ? 'text-amber-600' : 'text-zinc-700',
        },
        {
          label: 'Delayed',
          value: overview.delayedDeliveries,
          icon: Truck,
          iconClass: overview.delayedDeliveries > 0 ? 'text-red-600' : 'text-zinc-700',
        },
        {
          label: 'Tasks Done',
          value: `${overview.taskCompletionRate}%`,
          icon: CheckCircle,
          iconClass: 'text-zinc-700',
        },
        {
          label: 'Avg ESG',
          value: overview.avgEsgScore?.toFixed(1) || '0.0',
          icon: Leaf,
          iconClass: 'text-emerald-600',
        },
      ]
    : [];

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Dashboard"
          subtitle="Real-time view of inventory, suppliers, and procurement health."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <StatsCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardHeader title="Monthly spend" subtitle="Purchase order totals over time" />
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={monthlySpend.map((m) => ({ month: m.month, total: Number(m.total) }))}
                margin={{ top: 10, right: 4, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="month" tick={CHART_AXIS} axisLine={false} tickLine={false} />
                <YAxis
                  tick={CHART_AXIS}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Spend']}
                  cursor={{ stroke: '#e4e4e7', strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#059669"
                  strokeWidth={1.8}
                  fill="url(#spendFill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#059669' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader title="Order status" subtitle="Distribution of POs" />
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={ordersByStatus.map((o) => ({ name: o.status, value: Number(o.count) }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {ordersByStatus.map((o, i) => (
                <div key={o.status} className="flex items-center justify-between text-[12px] py-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
                    />
                    <span className="text-zinc-600 capitalize">{o.status}</span>
                  </div>
                  <span className="font-medium text-zinc-900 tabular-nums">{o.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Delivery performance" subtitle="Status breakdown" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={deliveryPerf.map((d) => ({
                  status: d.status.replace('_', ' '),
                  count: Number(d.count),
                  rawStatus: d.status,
                }))}
                margin={{ top: 10, right: 4, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="status" tick={CHART_AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_AXIS} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'rgba(9,9,11,0.04)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {deliveryPerf.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.status === 'delayed'
                          ? '#dc2626'
                          : d.status === 'delivered'
                            ? '#059669'
                            : '#71717a'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader title="Top suppliers" subtitle="Ranked by total order value" />
            <div className="space-y-1">
              {topSuppliers.length === 0 && (
                <p className="text-center text-[13px] text-zinc-400 py-10">No supplier data yet</p>
              )}
              {topSuppliers.map((s, i) => {
                const score = Number(s.esgScore);
                const esgVariant: 'success' | 'warning' | 'danger' =
                  score >= 3.5 ? 'success' : score >= 2 ? 'warning' : 'danger';
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center text-[11px] font-medium text-zinc-500 tabular-nums shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-zinc-900 truncate">{s.name}</p>
                      <p className="text-[11px] text-zinc-500 tabular-nums">
                        {s.orderCount} orders
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-zinc-900 tabular-nums">
                        ${Number(s.totalValue).toLocaleString()}
                      </p>
                      <div className="flex justify-end mt-0.5">
                        <Badge variant={esgVariant} size="sm">
                          ESG {score.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
