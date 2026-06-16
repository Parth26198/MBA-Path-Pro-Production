import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageState } from '@/components/shared/PageState';
import { Plus, Loader2, Pencil } from 'lucide-react';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  package_id: '',
  trainer_id: '',
  payment_status: 'completed',
};

export default function AdminStudents() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: studentsRes, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-students'],
    queryFn: adminApi.students,
  });
  const { data: trainersRes } = useQuery({ queryKey: ['admin-trainers'], queryFn: adminApi.trainers });
  const { data: packagesRes } = useQuery({ queryKey: ['admin-packages'], queryFn: adminApi.packages });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId ? adminApi.updateStudent(editId, payload) : adminApi.createStudent(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-students'] });
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: adminApi.deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-students'] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ studentId, trainerId }) => adminApi.assignTrainer(studentId, trainerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-students'] }),
  });

  const students = studentsRes?.data || [];
  const trainers = trainersRes?.data || [];
  const packages = packagesRes?.data || [];

  const startEdit = (s) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      email: s.email,
      password: '',
      phone: s.phone || '',
      package_id: s.package_id || '',
      trainer_id: s.trainer_id || '',
      payment_status: s.payment_status || 'completed',
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      package_id: parseInt(form.package_id, 10),
      trainer_id: form.trainer_id ? parseInt(form.trainer_id, 10) : null,
      payment_status: form.payment_status,
    };
    if (form.password) payload.password = form.password;
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Students</h2>
          <p className="text-sm text-slate-500">Create, edit, assign trainers, and deactivate students</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>{editId ? 'New Password (optional)' : 'Password'}</Label><Input type="password" required={!editId} minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div>
              <Label>Package</Label>
              <select required className="flex h-10 w-full rounded-lg border px-3 text-sm" value={form.package_id} onChange={(e) => setForm({ ...form, package_id: e.target.value })}>
                <option value="">Select</option>
                {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Trainer</Label>
              <select className="flex h-10 w-full rounded-lg border px-3 text-sm" value={form.trainer_id} onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}>
                <option value="">Unassigned</option>
                {trainers.filter((t) => t.is_active !== 0).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          {saveMutation.isError && <p className="text-sm text-red-600">{saveMutation.error.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saveMutation.isPending}>{editId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <PageState isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && students.length === 0} emptyTitle="No students" onRetry={refetch}>
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Trainer</th>
                <th className="px-4 py-3 text-left">Apps</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </td>
                  <td className="px-4 py-3"><Badge>{s.package_code || s.package_name}</Badge></td>
                  <td className="px-4 py-3">{s.trainer_name || <span className="text-amber-600">Unassigned</span>}</td>
                  <td className="px-4 py-3">{s.colleges_applied}/{s.colleges_allowed}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(s)}><Pencil className="h-3 w-3" /></Button>
                      {!s.trainer_id && trainers[0] && (
                        <Button size="sm" onClick={() => assignMutation.mutate({ studentId: s.id, trainerId: trainers[0].id })}>Quick Assign</Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deactivateMutation.mutate(s.id)}>Deactivate</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageState>
    </div>
  );
}
