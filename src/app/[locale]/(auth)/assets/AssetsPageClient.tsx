'use client';

import { Add as AddIcon, Folder as FolderIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AssetsTopBar } from '@/components/Assets/AssetsTopBar';
import { AssetsList } from '@/components/Assets/Views/AssetsList';
import type { AssetData } from '@/entities';
import type { AssetsListFolderCardSize, AssetsListSortBy, AssetsListViewMode } from './assetsListPrefs';
import { loadAssetsListPrefs, saveAssetsListPrefs } from './assetsListPrefs';

type AssetsPageClientProps = {
  assets: AssetData[];
  locale: string;
  assetType?: string;
};

export function AssetsPageClient({ assets, locale, assetType }: AssetsPageClientProps) {
  const t = useTranslations('Assets');
  const [assetsList, setAssetsList] = useState<AssetData[]>(assets);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<AssetsListViewMode>(() => loadAssetsListPrefs(locale).viewMode);
  const [cardSize, setCardSize] = useState<AssetsListFolderCardSize>(() => loadAssetsListPrefs(locale).cardSize);
  const [sortBy, setSortBy] = useState<AssetsListSortBy>(() => loadAssetsListPrefs(locale).sortBy);

  useEffect(() => {
    const prefs = loadAssetsListPrefs(locale);
    setViewMode(prefs.viewMode);
    setCardSize(prefs.cardSize);
    setSortBy(prefs.sortBy);
  }, [locale]);

  useEffect(() => {
    setAssetsList(assets);
  }, [assets]);

  useEffect(() => {
    saveAssetsListPrefs(locale, { viewMode, cardSize, sortBy });
  }, [locale, viewMode, cardSize, sortBy]);

  const handleAssetDeleted = (assetId: number) => {
    setAssetsList(prev => prev.filter(a => a.id !== assetId));
  };

  const getButtonLabel = () => {
    if (assetType) {
      return (t as any)(`new_${assetType}`);
    }
    return (t as any)('new_asset');
  };

  const handleViewModeChange = (mode: AssetsListViewMode) => {
    setViewMode(mode);
  };

  return (
    <>
      <Box>
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
