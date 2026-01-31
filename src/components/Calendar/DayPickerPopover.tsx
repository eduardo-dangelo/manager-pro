'use client';

import { Box, IconButton, Popover, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
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
  subMonths,
} from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

const POPOVER_WIDTH = 280;
const POPOVER_GAP = 8;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayPickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentDate: Date;
  onSelect: (date: Date) => void;
  locale: string;
};

function getAnchorOrigin(anchorEl: HTMLElement | null): { vertical: 'top' | 'center' | 'bottom'; horizontal: 'left' | 'center' | 'right' } {
  if (!anchorEl) {
    return { vertical: 'center', horizontal: 'left' };
  }
  if (typeof window === 'undefined') {
    return { vertical: 'center', horizontal: 'right' };
  }
  const rect = anchorEl.getBoundingClientRect();
  const spaceOnRight = window.innerWidth - rect.right;
  const spaceOnLeft = rect.left;
  const openToRight = spaceOnRight >= POPOVER_WIDTH + POPOVER_GAP || spaceOnRight >= spaceOnLeft;
  return {
    vertical: 'center',
    horizontal: openToRight ? 'right' : 'left',
  };
}

function getTransformOrigin(anchorOrigin: { vertical: string; horizontal: string }): { vertical: 'top' | 'center' | 'bottom'; horizontal: 'left' | 'center' | 'right' } {
  return {
    vertical: 'center',
    horizontal: anchorOrigin.horizontal === 'right' ? 'left' : 'right',
  };
}

export function DayPickerPopover({
  open,
  anchorEl,
  onClose,
  currentDate,
  onSelect,
}: DayPickerPopoverProps) {
  const [displayedMonth, setDisplayedMonth] = useState(() => startOfMonth(currentDate));

  const anchorOrigin = useMemo(() => {
    if (!open || !anchorEl) {
      return { vertical: 'center' as const, horizontal: 'left' as const };
    }
    return getAnchorOrigin(anchorEl);
  }, [open, anchorEl]);

  const transformOrigin = useMemo(() => getTransformOrigin(anchorOrigin), [anchorOrigin]);

  const monthStart = startOfMonth(displayedMonth);
  const monthEnd = endOfMonth(displayedMonth);
  const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const today = new Date();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayedMonth((m) => subMonths(m, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayedMonth((m) => addMonths(m, 1));
  };

  const handleDayClick = (day: Date) => {
    onSelect(day);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setDisplayedMonth(startOfMonth(currentDate));
    }
  }, [open, currentDate]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: {
            minWidth: POPOVER_WIDTH,
            maxWidth: POPOVER_WIDTH,
            overflow: 'visible',
            borderRadius: 2,
            marginLeft: anchorOrigin.horizontal === 'right' ? `${POPOVER_GAP}px` : undefined,
            marginRight: anchorOrigin.horizontal === 'left' ? `${POPOVER_GAP}px` : undefined,
          },
        },
      }}
      disableRestoreFocus
    >
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <IconButton size="small" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft fontSize="small" />
          </IconButton>
          <Typography variant="subtitle2" fontWeight={600}>
            {format(displayedMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton size="small" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
          {DAY_NAMES.map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'text.secondary',
                py: 0.5,
              }}
            >
              {day}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {days.map((day) => {
            const inMonth = isSameMonth(day, displayedMonth);
            const isTodayDate = isSameDay(day, today);
            const isCurrent = isSameDay(day, currentDate);
            return (
              <Box
                key={day.toISOString()}
                component="button"
                type="button"
                onClick={() => handleDayClick(day)}
                sx={{
                  'py': 0.75,
                  'px': 0.25,
                  'border': 'none',
                  'borderRadius': 1,
                  'bgcolor': 'transparent',
                  'cursor': 'pointer',
                  'textAlign': 'center',
                  'minWidth': 32,
                  '&:hover': inMonth ? { bgcolor: 'action.hover' } : {},
                  ...(isCurrent ? { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } } : {}),
                  ...(!inMonth ? { color: 'text.disabled' } : {}),
                  ...(isTodayDate && !isCurrent ? { border: '1px solid', borderColor: 'primary.main', color: 'primary.main' } : {}),
                }}
                aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                aria-current={isCurrent ? 'date' : undefined}
              >
                <Typography variant="body2" fontWeight={isCurrent ? 600 : 400} fontSize="0.875rem">
                  {format(day, 'd')}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Popover>
  );
}
