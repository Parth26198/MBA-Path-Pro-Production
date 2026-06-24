import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api';

export function useSavedUniversities() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['saved-universities'],
    queryFn: studentApi.savedUniversities,
  });

  const saveMutation = useMutation({
    mutationFn: (collegeId) => studentApi.saveUniversity(collegeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-universities'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      qc.invalidateQueries({ queryKey: ['student-universities'] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (collegeId) => studentApi.unsaveUniversity(collegeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-universities'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      qc.invalidateQueries({ queryKey: ['student-universities'] });
    },
  });

  const savedIds = new Set((query.data?.data || []).map((u) => u.id));

  const toggleSave = (university) => {
    if (savedIds.has(university.id)) unsaveMutation.mutate(university.id);
    else saveMutation.mutate(university.id);
  };

  return {
    saved: query.data?.data || [],
    savedIds,
    isLoading: query.isLoading,
    toggleSave,
    isSaving: saveMutation.isPending || unsaveMutation.isPending,
  };
}
