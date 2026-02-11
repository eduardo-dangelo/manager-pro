'use client';

import { Add as AddIcon, Folder as FolderIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AssetsTopBar } from '@/components/Assets/AssetsTopBar';
import { AssetsList } from '@/components/Assets/Views/AssetsList';

type Asset = {
  id: number;
  name: string | null;
  description: string | null;
  color: string | null;
  status: string | null;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  registrationNumber?: string | null;
  metadata?: {
    specs?: {
      registration?: string;
    };
  } | null;
};

type ViewMode = 'folder' | 'list';
type CardSize = 'small' | 'medium' | 'large';
type SortBy = 'dateCreated' | 'dateModified' | 'name' | 'type' | 'status';

type AssetsPageClientProps = {
  assets: Asset[];
  locale: string;
  assetType?: string;
  userPreferences?: {
    assetsViewMode: ViewMode;
    assetsCardSize: CardSize;
    assetsSortBy: SortBy;
  };
};

export function AssetsPageClient({ assets, locale, assetType, userPreferences }: AssetsPageClientProps) {
  const t = useTranslations('Assets');
  const [assetsList, setAssetsList] = useState<Asset[]>(assets);

  // State for view controls
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(userPreferences?.assetsViewMode || 'folder');
  const [cardSize, setCardSize] = useState<CardSize>(userPreferences?.assetsCardSize || 'medium');
  const [sortBy, setSortBy] = useState<SortBy>(userPreferences?.assetsSortBy || 'dateModified');

  // Update local state when props change (e.g., after navigation)
  useEffect(() => {
    setAssetsList(assets);
  }, [assets]);

  const handleAssetDeleted = (assetId: number) => {
    setAssetsList(prev => prev.filter(a => a.id !== assetId));
  };

  const getButtonLabel = () => {
    if (assetType) {
      return (t as any)(`new_${assetType}`);
    }
    return t('new_asset');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <>
      <Box>
        {/* Page Header */}

        {/* Assets TopBar */}
        {assetsList.length > 0 && (
          <AssetsTopBar
            searchQuery={searchQuery}
            viewMode={viewMode}
            cardSize={cardSize}
            sortBy={sortBy}
            onSearchChange={setSearchQuery}
            onViewModeChange={handleViewModeChange}
            onCardSizeChange={setCardSize}
            onSortByChange={setSortBy}
            locale={locale}
            assetType={assetType}
          />
        )}

        {/* Empty State or Asset List */}
        {assetsList.length === 0
          ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <FolderIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'grey.900',
                    mb: 1,
                  }}
                >
                  {t('empty_state_title')}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'grey.600',
                    mb: 3,
                  }}
                >
                  {t('empty_state_description')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    'bgcolor': '#1e293b',
                    'color': 'white',
                    'textTransform': 'none',
                    'px': 4,
                    'py': 1.5,
                    'borderRadius': 2,
                    '&:hover': {
                      bgcolor: '#0f172a',
                    },
                  }}
                >
                  {getButtonLabel()}
                </Button>
              </Box>
            )
          : (
              <AssetsList
                assets={assetsList}
                locale={locale}
                viewMode={viewMode}
                cardSize={cardSize}
                sortBy={sortBy}
                searchQuery={searchQuery}
                onAssetDeleted={handleAssetDeleted}
              />
            )}
      </Box>
    </>
  );
}
