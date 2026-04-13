'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { GalleryTab } from '@/components/Assets/Asset/tabs/GalleryTab';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';
import {
  GlobalAssetSectionList,
  toAssetTabMediaValue,
  useFilteredAssetsWithMedia,
} from '@/components/GlobalAssetMedia';
import { useGetAssets } from '@/queries/hooks/assets/useGetAssets';

type GalleryClientProps = {
  locale: string;
};

export function GalleryClient({ locale }: GalleryClientProps) {
  const dashboardT = useTranslations('DashboardLayout');
  const assetsT = useTranslations('Assets');
  const { data: assetsData = [], isLoading, error } = useGetAssets(locale);
  const assets = assetsData.map(asset => asset.data);
  const assetsWithGallery = useFilteredAssetsWithMedia(assets, 'gallery');

  useSetBreadcrumb([
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: dashboardT('menu_gallery'), href: `/${locale}/gallery` },
  ]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error instanceof Error ? error.message : 'Failed to load'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        {dashboardT('menu_gallery')}
      </Typography>
      <GlobalAssetSectionList
        locale={locale}
        assets={assetsWithGallery}
        emptyMessage={assetsT('global_gallery_empty')}
        renderSectionContent={asset => (
          <GalleryTab
            asset={toAssetTabMediaValue(asset)}
            locale={locale}
            onUpdateAsset={() => {}}
          />
        )}
      />
    </Box>
  );
}
