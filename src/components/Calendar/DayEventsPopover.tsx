'use client';

import type { CalendarEvent } from './types';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Popover } from '@/components/common/Popover';
import { CalendarEvent as CalendarEventItem } from './CalendarEvent';

const POPOVER_WIDTH = 230;

type DayEventsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onCreateEvent: (date: Date) => void;
  onDayTitleClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent, anchorEl: HTMLElement) => void;
  locale?: string;
};

export function DayEventsPopover({
  open,
  anchorEl,
  date,
  events,
  onClose,
  onCreateEvent,
  onDayTitleClick,
  onEventClick,
}: DayEventsPopoverProps) {
  const t = useTranslations('Calendar');

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box
            component={onDayTitleClick ? 'button' : 'div'}
            type={onDayTitleClick ? 'button' : undefined}
            onClick={onDayTitleClick ? () => onDayTitleClick(date) : undefined}
            aria-label={onDayTitleClick ? `View ${format(date, 'EEEE, MMMM d, yyyy')}` : undefined}
            sx={{
              textAlign: 'center',
              flex: 1,
              ...(onDayTitleClick
                ? {
                    'border': 'none',
                    'background': 'none',
                    'padding': 0,
                    'cursor': 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }
                : {}),
            }}
          >
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
                  <Box
                    key={ev.id}
                    component="button"
                    type="button"
                    onClick={e => onEventClick?.(ev, e.currentTarget)}
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
                    <CalendarEventItem event={ev} variant="compact" />
                  </Box>
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
