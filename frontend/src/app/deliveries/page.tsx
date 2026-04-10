'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { Plus, X, Truck, MapPin } from 'lucide-react';

const statusConfig: Record<string, { variant: any; label: string }> = {
  pending: { variant: 'gray', label: 'Pending' },
  in_transit: { variant: 'blue', label: 'In Transit' },
  delivered: { variant: 'green', label: 'Delivered' },
  delayed: { variant: 'red', label: 'Delayed' },
  returned: { variant: 'orange', label: 'Returned' },
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ purchaseOrderId: '', carrier: '', estimatedArrival: '', notes: '' });

  const load = () => api.get('/deliveries').then((r) => { setDeliveries(r.data); setLoading(false); });
  useEffect(() => { load(); api.get('/purchase-orders').then((r) => setOrders(r.data)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', form);
      toast.success('Delivery created');
      setShowForm(false);
      setForm({ purchaseOrderId: '', carrier: '', estimatedArrival: '', notes: '' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id: string, status: string) => {
    const data: any = { status };
    if (status === 'delivered') data.actualArrival = new Date().toISOString().split('T')[0];
    await api.patch(`/deliveries/${id}`, data);
    toast.success('Updated');
    load();
  };

  if (loading) return <AuthGuard><LoadingSpinner /></AuthGuard>;

  const delayed = deliveries.filter((d) => d.status === 'delayed').length;
  const delivered = deliveries.filter((d) => d.status === 'delivered').length;
  const onTimeRate = deliveries.length ? Math.round((delivered / deliveries.length) * 100) : 0;

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="space-y-4">
        <PageHeader
          title="Delivery Tracking"
          subtitle={`${deliveries.length} deliveries | ${delayed} delayed | ${onTimeRate}% delivered`}
          action={
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-lg shadow-green-500/20">
              <Plus size={16} /> New Delivery
            </button>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = deliveries.filter((d) => d.status === key).length;
            return (
              <div key={key} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-900">New Delivery</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Purchase Order *</label>
                <select value={form.purchaseOrderId} onChange={(e) => setForm({ ...form, purchaseOrderId: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                  <option value="">Select Order</option>{orders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber} - {o.supplier?.name}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Carrier</label><input value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} placeholder="DHL, FedEx, etc." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Estimated Arrival</label><input type="date" value={form.estimatedArrival} onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Notes</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" /></div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-green-500/20">Create Delivery</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border"><EmptyState icon={Truck} title="No deliveries yet" /></div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${d.status === 'delivered' ? 'bg-green-50' : d.status === 'delayed' ? 'bg-red-50' : d.status === 'in_transit' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <Truck size={20} className={d.status === 'delivered' ? 'text-green-600' : d.status === 'delayed' ? 'text-red-500' : d.status === 'in_transit' ? 'text-blue-600' : 'text-gray-400'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-semibold text-gray-900">{d.trackingNumber}</p>
                        <Badge variant={statusConfig[d.status]?.variant || 'gray'} dot>{statusConfig[d.status]?.label || d.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.purchaseOrder?.orderNumber} | {d.purchaseOrder?.supplier?.name} {d.carrier ? `| ${d.carrier}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Expected</p>
                      <p className="text-sm font-medium">{d.estimatedArrival?.split('T')[0] || '-'}</p>
                    </div>
                    {d.actualArrival && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Delivered</p>
                        <p className="text-sm font-medium text-green-600">{d.actualArrival?.split('T')[0]}</p>
                      </div>
                    )}
                    <select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)} className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                      {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                {d.notes && <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-2 rounded-lg">{d.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
