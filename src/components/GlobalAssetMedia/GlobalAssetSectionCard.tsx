'use client';

import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import type { AssetMediaItem } from './types';
import { Asset } from '@/entities';

type GlobalAssetSectionCardProps = {
  asset: AssetMediaItem;
  locale: string;
  children: React.ReactNode;
};

export function GlobalAssetSectionCard({ asset, locale, children }: GlobalAssetSectionCardProps) {
  const href = `/${locale}/assets/${new Asset(asset).getPluralizedRoute()}/${asset.id}`;

  return (
    <Box sx={{ pb: 1 }}>
      <Typography
        component={Link}
        href={href}
        variant="h6"
        sx={{
          textDecoration: 'none',
          color: 'text.primary',
          fontWeight: 600,
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {asset.name || `#${asset.id}`}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {children}
      </Box>
    </Box>
  );
}
