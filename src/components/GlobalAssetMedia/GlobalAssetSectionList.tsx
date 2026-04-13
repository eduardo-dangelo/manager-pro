'use client';

import type { AssetMediaItem } from './types';
import { Box, Typography } from '@mui/material';
import { GlobalAssetSectionCard } from './GlobalAssetSectionCard';

type GlobalAssetSectionListProps = {
  locale: string;
  assets: AssetMediaItem[];
  emptyMessage: string;
  renderSectionContent: (asset: AssetMediaItem) => React.ReactNode;
};

export function GlobalAssetSectionList({
  locale,
  assets,
  emptyMessage,
  renderSectionContent,
}: GlobalAssetSectionListProps) {
  if (assets.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {assets.map(asset => (
        <GlobalAssetSectionCard key={asset.id} asset={asset} locale={locale}>
          {renderSectionContent(asset)}
        </GlobalAssetSectionCard>
      ))}
    </Box>
  );
}
