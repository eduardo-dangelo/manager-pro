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
import { useHoverSound } from '@/hooks/useHoverSound';
import { COLOR_MAP } from '../constants';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_HEIGHT_PX = 700;
const TRANSITION_MS = 300;

type MonthViewProps = {
  currentDate: Date;
  onCurrentDateChange: (d: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date, anchorEl?: HTMLElement) => void;
  onEventClick?: (event: CalendarEvent, anchorEl: HTMLElement) => void;
  locale: string;
  /** When set from parent (e.g. toolbar), triggers the same slide animation as wheel */
  slideDirection?: 'prev' | 'next' | null;
  onSlideDirectionComplete?: () => void;
  /** When set (e.g. from month picker), slides to this month with transition */
  slideToDate?: Date | null;
  onSlideToMonthComplete?: () => void;
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

function eventColor(color: string | null): string {
  if (!color) {
    return '#6b7280';
  }
  return COLOR_MAP[color] ?? color;
}

const MAX_EVENT_NAME_LENGTH = 16;

function truncateEventName(name: string, maxLen: number = MAX_EVENT_NAME_LENGTH): string {
  return name.length <= maxLen ? name : `${name.slice(0, maxLen)}…`;
}

function isAllDayEvent(start: Date, end: Date): boolean {
  return (
    start.getHours() === 0
    && start.getMinutes() === 0
    && ((end.getHours() === 23 && end.getMinutes() === 59)
      || (end.getHours() === 0 && end.getMinutes() === 0))
  );
}

function isMultiDayEvent(start: Date, end: Date): boolean {
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');
  return startStr !== endStr;
}

function eventsTouchingWeek(events: CalendarEvent[], weekDays: Date[]): CalendarEvent[] {
  if (weekDays.length === 0) {
    return [];
  }
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];
  if (first === undefined || last === undefined) {
    return [];
  }
  const weekStartStr = format(first, 'yyyy-MM-dd');
  const weekEndStr = format(last, 'yyyy-MM-dd');
  return events.filter((e) => {
    const start = format(new Date(e.start), 'yyyy-MM-dd');
    const end = format(new Date(e.end), 'yyyy-MM-dd');
    return start <= weekEndStr && end >= weekStartStr;
  });
}

function computeWeekLanes(
  events: CalendarEvent[],
  weekDays: Date[],
): { eventToLane: Map<number, number>; maxLane: number } {
  const weekEvents = eventsTouchingWeek(events, weekDays);
  weekEvents.sort((a, b) => {
    const aStart = format(new Date(a.start), 'yyyy-MM-dd');
    const bStart = format(new Date(b.start), 'yyyy-MM-dd');
    if (aStart !== bStart) {
      return aStart.localeCompare(bStart);
    }
    const aEnd = format(new Date(a.end), 'yyyy-MM-dd');
    const bEnd = format(new Date(b.end), 'yyyy-MM-dd');
    if (aEnd !== bEnd) {
      return bEnd.localeCompare(aEnd);
    }
    return a.id - b.id;
  });
  const eventToLane = new Map<number, number>();
  const laneRanges: Array<Array<{ start: string; end: string }>> = [];
  for (const ev of weekEvents) {
    const startStr = format(new Date(ev.start), 'yyyy-MM-dd');
    const endStr = format(new Date(ev.end), 'yyyy-MM-dd');
    let k = 0;
    while (k < laneRanges.length) {
      const lane = laneRanges[k];
      const conflict = lane?.some(
        r => startStr <= r.end && r.start <= endStr,
      ) ?? false;
      if (!conflict) {
        break;
      }
      k++;
    }
    if (k === laneRanges.length) {
      laneRanges.push([]);
    }
    const targetLane = laneRanges[k];
    if (targetLane) {
      targetLane.push({ start: startStr, end: endStr });
    }
    eventToLane.set(ev.id, k);
  }
  const maxLane = laneRanges.length > 0 ? laneRanges.length - 1 : -1;
  return { eventToLane, maxLane };
}

const MAX_VISIBLE_LANES = 3;

type MonthGridProps = {
  monthDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date, anchorEl?: HTMLElement) => void;
  onEventClick?: (event: CalendarEvent, anchorEl: HTMLElement) => void;
};

function MonthGrid({ monthDate, events, onDayClick, onEventClick }: MonthGridProps) {
  const { playHoverSound } = useHoverSound();
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  const today = new Date();

  const dayCells = weeks.flatMap((weekDays) => {
    const { eventToLane, maxLane } = computeWeekLanes(events, weekDays);
    return weekDays.map(day => ({ day, eventToLane, maxLane }));
  });

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
        {dayCells.map(({ day, eventToLane, maxLane }) => {
          const dayEventsEnriched = getEventsForDate(events, day)
            .map((ev) => {
              const startDate = new Date(ev.start);
              const endDate = new Date(ev.end);
              const allDay = isAllDayEvent(startDate, endDate);
              const multiDay = isMultiDayEvent(startDate, endDate);
              return {
                ev,
                startDate,
                endDate,
                allDay,
                multiDay,
              };
            });
          const dayEventsByLane = new Map<number, (typeof dayEventsEnriched)[number]>();
          for (const entry of dayEventsEnriched) {
            const lane = eventToLane.get(entry.ev.id);
            if (lane !== undefined) {
              dayEventsByLane.set(lane, entry);
            }
          }
          const inMonth = isSameMonth(day, monthDate);
          const isTodayDate = isSameDay(day, today);
          const visibleLaneCount = Math.min(maxLane + 1, MAX_VISIBLE_LANES);
          const moreCount = dayEventsEnriched.filter(
            entry => (eventToLane.get(entry.ev.id) ?? -1) >= MAX_VISIBLE_LANES,
          ).length;

          return (
            <Paper
              key={day.toISOString()}
              component="button"
              type="button"
              onClick={e => onDayClick(day, e.currentTarget as HTMLElement)}
              onMouseEnter={playHoverSound}
              sx={{
                'minHeight': 140,
                'p': 1,
                'cursor': 'pointer',
                'textAlign': 'left',
                'display': 'flex',
                'flexDirection': 'column',
                'border': '1px solid',
                'borderColor': isTodayDate ? 'primary.main' : 'divider',
                'bgcolor': 'transparent',
                '&:hover': inMonth
                  ? { bgcolor: 'action.hover' }
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
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                flex: 1,
                overflow: 'visible',
              }}
              >
                {maxLane < 0
                  ? null
                  : Array.from({ length: visibleLaneCount }, (_, laneIndex) => {
                      const entry = dayEventsByLane.get(laneIndex);
                      if (!entry) {
                        return (
                          <Box
                            key={laneIndex}
                            sx={{ minHeight: 24, width: '100%' }}
                            aria-hidden
                          />
                        );
                      }
                      const { ev, startDate, endDate, allDay, multiDay } = entry;
                      const color = eventColor(ev.color);
                      const isTimedSingleDay = !allDay && !multiDay;
                      const isWeekStart = day.getDay() === 0;
                      const isFirstDayOfEvent = format(day, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
                      const showTitle = !multiDay || isFirstDayOfEvent || isWeekStart;
                      const isLastDayOfEvent = format(day, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
                      return (
                        <Box
                          key={ev.id}
                          component="span"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(ev, e.currentTarget as HTMLElement);
                          }}
                          sx={{
                            'display': 'inline-block',
                            'cursor': onEventClick ? 'pointer' : 'default',
                            'alignSelf': 'flex-start',
                            '&:hover': onEventClick ? { opacity: 0.9 } : {},
                            'width': '100%',
                          }}
                        >
                          {isTimedSingleDay
                            ? (
                                <Box sx={{
                                  position: 'relative',
                                  width: '100%',
                                  height: '20px',
                                }}
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      width: '100%',
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        bgcolor: color,
                                        mr: 0.5,
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        mr: 0.5,
                                        color: 'text.secondary',
                                        flexShrink: 0,
                                        fontSize: '0.688rem',
                                      }}
                                    >
                                      {format(startDate, 'HH:mm')}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      noWrap
                                      sx={{
                                        minWidth: 0,
                                        fontSize: '0.688rem',
                                      }}
                                    >
                                      {truncateEventName(ev.name)}
                                    </Typography>
                                  </Box>
                                </Box>
                              )
                            : (
                                <Box
                                  sx={{
                                    width: `calc(100% + ${!isLastDayOfEvent ? 28 : 8}px)`,
                                    marginLeft: !showTitle ? -1.15 : 0,
                                    borderRadius: showTitle || isLastDayOfEvent ? 1 : undefined,
                                    bgcolor: color,
                                    px: 0.5,
                                    py: 0.25,
                                    display: 'flex',
                                    alignItems: 'center',
                                    minHeight: 24,
                                  }}
                                >
                                  {showTitle && (
                                    <Typography
                                      variant="caption"
                                      noWrap
                                      sx={{
                                        color: 'common.white',
                                        fontWeight: 500,
                                        fontSize: '0.688rem',
                                      }}
                                    >
                                      {truncateEventName(ev.name)}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                        </Box>
                      );
                    })}
                {moreCount > 0 && (
                  <Typography variant="caption" sx={{ fontSize: '0.688rem', color: 'grey.600' }}>
                    +
                    {moreCount}
                    {' '}
                    more
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
  onEventClick,
  slideDirection: slideDirectionProp,
  onSlideDirectionComplete,
  slideToDate: slideToDateProp,
  onSlideToMonthComplete,
}: MonthViewProps) {
  const [direction, setDirection] = useState<Direction>(null);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetMonthForSlide, setTargetMonthForSlide] = useState<Date | null>(null);
  const [enableTransition, setEnableTransition] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentMonthStart = startOfMonth(currentDate);

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
    if (targetMonthForSlide !== null) {
      onCurrentDateChange(targetMonthForSlide);
      onSlideToMonthComplete?.();
      setTargetMonthForSlide(null);
    } else {
      if (direction === 'next') {
        onCurrentDateChange(addMonths(currentDate, 1));
      } else {
        onCurrentDateChange(addMonths(currentDate, -1));
      }
      onSlideDirectionComplete?.();
    }
    setDirection(null);
    setIsAnimating(false);
    setSlideOffset(0);
  }, [isAnimating, direction, currentDate, onCurrentDateChange, onSlideDirectionComplete, onSlideToMonthComplete, targetMonthForSlide]);

  useEffect(() => {
    if (slideDirectionProp === 'prev') {
      prev();
    } else if (slideDirectionProp === 'next') {
      next();
    }
  }, [slideDirectionProp, prev, next]);

  useEffect(() => {
    if (slideToDateProp == null || isAnimating) {
      return;
    }
    const targetMonthStart = startOfMonth(slideToDateProp);
    const currentMonthTime = currentMonthStart.getTime();
    const targetMonthTime = targetMonthStart.getTime();
    if (currentMonthTime === targetMonthTime) {
      return;
    }
    setTargetMonthForSlide(targetMonthStart);
    setDirection(targetMonthTime > currentMonthTime ? 'next' : 'prev');
    setIsAnimating(true);
    setSlideOffset(targetMonthTime > currentMonthTime ? 0 : -SLOT_HEIGHT_PX);
    setEnableTransition(false);
  }, [slideToDateProp, currentMonthStart.getTime(), isAnimating]);

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
                      <MonthGrid monthDate={currentDate} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />
                    </Box>
                    <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                      <MonthGrid monthDate={targetMonthForSlide ?? addMonths(currentDate, 1)} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />
                    </Box>
                  </>
                )
              : (
                  <>
                    <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                      <MonthGrid monthDate={targetMonthForSlide ?? addMonths(currentDate, -1)} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />
                    </Box>
                    <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                      <MonthGrid monthDate={currentDate} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />
                    </Box>
                  </>
                )
            : (
                <Box sx={{ height: SLOT_HEIGHT_PX, p: 0, overflow: 'hidden' }}>
                  <MonthGrid monthDate={currentDate} events={events} onDayClick={onDayClick} onEventClick={onEventClick} />
                </Box>
              )}
        </Box>
      </Box>
    </Box>
  );
}
