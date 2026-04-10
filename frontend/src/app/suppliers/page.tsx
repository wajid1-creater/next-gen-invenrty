'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { Plus, Trash2, Edit2, X, Users } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', status: 'active', esgScore: '', certifications: '' });

  const load = () => api.get('/suppliers').then((r) => { setSuppliers(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setShowForm(false); setEditing(null);
    setForm({ name: '', email: '', phone: '', address: '', status: 'active', esgScore: '', certifications: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, esgScore: parseFloat(form.esgScore) || 0 };
    try {
      if (editing) { await api.patch(`/suppliers/${editing.id}`, payload); toast.success('Updated'); }
      else { await api.post('/suppliers', payload); toast.success('Created'); }
      resetForm(); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, phone: s.phone || '', address: s.address || '', status: s.status, esgScore: String(s.esgScore), certifications: s.certifications || '' });
    setShowForm(true);
  };

  if (loading) return <AuthGuard><LoadingSpinner /></AuthGuard>;

  const esgAvg = suppliers.length ? (suppliers.reduce((s, x) => s + parseFloat(x.esgScore), 0) / suppliers.length).toFixed(1) : '0';

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="space-y-4">
        <PageHeader
          title="Supplier Management"
          subtitle={`${suppliers.length} suppliers | Avg ESG Score: ${esgAvg}`}
          action={
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-lg shadow-green-500/20 transition-all">
              <Plus size={16} /> Add Supplier
            </button>
          }
        />

        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-900">{editing ? 'Edit Supplier' : 'New Supplier'}</h3>
              <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Company Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" /></div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50">
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">ESG Score (0-5)</label><input type="number" step="0.1" min="0" max="5" value={form.esgScore} onChange={(e) => setForm({ ...form, esgScore: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Certifications</label><input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="ISO 14001, SA8000, etc." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-gray-50" /></div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-green-500/20">{editing ? 'Update' : 'Create Supplier'}</button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {suppliers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100"><EmptyState icon={Users} title="No suppliers yet" description="Add your first supplier to start tracking." /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center">
                      <Users size={18} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{s.name}</h4>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </div>
                  </div>
                  <Badge variant={s.status === 'active' ? 'green' : s.status === 'suspended' ? 'red' : 'gray'} dot>
                    {s.status}
                  </Badge>
                </div>

                <div className="space-y-2 mt-4">
                  {s.phone && <p className="text-xs text-gray-500">Phone: {s.phone}</p>}
                  {s.address && <p className="text-xs text-gray-500">Location: {s.address}</p>}
                  {s.certifications && <p className="text-xs text-gray-500">Certs: {s.certifications}</p>}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-gray-400">ESG Score</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div className={`h-full rounded-full ${parseFloat(s.esgScore) >= 3.5 ? 'bg-green-500' : parseFloat(s.esgScore) >= 2 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(parseFloat(s.esgScore) / 5) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{parseFloat(s.esgScore).toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Orders</p>
                      <p className="text-sm font-semibold">{s.purchaseOrders?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} className="text-blue-500" /></button>
                    <button onClick={() => { if (confirm('Delete?')) api.delete(`/suppliers/${s.id}`).then(() => { toast.success('Deleted'); load(); }); }} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} className="text-red-500" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
