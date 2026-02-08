'use client';

import type { CalendarEvent } from '../types';
import { Box, Paper, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import { CalendarEvent as CalendarEventItem } from '../CalendarEvent';

type ScheduleViewProps = {
  currentDate: Date;
  onCurrentDateChange: (_d: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date, anchorEl?: HTMLElement) => void;
  onEventClick?: (event: CalendarEvent, anchorEl: HTMLElement) => void;
  locale: string;
};

function groupEventsByDay(events: CalendarEvent[]): { date: string; events: CalendarEvent[] }[] {
  const map = new Map<string, CalendarEvent[]>();
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
  for (const e of sorted) {
    const d = format(parseISO(e.start), 'yyyy-MM-dd');
    if (!map.has(d)) {
      map.set(d, []);
    }
    map.get(d)!.push(e);
  }
  return Array.from(map.entries()).map(([date, evs]) => ({ date, events: evs }));
}

export function ScheduleView({
  events,
  onDayClick,
  onEventClick,
}: ScheduleViewProps) {
  const t = useTranslations('Calendar');
  const grouped = groupEventsByDay(events);

  if (grouped.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }} elevation={1}>
        <Typography color="text.secondary">{t('no_events')}</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {grouped.map(({ date, events: dayEvents }, index) => {
        const d = parseISO(date);
        const isLastDay = index === grouped.length - 1;
        return (
          <Box
            key={date}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'stretch',
              gap: 1,
              pb: 0.5,
            }}
          >
            {/* Timeline left column: circle + vertical line */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={e => onDayClick(d, e.currentTarget)}
                sx={{
                  'width': 34,
                  'color': 'text.primary',
                  'display': 'flex',
                  'alignItems': 'center',
                  'justifyContent': 'center',
                  'zIndex': 1,
                  'cursor': 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: 30 }}>
                  {format(d, 'd')}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '1px',
                  height: '100%',
                  backgroundColor: isLastDay ? 'transparent' : 'divider',
                  borderRadius: 2,
                }}
              />
            </Box>

            {/* Content right column: date string + events card */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                component="button"
                type="button"
                onClick={e => onDayClick(d, e.currentTarget)}
                sx={{
                  'width': '100%',
                  'p': 0,
                  'mb': 0.5,
                  'border': 'none',
                  'bgcolor': 'transparent',
                  'cursor': 'pointer',
                  'textAlign': 'left',
                  '&:hover': { opacity: 0.8 },
                  'mt': 1.3,

                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {format(d, 'MMMM yyyy')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, mb: 2 }}>
                {dayEvents.map(ev => (
                  <Box
                    key={ev.id}
                    component="button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(ev, e.currentTarget);
                    }}
                    sx={{
                      'width': '100%',
                      'p': 0,
                      'm': 0,
                      'border': 'none',
                      'bgcolor': 'transparent',
                      'cursor': onEventClick ? 'pointer' : 'default',
                      'textAlign': 'left',
                      '&:hover': onEventClick ? { opacity: 0.9 } : {},
                    }}
                  >
                    <CalendarEventItem event={ev} variant="inline" />
                  </Box>
                ))}
              </Box>

            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
