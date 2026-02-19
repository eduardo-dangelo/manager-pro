'use client';

import type { FilePreviewItem } from '@/components/Assets/Asset/tabs/FilePreviewPopover';
import type { FileItem } from '@/components/Assets/Asset/tabs/types';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { normalizeGalleryMetadata } from '@/components/Assets/Asset/tabs/types';
import { Card as CommonCard } from '@/components/common/Card';

type Asset = {
  id: number;
  name?: string | null;
  type?: string | null;
  tabs?: string[];
  metadata?: Record<string, unknown>;
};

type GalleryCardProps = {
  asset: Asset;
  locale: string;
  onNavigateToTab: (tabName: string) => void;
  onOpenFilePreview?: (file: FilePreviewItem) => void;
};

const MAX_THUMBNAILS = 6;

export function GalleryCard({ asset, onNavigateToTab, onOpenFilePreview }: GalleryCardProps) {
  const t = useTranslations('Assets');

  const files = useMemo(() => {
    const { files } = normalizeGalleryMetadata(asset.metadata?.gallery);
    return files.slice(0, MAX_THUMBNAILS);
  }, [asset.metadata?.gallery]);

  if (files.length === 0) {
    return null;
  }

  return (
    <CommonCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box
        component="button"
        type="button"
        onClick={() => onNavigateToTab('gallery')}
        sx={{
          'display': 'flex',
          'alignItems': 'center',
          'p': 2,
          'pb': 1,
          'border': 'none',
          'bgcolor': 'transparent',
          'cursor': 'pointer',
          'textAlign': 'left',
          '&:hover': { opacity: 0.8 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          {t('tabs_gallery')}
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          px: 2,
          pb: 2,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
        }}
      >
        {files.map((file: FileItem) => (
          <Box
            key={file.id}
            component="button"
            type="button"
            onClick={() => {
              if (onOpenFilePreview) {
                onOpenFilePreview(file);
              } else {
                onNavigateToTab('gallery');
              }
            }}
            sx={{
              'aspectRatio': '1',
              'borderRadius': 1,
              'overflow': 'hidden',
              'cursor': 'pointer',
              'border': 'none',
              'p': 0,
              'bgcolor': 'transparent',
              '&:hover': { opacity: 0.9 },
            }}
          >
            <Box
              component="img"
              src={file.url}
              alt={file.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        ))}
      </Box>
    </CommonCard>
  );
}
