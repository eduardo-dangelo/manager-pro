'use client';

import type { CalendarEventData } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEvent } from '@/entities';
import { assetKeys, calendarEventKeys, notificationKeys } from '@/queries/keys';

export type UpdateEventInput = Partial<{
  assetId: number;
  name: string;
  description: string | null;
  location: string | null;
  color: string | null;
  start: Date | string;
  end: Date | string;
  reminders: { useDefault: boolean; overrides: { method: 'email' | 'popup'; minutes: number }[] } | null;
}>;

export function useUpdateEvent(locale: string, eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEventInput) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.start !== undefined) {
        payload.start = typeof data.start === 'string' ? data.start : data.start.toISOString();
      }
      if (data.end !== undefined) {
        payload.end = typeof data.end === 'string' ? data.end : data.end.toISOString();
      }
      const res = await fetch(`/${locale}/api/calendar-events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update event');
      }
      const { event } = (await res.json()) as { event: CalendarEventData };
      return CalendarEvent.fromApi(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
