'use client';

import { Box, Popover, Typography } from '@mui/material';
import { useMemo } from 'react';

const POPOVER_WIDTH = 'auto';
const POPOVER_GAP = 8;
const YEAR_RANGE = 12;
const BASE_YEAR_OFFSET = 6;

type YearPickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentYear: number;
  onSelect: (year: number) => void;
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

export function YearPickerPopover({
  open,
  anchorEl,
  onClose,
  currentYear,
  onSelect,
}: YearPickerPopoverProps) {
  const anchorOrigin = useMemo(() => {
    if (!open || !anchorEl) {
      return { vertical: 'center' as const, horizontal: 'left' as const };
    }
    return getAnchorOrigin(anchorEl);
  }, [open, anchorEl]);

  const transformOrigin = useMemo(() => getTransformOrigin(anchorOrigin), [anchorOrigin]);

  const baseYear = currentYear - BASE_YEAR_OFFSET;
  const years = Array.from({ length: YEAR_RANGE }, (_, i) => baseYear + i);

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
        {years.map(year => (
          <Box
            key={year}
            component="button"
            type="button"
            onClick={() => onSelect(year)}
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
              ...(year === currentYear ? { 'bgcolor': 'primary.main', 'color': 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } } : {}),
            }}
            aria-label={`Select year ${year}`}
            aria-current={year === currentYear ? 'true' : undefined}
          >
            <Typography variant="body2" fontWeight={year === currentYear ? 600 : 400}>
              {year}
            </Typography>
          </Box>
        ))}
      </Box>
    </Popover>
  );
}
