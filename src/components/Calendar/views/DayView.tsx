'use client';

import type { CalendarEvent } from '../types';
import { CalendarEvent as CalendarEventItem } from '../CalendarEvent';
import { Box, Paper, Typography } from '@mui/material';
import { format } from 'date-fns';

type DayViewProps = {
  currentDate: Date;
  onCurrentDateChange: (d: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  locale: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return events.filter((e) => {
    const start = format(new Date(e.start), 'yyyy-MM-dd');
    const end = format(new Date(e.end), 'yyyy-MM-dd');
    return (dateStr >= start && dateStr <= end) || start === dateStr;
  });
}

export function DayView({
  currentDate,
  events,
  onDayClick,
}: DayViewProps) {
  const dayEvents = getEventsForDate(events, currentDate);

  return (
    <Box>
      <Paper
        component="button"
        type="button"
        onClick={() => onDayClick(currentDate)}
        sx={{
          'width': '100%',
          'p': 2,
          'mb': 2,
          'cursor': 'pointer',
          'textAlign': 'left',
          'border': '1px dashed',
          'borderColor': 'grey.300',
          'bgcolor': 'grey.50',
          '&:hover': { bgcolor: 'grey.100', borderColor: 'grey.400' },
        }}
        elevation={0}
      >
        <Typography variant="body2" color="text.secondary">
          Click to add event
        </Typography>
      </Paper>
      <Paper sx={{ p: 2 }} elevation={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {HOURS.map(h => (
            <Box
              key={h}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                minHeight: 48,
                borderBottom: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="caption" sx={{ width: 48, flexShrink: 0, color: 'grey.600' }}>
                {format(new Date(2000, 0, 1, h, 0), 'ha')}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {dayEvents
                  .filter(e => new Date(e.start).getHours() === h)
                  .map(ev => (
                    <CalendarEventItem key={ev.id} event={ev} variant="inline" />
                  ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
