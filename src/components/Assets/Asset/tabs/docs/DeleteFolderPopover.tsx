'use client';

import type { useTranslations } from 'next-intl';
import { Box, Button, Typography } from '@mui/material';
import { Popover } from '@/components/common/Popover';
import type { FolderItem } from '../types';

type DeleteFolderPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  item: FolderItem | null; // eslint-disable-line @typescript-eslint/no-unused-vars -- used for future enhancements
  onClose: () => void;
  onConfirm: () => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
};

export function DeleteFolderPopover({ open, anchorEl, onClose, onConfirm, t }: DeleteFolderPopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={240}
      maxWidth={280}
      showArrow={true}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('folder_delete_confirm')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" variant="outlined" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button size="small" variant="contained" color="error" onClick={onConfirm}>
            {t('delete')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
