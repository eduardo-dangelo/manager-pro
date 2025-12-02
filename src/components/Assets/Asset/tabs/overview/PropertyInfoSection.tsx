'use client';

import {
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Asset = {
  id: number;
  name: string;
  type?: string | null;
  metadata?: Record<string, any>;
  objectives?: any[];
  todos?: any[];
  sprints?: any[];
};

type PropertyInfoSectionProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

export function PropertyInfoSection({ asset, locale, onUpdateAsset }: PropertyInfoSectionProps) {
  const t = useTranslations('Assets');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editedInfo, setEditedInfo] = useState(() => {
    const metadata = asset.metadata || {};
    return {
      address: metadata.info?.address || '',
      buyOrRent: metadata.info?.buyOrRent || '',
      propertyType: metadata.info?.propertyType || '',
      size: metadata.info?.size || '',
      bedrooms: metadata.info?.bedrooms || '',
      bathrooms: metadata.info?.bathrooms || '',
      value: metadata.info?.value || '',
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
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating property info:', error);
    }
  };

  const handleCancel = () => {
    const metadata = asset.metadata || {};
    setEditedInfo({
      address: metadata.info?.address || '',
      buyOrRent: metadata.info?.buyOrRent || '',
      propertyType: metadata.info?.propertyType || '',
      size: metadata.info?.size || '',
      bedrooms: metadata.info?.bedrooms || '',
      bathrooms: metadata.info?.bathrooms || '',
      value: metadata.info?.value || '',
    });
    setIsModalOpen(false);
  };

  const metadata = asset.metadata || {};
  const info = metadata.info || {};
  const hasData = info && Object.keys(info).length > 0 && Object.values(info).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <Box>
      {!hasData
        ? (
            <Box
          sx={{
            'p': 4,
            'textAlign': 'center',
            'cursor': 'pointer',
            'border': '1px dashed',
            'borderColor': 'divider',
            'borderRadius': 1,
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('add_property_info_invitation')}
          </Typography>
        </Box>
          )
        : (
            <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            sx={{ color: '#ff9800' }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#ff9800',
              textTransform: 'uppercase',
            }}
          >
            {t('property_info_title')}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          sx={{ color: 'text.secondary' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ pl: 4 }}>
          {info.address && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('property_address')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                {info.address}
              </Typography>
            </Box>
          )}

          {info.buyOrRent && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('property_buy_or_rent')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                {t(info.buyOrRent)}
              </Typography>
            </Box>
          )}

          {info.propertyType && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('property_type')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                {info.propertyType}
              </Typography>
            </Box>
          )}

          {info.size && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('property_size')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                {info.size}
              </Typography>
            </Box>
          )}

          {info.bedrooms && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('property_bedrooms')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                {info.bedrooms}
              </Typography>
            </Box>
          )}

          {info.bathrooms && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('property_bathrooms')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                {info.bathrooms}
              </Typography>
            </Box>
          )}

          {info.value && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('property_value')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                $
                {Number(info.value).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
            </>
          )}

      <Dialog open={isModalOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('edit_property_info')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('property_address')}
              value={editedInfo.address}
              onChange={e => setEditedInfo({ ...editedInfo, address: e.target.value })}
              multiline
              rows={2}
            />
            <FormControl fullWidth size="small">
              <InputLabel>{t('property_buy_or_rent')}</InputLabel>
              <Select
                value={editedInfo.buyOrRent}
                onChange={e => setEditedInfo({ ...editedInfo, buyOrRent: e.target.value })}
                label={t('property_buy_or_rent')}
              >
                <MenuItem value="buy">{t('buy')}</MenuItem>
                <MenuItem value="rent">{t('rent')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label={t('property_type')}
              value={editedInfo.propertyType}
              onChange={e => setEditedInfo({ ...editedInfo, propertyType: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_size')}
              value={editedInfo.size}
              onChange={e => setEditedInfo({ ...editedInfo, size: e.target.value })}
              placeholder="e.g., 1200 sq ft"
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_bedrooms')}
              type="number"
              value={editedInfo.bedrooms}
              onChange={e => setEditedInfo({ ...editedInfo, bedrooms: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_bathrooms')}
              type="number"
              value={editedInfo.bathrooms}
              onChange={e => setEditedInfo({ ...editedInfo, bathrooms: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_value')}
              type="number"
              value={editedInfo.value}
              onChange={e => setEditedInfo({ ...editedInfo, value: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>{t('cancel')}</Button>
          <Button onClick={handleSave} variant="contained">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
