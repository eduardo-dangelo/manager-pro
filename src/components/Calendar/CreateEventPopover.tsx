'use client';

import type { AssetOption } from './CreateEventForm';
import type { CalendarEvent } from './types';
import { Popover } from '@mui/material';
import { useMemo } from 'react';
import { CreateEventForm } from './CreateEventForm';

const POPOVER_WIDTH = 360;
const POPOVER_MAX_HEIGHT = 580;
const POPOVER_GAP = 8;

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
  const anchorOrigin = useMemo(() => {
    if (!open || !anchorEl) {
      return { vertical: 'center' as const, horizontal: 'left' as const };
    }
    return getAnchorOrigin(anchorEl);
  }, [open, anchorEl]);

  const transformOrigin = useMemo(() => getTransformOrigin(anchorOrigin), [anchorOrigin]);

  const handleSuccess = (event: CalendarEvent) => {
    onCreateSuccess?.(event);
    onClose();
  };

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
            maxHeight: POPOVER_MAX_HEIGHT,
            overflow: 'auto',
            borderRadius: 2,
            marginLeft: anchorOrigin.horizontal === 'right' ? `${POPOVER_GAP}px` : undefined,
            marginRight: anchorOrigin.horizontal === 'left' ? `${POPOVER_GAP}px` : undefined,
          },
        },
      }}
      disableRestoreFocus
    >
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
    </Popover>
  );
}
