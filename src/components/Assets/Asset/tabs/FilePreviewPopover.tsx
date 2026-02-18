'use client';

import { Download as DownloadIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Popover } from '@/components/common/Popover';

export type FilePreviewItem = {
  id: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
};

type FilePreviewPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  item: FilePreviewItem | null;
  type: 'image' | 'pdf';
};

const PREVIEW_MAX_SIZE = 480;

export function FilePreviewPopover({
  open,
  anchorEl,
  onClose,
  item,
  type,
}: FilePreviewPopoverProps) {
  const t = useTranslations('Assets');

  if (!item) {
    return null;
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={type === 'image' ? PREVIEW_MAX_SIZE : 400}
      maxWidth={type === 'image' ? PREVIEW_MAX_SIZE : 600}
      maxHeight={type === 'pdf' ? 80 : 90}
      showArrow={true}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
          {item.name}
        </Typography>

        {type === 'image' && (
          <Box
            component="img"
            src={item.url}
            alt={item.name}
            sx={{
              maxWidth: PREVIEW_MAX_SIZE,
              maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 1,
              display: 'block',
            }}
          />
        )}

        {type === 'pdf' && (
          <Box
            component="iframe"
            src={item.url}
            title={item.name}
            sx={{
              width: '100%',
              minHeight: 400,
              border: 'none',
              borderRadius: 1,
            }}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            component="a"
            href={item.url}
            download={item.name}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('file_download')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
