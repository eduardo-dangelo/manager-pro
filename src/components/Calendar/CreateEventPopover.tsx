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
  /** @deprecated Use onSuccess with mode="create" instead. */
  onCreateSuccess?: (event: CalendarEvent) => void;
  mode?: 'create' | 'edit';
  event?: CalendarEvent | null;
  onSuccess?: (event: CalendarEvent) => void;
  onDeleteSuccess?: (eventId: number) => void;
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
  mode = 'create',
  event,
  onSuccess,
  onDeleteSuccess,
}: CreateEventPopoverProps) {
  const handleSuccess = (savedEvent: CalendarEvent) => {
    onSuccess?.(savedEvent);
    onCreateSuccess?.(savedEvent);
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
          onDeleteSuccess={onDeleteSuccess}
          variant="popover"
          mode={mode}
          event={event}
        />
      </Box>
    </Popover>
  );
}
