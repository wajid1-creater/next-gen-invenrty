'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import FormField, { Input, Select, Button } from '@/components/FormField';
import { Plus, Trash2, ShoppingCart, FileText, DollarSign } from 'lucide-react';

const statusConfig: Record<string, { variant: string; label: string }> = {
  draft: { variant: 'gray', label: 'Draft' },
  submitted: { variant: 'blue', label: 'Submitted' },
  approved: { variant: 'green', label: 'Approved' },
  shipped: { variant: 'purple', label: 'Shipped' },
  delivered: { variant: 'emerald', label: 'Delivered' },
  cancelled: { variant: 'red', label: 'Cancelled' },
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplierId: '', expectedDeliveryDate: '', notes: '' });
  const [items, setItems] = useState<any[]>([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }]);

  const load = () => api.get('/purchase-orders').then((r) => { setOrders(r.data); setLoading(false); });

  useEffect(() => {
    load();
    api.get('/suppliers').then((r) => setSuppliers(r.data));
    api.get('/products').then((r) => setProducts(r.data));
  }, []);

  const addItem = () => setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const totalAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/purchase-orders', { ...form, items });
      toast.success('Purchase order created');
      setShowModal(false);
      setForm({ supplierId: '', expectedDeliveryDate: '', notes: '' });
      setItems([{ productId: '', productName: '', quantity: 1, unitPrice: 0 }]);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/purchase-orders/${id}`, { status });
    toast.success('Status updated');
    load();
  };

  if (loading) return <AuthGuard><LoadingSpinner /></AuthGuard>;

  const totalValue = orders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="space-y-5">
        <PageHeader
          title="Purchase Orders"
          subtitle={`${orders.length} orders | Total value: $${totalValue.toLocaleString()}`}
          action={
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Order
            </Button>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 stagger-children">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = orders.filter((o) => o.status === key).length;
            return (
              <div key={key} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center card-hover">
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <Badge variant={cfg.variant as any} size="md">{cfg.label}</Badge>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Purchase Order" subtitle="Fill in the details for the new order" size="xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              <FormField label="Supplier" required>
                <Select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required>
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Expected Delivery">
                <Input type="date" value={form.expectedDeliveryDate} onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} />
              </FormField>
              <FormField label="Notes">
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Items</h4>
                <button type="button" onClick={addItem} className="text-xs text-green-600 font-semibold hover:text-green-700 transition-colors">+ Add Item</button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end bg-gray-50/50 p-3 rounded-xl border border-gray-100 animate-fade-in">
                    <div className="col-span-5">
                      {i === 0 && <label className="block text-[10px] font-medium text-gray-400 mb-1">Product</label>}
                      <Select value={item.productId} onChange={(e) => {
                        const p = products.find((pr) => pr.id === e.target.value);
                        const n = [...items]; n[i] = { ...n[i], productId: e.target.value, productName: p?.name || '', unitPrice: parseFloat(p?.unitPrice) || 0 }; setItems(n);
                      }}>
                        <option value="">Select product...</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </Select>
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="block text-[10px] font-medium text-gray-400 mb-1">Quantity</label>}
                      <Input type="number" min="1" value={item.quantity} onChange={(e) => { const n = [...items]; n[i].quantity = parseInt(e.target.value) || 0; setItems(n); }} />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <label className="block text-[10px] font-medium text-gray-400 mb-1">Unit Price</label>}
                      <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => { const n = [...items]; n[i].unitPrice = parseFloat(e.target.value) || 0; setItems(n); }} />
                    </div>
                    <div className="col-span-2 text-right">
                      {i === 0 && <label className="block text-[10px] font-medium text-gray-400 mb-1">Subtotal</label>}
                      <p className="py-2.5 text-sm font-semibold text-gray-700">${(item.quantity * item.unitPrice).toLocaleString()}</p>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3 pr-16">
                <div className="bg-green-50 px-5 py-3 rounded-xl border border-green-100">
                  <p className="text-xs text-green-600 font-semibold">Total Amount</p>
                  <p className="text-xl font-bold text-green-700">${totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button type="submit" variant="primary">Create Order</Button>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>

        {/* Orders Table */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <EmptyState icon={ShoppingCart} title="No purchase orders" description="Create your first purchase order to get started." />
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {orders.map((o) => {
              const cfg = statusConfig[o.status] || statusConfig.draft;
              return (
                <div key={o.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center">
                        <FileText size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <p className="font-mono text-sm font-bold text-gray-900">{o.orderNumber}</p>
                          <Badge variant={cfg.variant as any} dot>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {o.supplier?.name} &middot; {o.items?.length || 0} items
                          {o.expectedDeliveryDate && ` &middot; Due: ${o.expectedDeliveryDate?.split('T')[0]}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium">Total Value</p>
                        <p className="text-lg font-bold text-gray-900">${parseFloat(o.totalAmount).toLocaleString()}</p>
                      </div>
                      <Select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="!w-36 !py-2 !text-xs">
                        {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </Select>
                    </div>
                  </div>

                  {/* Items Preview */}
                  {o.items && o.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2 flex-wrap">
                      {o.items.slice(0, 4).map((item: any, idx: number) => (
                        <span key={idx} className="text-[10px] bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg border border-gray-100">
                          {item.productName} &times; {item.quantity}
                        </span>
                      ))}
                      {o.items.length > 4 && <span className="text-[10px] text-gray-400">+{o.items.length - 4} more</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
