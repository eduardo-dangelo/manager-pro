'use client';

import type { AssetOption } from './CreateEventForm';
import type { CalendarEvent } from './types';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { CreateEventForm } from './CreateEventForm';

type CreateEventModalProps = {
  open: boolean;
  onClose: () => void;
  initialDate?: Date;
  assetId?: number;
  assets?: AssetOption[];
  locale: string;
  onCreateSuccess?: (event: CalendarEvent) => void;
};

export function CreateEventModal({
  open,
  onClose,
  initialDate,
  assetId,
  assets,
  locale,
  onCreateSuccess,
}: CreateEventModalProps) {
  const t = useTranslations('Calendar');
  const handleSuccess = (event: CalendarEvent) => {
    onCreateSuccess?.(event);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {t('new_event')}
          </Typography>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <CreateEventForm
          open={open}
          initialDate={initialDate}
          assetId={assetId}
          assets={assets}
          locale={locale}
          onSuccess={handleSuccess}
          onCancel={onClose}
          variant="modal"
        />
      </DialogContent>
    </Dialog>
  );
}
