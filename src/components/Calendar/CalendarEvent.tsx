'use client';

import type { CalendarEvent as CalendarEventType } from './types';
import { Box, Chip, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { COLOR_MAP } from './constants';

function eventColor(color: string | null): string {
  if (!color) {
    return '#6b7280';
  }
  return COLOR_MAP[color] ?? color;
}

function isAllDayEvent(start: Date, end: Date): boolean {
  return (
    start.getHours() === 0
    && start.getMinutes() === 0
    && ((end.getHours() === 23 && end.getMinutes() === 59)
      || (end.getHours() === 0 && end.getMinutes() === 0))
  );
}

type CalendarEventProps = {
  event: CalendarEventType;
  variant?: 'chip' | 'inline' | 'compact';
};

export function CalendarEvent({ event, variant = 'inline' }: CalendarEventProps) {
  const t = useTranslations('Calendar');
  const color = eventColor(event.color);
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const allDay = isAllDayEvent(startDate, endDate);

  if (variant === 'chip') {
    return (
      <Chip
        label={event.name}
        size="small"
        sx={{
          'height': 'auto',
          'py': 0.25,
          'fontSize': '0.688rem',
          'backgroundColor': 'white',
          'borderLeft': '3px solid',
          'borderLeftColor': color,
          'borderRadius': 1,
          'justifyContent': 'flex-start',
          '& .MuiChip-label': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '2px 4px',
          },
        }}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: `${color}20`,
          borderLeft: '3px solid',
          borderLeftColor: color,
        }}
      >
        <Typography variant="caption" sx={{ flexShrink: 0, color: 'text.secondary' }}>
          {allDay ? t('all_day') : `${format(startDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`}
        </Typography>
        <Typography variant="body2" fontWeight={500} noWrap sx={{ minWidth: 0 }}>
          {event.name}
        </Typography>
        {event.location && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
            · {event.location}
          </Typography>
        )}
      </Box>
    );
  }

  // inline (default)
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: `${color}20`,
        borderLeft: '3px solid',
        borderLeftColor: color,
        mb: 0.5,
      }}
    >
      <Typography variant="body2" fontWeight={500}>
        {event.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {allDay ? t('all_day') : `${format(startDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`}
        {event.location ? ` · ${event.location}` : ''}
      </Typography>
    </Box>
  );
}
