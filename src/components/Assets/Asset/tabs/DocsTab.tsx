'use client';

import type { FilePreviewItem } from './FilePreviewPopover';
import {
  Add as AddIcon,
  Close as CloseIcon,
  DeleteOutlined as DeleteIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { DropdownButton } from '@/components/common/DropdownButton';
import { Popover } from '@/components/common/Popover';

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

const DOCS_ACCEPT = 'application/pdf';

export function DocsTab({ asset, locale, onUpdateAsset }: DocsTabProps) {
  const t = useTranslations('Assets');
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<FilePreviewItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<FilePreviewItem | null>(null);
  const rowDropdownRefs = useRef<Record<string, HTMLElement>>({});

  const docs = useMemo(
    () => (asset.metadata?.docs as FilePreviewItem[] | undefined) ?? [],
    [asset.metadata?.docs],
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.set('file', file);
        formData.set('type', 'docs');

        const res = await fetch(`/${locale}/api/assets/${asset.id}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'Upload failed');
        }

        const data = (await res.json()) as FilePreviewItem;

        const updatedDocs = [...docs, data];
        const metadata = { ...asset.metadata, docs: updatedDocs };

        const putRes = await fetch(`/${locale}/api/assets/${asset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metadata }),
        });

        if (!putRes.ok) {
          throw new Error('Failed to save');
        }

        const { asset: updatedAsset } = await putRes.json();
        onUpdateAsset({
          ...asset,
          metadata: updatedAsset?.metadata ?? metadata,
        });
      } catch (error) {
        console.error('Docs upload error:', error);
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [asset, docs, locale, onUpdateAsset],
  );

  const handleDocClick = (_e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  const handleNameClick = (e: React.MouseEvent, item: FilePreviewItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setRenameValue(item.name);
  };

  const handleRenameSave = useCallback(async () => {
    if (!editingId || !renameValue.trim()) {
      setEditingId(null);
      return;
    }

    const item = docs.find((d: FilePreviewItem) => d.id === editingId);
    if (!item || item.name === renameValue.trim()) {
      setEditingId(null);
      return;
    }

    const updatedDocs = docs.map((d: FilePreviewItem) =>
      d.id === editingId ? { ...d, name: renameValue.trim() } : d,
    );
    const metadata = { ...asset.metadata, docs: updatedDocs };

    try {
      const res = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      });

      if (!res.ok) {
        throw new Error('Failed to rename');
      }

      const { asset: updatedAsset } = await res.json();
      onUpdateAsset({
        ...asset,
        metadata: updatedAsset?.metadata ?? metadata,
      });
    } catch (error) {
      console.error('Rename error:', error);
    }
    setEditingId(null);
  }, [asset, docs, editingId, locale, onUpdateAsset, renameValue]);

  const handleRenameKeyDown = (e: React.KeyboardEvent, item: FilePreviewItem) => {
    if (e.key === 'Enter') {
      handleRenameSave();
    } else if (e.key === 'Escape') {
      setRenameValue(item.name);
      setEditingId(null);
    }
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmAnchor(null);
    setDeleteConfirmItem(null);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmItem) {
      return;
    }

    const updatedDocs = docs.filter((d: FilePreviewItem) => d.id !== deleteConfirmItem.id);
    const metadata = { ...asset.metadata, docs: updatedDocs };

    try {
      const res = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      });

      if (!res.ok) {
        throw new Error('Failed to remove');
      }

      const { asset: updatedAsset } = await res.json();
      onUpdateAsset({
        ...asset,
        metadata: updatedAsset?.metadata ?? metadata,
      });
      handleDeleteConfirmClose();
    } catch (error) {
      console.error('Remove error:', error);
    }
  }, [asset, deleteConfirmItem, docs, locale, onUpdateAsset]);

  const isPdf = (item: FilePreviewItem) =>
    item.mimeType === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box />
        <Box>
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
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <FileUploadOutlinedIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            sx={{ textTransform: 'none' }}
          >
            {t('docs_upload')}
          </Button>
        </Box>
      </Box>

      {docs.length === 0
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
            <List disablePadding>
              {docs.map((item: FilePreviewItem) => (
                <ListItem
                  key={item.id}
                  disablePadding
                  sx={{
                    'mb': 1,
                    'display': 'flex',
                    'alignItems': 'center',
                    'borderRadius': 1,
                    'border': 1,
                    'borderColor': 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    onClick={e => handleDocClick(e, item)}
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
                      {isPdf(item)
                        ? (
                            <PdfIcon color="error" />
                          )
                        : (
                            <FileIcon color="action" />
                          )}
                    </ListItemIcon>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-start' }}>
                      {editingId === item.id
                        ? (
                            <TextField
                              size="small"
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onBlur={handleRenameSave}
                              onKeyDown={e => handleRenameKeyDown(e, item)}
                              onClick={e => e.stopPropagation()}
                              autoFocus
                              fullWidth
                              sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                            />
                          )
                        : (
                            <Typography
                              variant="body2"
                              noWrap
                              onClick={e => handleNameClick(e, item)}

                            >
                              {item.name}
                            </Typography>
                          )}
                    </Box>
                  </Box>
                  <Box
                    ref={(el) => {
                      if (el) {
                        rowDropdownRefs.current[item.id] = el;
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                    sx={{ pr: 0.5 }}
                  >
                    <DropdownButton
                      icon={<MoreHorizIcon fontSize="small" />}
                      tooltip={t('docs_actions')}
                      options={[
                        {
                          label: t('docs_open'),
                          icon: <OpenInNewIcon fontSize="small" />,
                          onClick: () => handleDocClick({} as React.MouseEvent, item),
                        },
                        {
                          label: t('file_download'),
                          icon: <DownloadIcon fontSize="small" />,
                          onClick: () => {
                            const a = document.createElement('a');
                            a.href = item.url;
                            a.download = item.name;
                            a.click();
                          },
                        },
                        {
                          label: t('delete'),
                          icon: <DeleteIcon fontSize="small" />,
                          onClick: () => {
                            const anchor = rowDropdownRefs.current[item.id];
                            setDeleteConfirmAnchor(anchor ?? null);
                            setDeleteConfirmItem(item);
                          },
                          sx: { color: 'error.main' },
                        },
                      ]}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

      {/* PDF preview modal */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            bgcolor: 'background.paper',
          },
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
                sx={{
                  width: '100%',
                  minHeight: 600,
                  border: 'none',
                  borderRadius: 1,
                }}
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

      {/* Delete confirmation popover */}
      <Popover
        open={Boolean(deleteConfirmAnchor)}
        anchorEl={deleteConfirmAnchor}
        onClose={handleDeleteConfirmClose}
        minWidth={240}
        maxWidth={280}
        showArrow={true}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('docs_delete_confirm')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" variant="outlined" onClick={handleDeleteConfirmClose}>
              {t('cancel')}
            </Button>
            <Button size="small" variant="contained" color="error" onClick={handleDeleteConfirm}>
              {t('delete')}
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
