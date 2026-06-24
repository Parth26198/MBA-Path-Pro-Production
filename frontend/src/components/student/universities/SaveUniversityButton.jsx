import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedUniversities } from '@/hooks/useSavedUniversities';
import { cn } from '@/lib/utils';

export function SaveUniversityButton({ university, variant = 'outline', size = 'sm', className }) {
  const { savedIds, toggleSave, isSaving } = useSavedUniversities();
  const saved = savedIds.has(university.id);

  return (
    <Button
      type="button"
      variant={saved ? 'default' : variant}
      size={size}
      className={cn(className)}
      disabled={isSaving}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(university);
      }}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
      )}
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}
