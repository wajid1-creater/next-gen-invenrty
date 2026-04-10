'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

export default function ForecastingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [shortages, setShortages] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data));
    api.get('/forecasting/shortages').then((r) => setShortages(r.data)).catch(() => {});
  }, []);

  const generateForecast = async () => {
    if (!selectedProduct) return toast.error('Select a product');
    setGenerating(true);
    try {
      await api.post(`/forecasting/generate/${selectedProduct}?periods=6`);
      const { data } = await api.get(`/forecasting/product/${selectedProduct}`);
      setForecasts(data);
      toast.success('Forecast generated successfully');
    } catch { toast.error('Failed to generate'); }
    finally { setGenerating(false); }
  };

  const loadForecasts = async (productId: string) => {
    setSelectedProduct(productId);
    if (productId) {
      const { data } = await api.get(`/forecasting/product/${productId}`);
      setForecasts(data);
    } else setForecasts([]);
  };

  const chartData = forecasts.map((f) => ({
    date: f.forecastDate?.split('T')[0],
    demand: f.predictedDemand,
    confidence: f.confidence,
  }));

  const selectedProd = products.find((p) => p.id === selectedProduct);

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="space-y-6">
        <PageHeader title="Demand Forecasting" subtitle="AI-powered product demand prediction and shortage alerts" />

        {/* Forecast Generator */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Product</label>
              <select value={selectedProduct} onChange={(e) => loadForecasts(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                <option value="">Choose a product to forecast...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku} | Stock: {p.currentStock})</option>)}
              </select>
            </div>
            <button onClick={generateForecast} disabled={generating || !selectedProduct}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all whitespace-nowrap">
              <Zap size={16} />{generating ? 'Generating...' : 'Generate Forecast'}
            </button>
          </div>

          {/* Product Info Card */}
          {selectedProd && (
            <div className="bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl p-4 mb-6 flex items-center gap-6 flex-wrap">
              <div><p className="text-xs text-gray-400">Product</p><p className="font-semibold text-gray-900">{selectedProd.name}</p></div>
              <div><p className="text-xs text-gray-400">Current Stock</p><p className="font-semibold">{selectedProd.currentStock} {selectedProd.unit}</p></div>
              <div><p className="text-xs text-gray-400">Reorder Level</p><p className="font-semibold">{selectedProd.reorderLevel}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><Badge variant={selectedProd.currentStock <= selectedProd.reorderLevel ? 'red' : 'green'} dot>{selectedProd.currentStock <= selectedProd.reorderLevel ? 'Low Stock' : 'Healthy'}</Badge></div>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Predicted Demand - Next 6 Months</h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="demand" stroke="#10b981" strokeWidth={2.5} fill="url(#colorDemand)" dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>

              {/* Forecast Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {forecasts.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium">{f.forecastDate?.split('T')[0]}</td>
                        <td className="px-5 py-3"><span className="font-semibold">{f.predictedDemand}</span> units</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${parseFloat(f.confidence) >= 80 ? 'bg-green-500' : parseFloat(f.confidence) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${f.confidence}%` }} /></div>
                            <span className="text-xs font-medium">{parseFloat(f.confidence).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3"><Badge variant="blue">{f.model}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {chartData.length === 0 && selectedProduct && <p className="text-gray-400 text-center py-12 text-sm">No forecasts yet. Click Generate to create AI predictions.</p>}
          {!selectedProduct && <p className="text-gray-400 text-center py-12 text-sm">Select a product to view or generate demand forecasts.</p>}
        </div>

        {/* Shortage Alerts */}
        {shortages.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} /> Shortage Alerts
            </h3>
            <p className="text-sm text-gray-500 mb-4">Products predicted to run out based on demand forecasts</p>
            <div className="space-y-3">
              {shortages.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-gradient-to-r from-red-50/50 to-white hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.product.name}</p>
                      <p className="text-xs text-gray-500">Current: {s.currentStock} {s.product.unit} | 3-month predicted: {s.predictedDemand3Months}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">-{s.shortageAmount}</p>
                    <Badge variant={s.severity === 'critical' ? 'red' : s.severity === 'high' ? 'orange' : 'yellow'}>{s.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
