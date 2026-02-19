'use client';

import type { useTranslations } from 'next-intl';
import type { FileItem, FolderItem } from '../types';
import { Folder as FolderIcon, DriveFileMove as MoveIcon } from '@mui/icons-material';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Popover } from '@/components/common/Popover';
import { canMoveFolderTo } from '../types';

type MovePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  item: FileItem | FolderItem | null;
  itemType: 'file' | 'folder' | null;
  folders: FolderItem[];
  currentFolderId: string | null;
  onClose: () => void;
  onMove: (itemId: string, itemType: 'file' | 'folder', targetFolderId: string | null) => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
};

export function MovePopover({
  open,
  anchorEl,
  item,
  itemType,
  folders,
  currentFolderId,
  onClose,
  onMove,
  t,
}: MovePopoverProps) {
  if (!item || !itemType) {
    return null;
  }

  const currentItemFolderId = itemType === 'file'
    ? (item as FileItem).folderId ?? null
    : (item as FolderItem).parentId;

  const parentFolderId = currentFolderId !== null
    ? folders.find(f => f.id === currentFolderId)?.parentId ?? null
    : null;

  const siblingFolders = folders.filter(
    f => f.parentId === currentFolderId,
  );

  const options: Array<{ targetFolderId: string | null; label: string }> = [];

  if (currentFolderId !== null) {
    options.push({ targetFolderId: parentFolderId, label: t('docs_move_parent_folder') });
  }

  if (currentItemFolderId !== null && (currentFolderId === null || parentFolderId !== null)) {
    options.push({ targetFolderId: null, label: t('docs_move_root') });
  }

  for (const folder of siblingFolders) {
    if (itemType === 'file') {
      if (folder.id !== currentItemFolderId) {
        options.push({ targetFolderId: folder.id, label: folder.name });
      }
    } else if (canMoveFolderTo(folder.id, item.id, folders)) {
      options.push({ targetFolderId: folder.id, label: folder.name });
    }
  }

  const handleSelect = (targetFolderId: string | null) => {
    onMove(item.id, itemType, targetFolderId);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={200}
      maxWidth={280}
      showArrow={false}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <List dense disablePadding sx={{ py: 1 }}>
        {options.map(({ targetFolderId, label }) => (
          <ListItemButton
            key={targetFolderId ?? 'root'}
            onClick={() => handleSelect(targetFolderId)}
            sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {targetFolderId === null
                ? <MoveIcon fontSize="small" color="action" />
                : <FolderIcon fontSize="small" sx={{ color: 'warning.main' }} />}
            </ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ variant: 'body2' }} />
          </ListItemButton>
        ))}
      </List>
    </Popover>
  );
}
