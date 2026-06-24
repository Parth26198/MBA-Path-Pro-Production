import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, studentApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PageState } from '@/components/shared/PageState';
import { ProfileCompletionCard } from '@/components/student/dashboard/ProfileCompletionCard';

export default function StudentProfile() {
  const qc = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentApi.profile,
  });

  const profile = data?.data || {};
  const academic = profile.academic_details || {};
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    career_goal: '',
    target_countries: '',
    target_programs: '',
    preferred_budget_max: '',
    gmat: '',
    cat_percentile: '',
  });

  useEffect(() => {
    if (profile.id) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        state: profile.state || '',
        career_goal: profile.career_goal || '',
        target_countries: (profile.target_countries || []).join(', '),
        target_programs: (profile.target_programs || []).join(', '),
        preferred_budget_max: profile.preferred_budget_max || '',
        gmat: academic.gmat || '',
        cat_percentile: academic.cat_percentile || '',
      });
    }
  }, [
    profile.id,
    profile.name,
    profile.phone,
    profile.city,
    profile.state,
    profile.career_goal,
    profile.target_countries,
    profile.target_programs,
    profile.preferred_budget_max,
    academic.gmat,
    academic.cat_percentile,
  ]);

  const saveMutation = useMutation({
    mutationFn: (payload) => studentApi.updateProfile(payload),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['student-profile'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      const me = await authApi.me();
      setAuth({ token, user: me.data, profile: me.data.profile });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      name: form.name,
      phone: form.phone,
      city: form.city,
      state: form.state,
      career_goal: form.career_goal,
      target_countries: form.target_countries
        ? form.target_countries.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      target_programs: form.target_programs
        ? form.target_programs.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      preferred_budget_max: form.preferred_budget_max ? Number(form.preferred_budget_max) : null,
      academic_details: {
        ...academic,
        gmat: form.gmat ? Number(form.gmat) : null,
        cat_percentile: form.cat_percentile ? Number(form.cat_percentile) : null,
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <PageState isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileCompletionCard completion={profile.profile_completion} />
          <div className="student-card p-6">
            <p className="text-sm text-slate-500">Signed in as</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="student-card mt-6 space-y-6 p-6">
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold">Personal Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Career Goal</Label>
              <Input value={form.career_goal} onChange={(e) => setForm({ ...form, career_goal: e.target.value })} placeholder="e.g. Product Management, Consulting" />
            </div>
            <div>
              <Label>Target Countries (comma separated)</Label>
              <Input value={form.target_countries} onChange={(e) => setForm({ ...form, target_countries: e.target.value })} placeholder="India, USA, UK" />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h2 className="font-display text-lg font-bold">MBA Preferences</h2>
            <div>
              <Label>Target Programs (comma separated)</Label>
              <Input value={form.target_programs} onChange={(e) => setForm({ ...form, target_programs: e.target.value })} placeholder="Finance, Marketing, Strategy" />
            </div>
            <div>
              <Label>Maximum Budget (₹)</Label>
              <Input type="number" value={form.preferred_budget_max} onChange={(e) => setForm({ ...form, preferred_budget_max: e.target.value })} placeholder="2500000" />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h2 className="font-display text-lg font-bold">Exam Scores</h2>
            <p className="text-sm text-slate-500">Used for personalized match scores and recommendations.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>GMAT Score</Label>
                <Input type="number" value={form.gmat} onChange={(e) => setForm({ ...form, gmat: e.target.value })} placeholder="720" />
              </div>
              <div>
                <Label>CAT Percentile</Label>
                <Input type="number" value={form.cat_percentile} onChange={(e) => setForm({ ...form, cat_percentile: e.target.value })} placeholder="99" />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </PageState>
    </div>
  );
}
