'use client';

import type { Activity } from './types';
import type { CalendarEvent } from '@/components/Calendar/types';
import type { AssetData } from '@/entities';
import Timeline from '@mui/lab/Timeline';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { EventDetailsPopover } from '@/components/Calendar/EventDetailsPopover';
import { ActivityItem } from './ActivityItem';

type ActivityTimelineProps = {
  activities: Activity[];
  showAssetLink?: boolean;
  locale: string;
  emptyMessage?: string;
  assets?: AssetData[];
};

export function ActivityTimeline({
  activities,
  showAssetLink = false,
  locale,
  emptyMessage,
  assets,
}: ActivityTimelineProps) {
  const t = useTranslations('Activity');
  const defaultEmpty = t('no_activities');

  const [eventDetailsAnchor, setEventDetailsAnchor] = useState<HTMLElement | null>(null);
  const [eventDetailsEvent, setEventDetailsEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = useCallback(
    async (eventId: number, anchorEl: HTMLElement) => {
      setEventDetailsAnchor(anchorEl);
      try {
        const res = await fetch(`/${locale}/api/calendar-events/${eventId}`);
        if (!res.ok) {
          setEventDetailsAnchor(null);
          setEventDetailsEvent(null);
          return;
        }
        const data = (await res.json()) as { event: CalendarEvent };
        setEventDetailsEvent(data.event);
      } catch {
        setEventDetailsAnchor(null);
        setEventDetailsEvent(null);
      }
    },
    [locale],
  );

  const handleEventDetailsClose = () => {
    setEventDetailsAnchor(null);
    setEventDetailsEvent(null);
  };

  if (activities.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }} elevation={1}>
        <Typography color="text.secondary">
          {emptyMessage ?? defaultEmpty}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Timeline
        position="right"
        sx={{
          p: 0,
          m: 0,
          maxWidth: '100%',
          [`& .MuiTimelineItem-root:before`]: {
            flex: 0,
            padding: 0,
          },
          // @mui/lab TimelineDot uses 11.5px vertical margin by default
          [`& .MuiTimelineDot-root`]: {
            marginTop: 0,
            marginBottom: 0,
          },
        }}
      >
        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            showAssetLink={showAssetLink}
            locale={locale}
            isLast={index === activities.length - 1}
            onEventClick={handleEventClick}
          />
        ))}
      </Timeline>

      {eventDetailsAnchor != null && eventDetailsEvent != null && (
        <EventDetailsPopover
          open
          anchorEl={eventDetailsAnchor}
          event={eventDetailsEvent}
          assets={assets}
          showAssetCard
          onClose={handleEventDetailsClose}
          locale={locale}
        />
      )}
    </Box>
  );
}
