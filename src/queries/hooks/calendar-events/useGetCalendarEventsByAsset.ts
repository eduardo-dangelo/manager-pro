'use client';

import type { CalendarEventData } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { CalendarEvent } from '@/entities';
import { calendarEventKeys } from '@/queries/keys';

export function useGetCalendarEventsByAsset(
  locale: string,
  assetId: number | null | undefined,
) {
  return useQuery({
    queryKey: calendarEventKeys.list({ assetId: assetId ?? 0 }),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/calendar-events?assetId=${assetId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      const { events } = (await res.json()) as { events: CalendarEventData[] };
      return (events ?? []).map((e: CalendarEventData) => CalendarEvent.fromApi(e));
    },
    enabled: typeof assetId === 'number' && assetId > 0,
  });
}
