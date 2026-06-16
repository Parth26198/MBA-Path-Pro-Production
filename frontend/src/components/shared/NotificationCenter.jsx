import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: countRes } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: notificationApi.unreadCount,
    refetchInterval: 30000,
  });

  const { data: listRes, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list({ limit: 20 }),
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const unreadCount = countRes?.data?.count || 0;
  const notifications = listRes?.data?.notifications || [];

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setOpen((v) => !v)}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" aria-label="Close notifications" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-white shadow-xl sm:w-96">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
                    <CheckCheck className="mr-1 h-3 w-3" /> Read all
                  </Button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn('border-b px-4 py-3 text-sm', !n.is_read && 'bg-brand-50/50')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="mt-0.5 text-slate-600">{n.message}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                        </p>
                        {n.link && (
                          <Link to={n.link} className="mt-1 inline-block text-xs text-brand-600 hover:underline" onClick={() => setOpen(false)}>
                            View details
                          </Link>
                        )}
                      </div>
                      {!n.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-xs"
                          onClick={() => markReadMutation.mutate(n.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
