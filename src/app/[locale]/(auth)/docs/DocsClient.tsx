'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { DocsTabContent } from '@/components/Assets/Asset/tabs/docs';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';
import {
  GlobalAssetSectionList,
  toAssetTabMediaValue,
  useFilteredAssetsWithMedia,
} from '@/components/GlobalAssetMedia';
import { useGetAssets } from '@/queries/hooks/assets/useGetAssets';

type DocsClientProps = {
  locale: string;
};

export function DocsClient({ locale }: DocsClientProps) {
  const dashboardT = useTranslations('DashboardLayout');
  const assetsT = useTranslations('Assets');
  const { data: assetsData = [], isLoading, error } = useGetAssets(locale);
  const assets = assetsData.map(asset => asset.data);
  const assetsWithDocs = useFilteredAssetsWithMedia(assets, 'docs');

  useSetBreadcrumb([
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: dashboardT('menu_docs'), href: `/${locale}/docs` },
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
        {dashboardT('menu_docs')}
      </Typography>
      <GlobalAssetSectionList
        locale={locale}
        assets={assetsWithDocs}
        emptyMessage={assetsT('global_docs_empty')}
        renderSectionContent={asset => (
          <DocsTabContent
            asset={toAssetTabMediaValue(asset)}
            locale={locale}
          />
        )}
      />
    </Box>
  );
}
