'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type { FilePreviewItem } from './FilePreviewPopover';
import type { FileItem, FolderItem } from './types';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  CreateNewFolder as CreateFolderIcon,
  DeleteOutlined as DeleteIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
  Folder as FolderIcon,
  MoreHoriz as MoreHorizIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,

  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { DropdownButton } from '@/components/common/DropdownButton';
import { Popover } from '@/components/common/Popover';
import { useUpdateAsset } from '@/queries/hooks/assets/useUpdateAsset';
import { useUploadAssetFile } from '@/queries/hooks/assets/useUploadAssetFile';
import { InlineEditableName } from './InlineEditableName';
import {
  canMoveFolderTo,
  getItemsInFolder,
  isFolderEmpty,
  normalizeDocsMetadata,
} from './types';

const DOCS_ACCEPT = 'application/pdf';

const DROPPABLE_ROOT = 'droppable-root';
const droppableId = (folderId: string | null) =>
  folderId === null ? DROPPABLE_ROOT : `droppable-${folderId}`;
const draggableFileId = (id: string) => `file-${id}`;
const draggableFolderId = (id: string) => `folder-${id}`;

type Asset = {
  id: number;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
};

type DocsTabProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (updates: Partial<Asset>) => void;
};

export function DocsTab({ asset, locale, onUpdateAsset: _onUpdateAsset }: DocsTabProps) {
  const t = useTranslations('Assets');
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

  const items = useMemo(
    () => [...subfolders, ...folderFiles] as (FolderItem | FileItem)[],
    [subfolders, folderFiles],
  );

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

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  const handleFileRenameSave = useCallback(
    async (fileId: string, newName: string) => {
      const trimmed = newName.trim();
      const item = files.find(d => d.id === fileId);
      if (!item || item.name === trimmed) {
        return;
      }
      setSavingFileId(fileId);
      try {
        const newFiles = files.map(d =>
          d.id === fileId ? { ...d, name: trimmed } : d,
        );
        await updateDocsMetadata(folders, newFiles);
      } finally {
        setSavingFileId(null);
      }
    },
    [files, folders, updateDocsMetadata],
  );

  const handleFolderRenameSave = useCallback(
    async (folderId: string, newName: string) => {
      const trimmed = newName.trim();
      const isNewFolder = folderId === newFolderId;
      if (isNewFolder && !trimmed) {
        const newFolders = folders.filter(f => f.id !== folderId);
        await updateDocsMetadata(newFolders, files);
        setNewFolderId(null);
        return;
      }
      const folder = folders.find(f => f.id === folderId);
      if (!folder || folder.name === trimmed) {
        if (isNewFolder) {
          setNewFolderId(null);
        }
        return;
      }
      setSavingFolderId(folderId);
      try {
        const newFolders = folders.map(f =>
          f.id === folderId ? { ...f, name: trimmed } : f,
        );
        await updateDocsMetadata(newFolders, files);
        if (isNewFolder) {
          setNewFolderId(null);
        }
      } finally {
        setSavingFolderId(null);
      }
    },
    [files, folders, newFolderId, updateDocsMetadata],
  );

  const handleCreateFolderOpen = useCallback(() => {
    const newFolder: FolderItem = {
      id: crypto.randomUUID(),
      name: '',
      type: 'folder',
      parentId: currentFolderId,
    };
    updateDocsMetadata([newFolder, ...folders], files);
    setNewFolderId(newFolder.id);
  }, [currentFolderId, files, folders, updateDocsMetadata]);

  const handleDeleteFileConfirm = useCallback(async () => {
    if (!deleteFileItem) {
      return;
    }

    const newFiles = files.filter(d => d.id !== deleteFileItem.id);
    updateDocsMetadata(folders, newFiles);
    setDeleteFileAnchor(null);
    setDeleteFileItem(null);
  }, [deleteFileItem, files, folders, updateDocsMetadata]);

  const handleDeleteFolderConfirm = useCallback(async () => {
    if (!deleteFolderItem) {
      return;
    }

    const newFolders = folders.filter(f => f.id !== deleteFolderItem.id);
    updateDocsMetadata(newFolders, files);
    setDeleteFolderAnchor(null);
    setDeleteFolderItem(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);

      let itemId: string;
      let itemType: 'file' | 'folder';

      if (activeId.startsWith('file-')) {
        itemId = activeId.slice(5);
        itemType = 'file';
      } else if (activeId.startsWith('folder-')) {
        itemId = activeId.slice(7);
        itemType = 'folder';
      } else {
        return;
      }

      let targetFolderId: string | null;
      if (overId === DROPPABLE_ROOT) {
        targetFolderId = null;
      } else if (overId.startsWith('droppable-')) {
        targetFolderId = overId.slice(10) || null;
      } else {
        return;
      }

      if (itemType === 'file') {
        const file = files.find(f => f.id === itemId);
        if (file && (file.folderId ?? null) !== targetFolderId) {
          handleMove(itemId, 'file', targetFolderId);
        }
      } else {
        const folder = folders.find(f => f.id === itemId);
        if (folder && canMoveFolderTo(targetFolderId, itemId, folders)) {
          if (folder.parentId !== targetFolderId) {
            handleMove(itemId, 'folder', targetFolderId);
          }
        }
      }
    },
    [files, folders, handleMove],
  );

  const isPdf = (item: FilePreviewItem) =>
    item.mimeType === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');

  const uploading = uploadMutation.isPending;
  const isEmpty = folders.length === 0 && files.length === 0;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentFolderId !== null && (
            <>
              <Tooltip title={t('folder_back')}>
                <IconButton size="small" onClick={handleBack} aria-label={t('folder_back')}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                {folders.find(f => f.id === currentFolderId)?.name ?? ''}
              </Typography>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CreateFolderIcon />}
            onClick={handleCreateFolderOpen}
            sx={{ textTransform: 'none' }}
          >
            {t('folder_create')}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={DOCS_ACCEPT}
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            size="small"
            disableElevation
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <FileUploadOutlinedIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            sx={{ textTransform: 'none' }}
          >
            {t('docs_upload')}
          </Button>
        </Box>
      </Box>

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
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <DocsFlatList
                items={items}
                folders={folders}
                files={files}
                listItemSx={listItemSx}
                savingFileId={savingFileId}
                savingFolderId={savingFolderId}
                newFolderId={newFolderId}
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
                t={t}
              />
            </DndContext>
          )}

      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh', bgcolor: 'background.paper' },
        }}
      >
        {previewItem && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                {previewItem.name}
              </Typography>
              <IconButton size="small" onClick={handlePreviewClose} aria-label={t('cancel')}>
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ p: 0, minHeight: 400 }}>
              <Box
                component="iframe"
                src={previewItem.url}
                title={previewItem.name}
                sx={{ width: '100%', minHeight: 600, border: 'none', borderRadius: 1 }}
              />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                component="a"
                href={previewItem.url}
                download={previewItem.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('file_download')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Popover
        open={Boolean(deleteFileAnchor)}
        anchorEl={deleteFileAnchor}
        onClose={() => {
          setDeleteFileAnchor(null);
          setDeleteFileItem(null);
        }}
        minWidth={240}
        maxWidth={280}
        showArrow={true}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('docs_delete_confirm')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" variant="outlined" onClick={() => setDeleteFileAnchor(null)}>
              {t('cancel')}
            </Button>
            <Button size="small" variant="contained" color="error" onClick={handleDeleteFileConfirm}>
              {t('delete')}
            </Button>
          </Box>
        </Box>
      </Popover>

      <Popover
        open={Boolean(deleteFolderAnchor)}
        anchorEl={deleteFolderAnchor}
        onClose={() => {
          setDeleteFolderAnchor(null);
          setDeleteFolderItem(null);
        }}
        minWidth={240}
        maxWidth={280}
        showArrow={true}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('folder_delete_confirm')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" variant="outlined" onClick={() => setDeleteFolderAnchor(null)}>
              {t('cancel')}
            </Button>
            <Button size="small" variant="contained" color="error" onClick={handleDeleteFolderConfirm}>
              {t('delete')}
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}

type DocsFlatListProps = {
  items: (FolderItem | FileItem)[];
  folders: FolderItem[];
  files: FileItem[];
  listItemSx: object;
  savingFileId: string | null;
  savingFolderId: string | null;
  newFolderId: string | null;
  rowDropdownRefs: React.MutableRefObject<Record<string, HTMLElement>>;
  folderDropdownRefs: React.MutableRefObject<Record<string, HTMLElement>>;
  isPdf: (item: FilePreviewItem) => boolean;
  onFolderClick: (folderId: string) => void;
  onDocClick: (e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => void;
  onFileRenameSave: (fileId: string, newName: string) => Promise<void>;
  onFolderRenameSave: (folderId: string, newName: string) => Promise<void>;
  onDeleteFile: (item: FileItem, anchor: HTMLElement) => void;
  onDeleteFolder: (item: FolderItem, anchor: HTMLElement) => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
};

function DocsFlatList({
  items,
  folders,
  files,
  listItemSx,
  savingFileId,
  savingFolderId,
  newFolderId,
  rowDropdownRefs,
  folderDropdownRefs,
  isPdf,
  onFolderClick,
  onDocClick,
  onFileRenameSave,
  onFolderRenameSave,
  onDeleteFile,
  onDeleteFolder,
  t,
}: DocsFlatListProps) {
  return (
    <DroppableList areaId={DROPPABLE_ROOT} folderId={null}>
      <List disablePadding>
        <TransitionGroup component={null}>
          {items.map((item) => {
            if ('type' in item && item.type === 'folder') {
              return (
                <Collapse key={`${item.id}-${item.type}`} timeout={undefined}>
                  <DocsFolderRow
                    folder={item}
                    folders={folders}
                    files={files}
                    listItemSx={listItemSx}
                    folderDropdownRefs={folderDropdownRefs}
                    savingFolderId={savingFolderId}
                    newFolderId={newFolderId}
                    onFolderClick={onFolderClick}
                    onFolderRenameSave={onFolderRenameSave}
                    onDeleteFolder={onDeleteFolder}
                    t={t}
                  />
                </Collapse>
              );
            }
            const file = item as FileItem;
            return (
              <Collapse key={`${file.id}-doc`} timeout={undefined}>
                <DocsFileRow
                  file={file}
                  listItemSx={listItemSx}
                  savingFileId={savingFileId}
                  rowDropdownRefs={rowDropdownRefs}
                  isPdf={isPdf}
                  onDocClick={onDocClick}
                  onFileRenameSave={onFileRenameSave}
                  onDeleteFile={onDeleteFile}
                  t={t}
                />
              </Collapse>
            );
          })}
        </TransitionGroup>
      </List>
    </DroppableList>
  );
}

function DroppableList({
  areaId,
  folderId,
  children,
}: {
  areaId: string;
  folderId: string | null;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: areaId,
    data: { folderId },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 40,
        borderRadius: 1,
        border: isOver ? 2 : 0,
        borderColor: 'primary.main',
        borderStyle: 'dashed',
        ...(isOver ? { bgcolor: 'action.selected' } : {}),
      }}
    >
      {children}
    </Box>
  );
}

function DocsFolderRow({
  folder,
  folders,
  files,
  listItemSx,
  folderDropdownRefs,
  savingFolderId,
  newFolderId,
  onFolderClick,
  onFolderRenameSave,
  onDeleteFolder,
  t,
}: {
  folder: FolderItem;
  folders: FolderItem[];
  files: FileItem[];
  listItemSx: object;
  folderDropdownRefs: React.MutableRefObject<Record<string, HTMLElement>>;
  savingFolderId: string | null;
  newFolderId: string | null;
  onFolderClick: (folderId: string) => void;
  onFolderRenameSave: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder: (item: FolderItem, anchor: HTMLElement) => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const canDelete = isFolderEmpty(folders, files, folder.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableFolderId(folder.id),
    data: { type: 'folder' as const, id: folder.id },
  });

  const dropdownOptions = [
    ...(canDelete
      ? [
          {
            label: t('folder_delete'),
            icon: <DeleteIcon fontSize="small" />,
            onClick: () => {
              const anchor = folderDropdownRefs.current[folder.id];
              if (anchor) {
                onDeleteFolder(folder, anchor);
              }
            },
            sx: { color: 'error.main' as const },
          },
        ]
      : [
          {
            label: t('folder_empty_only'),
            icon: <DeleteIcon fontSize="small" />,
            onClick: () => {},
            disabled: true,
            tooltip: t('folder_empty_only'),
            sx: { color: 'text.disabled' as const },
          },
        ]),
  ];

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        mb: 1,
        width: '100%',
        cursor: 'grab',
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <DroppableList areaId={droppableId(folder.id)} folderId={folder.id}>
        <ListItem
          disablePadding
          sx={{
            ...listItemSx,
            width: '100%',
          }}
        >
          <Box
            onClick={() => onFolderClick(folder.id)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              cursor: 'pointer',
              py: 1.5,
              px: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <FolderIcon sx={{ fontSize: 20, color: 'warning.main' }} />
            </ListItemIcon>
            <Box
              sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}
            >
              {isEditing
                ? (
                    <InlineEditableName
                      value={folder.name}
                      onChange={() => {}}
                      onSave={(value) => {
                        void onFolderRenameSave(folder.id, value).then(() => {
                          setIsEditing(false);
                        });
                      }}
                      placeholder={folder.id === newFolderId ? t('folder_new_placeholder') : undefined}
                      saving={savingFolderId === folder.id}
                      autoFocus
                      size="body2"
                    />
                  )
                : (

                    <Typography
                      variant="body2"
                      onClick={(e) => {
                        setIsEditing(true);
                        e.stopPropagation();
                      }}
                      sx={{ '&:hover': { cursor: 'pointer', color: 'text.secondary' } }}
                    >
                      {folder.name}
                    </Typography>

                  )}
            </Box>
          </Box>
          <Box
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                folderDropdownRefs.current[folder.id] = el;
              }
            }}
            onClick={e => e.stopPropagation()}
            sx={{ pr: 0.5 }}
          >
            <DropdownButton
              icon={<MoreHorizIcon fontSize="small" />}
              tooltip={t('docs_actions')}
              options={dropdownOptions}
            />
          </Box>
        </ListItem>
      </DroppableList>
    </Box>
  );
}

function DocsFileRow({
  file,
  listItemSx,
  savingFileId,
  rowDropdownRefs,
  isPdf,
  onDocClick,
  onFileRenameSave,
  onDeleteFile,
  t,
}: {
  file: FileItem;
  listItemSx: object;
  savingFileId: string | null;
  rowDropdownRefs: React.MutableRefObject<Record<string, HTMLElement>>;
  isPdf: (item: FilePreviewItem) => boolean;
  onDocClick: (e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => void;
  onFileRenameSave: (fileId: string, newName: string) => Promise<void>;
  onDeleteFile: (item: FileItem, anchor: HTMLElement) => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableFileId(file.id),
    data: { type: 'file' as const, id: file.id },
  });

  const saving = savingFileId === file.id;

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        mb: 1,
        width: '100%',
        cursor: 'grab',
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <ListItem
        disablePadding
        sx={{
          ...listItemSx,
          width: '100%',
        }}
      >
        <Box
          onClick={e => onDocClick(e, file)}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            cursor: 'pointer',
            py: 1.5,
            px: 2,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {isPdf(file) ? <PdfIcon color="error" /> : <FileIcon color="action" />}
          </ListItemIcon>
          <Box
            sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}
          >
            {saving && (
              <Box sx={{ ml: 1 }}>
                <CircularProgress size={14} />
              </Box>
            )}
            {isEditing
              ? (
                  <InlineEditableName
                    value={file.name}
                    onChange={() => {}}
                    onSave={(value) => {
                      void onFileRenameSave(file.id, value).then(() => {
                        setIsEditing(false);
                      });
                    }}
                    saving={saving}
                    size="body2"
                    autoFocus
                  />
                )
              : (
                  <Typography
                    variant="body2"
                    onClick={(e) => {
                      setIsEditing(true);
                      e.stopPropagation();
                    }}
                    sx={{ '&:hover': { cursor: 'pointer', color: 'text.secondary' } }}
                  >
                    {file.name}
                  </Typography>
                )}
          </Box>
        </Box>
        <Box
          ref={(el: HTMLDivElement | null) => {
            if (el) {
              rowDropdownRefs.current[file.id] = el;
            }
          }}
          onClick={e => e.stopPropagation()}
          sx={{ pr: 0.5, flex: 1, justifyContent: 'flex-end', display: 'flex' }}
        >
          <DropdownButton
            icon={<MoreHorizIcon fontSize="small" />}
            tooltip={t('docs_actions')}
            options={[
              {
                label: t('docs_open'),
                icon: <OpenInNewIcon fontSize="small" />,
                onClick: () => {
                  onDocClick({} as React.MouseEvent<HTMLElement>, file);
                },
              },
              {
                label: t('file_download'),
                icon: <DownloadIcon fontSize="small" />,
                onClick: () => {
                  const a = document.createElement('a');
                  a.href = file.url;
                  a.download = file.name;
                  a.click();
                },
              },
              {
                label: t('delete'),
                icon: <DeleteIcon fontSize="small" />,
                onClick: () => {
                  const anchor = rowDropdownRefs.current[file.id];
                  if (anchor) {
                    onDeleteFile(file, anchor);
                  }
                },
                sx: { color: 'error.main' },
              },
            ]}
          />
        </Box>
      </ListItem>
    </Box>
  );
}
