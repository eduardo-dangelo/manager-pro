'use client';

import type { FilePreviewItem } from '@/components/Assets/Asset/tabs/FilePreviewPopover';
import { getItemsInFolder, normalizeDocsMetadata } from '@/components/Assets/Asset/tabs/types';
import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { CalendarCard } from './CalendarCard';
import { DocsCard } from './DocsCard';

type Asset = {
  id: number;
  name?: string | null;
  type?: string | null;
  tabs?: string[];
  metadata?: Record<string, unknown>;
};

type TabsSectionProps = {
  asset: Asset;
  locale: string;
  onNavigateToTab: (tabName: string) => void;
  onOpenFilePreview?: (file: FilePreviewItem) => void;
};

export function TabsSection({ asset, locale, onNavigateToTab, onOpenFilePreview }: TabsSectionProps) {
  const hasCalendar = asset.tabs?.includes('calendar') ?? false;
  const hasDocs = asset.tabs?.includes('docs') ?? false;
  const [hasUpcomingEvents, setHasUpcomingEvents] = useState<boolean | null>(null);

  const hasDocsItems = useMemo(() => {
    if (!hasDocs) return false;
    const { folders, files } = normalizeDocsMetadata(asset.metadata?.docs);
    const { subfolders, folderFiles } = getItemsInFolder(folders, files, null);
    return subfolders.length + folderFiles.length > 0;
  }, [hasDocs, asset.metadata?.docs]);

  const showSection = (hasCalendar && hasUpcomingEvents !== false) || (hasDocs && hasDocsItems);
  if (!showSection) {
    return null;
  }

  return (
    <Box sx={{ mt: 1, mx: -1 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {hasCalendar && (
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1 }}>
            <CalendarCard
              asset={asset}
              locale={locale}
              onNavigateToTab={onNavigateToTab}
              onHasUpcomingEvents={setHasUpcomingEvents}
            />
          </Box>
        )}
        {hasDocs && hasDocsItems && onOpenFilePreview && (
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1 }}>
            <DocsCard
              asset={asset}
              locale={locale}
              onNavigateToTab={onNavigateToTab}
              onOpenFilePreview={onOpenFilePreview}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
