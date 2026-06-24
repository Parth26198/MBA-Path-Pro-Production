import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2, PlusCircle, Sparkles } from 'lucide-react';
import { formatFees } from '@/lib/utils';
import { useStudentTier } from '@/hooks/useStudentTier';
import { PremiumLockScreen } from '@/components/student/access/PremiumLockScreen';

export function ApplyCollegeSection({ student }) {
  const { isPremium, canApply, collegesRemaining } = useStudentTier();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');

  const { data: collegesRes, isLoading } = useQuery({
    queryKey: ['student-available-colleges'],
    queryFn: studentApi.availableColleges,
    enabled: isPremium,
  });

  const colleges = collegesRes?.data || [];

  const applyMutation = useMutation({
    mutationFn: (collegeId) => studentApi.applyCollege(collegeId),
    onSuccess: async () => {
      setSelectedId('');
      setError('');
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      qc.invalidateQueries({ queryKey: ['student-applications'] });
      qc.invalidateQueries({ queryKey: ['student-available-colleges'] });
    },
    onError: (err) => setError(err.message),
  });

  if (!isPremium) {
    return (
      <PremiumLockScreen
        feature="College Applications"
        title="Apply to Colleges with Premium"
        description="Upgrade your plan to submit applications, track progress, and work with your assigned counsellor."
      />
    );
  }

  if (!canApply) {
    return (
      <div className="student-card border-warning-200 bg-warning-50 p-6">
        <p className="font-semibold text-warning-700">College application limit reached</p>
        <p className="mt-1 text-sm text-slate-600">
          You have used all {student?.colleges_allowed} slots in your {student?.package_name} package.
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/student/packages">Upgrade Package</Link>
        </Button>
      </div>
    );
  }

  const handleApply = () => {
    if (!selectedId) {
      setError('Please select a college');
      return;
    }
    applyMutation.mutate(parseInt(selectedId, 10));
  };

  return (
    <div className="student-card p-6">
      <div className="flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-brand-600" />
        <h3 className="font-display text-lg font-bold">Apply to a College</h3>
        <Badge variant="success">{collegesRemaining} slot{collegesRemaining !== 1 ? 's' : ''} left</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Select a published college to start a new application.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Loading available colleges...</p>
      ) : colleges.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No new colleges available.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(String(c.id))}
              className={`rounded-xl border p-4 text-left transition-all hover:border-brand-400 hover:shadow-card-hover ${
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
                    Rank #{c.ranking} · From {formatFees(c.fees_min)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}

      {colleges.length > 0 && (
        <Button className="mt-4" variant="premium" onClick={handleApply} disabled={!selectedId || applyMutation.isPending}>
          {applyMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Submit Application
            </>
          )}
        </Button>
      )}
    </div>
  );
}
