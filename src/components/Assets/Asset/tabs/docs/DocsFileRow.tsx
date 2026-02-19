'use client';

import type { useTranslations } from 'next-intl';
import type { FilePreviewItem } from '../FilePreviewPopover';
import type { FileItem } from '../types';
import {
  Check as CheckIcon,
  DeleteOutlined as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  InsertDriveFile as FileIcon,
  MoreHoriz as MoreHorizIcon,
  DriveFileMove as MoveIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { Box, Fade, IconButton, ListItem, ListItemIcon, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { DropdownButton } from '@/components/common/DropdownButton';
import { useHoverSound } from '@/hooks/useHoverSound';
import { InlineEditableName } from '../InlineEditableName';

const HOVER_DELAY_MS = 500;

type DocsFileRowProps = {
  file: FileItem;
  listItemSx: object;
  savingFileId: string | null;
  rowDropdownRefs: React.MutableRefObject<Record<string, HTMLElement>>;
  isPdf: (item: FilePreviewItem) => boolean;
  isDeleting?: boolean;
  onDocClick: (e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => void;
  onFileRenameSave: (fileId: string, newName: string) => Promise<void>;
  onDeleteFile: (item: FileItem, anchor: HTMLElement) => void;
  onMoveClick: (item: FileItem, anchor: HTMLElement, onDropdownClose?: () => void) => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
};

export function DocsFileRow({
  file,
  listItemSx,
  savingFileId,
  rowDropdownRefs,
  isPdf,
  isDeleting = false,
  onDocClick,
  onFileRenameSave,
  onDeleteFile,
  onMoveClick,
  t,
}: DocsFileRowProps) {
  const { playHoverSound } = useHoverSound();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showCheckIcon, setShowCheckIcon] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIconTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeDropdownRef = useRef<(() => void) | null>(null);

  const saving = savingFileId === file.id;

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

  return (
    <Box
      onMouseEnter={playHoverSound}
      sx={{
        mb: 1,
        width: '100%',
        opacity: isDeleting ? 0.35 : 1,
      }}
    >
      <ListItem disablePadding sx={{ ...listItemSx, width: '100%' }}>
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
            sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isEditing
              ? (
                  <InlineEditableName
                    value={file.name}
                    onChange={() => {}}
                    onSave={(value) => {
                      void onFileRenameSave(file.id, value).then(() => {
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
                        }, 1500);
                      });
                    }}

                    saving={saving}
                    size="body2"
                    autoFocus
                    lockedSuffix={isPdf(file) ? '.pdf' : undefined}
                  />
                )
              : (
                  <>
                    <Typography variant="body2" sx={{ minWidth: 0, mr: 1 }} noWrap onClick={handleEditClick}>
                      {file.name}
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
              rowDropdownRefs.current[file.id] = el;
            }
          }}
          onClick={e => e.stopPropagation()}
          sx={{ pr: 0.5, flex: 1, justifyContent: 'flex-end', display: 'flex' }}
        >
          <DropdownButton
            icon={<MoreHorizIcon fontSize="small" />}
            tooltip={t('docs_actions')}
            registerClose={(close) => {
              closeDropdownRef.current = close;
            }}
            options={[
              {
                label: t('docs_open'),
                icon: <OpenInNewIcon fontSize="small" />,
                onClick: () => onDocClick({} as React.MouseEvent<HTMLElement>, file),
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
                label: t('docs_move'),
                icon: <MoveIcon fontSize="small" />,
                keepOpenOnClick: true,
                onClick: (event?: React.MouseEvent<HTMLElement>) => {
                  const anchor = event?.currentTarget ?? rowDropdownRefs.current[file.id];
                  if (anchor) {
                    onMoveClick(file, anchor, () => closeDropdownRef.current?.());
                  }
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
