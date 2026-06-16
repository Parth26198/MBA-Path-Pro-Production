import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2, PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function ApplyCollegeSection({ student }) {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');

  const remaining = student?.colleges_remaining ?? 0;
  const canApply = remaining > 0;

  const { data: collegesRes, isLoading } = useQuery({
    queryKey: ['student-available-colleges'],
    queryFn: studentApi.availableColleges,
    enabled: canApply,
  });

  const colleges = collegesRes?.data || [];

  const applyMutation = useMutation({
    mutationFn: (collegeId) => studentApi.applyCollege(collegeId),
    onSuccess: () => {
      setSelectedId('');
      setError('');
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      qc.invalidateQueries({ queryKey: ['student-applications'] });
      qc.invalidateQueries({ queryKey: ['student-available-colleges'] });
    },
    onError: (err) => setError(err.message),
  });

  const handleApply = () => {
    if (!selectedId) {
      setError('Please select a college');
      return;
    }
    applyMutation.mutate(parseInt(selectedId, 10));
  };

  if (!canApply) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-900">College application limit reached</p>
        <p className="mt-1 text-sm text-amber-800">
          You have used all {student?.college_limit} college slots in your {student?.package_name} package.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-brand-600" />
        <h3 className="font-display text-lg font-bold">Apply to a College</h3>
        <Badge variant="success">{remaining} slot{remaining !== 1 ? 's' : ''} remaining</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Select a published college to start a new application. Your trainer will manage checklist and status updates.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Loading available colleges...</p>
      ) : colleges.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No new colleges available — you may have applied to all published colleges.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(String(c.id))}
              className={`rounded-xl border p-4 text-left transition-all hover:border-brand-400 hover:shadow-sm ${
                selectedId === String(c.id) ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.location}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Rank #{c.ranking} · From {formatCurrency(c.fees_min)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {colleges.length > 0 && (
        <Button
          className="mt-4"
          onClick={handleApply}
          disabled={!selectedId || applyMutation.isPending}
        >
          {applyMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>Submit Application</>
          )}
        </Button>
      )}
    </div>
  );
}
