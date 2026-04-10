'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { Plus, Trash2, Edit2, X, Package } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', sku: '', description: '', category: '', unitPrice: '', currentStock: '', reorderLevel: '10', unit: 'pcs' });

  const load = () => api.get('/products').then((r) => { setProducts(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, unitPrice: parseFloat(form.unitPrice) || 0, currentStock: parseInt(form.currentStock) || 0, reorderLevel: parseInt(form.reorderLevel) || 10 };
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
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const resetForm = () => {
    setShowForm(false); setEditing(null);
    setForm({ name: '', sku: '', description: '', category: '', unitPrice: '', currentStock: '', reorderLevel: '10', unit: 'pcs' });
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, description: p.description || '', category: p.category || '', unitPrice: String(p.unitPrice), currentStock: String(p.currentStock), reorderLevel: String(p.reorderLevel), unit: p.unit || 'pcs' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Deleted');
    load();
  };

  if (loading) return <AuthGuard><LoadingSpinner /></AuthGuard>;

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="space-y-4">
        <PageHeader
          title="Products & Inventory"
          subtitle={`${products.length} products total | ${products.filter((p) => p.currentStock <= p.reorderLevel).length} low stock`}
          action={
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-lg shadow-green-500/20 transition-all">
              <Plus size={16} /> Add Product
            </button>
          }
        />

        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">SKU *</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price ($)</label>
                <input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Current Stock</label>
                <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Reorder Level</label>
                <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/20">
                  {editing ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <EmptyState icon={Package} title="No products yet" description="Add your first product to start managing inventory." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                          <Package size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          {p.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-5 py-4"><Badge variant="blue">{p.category || '-'}</Badge></td>
                    <td className="px-5 py-4 font-semibold">${parseFloat(p.unitPrice).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold">{p.currentStock}</span>
                        <span className="text-gray-400 text-xs"> / {p.reorderLevel}</span>
                      </div>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                        <div
                          className={`h-full rounded-full ${p.currentStock <= p.reorderLevel ? 'bg-red-500' : p.currentStock <= p.reorderLevel * 2 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, (p.currentStock / (p.reorderLevel * 3)) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={p.currentStock <= p.reorderLevel ? 'red' : 'green'} dot>
                        {p.currentStock <= p.reorderLevel ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={15} className="text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={15} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
