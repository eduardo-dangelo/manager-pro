'use client';

import type { CalendarEvent } from '../types';
import { Box, Paper, Typography } from '@mui/material';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarEvent as CalendarEventItem } from '../CalendarEvent';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_HEIGHT_PX = 700;
const TRANSITION_MS = 300;

type MonthViewProps = {
  currentDate: Date;
  onCurrentDateChange: (d: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  locale: string;
};

type Direction = 'next' | 'prev' | null;

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return events.filter((e) => {
    const start = format(new Date(e.start), 'yyyy-MM-dd');
    const end = format(new Date(e.end), 'yyyy-MM-dd');
    return (dateStr >= start && dateStr <= end) || start === dateStr;
  });
}

type MonthGridProps = {
  monthDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
};

function MonthGrid({ monthDate, events, onDayClick }: MonthGridProps) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const today = new Date();

  return (
    <>
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
          const inMonth = isSameMonth(day, monthDate);
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
                  <CalendarEventItem key={ev.id} event={ev} variant="chip" />
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
    </>
  );
}

export function MonthView({
  currentDate,
  onCurrentDateChange,
  events,
  onDayClick,
}: MonthViewProps) {
  const [direction, setDirection] = useState<Direction>(null);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [enableTransition, setEnableTransition] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => {
    if (isAnimating) {
      return;
    }
    setDirection('prev');
    setIsAnimating(true);
    setSlideOffset(-SLOT_HEIGHT_PX);
    setEnableTransition(false);
  }, [isAnimating]);

  const next = useCallback(() => {
    if (isAnimating) {
      return;
    }
    setDirection('next');
    setIsAnimating(true);
    setSlideOffset(0);
    setEnableTransition(false);
  }, [isAnimating]);

  useEffect(() => {
    if (!isAnimating || direction === null) {
      return;
    }
    const enable = () => setEnableTransition(true);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(enable);
    });
    return () => cancelAnimationFrame(raf);
  }, [isAnimating, direction]);

  /* Trigger slide to target offset after transition is enabled; intentional setState in effect */
  /* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
  useEffect(() => {
    if (!isAnimating || direction === null || !enableTransition) {
      return;
    }
    if (direction === 'next') {
      setSlideOffset(-SLOT_HEIGHT_PX);
    } else {
      setSlideOffset(0);
    }
  }, [isAnimating, direction, enableTransition]);
  /* eslint-enable react-hooks-extra/no-direct-set-state-in-use-effect */

  const handleTransitionEnd = useCallback(() => {
    if (!isAnimating || direction === null) {
      return;
    }
    setEnableTransition(false);
    if (direction === 'next') {
      onCurrentDateChange(addMonths(currentDate, 1));
    } else {
      onCurrentDateChange(addMonths(currentDate, -1));
    }
    setDirection(null);
    setIsAnimating(false);
    setSlideOffset(0);
  }, [isAnimating, direction, currentDate, onCurrentDateChange]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      return;
    }
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating) {
        return;
      }
      if (e.deltaY > 0) {
        e.preventDefault();
        next();
      } else if (e.deltaY < 0) {
        e.preventDefault();
        prev();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isAnimating, prev, next]);

  const showTwoSlots = isAnimating && direction !== null;
  const trackHeight = showTwoSlots ? SLOT_HEIGHT_PX * 2 : SLOT_HEIGHT_PX;

  return (
    <Box>
      <Box
        ref={viewportRef}
        sx={{
          height: SLOT_HEIGHT_PX,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: trackHeight,
            transform: `translateY(${slideOffset}px)`,
            transition: enableTransition ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {showTwoSlots
            ? direction === 'next'
              ? (
                  <>
                    <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                      <MonthGrid monthDate={currentDate} events={events} onDayClick={onDayClick} />
                    </Box>
                    <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                      <MonthGrid monthDate={addMonths(currentDate, 1)} events={events} onDayClick={onDayClick} />
                    </Box>
                  </>
                )
              : (
                  <>
                    <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                      <MonthGrid monthDate={addMonths(currentDate, -1)} events={events} onDayClick={onDayClick} />
                    </Box>
                    <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                      <MonthGrid monthDate={currentDate} events={events} onDayClick={onDayClick} />
                    </Box>
                  </>
                )
            : (
                <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                  <MonthGrid monthDate={currentDate} events={events} onDayClick={onDayClick} />
                </Box>
              )}
        </Box>
      </Box>
    </Box>
  );
}
