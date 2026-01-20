'use client';

import { Box } from '@mui/material';
import { GenericOverviewSection } from '@/components/Assets/Asset/tabs/overview/GenericOverviewSection';
import { PropertyInfoSection } from '@/components/Assets/Asset/tabs/overview/PropertyInfoSection';
import { PropertyQuickLinksSection } from '@/components/Assets/Asset/tabs/overview/PropertyQuickLinksSection';
import { VehicleMaintenanceSection } from '@/components/Assets/Asset/tabs/overview/VehicleMaintenanceSection';
import { VehicleSpecsSection } from '@/components/Assets/Asset/tabs/overview/VehicleSpecsSection';

type Objective = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
};

type Todo = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  objectiveId: number | null;
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
  metadata?: Record<string, any>;
  objectives?: Objective[];
  todos?: Todo[];
  sprints?: Sprint[];
};

type OverviewTabProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Partial<Asset> | Asset) => void;
};

export function OverviewTab({ asset, locale, onUpdateAsset }: OverviewTabProps) {
  const renderContent = () => {
    switch (asset.type) {
      case 'vehicle':
        const metadata = asset.metadata || {};
        const specs = metadata.specs || {};
        const hasSpecs = specs && Object.keys(specs).length > 0 && Object.values(specs).some(v => v !== '' && v !== null && v !== undefined);

        return (
          <Box>
            <VehicleSpecsSection
              asset={asset}
              locale={locale}
              onUpdateAsset={onUpdateAsset}
            />
            {hasSpecs && (
              <Box sx={{ mt: 2 }}>
                <VehicleMaintenanceSection
                  asset={asset}
                  locale={locale}
                  onUpdateAsset={onUpdateAsset}
                />
              </Box>
            )}
          </Box>
        );
      case 'property':
        return (
          <Box>
            <PropertyInfoSection
              asset={asset}
              locale={locale}
              onUpdateAsset={onUpdateAsset}
            />
            <Box sx={{ mt: 4 }}>
              <PropertyQuickLinksSection
                asset={asset}
                locale={locale}
                onUpdateAsset={onUpdateAsset}
              />
            </Box>
          </Box>
        );
      default:
        return (
          <GenericOverviewSection
            asset={asset}
            locale={locale}
            onUpdateAsset={onUpdateAsset}
          />
        );
    }
  };

  return <Box>{renderContent()}</Box>;
}
