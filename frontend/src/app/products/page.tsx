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
import FormField, { Input } from '@/components/FormField';
import type { Page, Product } from '@/lib/types';
import { useConfirm } from '@/components/ConfirmDialog';
import { Plus, Trash2, Pencil, X, Package } from 'lucide-react';

interface ProductForm {
  name: string;
  sku: string;
  description: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  reorderLevel: string;
  unit: string;
}

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  category: '',
  unitPrice: '',
  currentStock: '',
  reorderLevel: '10',
  unit: 'pcs',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const confirm = useConfirm();

  const load = () =>
    api.get<Page<Product>>('/products', { params: { pageSize: 100 } }).then((r) => {
      setProducts(r.data.items);
      setLoading(false);
    });
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      unitPrice: parseFloat(form.unitPrice) || 0,
      currentStock: parseInt(form.currentStock, 10) || 0,
      reorderLevel: parseInt(form.reorderLevel, 10) || 10,
    };
    try {
      if (editing) {
        await api.patch(`/products/${editing.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      category: p.category || '',
      unitPrice: String(p.unitPrice),
      currentStock: String(p.currentStock),
      reorderLevel: String(p.reorderLevel),
      unit: p.unit || 'pcs',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete product?',
      description: `"${name}" and its bill-of-materials links will be permanently removed.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading)
    return (
      <AuthGuard>
        <LoadingSpinner />
      </AuthGuard>
    );

  const lowStock = products.filter((p) => p.currentStock <= p.reorderLevel).length;

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Products"
          subtitle={`${products.length} total · ${lowStock} below reorder level`}
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
              New product
            </Button>
          }
        />

        {showForm && (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">
                {editing ? 'Edit product' : 'New product'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
                aria-label="Close"
              >
                <X size={15} className="text-zinc-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <FormField label="Product name" required>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="SKU" required>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Category">
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </FormField>
              <FormField label="Unit price ($)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                />
              </FormField>
              <FormField label="Current stock">
                <Input
                  type="number"
                  value={form.currentStock}
                  onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                />
              </FormField>
              <FormField label="Reorder level">
                <Input
                  type="number"
                  value={form.reorderLevel}
                  onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                />
              </FormField>
              <FormField label="Unit">
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </FormField>
              <FormField label="Description">
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
              <div className="md:col-span-2 flex items-center gap-2 pt-1">
                <Button type="submit" variant="primary">
                  {editing ? 'Save changes' : 'Create product'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {products.length === 0 ? (
          <EmptyState
            variant="card"
            icon={Package}
            title="No products yet"
            description="Add your first product to start managing inventory."
            action={
              <Button
                variant="primary"
                leadingIcon={<Plus size={14} />}
                onClick={() => setShowForm(true)}
              >
                New product
              </Button>
            }
          />
        ) : (
          <Card padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-zinc-50/60 border-b border-zinc-200/70 text-left">
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th>Category</Th>
                    <Th align="right">Price</Th>
                    <Th align="right">Stock</Th>
                    <Th>Status</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map((p) => {
                    const low = p.currentStock <= p.reorderLevel;
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/60">
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-zinc-100 rounded-md flex items-center justify-center shrink-0">
                              <Package size={13} className="text-zinc-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-900 truncate">{p.name}</p>
                              {p.description && (
                                <p className="text-[11px] text-zinc-500 truncate max-w-[260px]">
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <span className="font-mono text-[12px] text-zinc-500">{p.sku}</span>
                        </Td>
                        <Td>
                          {p.category ? (
                            <Badge variant="neutral">{p.category}</Badge>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </Td>
                        <Td align="right">
                          <span className="font-medium text-zinc-900 tabular-nums">
                            ${Number(p.unitPrice).toFixed(2)}
                          </span>
                        </Td>
                        <Td align="right">
                          <span className="font-medium text-zinc-900 tabular-nums">
                            {p.currentStock}
                          </span>
                          <span className="text-zinc-400 tabular-nums"> / {p.reorderLevel}</span>
                        </Td>
                        <Td>
                          <Badge variant={low ? 'danger' : 'success'} dot>
                            {low ? 'Low stock' : 'In stock'}
                          </Badge>
                        </Td>
                        <Td align="right">
                          <div className="flex gap-0.5 justify-end">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
                              title="Edit"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Pencil size={13} className="text-zinc-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 size={13} className="text-zinc-400 hover:text-red-600" />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>{children}</td>
  );
}
