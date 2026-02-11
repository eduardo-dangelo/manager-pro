'use client';

import type { CalendarEventData } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEvent } from '@/entities';
import { assetKeys, calendarEventKeys, notificationKeys } from '@/queries/keys';

export type CreateEventInput = {
  assetId: number;
  name: string;
  description?: string | null;
  location?: string | null;
  color?: string | null;
  start: Date | string;
  end: Date | string;
  reminders?: { useDefault: boolean; overrides: { method: 'email' | 'popup'; minutes: number }[] } | null;
};

export function useCreateEvent(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const payload = {
        ...data,
        start: typeof data.start === 'string' ? data.start : data.start.toISOString(),
        end: typeof data.end === 'string' ? data.end : data.end.toISOString(),
      };
      const res = await fetch(`/${locale}/api/calendar-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create event');
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
