'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/queries/keys';

export function useMarkNotificationRead(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await fetch(`/${locale}/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to mark notification as read');
      }
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
