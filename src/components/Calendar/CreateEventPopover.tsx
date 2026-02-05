'use client';

import type { AssetOption } from './CreateEventForm';
import type { CalendarEvent } from './types';
import { Box } from '@mui/material';
import { Popover } from '@/components/common/Popover';
import { CreateEventForm } from './CreateEventForm';

const POPOVER_WIDTH = 360;
const POPOVER_MAX_HEIGHT = 580;

type CreateEventPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  initialDate?: Date;
  assetId?: number;
  assets?: AssetOption[];
  locale: string;
  onCreateSuccess?: (event: CalendarEvent) => void;
};

export function CreateEventPopover({
  open,
  anchorEl,
  onClose,
  initialDate,
  assetId,
  assets,
  locale,
  onCreateSuccess,
}: CreateEventPopoverProps) {
  const handleSuccess = (event: CalendarEvent) => {
    onCreateSuccess?.(event);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      maxHeight={POPOVER_MAX_HEIGHT}
    >
      <Box sx={{ maxHeight: POPOVER_MAX_HEIGHT, overflow: 'auto' }}>
        <CreateEventForm
        open={open}
        initialDate={initialDate}
        assetId={assetId}
        assets={assets}
        locale={locale}
        onSuccess={handleSuccess}
        onCancel={onClose}
        variant="popover"
        />
      </Box>
    </Popover>
  );
}
