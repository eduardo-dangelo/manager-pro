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
  IconButton,
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

type VehicleSpecsSectionProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

export function VehicleSpecsSection({ asset, locale, onUpdateAsset }: VehicleSpecsSectionProps) {
  const t = useTranslations('Assets');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editedSpecs, setEditedSpecs] = useState(() => {
    const metadata = asset.metadata || {};
    return {
      registration: metadata.specs?.registration || '',
      make: metadata.specs?.make || '',
      model: metadata.specs?.model || '',
      fuel: metadata.specs?.fuel || '',
      year: metadata.specs?.year || '',
      color: metadata.specs?.color || '',
      mileage: metadata.specs?.mileage || '',
      vin: metadata.specs?.vin || '',
      engineSize: metadata.specs?.engineSize || '',
      transmission: metadata.specs?.transmission || '',
      description: metadata.specs?.description || '',
      engineNumber: metadata.specs?.engineNumber || '',
      driveTrain: metadata.specs?.driveTrain || '',
      weight: metadata.specs?.weight || '',
      seats: metadata.specs?.seats || '',
      cost: metadata.specs?.cost || '',
    };
  });

  const handleSave = async () => {
    try {
      const metadata = asset.metadata || {};
      const updatedMetadata = {
        ...metadata,
        specs: editedSpecs,
      };

      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      await response.json();
      onUpdateAsset({ ...asset, metadata: updatedMetadata });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating vehicle specs:', error);
    }
  };

  const handleCancel = () => {
    const metadata = asset.metadata || {};
    setEditedSpecs({
      registration: metadata.specs?.registration || '',
      make: metadata.specs?.make || '',
      model: metadata.specs?.model || '',
      fuel: metadata.specs?.fuel || '',
      year: metadata.specs?.year || '',
      color: metadata.specs?.color || '',
      mileage: metadata.specs?.mileage || '',
      vin: metadata.specs?.vin || '',
      engineSize: metadata.specs?.engineSize || '',
      transmission: metadata.specs?.transmission || '',
      description: metadata.specs?.description || '',
      engineNumber: metadata.specs?.engineNumber || '',
      driveTrain: metadata.specs?.driveTrain || '',
      weight: metadata.specs?.weight || '',
      seats: metadata.specs?.seats || '',
      cost: metadata.specs?.cost || '',
    });
    setIsModalOpen(false);
  };

  const metadata = asset.metadata || {};
  const specs = metadata.specs || {};
  const hasData = specs && Object.keys(specs).length > 0 && Object.values(specs).some(v => v !== '' && v !== null && v !== undefined);

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
                {t('add_vehicle_specs_invitation')}
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
                    {t('vehicle_specs_title')}
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
                  {specs.registration && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_registration')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.registration}
                      </Typography>
                    </Box>
                  )}

                  {specs.make && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_make')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.make}
                      </Typography>
                    </Box>
                  )}

                  {specs.model && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_model')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.model}
                      </Typography>
                    </Box>
                  )}

                  {specs.year && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_year')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.year}
                      </Typography>
                    </Box>
                  )}

                  {specs.color && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_color')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.color}
                      </Typography>
                    </Box>
                  )}

                  {specs.description && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_description')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.description}
                      </Typography>
                    </Box>
                  )}

                  {specs.fuel && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_fuel')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.fuel}
                      </Typography>
                    </Box>
                  )}

                  {specs.engineNumber && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_engine_number')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.engineNumber}
                      </Typography>
                    </Box>
                  )}

                  {specs.driveTrain && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_drive_train')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.driveTrain}
                      </Typography>
                    </Box>
                  )}

                  {specs.transmission && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_transmission')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.transmission}
                      </Typography>
                    </Box>
                  )}

                  {specs.weight && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_weight')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.weight}
                        {' '}
                        {t('kg')}
                      </Typography>
                    </Box>
                  )}

                  {specs.seats && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_seats')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.seats}
                      </Typography>
                    </Box>
                  )}

                  {specs.mileage && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_mileage')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.mileage.toLocaleString()}
                        {' '}
                        {t('miles')}
                      </Typography>
                    </Box>
                  )}

                  {specs.vin && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_vin')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.vin}
                      </Typography>
                    </Box>
                  )}

                  {specs.engineSize && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_engine_size')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.engineSize}
                      </Typography>
                    </Box>
                  )}

                  {specs.cost && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_cost')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {specs.cost}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </>
          )}

      <Dialog open={isModalOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('edit_vehicle_specs')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_registration')}
              value={editedSpecs.registration}
              onChange={e => setEditedSpecs({ ...editedSpecs, registration: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_make')}
              value={editedSpecs.make}
              onChange={e => setEditedSpecs({ ...editedSpecs, make: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_model')}
              value={editedSpecs.model}
              onChange={e => setEditedSpecs({ ...editedSpecs, model: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_year')}
              type="number"
              value={editedSpecs.year}
              onChange={e => setEditedSpecs({ ...editedSpecs, year: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_color')}
              value={editedSpecs.color}
              onChange={e => setEditedSpecs({ ...editedSpecs, color: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_description')}
              value={editedSpecs.description}
              onChange={e => setEditedSpecs({ ...editedSpecs, description: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_fuel')}
              value={editedSpecs.fuel}
              onChange={e => setEditedSpecs({ ...editedSpecs, fuel: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_engine_number')}
              value={editedSpecs.engineNumber}
              onChange={e => setEditedSpecs({ ...editedSpecs, engineNumber: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_drive_train')}
              value={editedSpecs.driveTrain}
              onChange={e => setEditedSpecs({ ...editedSpecs, driveTrain: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_transmission')}
              value={editedSpecs.transmission}
              onChange={e => setEditedSpecs({ ...editedSpecs, transmission: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_weight')}
              value={editedSpecs.weight}
              onChange={e => setEditedSpecs({ ...editedSpecs, weight: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_seats')}
              type="number"
              value={editedSpecs.seats}
              onChange={e => setEditedSpecs({ ...editedSpecs, seats: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_mileage')}
              type="number"
              value={editedSpecs.mileage}
              onChange={e => setEditedSpecs({ ...editedSpecs, mileage: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_vin')}
              value={editedSpecs.vin}
              onChange={e => setEditedSpecs({ ...editedSpecs, vin: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_engine_size')}
              value={editedSpecs.engineSize}
              onChange={e => setEditedSpecs({ ...editedSpecs, engineSize: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('vehicle_cost')}
              value={editedSpecs.cost}
              onChange={e => setEditedSpecs({ ...editedSpecs, cost: e.target.value })}
              placeholder="e.g., £7,750 | 60x £135"
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
