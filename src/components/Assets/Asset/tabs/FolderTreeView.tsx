'use client';

import type { DragEndEvent } from '@dnd-kit/core';
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
  CreateNewFolder as CreateFolderIcon,
  DeleteOutlined as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import {
  Box,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import {
  canMoveFolderTo,
  getItemsInFolder,
  isFolderEmpty,
} from './types';

const DROPPABLE_ROOT = 'droppable-root';
const droppableId = (folderId: string | null) =>
  folderId === null ? DROPPABLE_ROOT : `droppable-${folderId}`;
const draggableFileId = (id: string) => `file-${id}`;
const draggableFolderId = (id: string) => `folder-${id}`;

type FolderTreeViewProps = {
  folders: FolderItem[];
  files: FileItem[];
  onMove: (itemId: string, itemType: 'file' | 'folder', targetFolderId: string | null) => void;
  onCreateFolder: (parentId: string | null, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, name: string) => void;
  renderFile: (file: FileItem, props: { isDragging: boolean }) => React.ReactNode;
  renderFolderActions?: (folder: FolderItem, props: { canDelete: boolean }) => React.ReactNode;
  /** Optional SX for the container wrapping files at each level (e.g. grid layout for gallery) */
  fileContainerSx?: object;
};

function DraggableFile({
  file,
  children,
  isOver,
}: {
  file: FileItem;
  children: React.ReactNode;
  isOver?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableFileId(file.id),
    data: { type: 'file' as const, id: file.id },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        ...(isOver ? { bgcolor: 'action.hover' } : {}),
      }}
    >
      <Box
        {...listeners}
        {...attributes}
        sx={{ cursor: 'grab', touchAction: 'none', display: 'flex', alignItems: 'center', mr: 0.5 }}
      >
        <DragIcon sx={{ fontSize: 18 }} />
      </Box>
      {children}
    </Box>
  );
}

function DraggableFolder({
  folder,
  children,
  isOver,
}: {
  folder: FolderItem;
  children: React.ReactNode;
  isOver?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableFolderId(folder.id),
    data: { type: 'folder' as const, id: folder.id },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        ...(isOver ? { bgcolor: 'action.hover' } : {}),
      }}
    >
      <Box
        {...listeners}
        {...attributes}
        sx={{ cursor: 'grab', touchAction: 'none', display: 'flex', alignItems: 'center', mr: 0.5 }}
      >
        <DragIcon sx={{ fontSize: 18 }} />
      </Box>
      {children}
    </Box>
  );
}

function DroppableZone({
  id,
  folderId,
  children,
  minHeight,
}: {
  id: string;
  folderId: string | null;
  children: React.ReactNode;
  minHeight?: number;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { folderId },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: minHeight ?? 24,
        borderRadius: 1,
        border: isOver ? 2 : 1,
        borderColor: isOver ? 'primary.main' : 'transparent',
        borderStyle: 'dashed',
        transition: 'border-color 0.2s, background-color 0.2s',
        ...(isOver ? { bgcolor: 'action.selected' } : {}),
      }}
    >
      {children}
    </Box>
  );
}

export function FolderTreeView({
  folders,
  files,
  onMove,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  renderFile,
  renderFolderActions,
  fileContainerSx,
}: FolderTreeViewProps) {
  const t = useTranslations('Assets');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [createFolderParent, setCreateFolderParent] = useState<string | null | 'root'>('root');
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

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
          onMove(itemId, 'file', targetFolderId);
        }
      } else {
        const folder = folders.find(f => f.id === itemId);
        if (folder && canMoveFolderTo(targetFolderId, itemId, folders)) {
          if (folder.parentId !== targetFolderId) {
            onMove(itemId, 'folder', targetFolderId);
          }
        }
      }
    },
    [files, folders, onMove],
  );

  const handleCreateFolder = useCallback(() => {
    const parentId = createFolderParent === 'root' ? null : createFolderParent;
    if (newFolderName.trim()) {
      onCreateFolder(parentId, newFolderName.trim());
      setNewFolderName('');
      setShowCreateInput(false);
      setCreateFolderParent('root');
      if (parentId) {
        setExpandedFolders(prev => new Set(prev).add(parentId));
      }
    }
  }, [createFolderParent, newFolderName, onCreateFolder]);

  const renderFolderLevel = useCallback(
    (parentId: string | null, depth: number) => {
      const { subfolders, folderFiles } = getItemsInFolder(folders, files, parentId);
      const dropId = droppableId(parentId);

      return (
        <DroppableZone key={dropId} id={dropId} folderId={parentId} minHeight={40}>
          <Box sx={{ pl: depth * 2 }}>
            {subfolders.map((folder) => {
              const isExpanded = expandedFolders.has(folder.id);
              const canDelete = isFolderEmpty(folders, files, folder.id);

              return (
                <Box key={folder.id} sx={{ mb: 0.5 }}>
                  <Box
                    sx={{
                      'display': 'flex',
                      'alignItems': 'center',
                      'borderRadius': 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <DraggableFolder folder={folder}>
                      <IconButton
                        size="small"
                        onClick={() => toggleFolder(folder.id)}
                        sx={{ p: 0.25 }}
                      >
                        {isExpanded
                          ? (
                              <ExpandLessIcon fontSize="small" />
                            )
                          : (
                              <ExpandMoreIcon fontSize="small" />
                            )}
                      </IconButton>
                      <FolderIcon sx={{ fontSize: 20, color: 'warning.main', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {folder.name}
                      </Typography>
                      {renderFolderActions?.(folder, { canDelete }) ?? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setCreateFolderParent(folder.id);
                              setShowCreateInput(true);
                            }}
                            aria-label={t('folder_create')}
                          >
                            <CreateFolderIcon fontSize="small" />
                          </IconButton>
                          {canDelete && (
                            <IconButton
                              size="small"
                              onClick={() => onDeleteFolder(folder.id)}
                              aria-label={t('folder_delete')}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </DraggableFolder>
                  </Box>
                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 0.5 }}>
                      {renderFolderLevel(folder.id, depth + 1)}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
            <Box
              sx={
                fileContainerSx ?? {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }
              }
            >
              {folderFiles.map(file => (
                <DraggableFile key={file.id} file={file}>
                  {renderFile(file, { isDragging: false })}
                </DraggableFile>
              ))}
            </Box>
            {depth === 0 && (
              <Box
                sx={{
                  'display': 'flex',
                  'alignItems': 'center',
                  'py': 0.5,
                  'cursor': 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  'borderRadius': 1,
                }}
                onClick={() => {
                  setCreateFolderParent('root');
                  setShowCreateInput(true);
                }}
              >
                <CreateFolderIcon sx={{ fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {t('folder_create')}
                </Typography>
              </Box>
            )}
          </Box>
        </DroppableZone>
      );
    },
    [
      expandedFolders,
      files,
      folders,
      onDeleteFolder,
      onCreateFolder,
      renderFile,
      renderFolderActions,
      t,
      toggleFolder,
    ],
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Box>
        {showCreateInput && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              p: 1,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
                if (e.key === 'Escape') {
                  setShowCreateInput(false);
                  setNewFolderName('');
                }
              }}
              placeholder={t('folder_name')}
              autoFocus
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={handleCreateFolder}
              style={{
                padding: '8px 16px',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {t('folder_create')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateInput(false);
                setNewFolderName('');
              }}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {t('cancel')}
            </button>
          </Box>
        )}
        {renderFolderLevel(null, 0)}
      </Box>
    </DndContext>
  );
}
