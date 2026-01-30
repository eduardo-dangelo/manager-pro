'use client';

import type { CalendarEvent } from '../types';
import { Box, Paper, Typography } from '@mui/material';
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from 'date-fns';
import { COLOR_MAP } from '../constants';

type WeekViewProps = {
  currentDate: Date;
  onCurrentDateChange: (d: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  locale: string;
};

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return events.filter((e) => {
    const start = format(new Date(e.start), 'yyyy-MM-dd');
    const end = format(new Date(e.end), 'yyyy-MM-dd');
    return (dateStr >= start && dateStr <= end) || start === dateStr;
  });
}

function eventColor(color: string | null): string {
  if (!color) {
    return '#6b7280';
  }
  return COLOR_MAP[color] ?? color;
}

export function WeekView({
  currentDate,
  onCurrentDateChange: _onCurrentDateChange,
  events,
  onDayClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date();

  return (
    <Box>
      <Paper sx={{ p: 2 }} elevation={1}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {days.map((day) => {
            const dayEvents = getEventsForDate(events, day);
            const isTodayDate = isSameDay(day, today);
            return (
              <Paper
                key={day.toISOString()}
                component="button"
                type="button"
                onClick={() => onDayClick(day)}
                sx={{
                  'minHeight': 120,
                  'p': 1,
                  'cursor': 'pointer',
                  'textAlign': 'left',
                  'display': 'flex',
                  'flexDirection': 'column',
                  'border': '1px solid',
                  'borderColor': isTodayDate ? 'primary.main' : 'grey.200',
                  'bgcolor': isTodayDate ? 'primary.50' : 'grey.50',
                  '&:hover': { bgcolor: isTodayDate ? 'primary.100' : 'grey.200' },
                  'transition': 'background-color 0.15s',
                }}
                elevation={0}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isTodayDate ? 700 : 500,
                    fontSize: '0.875rem',
                    color: isTodayDate ? 'primary.main' : 'grey.700',
                    mb: 0.5,
                  }}
                >
                  {format(day, 'EEE d')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, overflow: 'auto' }}>
                  {dayEvents.slice(0, 4).map(ev => (
                    <Box
                      key={ev.id}
                      sx={{
                        fontSize: '0.75rem',
                        py: 0.25,
                        px: 0.5,
                        borderRadius: 0.5,
                        bgcolor: `${eventColor(ev.color)}20`,
                        borderLeft: '2px solid',
                        borderLeftColor: eventColor(ev.color),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ev.name}
                    </Box>
                  ))}
                  {dayEvents.length > 4 && (
                    <Typography variant="caption" sx={{ fontSize: '0.688rem', color: 'grey.600' }}>
                      +
                      {dayEvents.length - 4}
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
