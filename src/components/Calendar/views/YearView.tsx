'use client';

import type { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import {
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

type YearViewProps = {
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

export function YearView({
  currentDate,
  onCurrentDateChange,
  events,
  onDayClick,
}: YearViewProps) {
  const year = currentDate.getFullYear();
  const prev = () => onCurrentDateChange(addYears(currentDate, -1));
  const next = () => onCurrentDateChange(addYears(currentDate, 1));

  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {year}
        </Typography>
        <Box>
          <IconButton onClick={prev} size="small" aria-label="previous year">
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={next} size="small" aria-label="next year">
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {months.map((month) => {
          const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
          const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
          const days = eachDayOfInterval({ start, end });
          return (
            <Paper key={month.toISOString()} sx={{ p: 1.5 }} elevation={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem' }}>
                {format(month, 'MMMM')}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                }}
              >
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <Box
                    key={d}
                    sx={{
                      textAlign: 'center',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: 'grey.500',
                    }}
                  >
                    {d}
                  </Box>
                ))}
                {days.map((day) => {
                  const dayEvents = getEventsForDate(events, day);
                  const inMonth = isSameMonth(day, month);
                  const hasEvents = dayEvents.length > 0;
                  return (
                    <Paper
                      key={day.toISOString()}
                      component="button"
                      type="button"
                      onClick={() => onDayClick(day)}
                      sx={{
                        'minWidth': 24,
                        'height': 24,
                        'p': 0,
                        'cursor': 'pointer',
                        'fontSize': '0.7rem',
                        'display': 'flex',
                        'alignItems': 'center',
                        'justifyContent': 'center',
                        'border': 'none',
                        'bgcolor': inMonth
                          ? hasEvents
                            ? 'primary.100'
                            : 'grey.100'
                          : 'transparent',
                        'color': inMonth ? 'text.primary' : 'grey.400',
                        '&:hover': inMonth ? { bgcolor: hasEvents ? 'primary.200' : 'grey.200' } : {},
                        'transition': 'background-color 0.15s',
                      }}
                      elevation={0}
                    >
                      {format(day, 'd')}
                    </Paper>
                  );
                })}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
