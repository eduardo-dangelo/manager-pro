'use client';

import { Box, Typography } from '@mui/material';
import { Popover } from '@/components/common/Popover';

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

export function YearPickerPopover({
  open,
  anchorEl,
  onClose,
  currentYear,
  onSelect,
}: YearPickerPopoverProps) {
  const baseYear = currentYear - BASE_YEAR_OFFSET;
  const years = Array.from({ length: YEAR_RANGE }, (_, i) => baseYear + i);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      showArrow={false}
      minWidth="auto"
      maxWidth="auto"
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
