'use client';

import { Box, IconButton, Typography } from '@mui/material';
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
import { useEffect, useState } from 'react';
import { Popover } from '@/components/common/Popover';

const POPOVER_WIDTH = 280;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayPickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentDate: Date;
  onSelect: (date: Date) => void;
  locale: string;
};

export function DayPickerPopover({
  open,
  anchorEl,
  onClose,
  currentDate,
  onSelect,
}: DayPickerPopoverProps) {
  const [displayedMonth, setDisplayedMonth] = useState(() => startOfMonth(currentDate));

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
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
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
