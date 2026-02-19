'use client';

import type { FilePreviewItem } from '@/components/Assets/Asset/tabs/FilePreviewPopover';
import type { FileItem, FolderItem } from '@/components/Assets/Asset/tabs/types';
import { InsertDriveFile as FileIcon, Folder as FolderIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Box, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { getItemsInFolder, normalizeDocsMetadata } from '@/components/Assets/Asset/tabs/types';
import { Card as CommonCard } from '@/components/common/Card';

type Asset = {
  id: number;
  name?: string | null;
  type?: string | null;
  tabs?: string[];
  metadata?: Record<string, unknown>;
};

type DocsCardProps = {
  asset: Asset;
  locale: string;
  onNavigateToTab: (tabName: string) => void;
  onOpenFilePreview: (file: FilePreviewItem) => void;
};

const MAX_ITEMS = 4;

function isPdf(item: FileItem): boolean {
  return item.mimeType === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');
}

export function DocsCard({ asset, onNavigateToTab, onOpenFilePreview }: DocsCardProps) {
  const t = useTranslations('Assets');

  const items = useMemo(() => {
    const { folders, files } = normalizeDocsMetadata(asset.metadata?.docs);
    const { subfolders, folderFiles } = getItemsInFolder(folders, files, null);
    const all = [...subfolders, ...folderFiles] as (FolderItem | FileItem)[];
    return all.slice(0, MAX_ITEMS);
  }, [asset.metadata?.docs]);

  if (items.length === 0) {
    return null;
  }

  return (
    <CommonCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box
        component="button"
        type="button"
        onClick={() => onNavigateToTab('docs')}
        sx={{
          'display': 'flex',
          'alignItems': 'center',
          'p': 2,
          'pb': 1,
          'border': 'none',
          'bgcolor': 'transparent',
          'cursor': 'pointer',
          'textAlign': 'left',
          '&:hover': { opacity: 0.8 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          {t('tabs_docs')}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, px: 2, pb: 2, overflow: 'hidden' }}>
        {items.map((item) => {
          const isFolder = item.type === 'folder';
          return (
            <ListItem
              key={item.id}
              disablePadding
              sx={{
                'border': '1px solid',
                'borderColor': 'divider',
                'cursor': 'pointer',
                'borderRadius': 1,
                'mb': 1,
                '&:last-child': { mb: 0 },
                '&:hover': { bgcolor: 'action.hover' },
                'p': 1,
              }}
              onClick={() => {
                if (isFolder) {
                  onNavigateToTab('docs');
                } else {
                  onOpenFilePreview(item as FileItem);
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {isFolder
                  ? <FolderIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                  : isPdf(item as FileItem)
                    ? <PdfIcon color="error" />
                    : <FileIcon color="action" />}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
              />
            </ListItem>
          );
        })}
      </Box>
    </CommonCard>
  );
}
