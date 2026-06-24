import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle = 'No data yet',
  emptyMessage = 'Nothing to show at the moment.',
  onRetry,
  loadingFallback,
  children,
}) {
  if (isLoading) {
    if (loadingFallback) return loadingFallback;
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="mt-3 text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-3 font-medium text-red-800">Something went wrong</p>
        <p className="mt-1 text-sm text-red-600">{error?.message || 'Failed to load data'}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center">
        <Inbox className="h-8 w-8 text-slate-300" />
        <p className="mt-3 font-medium text-slate-700">{emptyTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return children;
}
