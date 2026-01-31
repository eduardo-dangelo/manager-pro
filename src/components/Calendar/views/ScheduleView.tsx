'use client';

import type { CalendarEvent } from '../types';
import { CalendarEvent as CalendarEventItem } from '../CalendarEvent';
import { Box, Paper, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';

type ScheduleViewProps = {
  currentDate: Date;
  onCurrentDateChange: (_d: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {grouped.map(({ date, events: dayEvents }) => {
        const d = parseISO(date);
        return (
          <Paper key={date} sx={{ overflow: 'hidden' }} elevation={1}>
            <Box
              component="button"
              type="button"
              onClick={() => onDayClick(d)}
              sx={{
                'width': '100%',
                'p': 1.5,
                'textAlign': 'left',
                'cursor': 'pointer',
                'border': 'none',
                'bgcolor': 'grey.50',
                '&:hover': { bgcolor: 'grey.200' },
                'borderBottom': '1px solid',
                'borderColor': 'grey.200',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {format(d, 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dayEvents.map(ev => (
                <CalendarEventItem key={ev.id} event={ev} variant="inline" />
              ))}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
