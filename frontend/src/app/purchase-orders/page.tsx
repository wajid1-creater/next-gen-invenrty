'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api, { getErrorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { Card } from '@/components/Card';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import FormField, { Input, Select } from '@/components/FormField';
import type {
  POStatus,
  Page,
  Product,
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
} from '@/lib/types';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';

type SemVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_CONFIG: Record<POStatus, { variant: SemVariant; label: string }> = {
  draft: { variant: 'neutral', label: 'Draft' },
  submitted: { variant: 'info', label: 'Submitted' },
  approved: { variant: 'success', label: 'Approved' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

interface POForm {
  supplierId: string;
  expectedDeliveryDate: string;
  notes: string;
}

const emptyForm: POForm = { supplierId: '', expectedDeliveryDate: '', notes: '' };
const emptyItem: PurchaseOrderItem = { productId: '', productName: '', quantity: 1, unitPrice: 0 };

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<POForm>(emptyForm);
  const [items, setItems] = useState<PurchaseOrderItem[]>([{ ...emptyItem }]);

  const load = () =>
    api.get<Page<PurchaseOrder>>('/purchase-orders', { params: { pageSize: 100 } }).then((r) => {
      setOrders(r.data.items);
      setLoading(false);
    });

  useEffect(() => {
    load();
    api
      .get<Page<Supplier>>('/suppliers', { params: { pageSize: 100 } })
      .then((r) => setSuppliers(r.data.items));
    api
      .get<Page<Product>>('/products', { params: { pageSize: 100 } })
      .then((r) => setProducts(r.data.items));
  }, []);

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/purchase-orders', { ...form, items });
      toast.success('Purchase order created');
      setShowModal(false);
      setForm(emptyForm);
      setItems([{ ...emptyItem }]);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const updateStatus = async (id: string, status: POStatus) => {
    await api.patch(`/purchase-orders/${id}`, { status });
    toast.success('Status updated');
    load();
  };

  if (loading)
    return (
      <AuthGuard>
        <LoadingSpinner />
      </AuthGuard>
    );

  const totalValue = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Purchase orders"
          subtitle={`${orders.length} orders · $${Math.round(totalValue).toLocaleString()} total value`}
          action={
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={14} />}
              onClick={() => setShowModal(true)}
            >
              New order
            </Button>
          }
        />

        {/* Status counters */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {(
            Object.entries(STATUS_CONFIG) as [POStatus, { variant: SemVariant; label: string }][]
          ).map(([key, cfg]) => {
            const count = orders.filter((o) => o.status === key).length;
            return (
              <Card key={key} className="flex flex-col gap-1 !p-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                  {cfg.label}
                </p>
                <p className="text-xl font-semibold text-zinc-900 tabular-nums">{count}</p>
              </Card>
            );
          })}
        </div>

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Create purchase order"
          subtitle="Pick a supplier, add line items, submit."
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              <FormField label="Supplier" required>
                <Select
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  required
                >
                  <option value="">Select supplier…</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Expected delivery">
                <Input
                  type="date"
                  value={form.expectedDeliveryDate}
                  onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                />
              </FormField>
              <FormField label="Notes">
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional"
                />
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
                  Line items
                </h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[12px] text-emerald-700 font-medium hover:text-emerald-800"
                >
                  + Add item
                </button>
              </div>
              <div className="border border-zinc-200/70 rounded-md overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-50 border-b border-zinc-200/70 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Unit price</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                  <div className="col-span-1" />
                </div>
                <div className="divide-y divide-zinc-100">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center px-3 py-2">
                      <div className="col-span-5">
                        <Select
                          value={item.productId}
                          onChange={(e) => {
                            const p = products.find((pr) => pr.id === e.target.value);
                            const n = [...items];
                            n[i] = {
                              ...n[i],
                              productId: e.target.value,
                              productName: p?.name || '',
                              unitPrice: Number(p?.unitPrice) || 0,
                            };
                            setItems(n);
                          }}
                        >
                          <option value="">Select product…</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const n = [...items];
                            n[i].quantity = parseInt(e.target.value, 10) || 0;
                            setItems(n);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const n = [...items];
                            n[i].unitPrice = parseFloat(e.target.value) || 0;
                            setItems(n);
                          }}
                        />
                      </div>
                      <div className="col-span-2 text-right text-[13px] font-medium text-zinc-900 tabular-nums">
                        ${(item.quantity * item.unitPrice).toLocaleString()}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="p-1.5 hover:bg-red-50 rounded-md transition-colors group"
                            aria-label="Remove item"
                          >
                            <Trash2 size={13} className="text-zinc-400 group-hover:text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-3 px-3 py-2.5 bg-zinc-50 border-t border-zinc-200/70">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                    Total
                  </span>
                  <span className="text-base font-semibold text-zinc-900 tabular-nums">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
              <Button type="submit" variant="primary">
                Create order
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {orders.length === 0 ? (
          <EmptyState
            variant="card"
            icon={ShoppingCart}
            title="No purchase orders yet"
            description="Create your first PO to start procurement."
            action={
              <Button
                variant="primary"
                leadingIcon={<Plus size={14} />}
                onClick={() => setShowModal(true)}
              >
                New order
              </Button>
            }
          />
        ) : (
          <Card padded={false}>
            <div className="divide-y divide-zinc-100">
              {orders.map((o) => {
                const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.draft;
                return (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <p className="font-mono text-[13px] font-semibold text-zinc-900">
                          {o.orderNumber}
                        </p>
                        <Badge variant={cfg.variant} dot>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-zinc-500 truncate">
                        {o.supplier?.name} · {o.items?.length || 0} items
                        {o.expectedDeliveryDate && ` · Due ${o.expectedDeliveryDate.split('T')[0]}`}
                      </p>
                      {o.items && o.items.length > 0 && (
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                          {o.items.slice(0, 4).map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200/70 px-1.5 py-0.5 rounded"
                            >
                              {item.productName} × {item.quantity}
                            </span>
                          ))}
                          {o.items.length > 4 && (
                            <span className="text-[11px] text-zinc-400">
                              +{o.items.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                        Total
                      </p>
                      <p className="text-[15px] font-semibold text-zinc-900 tabular-nums">
                        ${Number(o.totalAmount).toLocaleString()}
                      </p>
                    </div>
                    <Select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as POStatus)}
                      className="!w-32 !text-[12px]"
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </Select>
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
