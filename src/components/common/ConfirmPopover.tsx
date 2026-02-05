'use client';

import type { ButtonProps } from '@mui/material';
import { Box, Button, Typography } from '@mui/material';
import { Popover } from './Popover';

export type ConfirmPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ButtonProps['color'];
  /** When true, confirm button shows loading and is disabled. */
  loading?: boolean;
};

export function ConfirmPopover({
  open,
  anchorEl,
  onClose,
  onConfirm,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  loading = false,
}: ConfirmPopoverProps) {
  const handleConfirm = () => {
    onConfirm();
    // Parent is responsible for closing (e.g. after async delete succeeds)
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={280}
      maxWidth={320}
      showArrow
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ textTransform: 'capitalize' }}
          >
            {cancelLabel}
          </Button>
          <Button
            size="small"
            color={confirmColor}
            variant="contained"
            onClick={handleConfirm}
            disabled={loading}
            sx={{ textTransform: 'capitalize' }}
          >
            {confirmLabel}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

ConfirmPopover.displayName = 'ConfirmPopover';
