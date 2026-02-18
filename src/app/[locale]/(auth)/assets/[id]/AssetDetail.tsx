'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AssetHeader } from '@/components/Assets/Asset/AssetHeader';
import { AssetTabs } from '@/components/Assets/Asset/AssetTabs';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';
import { Asset } from '@/entities';
import { useGetAsset } from '@/queries/hooks/assets/useGetAsset';
import { useUpdateAsset } from '@/queries/hooks/assets/useUpdateAsset';

// Pluralize asset type for routes (matches app routes like /assets/vehicles)
const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    person: 'persons',
    project: 'projects',
    trip: 'trips',
    custom: 'customs',
  };
  return pluralMap[type] || `${type}s`;
};

type Todo = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  objectiveId: number | null;
};

type Objective = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
};

type Sprint = {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

type AssetDetailAsset = {
  id: number;
  name: string | null;
  description: string | null;
  color: string | null;
  status: string | null;
  type?: string | null;
  tabs?: string[];
  metadata?: unknown;
  objectives: Objective[];
  todos: Todo[];
  sprints: Sprint[];
};

export function AssetDetail({
  asset: initialAsset,
  locale,
  hideBreadcrumb,
  headerActions,
}: {
  asset: AssetDetailAsset;
  locale: string;
  hideBreadcrumb?: boolean;
  headerActions?: React.ReactNode;
}) {
  const t = useTranslations('Assets');
  const dashboardT = useTranslations('DashboardLayout');

  const { data: assetEntity } = useGetAsset(locale, initialAsset.id, {
    initialData: Asset.fromApi(initialAsset as Parameters<typeof Asset.fromApi>[0]),
  });
  const updateMutation = useUpdateAsset(locale, initialAsset.id);

  const asset = (assetEntity?.data ?? initialAsset) as AssetDetailAsset;

  // Get breadcrumb label - show "New {{asset type}}" if name is empty and type exists
  const getBreadcrumbLabel = () => {
    if (!asset.name && asset.type) {
      const typeLabel = t(`type_${asset.type}` as any);
      return `New ${typeLabel}`;
    }
    return asset.name ?? '';
  };

  // Set breadcrumb in global topbar (only if not hidden)
  useSetBreadcrumb(
    hideBreadcrumb
      ? []
      : [
          { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
          { label: t('page_title'), href: `/${locale}/assets` },
          ...(asset.type
            ? [
                {
                  label: dashboardT(`menu_${asset.type}` as any),
                  href: `/${locale}/assets/${pluralizeType(asset.type)}`,
                },
              ]
            : []),
          { label: getBreadcrumbLabel() },
        ],
  );

  const updateAsset = async (updates: Partial<AssetDetailAsset>) => {
    try {
      await updateMutation.mutateAsync({
        ...updates,
        tabs: (updates as AssetDetailAsset).tabs ?? asset.tabs ?? ['overview'],
      } as Parameters<typeof updateMutation.mutateAsync>[0]);
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  // Wrapper that preserves tabs when merging updates (e.g. from vehicle refresh)
  const handleAssetUpdate = (updates: Partial<AssetDetailAsset> | AssetDetailAsset) => {
    void updateAsset({
      ...updates,
      tabs: (updates as AssetDetailAsset).tabs ?? asset.tabs ?? ['overview'],
    });
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', px: 0 }}>
        <AssetHeader
          asset={asset as { id: number; name: string; description: string; color: string; status: string; type?: string | null }}
          locale={locale}
          onUpdate={updateAsset}
          actions={headerActions}
          registration={asset.type === 'vehicle' ? (asset.metadata as { specs?: { registration?: string } })?.specs?.registration : undefined}
        />

        <AssetTabs
          asset={asset as Parameters<typeof AssetTabs>[0]['asset']}
          locale={locale}
          onUpdateAsset={handleAssetUpdate}
        />
      </Box>
    </Box>
  );
}
