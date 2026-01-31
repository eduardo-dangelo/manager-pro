'use client';

import type { CalendarEvent } from '../types';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useHoverSound } from '@/hooks/useHoverSound';
import { COLOR_MAP } from '../constants';

type YearBlockProps = {
  year: number;
  events: CalendarEvent[];
  onDayClick: (date: Date, anchorEl?: HTMLElement) => void;
  onMonthClick?: (date: Date) => void;
  locale: string;
  showYearLabel?: boolean;
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

export function YearBlock({ year, events, onDayClick, onMonthClick, showYearLabel = true }: YearBlockProps) {
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  const today = new Date();

  return (
    <Box sx={{ p: 0.5 }}>
      {showYearLabel && (
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', mb: 1.5 }}>
          {year}
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {months.map((month) => {
          const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
          const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
          const days = eachDayOfInterval({ start, end });
          return (
            <Box key={month.toISOString()} sx={{ p: 0.5 }}>
              <Typography
                variant="subtitle2"
                component={onMonthClick ? 'button' : 'p'}
                type={onMonthClick ? 'button' : undefined}
                aria-label={onMonthClick ? `Go to ${format(month, 'MMMM yyyy')}` : undefined}
                onClick={onMonthClick ? () => onMonthClick(month) : undefined}
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: '0.875rem',
                  ...(onMonthClick
                    ? {
                        'border': 'none',
                        'background': 'none',
                        'padding': 0,
                        'cursor': 'pointer',
                        'textAlign': 'left',
                        'color': 'text.primary',
                        '&:hover': { color: 'primary.dark' },
                      }
                    : {}),
                }}
              >
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
                  const inMonth = isSameMonth(day, month);
                  if (!inMonth) {
                    return <Box key={day.toISOString()} sx={{ minWidth: 24, height: 28 }} />;
                  }
                  const isToday = isSameDay(day, today);
                  const dayEvents = getEventsForDate(events, day);
                  const hasEvents = dayEvents.length > 0;
                  const showBg = isToday;
                  const dotsToShow = dayEvents.slice(0, 3);
                  return (
                    <Paper
                      key={day.toISOString()}
                      component="button"
                      type="button"
                      onClick={e => onDayClick(day, e.currentTarget as HTMLElement)}
                      onMouseEnter={playHoverSound}
                      aria-label={hasEvents ? `${format(day, 'd')}, ${dayEvents.length} events` : format(day, 'd')}
                      sx={{
                        'minWidth': 24,
                        'height': 28,
                        'p': 0,
                        'cursor': 'pointer',
                        'fontSize': '0.7rem',
                        'display': 'flex',
                        'flexDirection': 'column',
                        'alignItems': 'center',
                        'justifyContent': 'center',
                        'border': 'none',
                        'bgcolor': showBg ? 'action.selected' : 'transparent',
                        'color': showBg ? (theme.palette.mode === 'dark' ? 'white' : 'black') : 'text.secondary',
                        '&:hover': { bgcolor: showBg ? 'action.hover' : 'action.selected' },
                      }}
                      elevation={0}
                    >
                      {format(day, 'd')}
                      {hasEvents && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: 0.2,
                            mt: 0.25,
                          }}
                        >
                          {dotsToShow.map(ev => (
                            <Box
                              key={ev.id}
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: eventColor(ev.color),
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
