'use client';

import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Popover } from '@/components/common/Popover';

type MonthPickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentDate: Date;
  onSelect: (monthIndex: number) => void;
  locale: string;
};

export function MonthPickerPopover({
  open,
  anchorEl,
  onClose,
  currentDate,
  onSelect,
}: MonthPickerPopoverProps) {
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
      showArrow={false}
      minWidth="auto"
      maxWidth="auto"
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
