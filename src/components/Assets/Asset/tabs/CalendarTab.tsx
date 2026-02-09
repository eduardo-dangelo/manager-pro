'use client';

import type { CalendarEvent } from '@/components/Calendar/types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { CalendarView } from '@/components/Calendar';

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type?: string | null;
  tabs?: string[];
  metadata?: Record<string, unknown>;
  objectives: unknown[];
  todos: unknown[];
  sprints: unknown[];
};

type CalendarTabProps = {
  asset: Asset;
  locale: string;
  registerCalendarRefresh?: (fn: (() => void) | null) => void;
};

export function CalendarTab({ asset, locale, registerCalendarRefresh }: CalendarTabProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/${locale}/api/calendar-events?assetId=${asset.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = (await res.json()) as { events: CalendarEvent[] };
      setEvents(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [locale, asset.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    registerCalendarRefresh?.(fetchEvents);
    return () => { registerCalendarRefresh?.(null); };
  }, [fetchEvents, registerCalendarRefresh]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <CalendarView
      events={events}
      locale={locale}
      assetId={asset.id}
      onEventsChange={setEvents}
    />
  );
}
