'use client';

import type { FilePreviewItem } from '../FilePreviewPopover';
import type { FileItem, FolderItem } from '../types';
import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Asset as AssetEntity } from '@/entities';
import { useUpdateAsset } from '@/queries/hooks/assets/useUpdateAsset';
import { useUploadAssetFile } from '@/queries/hooks/assets/useUploadAssetFile';
import { assetKeys } from '@/queries/keys';
import { getItemsInFolder, normalizeDocsMetadata } from '../types';
import { DOCS_ACCEPT } from './constants';
import { DeleteFilePopover } from './DeleteFilePopover';
import { DeleteFolderPopover } from './DeleteFolderPopover';
import { DocsFlatList } from './DocsFlatList';
import { DocsHeader } from './DocsHeader';
import { DocsPreviewDialog } from './DocsPreviewDialog';
import { MovePopover } from './MovePopover';

type Asset = {
  id: number;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
};

type DocsTabContentProps = {
  asset: Asset;
  locale: string;
};

export function DocsTabContent({ asset, locale }: DocsTabContentProps) {
  const t = useTranslations('Assets');
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useUpdateAsset(locale, asset.id);
  const uploadMutation = useUploadAssetFile(locale, asset.id);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<FilePreviewItem | null>(null);
  const [savingFileId, setSavingFileId] = useState<string | null>(null);
  const [savingFolderId, setSavingFolderId] = useState<string | null>(null);
  const [newFolderId, setNewFolderId] = useState<string | null>(null);
  const [deleteFileAnchor, setDeleteFileAnchor] = useState<HTMLElement | null>(null);
  const [deleteFileItem, setDeleteFileItem] = useState<FileItem | null>(null);
  const [deleteFolderAnchor, setDeleteFolderAnchor] = useState<HTMLElement | null>(null);
  const [deleteFolderItem, setDeleteFolderItem] = useState<FolderItem | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [movePopoverAnchor, setMovePopoverAnchor] = useState<HTMLElement | null>(null);
  const [movePopoverItem, setMovePopoverItem] = useState<FileItem | FolderItem | null>(null);
  const [movePopoverItemType, setMovePopoverItemType] = useState<'file' | 'folder' | null>(null);
  const movePopoverCloseDropdownRef = useRef<(() => void) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const rowDropdownRefs = useRef<Record<string, HTMLElement>>({});
  const folderDropdownRefs = useRef<Record<string, HTMLElement>>({});

  const { folders, files } = useMemo(
    () => normalizeDocsMetadata(asset.metadata?.docs),
    [asset.metadata?.docs],
  );

  const { subfolders, folderFiles } = useMemo(
    () => getItemsInFolder(folders, files, currentFolderId),
    [folders, files, currentFolderId],
  );

  const items = useMemo(() => {
    const all = [...subfolders, ...folderFiles] as (FolderItem | FileItem)[];
    if (!searchQuery.trim()) {
      return all;
    }
    const q = searchQuery.toLowerCase().trim();
    return all.filter(item => item.name.toLowerCase().includes(q));
  }, [subfolders, folderFiles, searchQuery]);

  const updateDocsMetadata = useCallback(
    (newFolders: FolderItem[], newFiles: FileItem[]) => {
      const metadata = {
        ...asset.metadata,
        docs: { folders: newFolders, files: newFiles },
      };
      void updateMutation.mutateAsync({ metadata });
    },
    [asset.metadata, updateMutation],
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      try {
        const data = await uploadMutation.mutateAsync({ file, type: 'docs' });
        const newFile: FileItem = { ...data, folderId: currentFolderId };
        const newFiles = [...files, newFile];
        updateDocsMetadata(folders, newFiles);
      } catch (error) {
        console.error('Docs upload error:', error);
      } finally {
        e.target.value = '';
      }
    },
    [currentFolderId, files, folders, uploadMutation, updateDocsMetadata],
  );

  const handleBack = useCallback(() => {
    if (currentFolderId === null) {
      return;
    }
    const parent = folders.find(f => f.id === currentFolderId);
    setCurrentFolderId(parent?.parentId ?? null);
  }, [currentFolderId, folders]);

  const handleFolderClick = useCallback((folderId: string) => {
    setCurrentFolderId(folderId);
  }, []);

  const handleDocClick = (_e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
    setPreviewItem(null);
  }, []);

  const handleFileRenameSave = useCallback(
    async (fileId: string, newName: string) => {
      const trimmed = newName.trim();
      const item = files.find(d => d.id === fileId);
      if (!item || item.name === trimmed) {
        return;
      }
      setSavingFileId(fileId);
      const newFiles = files.map(d =>
        d.id === fileId ? { ...d, name: trimmed } : d,
      );
      const previous = queryClient.getQueryData(assetKeys.detail(asset.id)) as Record<string, unknown> | undefined;
      queryClient.setQueryData(assetKeys.detail(asset.id), {
        ...previous,
        data: {
          ...(previous?.data as Record<string, unknown> ?? {}),
          metadata: {
            ...((previous?.data as Record<string, unknown> | undefined)?.metadata as Record<string, unknown> ?? {}),
            docs: { folders, files: newFiles },
          },
        },
      });
      try {
        await updateDocsMetadata(folders, newFiles);
      } catch {
        queryClient.setQueryData(assetKeys.detail(asset.id), previous);
      } finally {
        setSavingFileId(null);
      }
    },
    [asset.id, files, folders, queryClient, updateDocsMetadata],
  );

  const handleFolderRenameSave = useCallback(
    async (folderId: string, newName: string) => {
      const trimmed = newName.trim();
      const isNewFolder = folderId === newFolderId;
      const folder = folders.find(f => f.id === folderId);
      if (!folder || folder.name === trimmed) {
        if (isNewFolder) {
          setNewFolderId(null);
        }
        return;
      }
      setSavingFolderId(folderId);
      const newFolders = folders.map(f =>
        f.id === folderId ? { ...f, name: trimmed } : f,
      );
      const previous = queryClient.getQueryData(assetKeys.detail(asset.id)) as Record<string, unknown> | undefined;
      queryClient.setQueryData(assetKeys.detail(asset.id), {
        ...previous,
        data: {
          ...(previous?.data as Record<string, unknown> ?? {}),
          metadata: {
            ...((previous?.data as Record<string, unknown> | undefined)?.metadata as Record<string, unknown> ?? {}),
            docs: { folders: newFolders, files },
          },
        },
      });
      try {
        await updateDocsMetadata(newFolders, files);
        if (isNewFolder) {
          setNewFolderId(null);
        }
      } catch {
        queryClient.setQueryData(assetKeys.detail(asset.id), previous);
      } finally {
        setSavingFolderId(null);
      }
    },
    [asset.id, files, folders, newFolderId, queryClient, updateDocsMetadata],
  );

  const handleCreateFolderOpen = useCallback(() => {
    const baseName = t('folder_new_default');
    const existingNames = subfolders.map(f => f.name);
    const name = AssetEntity.getUniqueNewFolderName(existingNames, baseName);
    const newFolder: FolderItem = {
      id: crypto.randomUUID(),
      name,
      type: 'folder',
      parentId: currentFolderId,
    };
    updateDocsMetadata([newFolder, ...folders], files);
    setNewFolderId(newFolder.id);
  }, [currentFolderId, files, folders, subfolders, t, updateDocsMetadata]);

  const handleDeleteFileConfirm = useCallback(() => {
    if (!deleteFileItem) {
      return;
    }
    const fileId = deleteFileItem.id;
    setDeletingFileId(fileId);
    setDeleteFileAnchor(null);
    setDeleteFileItem(null);
    setTimeout(() => {
      const newFiles = files.filter(d => d.id !== fileId);
      updateDocsMetadata(folders, newFiles);
    }, 180);
  }, [deleteFileItem, files, folders, updateDocsMetadata]);

  const handleDeleteFolderConfirm = useCallback(() => {
    if (!deleteFolderItem) {
      return;
    }
    const folderId = deleteFolderItem.id;
    setDeletingFolderId(folderId);
    setDeleteFolderAnchor(null);
    setDeleteFolderItem(null);
    setTimeout(() => {
      const newFolders = folders.filter(f => f.id !== folderId);
      updateDocsMetadata(newFolders, files);
      // setDeletingFolderId(null);
    }, 280);
  }, [deleteFolderItem, files, folders, updateDocsMetadata]);

  const handleMove = useCallback(
    (itemId: string, itemType: 'file' | 'folder', targetFolderId: string | null) => {
      if (itemType === 'file') {
        const newFiles = files.map(f =>
          f.id === itemId ? { ...f, folderId: targetFolderId } : f,
        );
        updateDocsMetadata(folders, newFiles);
      } else {
        const newFolders = folders.map(f =>
          f.id === itemId ? { ...f, parentId: targetFolderId } : f,
        );
        updateDocsMetadata(newFolders, files);
      }
    },
    [files, folders, updateDocsMetadata],
  );

  const isPdf = useCallback((item: FilePreviewItem) =>
    item.mimeType === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf'), []);

  const uploading = uploadMutation.isPending;
  const isEmpty = folders.length === 0 && files.length === 0;
  const currentFolderName = folders.find(f => f.id === currentFolderId)?.name ?? '';

  const listItemSx = {
    'mb': 1,
    'display': 'flex',
    'alignItems': 'center',
    'borderRadius': 1,
    'border': 1,
    'borderColor': 'divider',
    '&:hover': { bgcolor: 'action.hover' },
  };

  return (
    <Box>
      <DocsHeader
        currentFolderId={currentFolderId}
        currentFolderName={currentFolderName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={handleBack}
        onCreateFolder={handleCreateFolderOpen}
        onUploadClick={() => inputRef.current?.click()}
        uploading={uploading}
        inputRef={inputRef}
        accept={DOCS_ACCEPT}
        onUploadChange={handleUpload}
      />

      {isEmpty
        ? (
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                color: 'text.secondary',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('docs_empty')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {t('docs_upload')}
              </Button>
            </Box>
          )
        : (
            <DocsFlatList
              items={items}
              folders={folders}
              files={files}
              listItemSx={listItemSx}
              savingFileId={savingFileId}
              savingFolderId={savingFolderId}
              newFolderId={newFolderId}
              deletingFileId={deletingFileId}
              deletingFolderId={deletingFolderId}
              rowDropdownRefs={rowDropdownRefs}
              folderDropdownRefs={folderDropdownRefs}
              isPdf={isPdf}
              onFolderClick={handleFolderClick}
              onDocClick={handleDocClick}
              onFileRenameSave={handleFileRenameSave}
              onFolderRenameSave={handleFolderRenameSave}
              onDeleteFile={(item, anchor) => {
                setDeleteFileItem(item);
                setDeleteFileAnchor(anchor);
              }}
              onDeleteFolder={(item, anchor) => {
                setDeleteFolderItem(item);
                setDeleteFolderAnchor(anchor);
              }}
              onMoveClick={(item, itemType, anchor, onDropdownClose) => {
                setMovePopoverItem(item);
                setMovePopoverItemType(itemType);
                setMovePopoverAnchor(anchor);
                movePopoverCloseDropdownRef.current = onDropdownClose ?? null;
              }}
              t={t}
            />
          )}

      <DocsPreviewDialog
        open={previewOpen}
        item={previewItem}
        onClose={handlePreviewClose}
        t={t}
      />

      <DeleteFilePopover
        open={Boolean(deleteFileAnchor)}
        anchorEl={deleteFileAnchor}
        item={deleteFileItem}
        onClose={() => {
          setDeleteFileAnchor(null);
          setDeleteFileItem(null);
        }}
        onConfirm={handleDeleteFileConfirm}
        t={t}
      />

      <DeleteFolderPopover
        open={Boolean(deleteFolderAnchor)}
        anchorEl={deleteFolderAnchor}
        item={deleteFolderItem}
        onClose={() => {
          setDeleteFolderAnchor(null);
          setDeleteFolderItem(null);
        }}
        onConfirm={handleDeleteFolderConfirm}
        t={t}
      />

      <MovePopover
        open={Boolean(movePopoverAnchor)}
        anchorEl={movePopoverAnchor}
        item={movePopoverItem}
        itemType={movePopoverItemType}
        folders={folders}
        currentFolderId={currentFolderId}
        onClose={() => {
          movePopoverCloseDropdownRef.current?.();
          movePopoverCloseDropdownRef.current = null;
          setMovePopoverAnchor(null);
          setMovePopoverItem(null);
          setMovePopoverItemType(null);
        }}
        onMove={handleMove}
        t={t}
      />
    </Box>
  );
}
