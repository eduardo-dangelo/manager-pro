'use client';

import type { FilePreviewItem } from '../FilePreviewPopover';
import type { FileItem, FolderItem } from '../types';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import Image from 'next/image';
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
  const theme = useTheme();
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
  const [emptyDropzoneActive, setEmptyDropzoneActive] = useState(false);
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
    (
      newFolders: FolderItem[],
      newFiles: FileItem[],
      options?: {
        activityAction?: string;
        activityMetadata?: Record<string, unknown>;
        skipActivityLog?: boolean;
      },
    ) => {
      const metadata = {
        ...asset.metadata,
        docs: { folders: newFolders, files: newFiles },
      };
      void updateMutation.mutateAsync({ metadata, ...options });
    },
    [asset.metadata, updateMutation],
  );

  const uploadDocsFile = useCallback(
    async (file: File) => {
      try {
        const data = await uploadMutation.mutateAsync({ file, type: 'docs' });
        const newFile: FileItem = { ...data, folderId: currentFolderId };
        const newFiles = [...files, newFile];
        updateDocsMetadata(folders, newFiles, { skipActivityLog: true });
      } catch (error) {
        console.error('Docs upload error:', error);
      }
    },
    [currentFolderId, files, folders, uploadMutation, updateDocsMetadata],
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      await uploadDocsFile(file);
      e.target.value = '';
    },
    [uploadDocsFile],
  );

  const handleDropUpload = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setEmptyDropzoneActive(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) {
        return;
      }
      void uploadDocsFile(file);
    },
    [uploadDocsFile],
  );

  const dragOverUpload = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEmptyDropzoneActive(true);
  }, []);

  const dragLeaveUpload = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEmptyDropzoneActive(false);
  }, []);

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
      const oldName = item.name;
      const url = item.url;
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
        await updateDocsMetadata(folders, newFiles, {
          activityAction: 'doc_renamed',
          activityMetadata: { oldName, newName: trimmed, fileId, url },
        });
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
      const oldName = folder.name;
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
        await updateDocsMetadata(newFolders, files, {
          activityAction: 'doc_folder_renamed',
          activityMetadata: { oldName, newName: trimmed, folderId },
        });
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
    updateDocsMetadata([newFolder, ...folders], files, {
      activityAction: 'doc_folder_created',
      activityMetadata: {
        folderId: newFolder.id,
        folderName: newFolder.name,
      },
    });
    setNewFolderId(newFolder.id);
  }, [currentFolderId, files, folders, subfolders, t, updateDocsMetadata]);

  const handleDeleteFileConfirm = useCallback(() => {
    if (!deleteFileItem) {
      return;
    }
    const fileId = deleteFileItem.id;
    const fileName = deleteFileItem.name;
    setDeletingFileId(fileId);
    setDeleteFileAnchor(null);
    setDeleteFileItem(null);
    setTimeout(() => {
      const newFiles = files.filter(d => d.id !== fileId);
      updateDocsMetadata(folders, newFiles, {
        activityAction: 'doc_deleted',
        activityMetadata: { fileName, fileId },
      });
    }, 180);
  }, [deleteFileItem, files, folders, updateDocsMetadata]);

  const handleDeleteFolderConfirm = useCallback(() => {
    if (!deleteFolderItem) {
      return;
    }
    const folderId = deleteFolderItem.id;
    const folderName = deleteFolderItem.name;
    setDeletingFolderId(folderId);
    setDeleteFolderAnchor(null);
    setDeleteFolderItem(null);
    setTimeout(() => {
      const newFolders = folders.filter(f => f.id !== folderId);
      updateDocsMetadata(newFolders, files, {
        activityAction: 'doc_folder_deleted',
        activityMetadata: { folderName, folderId },
      });
    }, 280);
  }, [deleteFolderItem, files, folders, updateDocsMetadata]);

  const handleMove = useCallback(
    (itemId: string, itemType: 'file' | 'folder', targetFolderId: string | null) => {
      const rootLabel = t('docs_move_root');
      if (itemType === 'file') {
        const fileToMove = files.find(f => f.id === itemId);
        if (!fileToMove || (fileToMove.folderId ?? null) === targetFolderId) {
          return;
        }
        const fromFolderName = fileToMove.folderId
          ? folders.find(f => f.id === fileToMove.folderId)?.name ?? rootLabel
          : rootLabel;
        const toFolderName = targetFolderId
          ? folders.find(f => f.id === targetFolderId)?.name ?? rootLabel
          : rootLabel;
        const newFiles = files.map(f =>
          f.id === itemId ? { ...f, folderId: targetFolderId } : f,
        );
        updateDocsMetadata(folders, newFiles, {
          activityAction: 'doc_moved',
          activityMetadata: {
            fileId: fileToMove.id,
            fileName: fileToMove.name,
            url: fileToMove.url,
            fromFolderId: fileToMove.folderId ?? null,
            fromFolderName,
            toFolderId: targetFolderId,
            toFolderName,
          },
        });
      } else {
        const folderToMove = folders.find(f => f.id === itemId);
        if (!folderToMove || folderToMove.parentId === targetFolderId) {
          return;
        }
        const fromFolderName = folderToMove.parentId
          ? folders.find(f => f.id === folderToMove.parentId)?.name ?? rootLabel
          : rootLabel;
        const toFolderName = targetFolderId
          ? folders.find(f => f.id === targetFolderId)?.name ?? rootLabel
          : rootLabel;
        const newFolders = folders.map(f =>
          f.id === itemId ? { ...f, parentId: targetFolderId } : f,
        );
        updateDocsMetadata(newFolders, files, {
          activityAction: 'doc_folder_moved',
          activityMetadata: {
            folderId: folderToMove.id,
            folderName: folderToMove.name,
            fromFolderId: folderToMove.parentId ?? null,
            fromFolderName,
            toFolderId: targetFolderId,
            toFolderName,
          },
        });
      }
    },
    [files, folders, t, updateDocsMetadata],
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
            <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                <Image
                  src="/assets/images/undraw_folder-files_5www.svg"
                  alt="Documents illustration"
                  width={280}
                  height={186}
                  style={{ width: '100%', maxWidth: 280, height: 'auto' }}
                  priority={false}
                />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No docs data
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {t('docs_empty')}
              </Typography>
              <Box
                onDrop={handleDropUpload}
                onDragOver={dragOverUpload}
                onDragLeave={dragLeaveUpload}
                sx={{
                  p: 2.5,
                  border: '1px dashed',
                  borderColor: 'primary.main',
                  bgcolor: emptyDropzoneActive ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.03),
                  borderRadius: 1.5,
                  transition: 'background-color 120ms ease',
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Drop PDF files here, or choose a file.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  sx={{ textTransform: 'none' }}
                >
                  Select File
                </Button>
              </Box>
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
