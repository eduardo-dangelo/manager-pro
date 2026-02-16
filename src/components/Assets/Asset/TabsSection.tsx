'use client';

import { Box } from '@mui/material';
import { CalendarCard } from '@/components/Assets/Asset/TabsSection/CalendarCard';

type Asset = {
  id: number;
  name?: string | null;
  type?: string | null;
  tabs?: string[];
};

type TabsSectionProps = {
  asset: Asset;
  locale: string;
  onNavigateToTab: (tabName: string) => void;
};

export function TabsSection({ asset, locale, onNavigateToTab }: TabsSectionProps) {
  const hasCalendar = asset.tabs?.includes('calendar') ?? false;

  if (!hasCalendar) {
    return null;
  }

  return (
    <Box sx={{ mt: 1, mx: -1 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1 }}>
          <CalendarCard
            asset={asset}
            locale={locale}
            onNavigateToTab={onNavigateToTab}
          />
        </Box>
      </Box>
    </Box>
  );
}
