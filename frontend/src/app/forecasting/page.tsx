'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { toast } from '@/lib/toast';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import { Card, CardHeader } from '@/components/Card';
import Button from '@/components/Button';
import { Select } from '@/components/FormField';
import EmptyState from '@/components/EmptyState';
import { formatShortDate } from '@/lib/datetime';
import type { Forecast, Page, Product, ShortageAlert } from '@/lib/types';
import { AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

type SemVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const SEVERITY: Record<ShortageAlert['severity'], SemVariant> = {
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'warning',
};

export default function ForecastingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [shortages, setShortages] = useState<ShortageAlert[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api
      .get<Page<Product>>('/products', { params: { pageSize: 100 } })
      .then((r) => setProducts(r.data.items));
    api
      .get<ShortageAlert[]>('/forecasting/shortages')
      .then((r) => setShortages(r.data))
      .catch(() => {});
  }, []);

  const generateForecast = async () => {
    if (!selectedProduct) return toast.error('Select a product');
    setGenerating(true);
    try {
      await api.post(`/forecasting/generate/${selectedProduct}?periods=6`);
      const { data } = await api.get<Forecast[]>(`/forecasting/product/${selectedProduct}`);
      setForecasts(data);
      toast.success('Forecast generated');
    } catch {
      toast.error('Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const loadForecasts = async (productId: string) => {
    setSelectedProduct(productId);
    if (productId) {
      const { data } = await api.get<Forecast[]>(`/forecasting/product/${productId}`);
      setForecasts(data);
    } else setForecasts([]);
  };

  const chartData = forecasts.map((f) => ({
    date: formatShortDate(f.forecastDate),
    demand: f.predictedDemand,
    confidence: f.confidence,
  }));

  const selectedProd = products.find((p) => p.id === selectedProduct);

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Demand forecasting"
          subtitle="Predict 6-month product demand and surface upcoming shortages."
        />

        <Card>
          <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 mb-5">
            <div className="flex-1 w-full">
              <label className="block text-[12px] font-medium text-zinc-700 mb-1.5">Product</label>
              <Select value={selectedProduct} onChange={(e) => loadForecasts(e.target.value)}>
                <option value="">Choose a product to forecast…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU {p.sku} · stock {p.currentStock})
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={generateForecast}
              loading={generating}
              disabled={!selectedProduct}
              leadingIcon={!generating && <Zap size={14} />}
            >
              {generating ? 'Generating…' : 'Generate forecast'}
            </Button>
          </div>

          {selectedProd && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <MiniStat label="Product" value={selectedProd.name} />
              <MiniStat
                label="Current stock"
                value={`${selectedProd.currentStock} ${selectedProd.unit ?? ''}`.trim()}
              />
              <MiniStat label="Reorder level" value={selectedProd.reorderLevel} />
              <div className="bg-zinc-50 border border-zinc-200/70 rounded-md p-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                  Status
                </p>
                <div className="mt-1.5">
                  <Badge
                    variant={
                      selectedProd.currentStock <= selectedProd.reorderLevel ? 'danger' : 'success'
                    }
                    dot
                  >
                    {selectedProd.currentStock <= selectedProd.reorderLevel
                      ? 'Low stock'
                      : 'Healthy'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {chartData.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                Predicted demand · 6 months
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid rgba(9,9,11,0.08)',
                      fontSize: '12px',
                      padding: '8px 10px',
                    }}
                    cursor={{ stroke: '#e4e4e7', strokeDasharray: '3 3' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#059669"
                    strokeWidth={1.8}
                    fill="url(#demandFill)"
                    dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-5 overflow-x-auto border border-zinc-200/70 rounded-md">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-zinc-50/60 border-b border-zinc-200/70 text-left">
                      <th className="px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider text-right">
                        Predicted demand
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        Model
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {forecasts.map((f) => {
                      const c = Number(f.confidence);
                      return (
                        <tr key={f.id} className="hover:bg-zinc-50/60">
                          <td className="px-4 py-2.5 font-medium text-zinc-900 tabular-nums">
                            {formatShortDate(f.forecastDate)}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            <span className="font-semibold text-zinc-900">{f.predictedDemand}</span>
                            <span className="text-zinc-500"> units</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    c >= 80
                                      ? 'bg-emerald-500'
                                      : c >= 60
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                  }`}
                                  style={{ width: `${c}%` }}
                                />
                              </div>
                              <span className="text-[12px] font-medium tabular-nums">
                                {c.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant="info">{f.model}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title={selectedProduct ? 'No forecasts yet' : 'No product selected'}
              description={
                selectedProduct
                  ? 'Click Generate forecast to create AI predictions for this product.'
                  : 'Pick a product above to view or generate demand forecasts.'
              }
            />
          )}
        </Card>

        {shortages.length > 0 && (
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-600" /> Shortage alerts
                </span>
              }
              subtitle="Products predicted to run out based on demand forecasts"
            />
            <div className="space-y-2">
              {shortages.map((s) => (
                <div
                  key={s.product.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border border-red-100 bg-red-50/40"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-900 truncate">
                      {s.product.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 tabular-nums">
                      Current {s.currentStock} {s.product.unit ?? ''} · 3-month predicted{' '}
                      {s.predictedDemand3Months}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-semibold text-red-600 tabular-nums">
                      −{s.shortageAmount}
                    </p>
                    <Badge variant={SEVERITY[s.severity]}>{s.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-zinc-50 border border-zinc-200/70 rounded-md p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-zinc-900 truncate">{value}</p>
    </div>
  );
}
