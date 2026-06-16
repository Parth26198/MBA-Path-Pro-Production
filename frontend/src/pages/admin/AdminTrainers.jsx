import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageState } from '@/components/shared/PageState';
import { Plus, Loader2, Pencil } from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', phone: '', specialization: '', experience_years: '', bio: '' };

export default function AdminTrainers() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: adminApi.trainers,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? adminApi.updateTrainer(editId, payload) : adminApi.createTrainer(payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-trainers'] });
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => adminApi.updateTrainer(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-trainers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteTrainer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-trainers'] }),
  });

  const trainers = data?.data || [];

  const startEdit = (t) => {
    setEditId(t.id);
    setForm({
      name: t.name,
      email: t.email,
      password: '',
      phone: t.phone || '',
      specialization: t.specialization || '',
      experience_years: t.experience_years ?? '',
      bio: t.bio || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      specialization: form.specialization || null,
      experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
      bio: form.bio || null,
    };
    if (form.password) payload.password = form.password;
    if (!editId) payload.password = form.password;
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Trainers</h2>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          <Plus className="h-4 w-4" /> Add Trainer
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>{editId ? 'New Password (optional)' : 'Password'}</Label><Input type="password" required={!editId} minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
            <div><Label>Experience (years)</Label><Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Bio</Label><Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
          </div>
          {saveMutation.isError && <p className="text-sm text-red-600">{saveMutation.error.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saveMutation.isPending}>{editId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <PageState isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && trainers.length === 0} emptyTitle="No trainers" onRetry={refetch}>
        <div className="grid gap-4 md:grid-cols-2">
          {trainers.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-white p-6">
              <div className="flex justify-between gap-2">
                <h3 className="font-bold">{t.name}</h3>
                <Badge variant={t.is_active ? 'success' : 'danger'}>{t.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-sm text-slate-500">{t.email}</p>
              <p className="mt-2 text-sm">{t.specialization}</p>
              <p className="mt-4 text-sm"><strong>{t.assigned_students}</strong> students · Rating {t.rating}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(t)}><Pencil className="h-3 w-3" /> Edit</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleMutation.mutate({ id: t.id, is_active: !t.is_active })}
                >
                  {t.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => window.confirm(`Delete trainer ${t.name}?`) && deleteMutation.mutate(t.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
