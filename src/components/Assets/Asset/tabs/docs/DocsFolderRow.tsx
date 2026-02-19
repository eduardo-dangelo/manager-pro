'use client';

import type { useTranslations } from 'next-intl';
import type { FileItem, FolderItem } from '../types';
import { useDraggable } from '@dnd-kit/core';
import { Check as CheckIcon, DeleteOutlined as DeleteIcon, Edit as EditIcon, Folder as FolderIcon, MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { Box, Fade, IconButton, ListItem, ListItemIcon, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { DropdownButton } from '@/components/common/DropdownButton';
import { useHoverSound } from '@/hooks/useHoverSound';
import { InlineEditableName } from '../InlineEditableName';
import { isFolderEmpty } from '../types';
import { draggableFolderId, droppableId } from './constants';
import { DroppableList } from './DroppableList';

const HOVER_DELAY_MS = 500;

type DocsFolderRowProps = {
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
};

export function DocsFolderRow({
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
}: DocsFolderRowProps) {
  const { playHoverSound } = useHoverSound();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showCheckIcon, setShowCheckIcon] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIconTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canDelete = isFolderEmpty(folders, files, folder.id);
  const saving = savingFolderId === folder.id;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableFolderId(folder.id),
    data: { type: 'folder' as const, id: folder.id },
  });

  useEffect(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!isHovered || isEditing) {
      setShowActions(false);
      return undefined;
    }
    const timeoutId = setTimeout(() => setShowActions(true), HOVER_DELAY_MS);
    hoverTimeoutRef.current = timeoutId;
    return () => clearTimeout(timeoutId);
  }, [isHovered, isEditing]);

  useEffect(() => {
    return () => {
      if (checkIconTimeoutRef.current) {
        clearTimeout(checkIconTimeoutRef.current);
      }
    };
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saving) {
      return;
    }
    setIsEditing(true);
    setIsHovered(false);
  };

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
      onMouseEnter={playHoverSound}
      sx={{
        mb: 1,
        width: '100%',
        cursor: 'grab',
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <DroppableList areaId={droppableId(folder.id)} folderId={folder.id}>
        <ListItem disablePadding sx={{ ...listItemSx, width: '100%' }}>
          <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
              sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
              onClick={e => e.stopPropagation()}
            >
              {isEditing
                ? (
                    <InlineEditableName
                      value={folder.name}
                      onChange={() => {}}
                      onSave={(value) => {
                        void onFolderRenameSave(folder.id, value).then(() => {
                          setTimeout(() => {
                            setIsEditing(false);
                          }, 100);
                          setShowCheckIcon(true);
                          if (checkIconTimeoutRef.current) {
                            clearTimeout(checkIconTimeoutRef.current);
                          }
                          checkIconTimeoutRef.current = setTimeout(() => {
                            checkIconTimeoutRef.current = null;
                            setShowCheckIcon(false);
                          }, 1000);
                        });
                      }}
                      placeholder={folder.id === newFolderId ? t('folder_new_placeholder') : undefined}
                      saving={saving}
                      size="body2"
                      autoFocus
                    />
                  )
                : (
                    <>
                      <Typography variant="body2" sx={{ minWidth: 0, mr: 1 }} noWrap>
                        {folder.name}
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: 28 }}>
                        <Fade in={showCheckIcon} mountOnEnter unmountOnExit>
                          <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center' }}>
                            <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                              saved
                            </Typography>
                          </Box>
                        </Fade>
                        {!showCheckIcon && isHovered && (
                          <Fade in={showActions} mountOnEnter unmountOnExit>
                            <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center' }}>
                              <Tooltip title={t('edit')}>
                                <IconButton
                                  size="small"
                                  onClick={handleEditClick}
                                  sx={{
                                    'padding': 0.25,
                                    'minWidth': 'auto',
                                    'color': 'text.secondary',
                                    '&:hover': {
                                      color: 'primary.main',
                                      backgroundColor: 'action.hover',
                                    },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Fade>
                        )}
                      </Box>
                    </>
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
