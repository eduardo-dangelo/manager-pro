'use client';

import type { CalendarEvent } from '@/components/Calendar/types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { EventDetailsPopover } from '@/components/Calendar/EventDetailsPopover';
import { ScheduleView } from '@/components/Calendar/views/ScheduleView';
import { Card as CommonCard } from '@/components/common/Card';

type Asset = {
  id: number;
  name?: string | null;
  type?: string | null;
  tabs?: string[];
};

type CalendarCardProps = {
  asset: Asset;
  locale: string;
  onNavigateToTab: (tabName: string) => void;
};

export function CalendarCard({ asset, locale, onNavigateToTab }: CalendarCardProps) {
  const t = useTranslations('Assets');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventDetailsAnchor, setEventDetailsAnchor] = useState<HTMLElement | null>(null);
  const [eventDetailsAnchorPosition, setEventDetailsAnchorPosition] = useState<{ top: number; left: number } | null>(null);
  const [eventDetailsEvent, setEventDetailsEvent] = useState<CalendarEvent | null>(null);

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

  const handleEventClick = (event: CalendarEvent, anchorEl: HTMLElement, anchorPosition?: { x: number; y: number }) => {
    setEventDetailsAnchor(anchorEl);
    setEventDetailsAnchorPosition(anchorPosition ? { top: anchorPosition.y, left: anchorPosition.x } : null);
    setEventDetailsEvent(event);
  };

  return (
    <>
      <CommonCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          component="button"
          type="button"
          onClick={() => onNavigateToTab('calendar')}
          sx={{
            'display': 'flex',
            'alignItems': 'center',
            'p': 2,
            'pb': 1,
            'border': 'none',
            'bgcolor': 'transparent',
            'cursor': 'pointer',
            'textAlign': 'left',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              mb: 1,
              textTransform: 'uppercase',
            }}
          >
            {t('upcoming_events')}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, px: 2, pb: 2, overflow: 'hidden' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {error && (
            <Typography variant="body2" color="error" sx={{ py: 2 }}>
              {error}
            </Typography>
          )}
          {!loading && !error && (
            <ScheduleView
              events={events}
              onEventClick={handleEventClick}
              variant="compact"
              maxEvents={3}
            />
          )}
        </Box>
      </CommonCard>

      {eventDetailsAnchor != null && eventDetailsEvent != null && (
        <EventDetailsPopover
          open
          anchorEl={eventDetailsAnchor}
          anchorPosition={eventDetailsAnchorPosition}
          event={eventDetailsEvent}
          showAssetCard={false}
          onClose={() => {
            setEventDetailsAnchor(null);
            setEventDetailsAnchorPosition(null);
            setEventDetailsEvent(null);
          }}
          locale={locale}
        />
      )}
    </>
  );
}
