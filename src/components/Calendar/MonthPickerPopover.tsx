'use client';

import { Box, Popover, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useMemo } from 'react';

const POPOVER_WIDTH = 'auto';
const POPOVER_GAP = 8;

type MonthPickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentDate: Date;
  onSelect: (monthIndex: number) => void;
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

export function MonthPickerPopover({
  open,
  anchorEl,
  onClose,
  currentDate,
  onSelect,
}: MonthPickerPopoverProps) {
  const anchorOrigin = useMemo(() => {
    if (!open || !anchorEl) {
      return { vertical: 'center' as const, horizontal: 'left' as const };
    }
    return getAnchorOrigin(anchorEl);
  }, [open, anchorEl]);

  const transformOrigin = useMemo(() => getTransformOrigin(anchorOrigin), [anchorOrigin]);

  const currentMonth = currentDate.getMonth();
  const months = Array.from({ length: 12 }, (_, i) => ({
    index: i,
    label: format(new Date(2000, i, 1), 'MMMM'),
  }));

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
      <Box sx={{ py: 0.5, display: 'flex', flexDirection: 'column' }}>
        {months.map(({ index, label }) => (
          <Box
            key={index}
            component="button"
            type="button"
            onClick={() => onSelect(index)}
            sx={{
              'py': 1,
              'px': 2,
              'border': 'none',
              'borderRadius': 0,
              'bgcolor': 'transparent',
              'cursor': 'pointer',
              'textAlign': 'left',
              'width': '100%',
              '&:hover': { bgcolor: 'action.hover' },
              ...(index === currentMonth ? { 'bgcolor': 'primary.main', 'color': 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } } : {}),
            }}
            aria-label={`Select ${label}`}
            aria-current={index === currentMonth ? 'true' : undefined}
          >
            <Typography variant="body2" fontWeight={index === currentMonth ? 600 : 400}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Popover>
  );
}
