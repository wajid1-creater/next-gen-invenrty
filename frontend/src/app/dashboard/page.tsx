'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import {
  Package,
  Users,
  ShoppingCart,
  Truck,
  AlertTriangle,
  DollarSign,
  Leaf,
  CheckCircle,
  Clock,
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<any[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [deliveryPerf, setDeliveryPerf] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/overview'),
      api.get('/dashboard/orders-by-status'),
      api.get('/dashboard/monthly-spend'),
      api.get('/dashboard/top-suppliers'),
      api.get('/dashboard/delivery-performance'),
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

  if (loading) return <AuthGuard><LoadingSpinner text="Loading dashboard..." /></AuthGuard>;

  const stats = overview
    ? [
        { label: 'Total Products', value: overview.totalProducts, icon: Package, color: 'bg-blue-500' },
        { label: 'Active Suppliers', value: overview.totalSuppliers, icon: Users, color: 'bg-green-500' },
        { label: 'Purchase Orders', value: overview.totalOrders, icon: ShoppingCart, color: 'bg-purple-500' },
        { label: 'Total Order Value', value: `$${(overview.totalOrderValue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
        { label: 'Low Stock Items', value: overview.lowStockProducts, icon: AlertTriangle, color: 'bg-red-500' },
        { label: 'Delayed Deliveries', value: overview.delayedDeliveries, icon: Truck, color: 'bg-orange-500' },
        { label: 'Task Completion', value: `${overview.taskCompletionRate}%`, icon: CheckCircle, color: 'bg-indigo-500' },
        { label: 'Avg ESG Score', value: overview.avgEsgScore?.toFixed(1) || '0', icon: Leaf, color: 'bg-teal-500' },
      ]
    : [];

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's an overview of your supply chain operations."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {stats.map((s) => (
            <StatsCard key={s.label} {...s} />
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Spend - Takes 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Spending</h3>
                <p className="text-sm text-gray-500">Purchase order totals by month</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlySpend.map((m) => ({ month: m.month, total: parseFloat(m.total) }))}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, 'Spend']}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status - Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Status</h3>
            <p className="text-sm text-gray-500 mb-4">Distribution of purchase orders</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ordersByStatus.map((o) => ({ name: o.status, value: parseInt(o.count) }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {ordersByStatus.map((o, i) => (
                <div key={o.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 capitalize">{o.status}</span>
                  </div>
                  <span className="font-medium text-gray-900">{o.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Delivery Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delivery Performance</h3>
            <p className="text-sm text-gray-500 mb-6">Status of all deliveries</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deliveryPerf.map((d) => ({ status: d.status.replace('_', ' '), count: parseInt(d.count) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {deliveryPerf.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.status === 'delivered' ? '#10b981' : d.status === 'delayed' ? '#ef4444' : d.status === 'in_transit' ? '#3b82f6' : '#9ca3af'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Suppliers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Suppliers</h3>
            <p className="text-sm text-gray-500 mb-4">Ranked by total order value</p>
            <div className="space-y-3">
              {topSuppliers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">${parseFloat(s.totalValue).toLocaleString()}</p>
                    <Badge variant={parseFloat(s.esgScore) >= 3.5 ? 'green' : parseFloat(s.esgScore) >= 2 ? 'yellow' : 'red'}>
                      ESG {parseFloat(s.esgScore).toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
              {topSuppliers.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">No supplier data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
