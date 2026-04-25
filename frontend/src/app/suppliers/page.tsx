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
import type { Page, Supplier, SupplierStatus } from '@/lib/types';
import { useConfirm } from '@/components/ConfirmDialog';
import { Plus, Trash2, Pencil, X, Users, Mail, Phone, MapPin } from 'lucide-react';

interface SupplierForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: SupplierStatus;
  esgScore: string;
  certifications: string;
}

const emptyForm: SupplierForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
  esgScore: '',
  certifications: '',
};

const STATUS_VARIANT: Record<SupplierStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const confirm = useConfirm();

  const load = () =>
    api.get<Page<Supplier>>('/suppliers', { params: { pageSize: 100 } }).then((r) => {
      setSuppliers(r.data.items);
      setLoading(false);
    });
  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, esgScore: parseFloat(form.esgScore) || 0 };
    try {
      if (editing) {
        await api.patch(`/suppliers/${editing.id}`, payload);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', payload);
        toast.success('Supplier created');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (s: Supplier) => {
    const ok = await confirm({
      title: 'Delete supplier?',
      description: `"${s.name}" and all history will be removed. Active POs will lose their link.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/suppliers/${s.id}`);
      toast.success('Supplier deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      address: s.address || '',
      status: s.status,
      esgScore: String(s.esgScore),
      certifications: s.certifications || '',
    });
    setShowForm(true);
  };

  if (loading)
    return (
      <AuthGuard>
        <LoadingSpinner />
      </AuthGuard>
    );

  const esgAvg = suppliers.length
    ? (suppliers.reduce((s, x) => s + Number(x.esgScore), 0) / suppliers.length).toFixed(1)
    : '0.0';

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Suppliers"
          subtitle={`${suppliers.length} total · Avg ESG ${esgAvg}`}
          action={
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={14} />}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              New supplier
            </Button>
          }
        />

        {showForm && (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">
                {editing ? 'Edit supplier' : 'New supplier'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 hover:bg-zinc-100 rounded-md"
                aria-label="Close"
              >
                <X size={15} className="text-zinc-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <FormField label="Company name" required>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Email" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </FormField>
              <FormField label="Address">
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </FormField>
              <FormField label="Status">
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as SupplierStatus })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </FormField>
              <FormField label="ESG score (0–5)">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.esgScore}
                  onChange={(e) => setForm({ ...form, esgScore: e.target.value })}
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Certifications" hint="Comma-separated, e.g. ISO 14001, SA8000">
                  <Input
                    value={form.certifications}
                    onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="md:col-span-2 flex items-center gap-2 pt-1">
                <Button type="submit" variant="primary">
                  {editing ? 'Save changes' : 'Create supplier'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {suppliers.length === 0 ? (
          <EmptyState
            variant="card"
            icon={Users}
            title="No suppliers yet"
            description="Add your first supplier to start tracking deliveries and ESG."
            action={
              <Button
                variant="primary"
                leadingIcon={<Plus size={14} />}
                onClick={() => setShowForm(true)}
              >
                New supplier
              </Button>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => {
              const score = Number(s.esgScore);
              return (
                <Card key={s.id} className="hover:border-zinc-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-semibold text-zinc-900 truncate">{s.name}</h4>
                      <p className="text-[12px] text-zinc-500 truncate">{s.email}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[s.status]} dot>
                      {s.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-[12px] text-zinc-500">
                    {s.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-zinc-400" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-zinc-400" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    )}
                    {s.certifications && (
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-zinc-400 invisible" />
                        <span className="truncate text-zinc-400">{s.certifications}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">ESG</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-12 h-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                score >= 3.5
                                  ? 'bg-emerald-500'
                                  : score >= 2
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-[12px] font-medium text-zinc-900 tabular-nums">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Orders</p>
                        <p className="text-[12px] font-medium text-zinc-900 mt-0.5 tabular-nums">
                          {s.purchaseOrders?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
                        aria-label={`Edit ${s.name}`}
                      >
                        <Pencil size={13} className="text-zinc-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors group"
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 size={13} className="text-zinc-400 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
