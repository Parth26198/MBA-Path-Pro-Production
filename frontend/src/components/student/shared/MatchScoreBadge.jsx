import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function MatchScoreBadge({ score, className }) {
  const value = Number(score) || 0;
  const variant = value >= 90 ? 'success' : value >= 80 ? 'default' : 'muted';

  return (
    <Badge variant={variant} className={cn('font-bold', className)} title="Personalized match based on your profile and university ranking">
      {value}% Match
    </Badge>
  );
}
