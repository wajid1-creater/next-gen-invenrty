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
import Button from '@/components/Button';
import FormField, { Input, Select } from '@/components/FormField';
import { formatShortDate } from '@/lib/datetime';
import type { Delivery, DeliveryStatus, Page, PurchaseOrder } from '@/lib/types';
import { Plus, X, Truck } from 'lucide-react';

type SemVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_CONFIG: Record<DeliveryStatus, { variant: SemVariant; label: string }> = {
  pending: { variant: 'neutral', label: 'Pending' },
  in_transit: { variant: 'info', label: 'In transit' },
  delivered: { variant: 'success', label: 'Delivered' },
  delayed: { variant: 'danger', label: 'Delayed' },
  returned: { variant: 'warning', label: 'Returned' },
};

interface DeliveryForm {
  purchaseOrderId: string;
  carrier: string;
  estimatedArrival: string;
  notes: string;
}

const emptyForm: DeliveryForm = {
  purchaseOrderId: '',
  carrier: '',
  estimatedArrival: '',
  notes: '',
};

interface UpdateDeliveryPayload {
  status: DeliveryStatus;
  actualArrival?: string;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DeliveryForm>(emptyForm);

  const load = () =>
    api.get<Delivery[]>('/deliveries').then((r) => {
      setDeliveries(r.data);
      setLoading(false);
    });
  useEffect(() => {
    load();
    api
      .get<Page<PurchaseOrder>>('/purchase-orders', { params: { pageSize: 100 } })
      .then((r) => setOrders(r.data.items));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', form);
      toast.success('Delivery created');
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const updateStatus = async (id: string, status: DeliveryStatus) => {
    const data: UpdateDeliveryPayload = { status };
    if (status === 'delivered') data.actualArrival = new Date().toISOString().split('T')[0];
    await api.patch(`/deliveries/${id}`, data);
    toast.success('Delivery updated');
    load();
  };

  if (loading)
    return (
      <AuthGuard>
        <LoadingSpinner />
      </AuthGuard>
    );

  const delayed = deliveries.filter((d) => d.status === 'delayed').length;
  const delivered = deliveries.filter((d) => d.status === 'delivered').length;
  const onTimeRate = deliveries.length ? Math.round((delivered / deliveries.length) * 100) : 0;

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Deliveries"
          subtitle={`${deliveries.length} total · ${delayed} delayed · ${onTimeRate}% delivered`}
          action={
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={14} />}
              onClick={() => setShowForm(true)}
            >
              New delivery
            </Button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {(
            Object.entries(STATUS_CONFIG) as [
              DeliveryStatus,
              { variant: SemVariant; label: string },
            ][]
          ).map(([key, cfg]) => {
            const count = deliveries.filter((d) => d.status === key).length;
            return (
              <Card key={key} className="!p-3 flex flex-col gap-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                  {cfg.label}
                </p>
                <p className="text-xl font-semibold text-zinc-900 tabular-nums">{count}</p>
              </Card>
            );
          })}
        </div>

        {showForm && (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">New delivery</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:bg-zinc-100 rounded-md"
                aria-label="Close"
              >
                <X size={15} className="text-zinc-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <FormField label="Purchase order" required>
                <Select
                  value={form.purchaseOrderId}
                  onChange={(e) => setForm({ ...form, purchaseOrderId: e.target.value })}
                  required
                >
                  <option value="">Select order…</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — {o.supplier?.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Carrier">
                <Input
                  value={form.carrier}
                  onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                  placeholder="DHL, FedEx, UPS…"
                />
              </FormField>
              <FormField label="Estimated arrival">
                <Input
                  type="date"
                  value={form.estimatedArrival}
                  onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })}
                />
              </FormField>
              <FormField label="Notes">
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </FormField>
              <div className="md:col-span-2 flex items-center gap-2">
                <Button type="submit" variant="primary">
                  Create delivery
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {deliveries.length === 0 ? (
          <EmptyState
            variant="card"
            icon={Truck}
            title="No deliveries yet"
            description="Track shipments tied to your purchase orders."
          />
        ) : (
          <Card padded={false}>
            <div className="divide-y divide-zinc-100">
              {deliveries.map((d) => {
                const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending;
                return (
                  <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="font-mono text-[13px] font-semibold text-zinc-900">
                          {d.trackingNumber}
                        </p>
                        <Badge variant={cfg.variant} dot>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-zinc-500 mt-0.5 truncate">
                        {d.purchaseOrder?.orderNumber} · {d.purchaseOrder?.supplier?.name}
                        {d.carrier ? ` · ${d.carrier}` : ''}
                      </p>
                      {d.notes && (
                        <p className="text-[12px] text-zinc-500 mt-1.5 bg-zinc-50 border border-zinc-200/70 px-2 py-1 rounded inline-block">
                          {d.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                        Expected
                      </p>
                      <p className="text-[12px] font-medium text-zinc-900 tabular-nums">
                        {d.estimatedArrival ? formatShortDate(d.estimatedArrival) : '—'}
                      </p>
                    </div>
                    {d.actualArrival && (
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                          Delivered
                        </p>
                        <p className="text-[12px] font-medium text-emerald-700 tabular-nums">
                          {formatShortDate(d.actualArrival)}
                        </p>
                      </div>
                    )}
                    <Select
                      value={d.status}
                      onChange={(e) => updateStatus(d.id, e.target.value as DeliveryStatus)}
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
