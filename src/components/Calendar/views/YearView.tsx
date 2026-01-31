'use client';

import type { CalendarEvent } from '../types';
import { Box } from '@mui/material';
import { addYears } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { YearBlock } from './YearBlock';

const SLOT_HEIGHT_PX = 700;
const TRANSITION_MS = 300;

type YearViewProps = {
  currentDate: Date;
  onCurrentDateChange: (d: Date) => void;
  events: CalendarEvent[];
  onDayClick: (date: Date, anchorEl?: HTMLElement) => void;
  onMonthClick?: (date: Date) => void;
  locale: string;
  /** When set from parent (e.g. toolbar), triggers the same slide animation as wheel */
  slideDirection?: 'prev' | 'next' | null;
  onSlideDirectionComplete?: () => void;
  /** When set (e.g. from Today button), slides to this year with transition */
  slideToYear?: number | null;
  onSlideToYearComplete?: () => void;
};

type Direction = 'next' | 'prev' | null;

export function YearView({
  currentDate,
  onCurrentDateChange,
  events,
  onDayClick,
  onMonthClick,
  locale,
  slideDirection: slideDirectionProp,
  onSlideDirectionComplete,
  slideToYear: slideToYearProp,
  onSlideToYearComplete,
}: YearViewProps) {
  const year = currentDate.getFullYear();
  const [direction, setDirection] = useState<Direction>(null);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetYearForSlide, setTargetYearForSlide] = useState<number | null>(null);

  const [enableTransition, setEnableTransition] = useState(false);

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
    if (targetYearForSlide !== null) {
      onCurrentDateChange(new Date(targetYearForSlide, 0, 1));
      onSlideToYearComplete?.();
      setTargetYearForSlide(null);
    } else {
      if (direction === 'next') {
        onCurrentDateChange(addYears(currentDate, 1));
      } else {
        onCurrentDateChange(addYears(currentDate, -1));
      }
      onSlideDirectionComplete?.();
    }
    setDirection(null);
    setIsAnimating(false);
    setSlideOffset(0);
  }, [isAnimating, direction, currentDate, onCurrentDateChange, onSlideDirectionComplete, onSlideToYearComplete, targetYearForSlide]);

  const showTwoSlots = isAnimating && direction !== null;
  const trackHeight = showTwoSlots ? SLOT_HEIGHT_PX * 2 : SLOT_HEIGHT_PX;
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slideDirectionProp === 'prev') {
      prev();
    } else if (slideDirectionProp === 'next') {
      next();
    }
  }, [slideDirectionProp, prev, next]);

  useEffect(() => {
    if (slideToYearProp == null || slideToYearProp === year || isAnimating) {
      return;
    }
    setTargetYearForSlide(slideToYearProp);
    setDirection(slideToYearProp > year ? 'next' : 'prev');
    setIsAnimating(true);
    setSlideOffset(slideToYearProp > year ? 0 : -SLOT_HEIGHT_PX);
    setEnableTransition(false);
  }, [slideToYearProp, year, isAnimating]);

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
                    <Box sx={{ height: SLOT_HEIGHT_PX }}>
                      <YearBlock year={year} events={events} onDayClick={onDayClick} onMonthClick={onMonthClick} locale={locale} showYearLabel={false} />
                    </Box>
                    <Box sx={{ height: SLOT_HEIGHT_PX }}>
                      <YearBlock year={targetYearForSlide ?? year + 1} events={events} onDayClick={onDayClick} onMonthClick={onMonthClick} locale={locale} showYearLabel={false} />
                    </Box>
                  </>
                )
              : (
                  <>
                    <Box sx={{ height: SLOT_HEIGHT_PX }}>
                      <YearBlock year={targetYearForSlide ?? year - 1} events={events} onDayClick={onDayClick} onMonthClick={onMonthClick} locale={locale} showYearLabel={false} />
                    </Box>
                    <Box sx={{ height: SLOT_HEIGHT_PX }}>
                      <YearBlock year={year} events={events} onDayClick={onDayClick} onMonthClick={onMonthClick} locale={locale} showYearLabel={false} />
                    </Box>
                  </>
                )
            : (
                <Box sx={{ height: SLOT_HEIGHT_PX }}>
                  <YearBlock year={year} events={events} onDayClick={onDayClick} onMonthClick={onMonthClick} locale={locale} showYearLabel={false} />
                </Box>
              )}
        </Box>
      </Box>
    </Box>
  );
}
