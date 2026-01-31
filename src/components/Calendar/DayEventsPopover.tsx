'use client';

import type { CalendarEvent } from './types';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Popover, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CalendarEvent as CalendarEventItem } from './CalendarEvent';

const POPOVER_WIDTH = 230;
const POPOVER_GAP = 8;

type DayEventsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onCreateEvent: (date: Date) => void;
  locale?: string;
};

function getAnchorOrigin(anchorEl: HTMLElement | null): { vertical: 'top' | 'center' | 'bottom'; horizontal: 'left' | 'center' | 'right' } {
  if (!anchorEl) {
    return { vertical: 'center', horizontal: 'left' };
  }
  const rect = anchorEl.getBoundingClientRect();
  const spaceOnRight = typeof window !== 'undefined' ? window.innerWidth - rect.right : POPOVER_WIDTH + POPOVER_GAP;
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

export function DayEventsPopover({
  open,
  anchorEl,
  date,
  events,
  onClose,
  onCreateEvent,
}: DayEventsPopoverProps) {
  const t = useTranslations('Calendar');

  const anchorOrigin = useMemo(() => {
    if (!open || !anchorEl) {
      return { vertical: 'center' as const, horizontal: 'left' as const };
    }
    return getAnchorOrigin(anchorEl);
  }, [open, anchorEl]);

  const transformOrigin = useMemo(() => getTransformOrigin(anchorOrigin), [anchorOrigin]);

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
            borderRadius: 2,
            marginLeft: anchorOrigin.horizontal === 'right' ? `${POPOVER_GAP}px` : undefined,
            marginRight: anchorOrigin.horizontal === 'left' ? `${POPOVER_GAP}px` : undefined,
          },
        },
      }}
      disableRestoreFocus
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {format(date, 'EEE')}
            </Typography>
            <Typography variant="h6" component="span" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
              {format(date, 'd')}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="close"
            sx={{ mt: -0.5, mr: -0.5, position: 'absolute', right: 15, top: 15 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 240, overflow: 'auto' }}>
          {events.length === 0
            ? (
                <></>
              )
            : (
                events.map(ev => (
                  <CalendarEventItem key={ev.id} event={ev} variant="compact" />
                ))
              )}
        </Box>
        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => onCreateEvent(date)}
          sx={{ mt: 0.5, textTransform: 'none' }}
        >
          {t('new_event')}
        </Button>
      </Box>
    </Popover>
  );
}
