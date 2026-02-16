'use client';

import type { CalendarEvent } from '../types';
import { Box, Paper, Typography } from '@mui/material';
import { format, parseISO, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import { CalendarEvent as CalendarEventItem } from '../CalendarEvent';

type ScheduleViewProps = {
  currentDate?: Date;
  onCurrentDateChange?: (_d: Date) => void;
  events: CalendarEvent[];
  onDayClick?: (date: Date, anchorEl?: HTMLElement) => void;
  onEventClick?: (event: CalendarEvent, anchorEl: HTMLElement, anchorPosition?: { x: number; y: number }) => void;
  locale?: string;
  variant?: 'full' | 'compact';
  maxEvents?: number;
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
  variant = 'full',
  maxEvents,
}: ScheduleViewProps) {
  const t = useTranslations('Calendar');
  const today = startOfDay(new Date());
  const upcomingEvents = events.filter(e => parseISO(e.start) >= today);
  const limitedEvents = maxEvents != null
    ? upcomingEvents.slice(0, maxEvents)
    : upcomingEvents;
  const grouped = groupEventsByDay(limitedEvents);
  const isCompact = variant === 'compact';

  const emptyContent = isCompact
    ? (
        <Typography variant="body2" color="text.secondary">
          {t('no_events')}
        </Typography>
      )
    : (
        <Paper sx={{ p: 4, textAlign: 'center' }} elevation={1}>
          <Typography color="text.secondary">{t('no_events')}</Typography>
        </Paper>
      );

  if (grouped.length === 0) {
    return isCompact ? <Box sx={{ py: 1 }}>{emptyContent}</Box> : emptyContent;
  }

  const noop = () => {};
  const handleDayClick = onDayClick ?? noop;

  return (
    <Box sx={{ position: 'relative' }}>
      {grouped.map(({ date, events: dayEvents }, index) => {
        const d = parseISO(date);
        const currentYear = d.getFullYear();
        const prevItem = index > 0 ? grouped[index - 1] : undefined;
        const prevYear = prevItem ? parseISO(prevItem.date).getFullYear() : null;
        const showYearHeader = !isCompact && prevYear !== null && currentYear !== prevYear;
        const isLastDay = index === grouped.length - 1;

        return (
          <Box key={date} sx={{ position: 'relative' }}>
            {showYearHeader && (
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 1,
                  pb: 0.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    flexShrink: 0,
                    width: 34,
                  }}
                >
                  <Typography fontWeight={700} sx={{ fontSize: 18 }} color="text.secondary">
                    {currentYear}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, mt: 1.3 }} />
              </Box>
            )}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'stretch',
                gap: 1,
                pb: isCompact ? 0.25 : 0.5,
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
                  onClick={e => handleDayClick(d, e.currentTarget)}
                  sx={{
                    'width': isCompact ? 28 : 34,
                    'color': 'text.primary',
                    'display': 'flex',
                    'alignItems': 'center',
                    'justifyContent': 'center',
                    'zIndex': 1,
                    'cursor': isCompact ? 'default' : 'pointer',
                    '&:hover': isCompact ? {} : { opacity: 0.8 },
                    'position': isCompact ? 'relative' : 'sticky',
                    'top': isCompact ? undefined : 100,
                    'backgroundColor': 'background.default',
                  }}
                >
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: isCompact ? 20 : 30 }}>
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
                  onClick={e => handleDayClick(d, e.currentTarget)}
                  sx={{
                    'width': '100%',
                    'p': 0,
                    'mb': 0.5,
                    'border': 'none',
                    'bgcolor': 'transparent',
                    'cursor': isCompact ? 'default' : 'pointer',
                    'textAlign': 'left',
                    '&:hover': isCompact ? {} : { opacity: 0.8 },
                    'mt': isCompact ? 0.5 : 1.3,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} sx={isCompact ? { fontSize: '0.75rem' } : undefined}>
                    {format(d, 'MMMM yyyy')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: isCompact ? 0.5 : 1, mt: isCompact ? 0.5 : 1, mb: isCompact ? 0.5 : 2 }}>
                  {dayEvents.map(ev => (
                    <Box
                      key={ev.id}
                      component="button"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(ev, e.currentTarget, { x: e.clientX, y: e.clientY });
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
                      <CalendarEventItem event={ev} variant={isCompact ? 'compact' : 'inline'} showEndTime={!isCompact} />
                    </Box>
                  ))}
                </Box>

              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
