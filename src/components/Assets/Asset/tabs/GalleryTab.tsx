'use client';

import type { FilePreviewItem } from './FilePreviewPopover';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  DeleteOutlined as DeleteIcon,
  Download as DownloadIcon,
  ViewModule as LargeIcon,
  ViewModule as MediumIcon,
  ViewModule as SmallIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Popover } from '@/components/common/Popover';
import { getButtonGroupSx } from '@/utils/buttonGroupStyles';

type Asset = {
  id: number;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
};

type GridSize = 'small' | 'medium' | 'large';

type GalleryTabProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (updates: Partial<Asset>) => void;
};

const GALLERY_ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';

const GRID_MINMAX: Record<GridSize, string> = {
  small: '100px',
  medium: '140px',
  large: '200px',
};

const deleteButtonSx = {
  'position': 'absolute',
  'top': 8,
  'right': 8,
  'bgcolor': 'rgba(0,0,0,0.5)',
  'color': 'white',
  '&:hover': {
    bgcolor: 'rgba(0,0,0,0.7)',
  },
};

const navButtonSx = (side: 'left' | 'right') => ({
  'position': 'absolute' as const,
  [side]: 8,
  'top': '50%',
  'transform': 'translateY(-50%)',
  'bgcolor': 'rgba(0,0,0,0.3)',
  'color': 'white',
  '&:hover': {
    bgcolor: 'rgba(0,0,0,0.5)',
  },
});

export function GalleryTab({ asset, locale, onUpdateAsset }: GalleryTabProps) {
  const t = useTranslations('Assets');
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonGroupSx = getButtonGroupSx(theme);

  const [uploading, setUploading] = useState(false);
  const [gridSize, setGridSize] = useState<GridSize>('medium');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<FilePreviewItem | null>(null);
  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<FilePreviewItem | null>(null);

  const gallery = useMemo(
    () => (asset.metadata?.gallery as FilePreviewItem[] | undefined) ?? [],
    [asset.metadata?.gallery],
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
        formData.set('type', 'gallery');

        const res = await fetch(`/${locale}/api/assets/${asset.id}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'Upload failed');
        }

        const data = (await res.json()) as FilePreviewItem;

        const updatedGallery = [...gallery, data];
        const metadata = { ...asset.metadata, gallery: updatedGallery };

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
        console.error('Gallery upload error:', error);
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [asset, gallery, locale, onUpdateAsset],
  );

  const handleImageClick = (_e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const previewIndex = previewItem
    ? gallery.findIndex((f: FilePreviewItem) => f.id === previewItem.id)
    : -1;

  const goToPrev = () => {
    if (gallery.length === 0) {
      return;
    }
    const nextIndex = previewIndex <= 0 ? gallery.length - 1 : previewIndex - 1;
    const item = gallery[nextIndex];
    if (item) {
      setPreviewItem(item);
    }
  };

  const goToNext = () => {
    if (gallery.length === 0) {
      return;
    }
    const nextIndex = previewIndex >= gallery.length - 1 ? 0 : previewIndex + 1;
    const item = gallery[nextIndex];
    if (item) {
      setPreviewItem(item);
    }
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => {
    e.stopPropagation();
    setDeleteConfirmAnchor(e.currentTarget);
    setDeleteConfirmItem(item);
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmAnchor(null);
    setDeleteConfirmItem(null);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmItem) {
      return;
    }

    const updatedGallery = gallery.filter((f: FilePreviewItem) => f.id !== deleteConfirmItem.id);
    const metadata = { ...asset.metadata, gallery: updatedGallery };

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
  }, [asset, deleteConfirmItem, gallery, locale, onUpdateAsset]);

  const handleGridSizeChange = (_e: React.MouseEvent<HTMLElement>, newSize: GridSize | null) => {
    if (newSize !== null) {
      setGridSize(newSize);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={gridSize}
          exclusive
          onChange={handleGridSizeChange}
          size="small"
          sx={buttonGroupSx}
        >
          <Tooltip title={t('gallery_size_small' as any)}>
            <ToggleButton value="small" aria-label="small grid">
              <SmallIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('gallery_size_medium' as any)}>
            <ToggleButton value="medium" aria-label="medium grid">
              <MediumIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('gallery_size_large' as any)}>
            <ToggleButton value="large" aria-label="large grid">
              <LargeIcon sx={{ fontSize: 20 }} />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Box>
          <input
            ref={inputRef}
            type="file"
            accept={GALLERY_ACCEPT}
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {t('gallery_upload')}
          </Button>
        </Box>
      </Box>

      {gallery.length === 0
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
                {t('gallery_empty')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {t('gallery_upload')}
              </Button>
            </Box>
          )
        : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MINMAX[gridSize]}, 1fr))`,
                gap: 2,
              }}
            >
              {gallery.map((item: FilePreviewItem) => (
                <Box
                  key={item.id}
                  onClick={e => handleImageClick(e, item)}
                  sx={{
                    'aspectRatio': '1',
                    'borderRadius': 2,
                    'overflow': 'hidden',
                    'cursor': 'pointer',
                    'position': 'relative',
                    '&:hover': { opacity: 0.9 },
                    'transition': 'width 0.3s ease',
                    '& > button': {
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    },
                    '&:hover > button': {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={e => handleDeleteClick(e, item)}
                    sx={deleteButtonSx}
                    aria-label={t('gallery_delete_image' as any)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

      {/* Image preview modal */}
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
            {/* Header: name left, close right */}
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

            {/* Image with prev/next navigation */}
            <DialogContent sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {gallery.length > 1 && (
                <>
                  <IconButton
                    onClick={goToPrev}
                    sx={navButtonSx('left')}
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={goToNext}
                    sx={navButtonSx('right')}
                    aria-label="Next image"
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}
              <Box
                component="img"
                src={previewItem.url}
                alt={previewItem.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            </DialogContent>

            {/* Footer: download bottom right */}
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
            {t('gallery_delete_confirm' as any)}
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
