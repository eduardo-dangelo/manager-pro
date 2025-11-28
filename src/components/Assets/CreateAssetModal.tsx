'use client';

import {
  Close as CloseIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Helper function to pluralize asset types for routes
const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    person: 'persons',
    project: 'projects',
    trip: 'trips',
  };
  return pluralMap[type] || `${type}s`;
};

const colors = [
  { value: 'gray', label: 'Gray' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
];

const colorMap: Record<string, string> = {
  gray: '#6b7280',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
};

const assetTypes = [
  { value: 'vehicle', label: 'type_vehicle', icon: DirectionsCarIcon },
  { value: 'property', label: 'type_property', icon: HomeIcon },
  { value: 'person', label: 'type_person', icon: PersonIcon },
  { value: 'project', label: 'type_project', icon: WorkIcon },
  { value: 'trip', label: 'type_trip', icon: FlightIcon },
];

type CreateAssetModalProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  preSelectedType?: string;
};

export function CreateAssetModal({ open, onClose, locale, preSelectedType }: CreateAssetModalProps) {
  const t = useTranslations('Assets');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    status: 'active',
    type: preSelectedType || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/${locale}/api/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error || 'Failed to save asset');
      }

      const data = await response.json();

      // Reset form
      setFormData({
        name: '',
        description: '',
        color: 'blue',
        status: 'active',
        type: '',
      });

      // Close modal
      onClose();

      // Redirect to asset detail page
      router.push(`/${locale}/assets/${pluralizeType(data.asset.type)}/${data.asset.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        color: 'blue',
        status: 'active',
        type: preSelectedType || '',
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {t('new_project')}
          </Typography>
          <IconButton
            edge="end"
            onClick={handleClose}
            disabled={loading}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Asset Type - REQUIRED and FIRST - Hidden when preSelectedType is provided */}
            {!preSelectedType && (
              <FormControl fullWidth required>
                <InputLabel>{t('project_type')}</InputLabel>
                <Select
                  value={formData.type}
                  label={t('project_type')}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  {assetTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Icon sx={{ fontSize: 20, color: 'grey.600' }} />
                          <Typography>{t(type.label)}</Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            {/* Name */}
            <TextField
              label={t('project_name')}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            {/* Description */}
            <TextField
              label={t('project_description')}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />

            {/* Color */}
            <FormControl fullWidth>
              <InputLabel>{t('project_color')}</InputLabel>
              <Select
                value={formData.color}
                label={t('project_color')}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
              >
                {colors.map(color => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: colorMap[color.value],
                        }}
                      />
                      <Typography>{color.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>{t('project_status')}</InputLabel>
              <Select
                value={formData.status}
                label={t('project_status')}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">{t('status_active')}</MenuItem>
                <MenuItem value="completed">{t('status_completed')}</MenuItem>
                <MenuItem value="archived">{t('status_archived')}</MenuItem>
                <MenuItem value="on-hold">{t('status_on_hold')}</MenuItem>
              </Select>
            </FormControl>

            {/* Error Message */}
            {error && (
              <FormHelperText error sx={{ fontSize: '0.875rem' }}>
                {error}
              </FormHelperText>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  px: 3,
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  'bgcolor': '#1e293b',
                  'color': 'white',
                  'textTransform': 'none',
                  'px': 3,
                  '&:hover': {
                    bgcolor: '#0f172a',
                  },
                }}
              >
                {loading ? 'Creating...' : t('create_project')}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}

