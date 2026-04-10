'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import { Plus, X, Calendar, User } from 'lucide-react';

const columns = [
  { key: 'todo', label: 'To Do', color: 'bg-gray-400', bgColor: 'bg-gray-50' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  { key: 'review', label: 'Review', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
  { key: 'completed', label: 'Completed', color: 'bg-green-500', bgColor: 'bg-green-50' },
];

const priorityConfig: Record<string, { variant: any; label: string }> = {
  low: { variant: 'gray', label: 'Low' },
  medium: { variant: 'blue', label: 'Medium' },
  high: { variant: 'orange', label: 'High' },
  urgent: { variant: 'red', label: 'Urgent' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', department: '', assignedToId: '', dueDate: '' });

  const load = () => api.get('/tasks').then((r) => { setTasks(r.data); setLoading(false); });
  useEffect(() => { load(); api.get('/users').then((r) => setUsers(r.data)).catch(() => {}); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      toast.success('Task created');
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', department: '', assignedToId: '', dueDate: '' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/tasks/${id}`, { status });
    load();
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    toast.success('Deleted');
    load();
  };

  if (loading) return <AuthGuard><LoadingSpinner /></AuthGuard>;

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="space-y-4">
        <PageHeader
          title="Task Management"
          subtitle={`${tasks.length} total tasks | ${tasks.filter((t) => t.status === 'completed').length} completed`}
          action={
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-lg shadow-green-500/20">
              <Plus size={16} /> New Task
            </button>
          }
        />

        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-900">Create New Task</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Task Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.entries(priorityConfig).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setForm({ ...form, priority: key })} className={`py-2 rounded-lg text-xs font-medium border transition-all ${form.priority === key ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}>{cfg.label}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Assign To</label>
                <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                  <option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" /></div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-green-500/20">Create Task</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid md:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${col.bgColor}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                  <span className="ml-auto text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {colTasks.map((t) => (
                    <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-gray-900 leading-snug">{t.title}</h4>
                        <Badge variant={priorityConfig[t.priority]?.variant || 'gray'}>
                          {t.priority}
                        </Badge>
                      </div>
                      {t.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{t.description}</p>}

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {t.department && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">{t.department}</span>}
                        {t.dueDate && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar size={10} /> {t.dueDate?.split('T')[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        {t.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-[8px] text-white font-bold">{t.assignedTo.name?.charAt(0)}</span>
                            </div>
                            <span className="text-[10px] text-gray-500">{t.assignedTo.name}</span>
                          </div>
                        ) : <span className="text-[10px] text-gray-300">Unassigned</span>}
                        <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="text-[10px] border border-gray-200 rounded-lg px-1.5 py-1 bg-gray-50 focus:outline-none">
                          {columns.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AuthGuard>
  );
}
