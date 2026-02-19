'use client';

import type { useTranslations } from 'next-intl';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import type { FilePreviewItem } from '../FilePreviewPopover';

type DocsPreviewDialogProps = {
  open: boolean;
  item: FilePreviewItem | null;
  onClose: () => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
};

export function DocsPreviewDialog({ open, item, onClose, t }: DocsPreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh', bgcolor: 'background.paper' },
      }}
    >
      {item && (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
              {item.name}
            </Typography>
            <IconButton size="small" onClick={onClose} aria-label={t('cancel')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <DialogContent sx={{ p: 0, minHeight: 400 }}>
            <Box
              component="iframe"
              src={item.url}
              title={item.name}
              sx={{ width: '100%', minHeight: 600, border: 'none', borderRadius: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              component="a"
              href={item.url}
              download={item.name}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: 'none' }}
            >
              {t('file_download')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
