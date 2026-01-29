'use client';

import type { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { COLOR_MAP } from '../constants';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type MonthViewProps = {
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

export function MonthView({
  currentDate,
  onCurrentDateChange,
  events,
  onDayClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const today = new Date();

  const prev = () => onCurrentDateChange(addMonths(currentDate, -1));
  const next = () => onCurrentDateChange(addMonths(currentDate, 1));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <Box>
          <IconButton onClick={prev} size="small" aria-label="previous month">
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={next} size="small" aria-label="next month">
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
      <Paper sx={{ p: 2 }} elevation={1}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            mb: 1,
          }}
        >
          {DAY_NAMES.map(day => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'grey.700',
                pb: 1,
              }}
            >
              {day}
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
          }}
        >
          {days.map((day) => {
            const dayEvents = getEventsForDate(events, day);
            const inMonth = isSameMonth(day, currentDate);
            const isTodayDate = isSameDay(day, today);
            return (
              <Paper
                key={day.toISOString()}
                component="button"
                type="button"
                onClick={() => onDayClick(day)}
                sx={{
                  'minHeight': 100,
                  'p': 1,
                  'cursor': 'pointer',
                  'textAlign': 'left',
                  'display': 'flex',
                  'flexDirection': 'column',
                  'border': '1px solid',
                  'borderColor': isTodayDate ? 'primary.main' : 'grey.200',
                  'bgcolor': inMonth
                    ? isTodayDate
                      ? 'primary.50'
                      : 'grey.50'
                    : 'grey.100',
                  '&:hover': inMonth
                    ? { bgcolor: isTodayDate ? 'primary.100' : 'grey.200' }
                    : {},
                  'transition': 'background-color 0.15s',
                }}
                elevation={0}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isTodayDate ? 700 : 500,
                    fontSize: '0.875rem',
                    color: inMonth ? (isTodayDate ? 'primary.main' : 'grey.700') : 'grey.500',
                    mb: 0.5,
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, overflow: 'hidden' }}>
                  {dayEvents.slice(0, 3).map(ev => (
                    <Chip
                      key={ev.id}
                      label={ev.name}
                      size="small"
                      sx={{
                        'height': 'auto',
                        'py': 0.25,
                        'fontSize': '0.688rem',
                        'backgroundColor': 'white',
                        'borderLeft': '3px solid',
                        'borderLeftColor': eventColor(ev.color),
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
                  ))}
                  {dayEvents.length > 3 && (
                    <Typography variant="caption" sx={{ fontSize: '0.688rem', color: 'grey.600' }}>
                      +
                      {dayEvents.length - 3}
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
