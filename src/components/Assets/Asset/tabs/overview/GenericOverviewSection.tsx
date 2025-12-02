'use client';

import { Cancel as CancelIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Asset = {
  id: number;
  name: string;
  description: string;
  type?: string | null;
  metadata?: Record<string, any>;
  objectives?: any[];
  todos?: any[];
  sprints?: any[];
};

type GenericOverviewSectionProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

export function GenericOverviewSection({
  asset,
  locale,
  onUpdateAsset,
}: GenericOverviewSectionProps) {
  const t = useTranslations('Assets');
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(() => {
    const metadata = asset.metadata || {};
    return {
      notes: metadata.info?.notes || '',
      details: metadata.info?.details || '',
    };
  });

  const handleSave = async () => {
    try {
      const metadata = asset.metadata || {};
      const updatedMetadata = {
        ...metadata,
        info: editedInfo,
      };

      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const { asset: updatedAsset } = await response.json();
      onUpdateAsset({ ...asset, metadata: updatedMetadata });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating asset info:', error);
    }
  };

  const handleCancel = () => {
    const metadata = asset.metadata || {};
    setEditedInfo({
      notes: metadata.info?.notes || '',
      details: metadata.info?.details || '',
    });
    setIsEditing(false);
  };

  const metadata = asset.metadata || {};
  const info = metadata.info || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {t('overview_info_title')}
        </Typography>
        {!isEditing
          ? (
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{ color: 'text.secondary' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )
          : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={handleSave}
                  sx={{ color: 'success.main' }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancel}
                  sx={{ color: 'error.main' }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              {t('asset_description')}
            </Typography>
            <Typography variant="body1">
              {asset.description || t('no_description')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          {isEditing
            ? (
                <TextField
                  fullWidth
                  label={t('overview_notes')}
                  value={editedInfo.notes}
                  onChange={e => setEditedInfo({ ...editedInfo, notes: e.target.value })}
                  multiline
                  rows={4}
                  size="small"
                />
              )
            : (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('overview_notes')}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {info.notes || '-'}
                  </Typography>
                </Box>
              )}
        </Grid>

        <Grid item xs={12}>
          {isEditing
            ? (
                <TextField
                  fullWidth
                  label={t('overview_details')}
                  value={editedInfo.details}
                  onChange={e => setEditedInfo({ ...editedInfo, details: e.target.value })}
                  multiline
                  rows={4}
                  size="small"
                />
              )
            : (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('overview_details')}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {info.details || '-'}
                  </Typography>
                </Box>
              )}
        </Grid>
      </Grid>
    </Box>
  );
}
