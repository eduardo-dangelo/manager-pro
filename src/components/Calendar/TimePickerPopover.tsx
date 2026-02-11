'use client';

import { Box, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { Popover } from '@/components/common/Popover';

const POPOVER_WIDTH = 120;
const POPOVER_MAX_HEIGHT = 200;

const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

type TimePickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: string;
  onChange: (time: string) => void;
};

export function TimePickerPopover({
  open,
  anchorEl,
  onClose,
  value,
  onChange,
}: TimePickerPopoverProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && selectedRef.current && listRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [open]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      maxHeight={POPOVER_MAX_HEIGHT}
      showArrow={false}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Box
        ref={listRef}
        sx={{
          maxHeight: POPOVER_MAX_HEIGHT,
          overflow: 'auto',
          py: 0.5,
        }}
      >
        {TIME_SLOTS.map((time) => {
          const isSelected = value === time;
          return (
            <Box
              key={time}
              component="button"
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => {
                onChange(time);
                onClose();
              }}
              sx={{
                'display': 'block',
                'width': '100%',
                'px': 1.5,
                'py': 0.75,
                'border': 'none',
                'borderRadius': 0,
                'bgcolor': isSelected ? 'action.selected' : 'transparent',
                'cursor': 'pointer',
                'textAlign': 'left',
                '&:hover': {
                  bgcolor: isSelected ? 'action.selected' : 'action.hover',
                },
              }}
              aria-selected={isSelected}
              aria-label={time}
            >
              <Typography variant="body2" component="span">
                {time}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Popover>
  );
}
