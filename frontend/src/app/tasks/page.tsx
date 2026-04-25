'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import api, { getErrorMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import Badge from '@/components/Badge';
import { Card } from '@/components/Card';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import FormField, { Input, Select } from '@/components/FormField';
import { formatShortDate } from '@/lib/datetime';
import type { Task, TaskPriority, TaskStatus, User } from '@/lib/types';
import { Plus, X, Calendar } from 'lucide-react';

type SemVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const COLUMNS: { key: TaskStatus; label: string; dotClass: string }[] = [
  { key: 'todo', label: 'To do', dotClass: 'bg-zinc-400' },
  { key: 'in_progress', label: 'In progress', dotClass: 'bg-blue-500' },
  { key: 'review', label: 'Review', dotClass: 'bg-amber-500' },
  { key: 'completed', label: 'Completed', dotClass: 'bg-emerald-500' },
];

const PRIORITY: Record<TaskPriority, { variant: SemVariant; label: string }> = {
  low: { variant: 'neutral', label: 'Low' },
  medium: { variant: 'info', label: 'Medium' },
  high: { variant: 'warning', label: 'High' },
  urgent: { variant: 'danger', label: 'Urgent' },
};

interface TaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  department: string;
  assignedToId: string;
  dueDate: string;
}

const emptyForm: TaskForm = {
  title: '',
  description: '',
  priority: 'medium',
  department: '',
  assignedToId: '',
  dueDate: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskForm>(emptyForm);

  const load = () =>
    api.get<Task[]>('/tasks').then((r) => {
      setTasks(r.data);
      setLoading(false);
    });
  useEffect(() => {
    load();
    api
      .get<User[]>('/users')
      .then((r) => setUsers(r.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      toast.success('Task created');
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const updateStatus = async (id: string, status: TaskStatus) => {
    await api.patch(`/tasks/${id}`, { status });
    load();
  };

  if (loading)
    return (
      <AuthGuard>
        <LoadingSpinner />
      </AuthGuard>
    );

  return (
    <AuthGuard>
      <div className="space-y-5">
        <PageHeader
          title="Tasks"
          subtitle={`${tasks.length} total · ${tasks.filter((t) => t.status === 'completed').length} completed`}
          action={
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={14} />}
              onClick={() => setShowForm(true)}
            >
              New task
            </Button>
          }
        />

        {showForm && (
          <Card className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">New task</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:bg-zinc-100 rounded-md"
                aria-label="Close"
              >
                <X size={15} className="text-zinc-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <FormField label="Task title" required>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Department">
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </FormField>
              <FormField label="Priority">
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    Object.entries(PRIORITY) as [
                      TaskPriority,
                      { variant: SemVariant; label: string },
                    ][]
                  ).map(([key, cfg]) => {
                    const active = form.priority === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, priority: key })}
                        className={`h-9 rounded-md text-[12px] font-medium border transition-colors ${
                          active
                            ? 'bg-zinc-900 border-zinc-900 text-white'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </FormField>
              <FormField label="Assign to">
                <Select
                  value={form.assignedToId}
                  onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Due date">
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </FormField>
              <FormField label="Description">
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
              <div className="md:col-span-2 flex items-center gap-2">
                <Button type="submit" variant="primary">
                  Create task
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Kanban */}
        <div className="grid md:grid-cols-4 gap-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dotClass}`} />
                  <span className="text-[12px] font-medium text-zinc-700">{col.label}</span>
                  <span className="ml-auto text-[11px] font-medium text-zinc-500 tabular-nums bg-zinc-100 px-1.5 rounded">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {colTasks.map((t) => (
                    <Card key={t.id} className="!p-3 hover:border-zinc-300 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] font-medium text-zinc-900 leading-snug">
                          {t.title}
                        </h4>
                        <Badge variant={PRIORITY[t.priority]?.variant || 'neutral'}>
                          {t.priority}
                        </Badge>
                      </div>
                      {t.description && (
                        <p className="text-[12px] text-zinc-500 mt-1 line-clamp-2">
                          {t.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[11px] text-zinc-500">
                        {t.department && (
                          <span className="px-1.5 py-0.5 bg-zinc-100 rounded">{t.department}</span>
                        )}
                        {t.dueDate && (
                          <span className="flex items-center gap-1 tabular-nums">
                            <Calendar size={10} /> {formatShortDate(t.dueDate)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100">
                        {t.assignedTo ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Avatar name={t.assignedTo.name} size="xs" />
                            <span className="text-[11px] text-zinc-600 truncate">
                              {t.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400">Unassigned</span>
                        )}
                        <select
                          value={t.status}
                          onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                          className="text-[11px] border border-zinc-200 rounded px-1.5 py-0.5 bg-white text-zinc-700 focus:outline-none focus:border-emerald-500"
                          aria-label="Change status"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Card>
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
