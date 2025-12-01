'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AssetHeader } from '@/components/Assets/Asset/AssetHeader';
import { AssetTabs } from '@/components/Assets/Asset/AssetTabs';
import { Breadcrumb } from '@/components/Breadcrumb';

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
  name: string;
  description: string;
  color: string;
  status: string;
  type?: string | null;
  tabs?: string[];
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

  const breadcrumbItems = [
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: t('page_title'), href: `/${locale}/assets` },
    { label: asset.name },
  ];

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
      setAsset({ ...asset, ...updatedAsset });
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', px: 0 }}>
        {!hideBreadcrumb && <Breadcrumb items={breadcrumbItems} />}

        <AssetHeader
          asset={asset}
          locale={locale}
          onUpdate={updateAsset}
          actions={headerActions}
        />

        <AssetTabs
          asset={asset}
          locale={locale}
          onUpdateAsset={setAsset}
        />
      </Box>
    </Box>
  );
}
