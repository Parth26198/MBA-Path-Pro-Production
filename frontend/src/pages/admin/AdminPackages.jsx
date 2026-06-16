import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PageState } from '@/components/shared/PageState';
import { formatPackage } from '@/lib/utils';
import { Plus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function AdminPackages() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', price: '', college_limit: 3, description: '', is_active: true });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: adminApi.packages,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? adminApi.updatePackage(editId, payload) : adminApi.createPackage(payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-packages'] });
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', code: '', price: '', college_limit: 3, description: '', is_active: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deletePackage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-packages'] }),
  });

  const packages = data?.data || [];

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, code: p.code, price: p.price, college_limit: p.college_limit, description: p.description || '', is_active: !!p.is_active });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Packages</h2>
        <Button onClick={() => { setShowForm(true); setEditId(null); }}>
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({ ...form, price: parseFloat(form.price), college_limit: parseInt(form.college_limit, 10) });
          }}
          className="rounded-2xl border bg-white p-6 space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Code</Label><Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div><Label>Price (₹)</Label><Input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>College Limit</Label><Input required type="number" value={form.college_limit} onChange={(e) => setForm({ ...form, college_limit: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active (available for purchase)
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={saveMutation.isPending}>{editId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <PageState isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && packages.length === 0} emptyTitle="No packages" onRetry={refetch}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <div key={p.id} className="rounded-2xl border bg-white p-6">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-slate-500">{p.code} · {p.college_limit} colleges</p>
              <p className="mt-2 text-xl font-bold">{formatPackage(p.price)}</p>
              <Badge className="mt-2" variant={p.is_active ? 'success' : 'warning'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
