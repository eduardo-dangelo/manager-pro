'use client';

import type { Asset } from '@/components/Assets/utils';
import { pluralizeType } from '@/components/Assets/utils';
import { AssetCard, type CardSize } from '@/components/Assets/AssetCard';
import { Box } from '@mui/material';
import Link from 'next/link';
import { TransitionGroup } from 'react-transition-group';
import { useHoverSound } from '@/hooks/useHoverSound';

type AssetFolderViewProps = {
  assets: Asset[];
  locale: string;
  cardSize: CardSize;
  onAssetDeleted?: (assetId: number) => void;
};

export function AssetFolderView({ assets, locale, cardSize, onAssetDeleted }: AssetFolderViewProps) {
  const getGridSizes = () => {
    switch (cardSize) {
      case 'small':
        return { xs: '33.33%', sm: '33.33%', md: '25%', lg: '20%', xl: '16.66%' };
      case 'large':
        return { xs: '100%', sm: '100%', md: '50%', lg: '33.33%', xl: '25%' };
      case 'medium':
      default:
        return { xs: '50%', sm: '50%', md: '33.33%', lg: '25%', xl: '20%' };
    }
  };

  const { playHoverSound } = useHoverSound();

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
      <TransitionGroup component={null}>
        {assets.map(asset => (
          <Box
            key={asset.id}
            component={Link}
            href={`/${locale}/assets/${pluralizeType(asset.type)}/${asset.id}`}
            onMouseEnter={playHoverSound}
            sx={{
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'block',
              perspective: '1000px',
              padding: 0,
              width: getGridSizes(),
              transition: 'all 0.3s ease',
              '&:hover .folder-body': {
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              },
              p: 1,
            }}
          >
            <AssetCard
              asset={asset}
              locale={locale}
              cardSize={cardSize}
              onAssetDeleted={onAssetDeleted}
            />
          </Box>
        ))}
      </TransitionGroup>
    </Box>
  );
}
