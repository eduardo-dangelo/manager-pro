'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetKeys, calendarEventKeys, notificationKeys } from '@/queries/keys';

export function useDeleteEvent(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      const res = await fetch(`/${locale}/api/calendar-events/${eventId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete event');
      }
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
