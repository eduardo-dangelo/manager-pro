'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AssetHeader } from '@/components/Assets/Asset/AssetHeader';
import { AssetTabs } from '@/components/Assets/Asset/AssetTabs';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';

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

type Asset = {
  id: number;
  name: string | null;
  description: string | null;
  color: string | null;
  status: string | null;
  type?: string | null;
  tabs?: string[];
  metadata?: Record<string, any>;
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
  asset: Asset;
  locale: string;
  hideBreadcrumb?: boolean;
  headerActions?: React.ReactNode;
}) {
  const t = useTranslations('Assets');
  const dashboardT = useTranslations('DashboardLayout');

  const [asset, setAsset] = useState(initialAsset);

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

  const updateAsset = async (updates: Partial<Asset>) => {
    try {
      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const { asset: updatedAsset } = await response.json();
      setAsset(prev => ({
        ...prev,
        ...updatedAsset,
        tabs: updatedAsset?.tabs ?? prev.tabs ?? ['overview'],
      }));
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  // Wrapper that preserves tabs when merging updates (e.g. from vehicle refresh)
  const handleAssetUpdate = (updates: Partial<Asset> | Asset) => {
    setAsset(prev => ({
      ...prev,
      ...updates,
      tabs: (updates as Asset).tabs ?? prev.tabs ?? ['overview'],
    }));
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', px: 0 }}>
        <AssetHeader
          asset={asset}
          locale={locale}
          onUpdate={updateAsset}
          actions={headerActions}
          registration={asset.type === 'vehicle' ? asset.metadata?.specs?.registration : undefined}
        />

        <AssetTabs
          asset={asset}
          locale={locale}
          onUpdateAsset={handleAssetUpdate}
        />
      </Box>
    </Box>
  );
}
