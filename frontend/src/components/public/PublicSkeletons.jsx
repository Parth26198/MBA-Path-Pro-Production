import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton({ className }) {
  return (
    <div className={className}>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  );
}

export function CarouselSkeleton({ count = 4 }) {
  return (
    <div className="flex gap-5 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[280px] shrink-0">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6, cols = 'sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid gap-6 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
