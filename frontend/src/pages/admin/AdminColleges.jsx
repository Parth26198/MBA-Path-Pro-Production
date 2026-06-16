import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageState } from '@/components/shared/PageState';
import { CollegeForm } from '@/components/colleges/CollegeForm';
import { Check, X, Star, Pencil, Trash2 } from 'lucide-react';

export default function AdminColleges() {
  const qc = useQueryClient();
  const [editCollege, setEditCollege] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-colleges'],
    queryFn: () => adminApi.colleges({ status: 'all' }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }) => adminApi.approveCollege(id, approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-colleges'] }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }) => adminApi.featureCollege(id, featured),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-colleges'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateCollege(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-colleges'] });
      setEditCollege(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCollege,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-colleges'] }),
  });

  const colleges = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">College Management</h2>
        <p className="text-sm text-slate-500">Approve trainer submissions, feature on homepage, edit or remove listings</p>
      </div>

      {editCollege && (
        <CollegeForm
          adminMode
          initial={editCollege}
          onSubmit={(payload) => updateMutation.mutate({ id: editCollege.id, payload })}
          onCancel={() => setEditCollege(null)}
          loading={updateMutation.isPending}
          error={updateMutation.error?.message}
        />
      )}

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && colleges.length === 0}
        emptyTitle="No colleges"
        onRetry={refetch}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {colleges.map((c) => (
            <div key={c.id} className="rounded-2xl border bg-white p-5">
              <div className="flex justify-between gap-2">
                <h3 className="font-bold">{c.name}</h3>
                <Badge variant={c.status === 'published' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'}>
                  {c.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">{c.location || c.city}</p>
              {c.is_featured ? <Badge className="mt-2">Featured</Badge> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {c.status === 'pending_approval' && (
                  <>
                    <Button size="sm" onClick={() => approveMutation.mutate({ id: c.id, approved: true })}>
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => approveMutation.mutate({ id: c.id, approved: false })}>
                      <X className="h-3 w-3" /> Reject
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => featureMutation.mutate({ id: c.id, featured: !c.is_featured })}
                >
                  <Star className="h-3 w-3" /> {c.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditCollege(c)}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(c.id)}>
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
