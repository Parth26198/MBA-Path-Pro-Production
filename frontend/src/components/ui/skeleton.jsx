import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800', className)} {...props} />;
}

export function CardSkeleton({ className }) {
  return <Skeleton className={cn('rounded-2xl', className)} />;
}

export function LineSkeleton({ className }) {
  return <Skeleton className={cn('h-4 rounded-lg', className)} />;
}
