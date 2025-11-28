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
      maxWidth="xs"
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Name Field */}
            <TextField
              label={t('project_name')}
              size="small"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              InputLabelProps={{
                sx: {
                  '& .MuiFormLabel-asterisk': {
                    color: 'error.main',
                  },
                },
              }}
            />

            {/* Asset Type - Hidden when preSelectedType is provided */}
            {!preSelectedType && (
              <FormControl fullWidth required>
                <InputLabel
                  size="small"
                  sx={{
                    '& .MuiFormLabel-asterisk': {
                      color: 'error.main',
                    },
                  }}
                >
                  {t('project_type')}
                </InputLabel>
                <Select
                  value={formData.type}
                  label={t('project_type')}
                  size="small"
                  onChange={(e) => {
                    setFormData({
                      name: formData.name,
                      type: e.target.value,
                    });
                  }}
                >
                  {assetTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Icon sx={{ fontSize: 20, color: 'grey.600' }} />
                          <Typography>{t(type.label as any)}</Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            {/* Error Message */}
            {error && (
              <FormHelperText error sx={{ fontSize: '0.875rem' }}>
                {error}
              </FormHelperText>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                {loading ? 'Saving...' : t('save')}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
